

(function(){


    var m               = window.MetaphorJs,
        dataFn          = m.data,
        toFragment      = m.toFragment,
        Watchable       = m.lib.Watchable,
        createWatchable = Watchable.create,
        isExpression    = Watchable.isExpression,
        evaluate        = Watchable.eval,
        Renderer        = m.view.Renderer,
        cloneFn         = m.clone,
        Scope           = m.view.Scope,
        animate         = m.animate,
        Promise         = m.lib.Promise,
        extend          = m.extend,

        tplCache        = {},

        getTemplate     = function(tplId) {

            if (!tplCache[tplId]) {
                var tplNode     = document.getElementById(tplId),
                    tag;

                if (tplNode) {

                    tag         = tplNode.tagName.toLowerCase();

                    if (tag == "script") {
                        var div = document.createElement("div");
                        div.innerHTML = tplNode.innerHTML;
                        tplCache[tplId] = toFragment(div.childNodes);
                    }
                    else {
                        if ("content" in tplNode) {
                            tplCache[tplId] = tplNode.content;
                        }
                        else {
                            tplCache[tplId] = toFragment(tplNode.childNodes);
                        }
                    }
                }
                else {
                    return tplCache[tplId] = MetaphorJs.ajax(tplId, {dataType: 'fragment'})
                        .then(function(fragment){
                            tplCache[tplId] = fragment;
                            return fragment;
                        });
                }
            }

            return tplCache[tplId];
        };

    m.define("MetaphorJs.view.Template", {

        _watcher:           null,
        _tpl:               null,
        _renderer:          null,
        _initial:           true,
        _fragment:          null,

        scope:              null,
        node:               null,
        tpl:                null,
        ownRenderer:        false,
        initPromise:        null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,

        initialize: function(cfg) {

            var self    = this;

            extend(self, cfg, true);

            var node    = self.node;

            node.removeAttribute("mjs-include");

            if (self.tpl) {

                if (node.firstChild) {
                    dataFn(node, "mjs-transclude", toFragment(node.childNodes));
                }

                if (isExpression(self.tpl) && !self.replace) {
                    self.ownRenderer        = true;
                    self._watcher           = createWatchable(self.scope, self.tpl, self.onChange, self);
                }

                if (self.replace) {
                    self.ownRenderer        = false;
                }

                self.initPromise = self.resolveTemplate();

                if (!self.deferRendering || !self.ownRenderer) {
                    self.initPromise.done(self.applyTemplate, self);
                }

                if (self.ownRenderer && self.parentRenderer) {
                    self.parentRenderer.on("destroy", self.onParentRendererDestroy, self);
                }
            }
            else {
                if (!self.deferRendering && self.ownRenderer) {
                    self.doRender();
                }
            }

            if (self.scope instanceof Scope) {
                self.scope.$on("destroy", self.onScopeDestroy, self);
            }
        },

        doRender: function() {
            var self = this;
            if (!self._renderer) {
                self._renderer   = new Renderer(self.node, self.scope);
                self._renderer.render();
            }
        },

        startRendering: function() {

            var self    = this,
                tpl     = self.tpl;

            if (self.deferRendering) {

                self.deferRendering = false;
                if (self.initPromise) {
                    self.initPromise.done(tpl ? self.applyTemplate : self.doRender, self);
                }
                else {
                    tpl ? self.applyTemplate() : self.doRender();
                }
            }
        },

        resolveTemplate: function() {

            var self    = this,
                tplId   = self._watcher ? self._watcher.getLastResult() : evaluate(self.tpl, self.scope);

            var returnPromise = new Promise;

            new Promise(function(resolve, reject){
                    resolve(getTemplate(tplId));
                })
                .done(function(fragment){
                    self._fragment = fragment;
                    returnPromise.resolve(!self.ownRenderer);
                })
                .fail(returnPromise.reject, returnPromise);

            return returnPromise;
        },

        onChange: function() {

            var self    = this;

            if (self._renderer) {
                self._renderer.destroy();
                self._renderer = null;
            }

            self.resolveTemplate()
                .done(self.applyTemplate, self);
        },

        doApplyTemplate: function() {

            var self    = this,
                el      = self.node;

            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }

            if (self.replace) {
                el.parentNode.replaceChild(cloneFn(self._fragment), el);
            }
            else {
                el.appendChild(cloneFn(self._fragment));
            }

            if (self.ownRenderer) {
                self.doRender();
            }
        },

        applyTemplate: function() {

            var self        = this,
                el          = self.node,
                deferred    = new Promise;

            if (!self._initial) {
                animate(el, "leave")
                    .done(self.doApplyTemplate, self)
                    .done(deferred.resolve, deferred);
                animate(el, "enter");
            }
            else {
                self.doApplyTemplate();
                deferred.resolve();
            }

            self._initial = false;

            return deferred;
        },

        onParentRendererDestroy: function() {

            this._renderer.destroy();
            this.destroy();

            delete this._renderer;
        },

        onScopeDestroy: function() {
            this.destroy();

            // renderer itself subscribes to scope's destroy event
            delete this._renderer;
        },

        destroy: function() {

            var self    = this;

            delete self.node;
            delete self.scope;
            delete self.initPromise;

            if (self._watcher) {
                self._watcher.unsubscribeAndDestroy(self.onChange, self);
                delete self._watcher;
            }

            delete self.tpl;
        }

    }, {

        getTemplate: getTemplate
    });

}());