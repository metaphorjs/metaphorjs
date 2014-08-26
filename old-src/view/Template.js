

(function(){


    var m               = window.MetaphorJs,
        dataFn          = m.data,
        toFragment      = m.toFragment,
        Watchable       = m.lib.Watchable,
        createWatchable = Watchable.create,
        evaluate        = Watchable.eval,
        Renderer        = m.view.Renderer,
        cloneFn         = m.clone,
        Scope           = m.view.Scope,
        animate         = m.animate,
        Promise         = m.lib.Promise,
        extend          = m.extend,
        nextUid         = m.nextUid,
        trim            = m.trim,

        observable      = new m.lib.Observable,

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
            }

            return tplCache[tplId];
        },

        loadTemplate = function(tplUrl) {
            if (!tplCache[tplUrl]) {
                return tplCache[tplUrl] = MetaphorJs.ajax(tplUrl, {dataType: 'fragment'})
                    .then(function(fragment){
                        tplCache[tplUrl] = fragment;
                        return fragment;
                    });
            }
            return tplCache[tplUrl];
        },

        isExpression = function(str) {
            return str.substr(0,1) == '.';
        };

    m.define("MetaphorJs.view.Template", {

        _watcher:           null,
        _tpl:               null,
        _renderer:          null,
        _initial:           true,
        _fragment:          null,
        _id:                null,

        scope:              null,
        node:               null,
        tpl:                null,
        url:                null,
        ownRenderer:        false,
        initPromise:        null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,

        initialize: function(cfg) {

            var self    = this;

            extend(self, cfg, true);

            self.id     = nextUid();

            self.tpl && (self.tpl = trim(self.tpl));
            self.url && (self.url = trim(self.url));

            var node    = self.node,
                tpl     = self.tpl || self.url;

            node && node.removeAttribute("mjs-include");

            if (!node) {
                self.deferRendering = true;
            }

            if (tpl) {

                if (node && node.firstChild) {
                    dataFn(node, "mjs-transclude", toFragment(node.childNodes));
                }

                if (isExpression(tpl) && !self.replace) {
                    self.ownRenderer        = true;
                    self._watcher           = createWatchable(self.scope, tpl, self.onChange, self);
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
                self._renderer.on("rendered", self.onRendered, self);
                self._renderer.process();
            }
        },

        onRendered: function() {
            observable.trigger("rendered-" + this.id, this);
        },

        on: function(event, fn, context) {
            return observable.on(event + "-" + this.id, fn, context);
        },

        un: function(event, fn, context) {
            return observable.un(event + "-" + this.id, fn, context);
        },

        startRendering: function() {

            var self    = this,
                tpl     = self.tpl || self.url;

            if (self.deferRendering && self.node) {

                self.deferRendering = false;
                if (self.initPromise) {
                    self.initPromise.done(tpl ? self.applyTemplate : self.doRender, self);
                    return self.initPromise;
                }
                else {
                    tpl ? self.applyTemplate() : self.doRender();
                }
            }

            return null;
        },

        resolveTemplate: function() {

            var self    = this,
                url     = self.url,
                tpl     = self._watcher ?
                            self._watcher.getLastResult() :
                            (self.tpl || url);

            var returnPromise = new Promise;

            new Promise(function(resolve){
                    if (url) {
                        resolve(getTemplate(tpl) || loadTemplate(url));
                    }
                    else {
                        resolve(getTemplate(tpl) || toFragment(tpl));
                    }
                })
                .done(function(fragment){
                    self._fragment = fragment;
                    returnPromise.resolve(!self.ownRenderer ? self.node : false);
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
                animate(el, "leave", null, true)
                    .done(self.doApplyTemplate, self)
                    .done(deferred.resolve, deferred);
                animate(el, "enter", null, true);
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

        getTemplate: getTemplate,
        loadTemplate: loadTemplate
    });

}());