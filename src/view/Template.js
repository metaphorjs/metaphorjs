

var data = require("../func/dom/data.js"),
    toFragment = require("../func/dom/toFragment.js"),
    clone = require("../func/dom/clone.js"),
    animate = require("../func/animation/animate.js"),
    extend = require("../func/extend.js"),
    nextUid = require("../func/nextUid.js"),
    trim = require("../func/trim.js"),
    createWatchable = require("../../../metaphorjs-watchable/src/func/createWatchable.js"),
    nsRegister = require("../../../metaphorjs-namespace/src/func/nsRegister.js"),
    Renderer = require("./Renderer.js"),
    Scope = require("../lib/Scope.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js"),
    Observable = require("../../../metaphorjs-observable/src/metaphorjs.observable.js"),
    ajax = require("../../../metaphorjs-ajax/src/metaphorjs.ajax.js"),
    ns = require("../../../metaphorjs-namespace/src/var/ns.js");




module.exports = function(){

    var observable      = new Observable,

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
                return tplCache[tplUrl] = ajax(tplUrl, {dataType: 'fragment'})
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



    var Template = function(cfg) {

        var self    = this;

        extend(self, cfg, true, false);

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
                data(node, "mjs-transclude", toFragment(node.childNodes));
            }

            if (isExpression(tpl) && !self.replace) {
                self.ownRenderer        = true;
                self._watcher           = createWatchable(self.scope, tpl, self.onChange, self, null, ns);
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
    };

    Template.prototype = {

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
                el.parentNode.replaceChild(clone(self._fragment), el);
            }
            else {
                el.appendChild(clone(self._fragment));
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

    };

    Template.getTemplate = getTemplate;
    Template.loadTemplate = loadTemplate;

    nsRegister("MetaphorJs.view.Template", Template);

    return Template;
}();

