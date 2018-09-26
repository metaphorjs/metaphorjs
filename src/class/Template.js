

var data = require("../func/dom/data.js"),
    toFragment = require("../func/dom/toFragment.js"),
    clone = require("../func/dom/clone.js"),
    toArray = require("../func/array/toArray.js"),
    animate = require("metaphorjs-animate/src/func/animate.js"),
    extend = require("../func/extend.js"),
    nextUid = require("../func/nextUid.js"),
    trim = require("../func/trim.js"),
    filterLookup = require("../func/filterLookup.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    Renderer = require("./Renderer.js"),
    Cache = require("../lib/Cache.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    Scope = require("metaphorjs/src/lib/Scope.js"),
    Observable = require("metaphorjs-observable/src/lib/Observable.js"),
    ajax = require("metaphorjs-ajax/src/func/ajax.js"),
    cls = require("metaphorjs-class/src/cls.js"),
    select = require("metaphorjs-select/src/func/select.js"),
    getAttr = require("../func/dom/getAttr.js"),
    setAttr = require("../func/dom/setAttr.js");




module.exports = function(){

    var observable      = new Observable,
        cache           = new Cache,
        options         = {},

        getFragmentContent  = function(frg) {
            var div = window.document.createElement("div");
            div.appendChild(clone(frg));
            return div.innerHTML;
        },

        resolveInclude  = function(cmt, tplId) {
            var frg = getTemplate(trim(tplId));
            if (!frg) {
                return "";
            }
            if (typeof frg === "string") {
                return frg;
            }
            return getFragmentContent(frg);
        },

        resolveIncludes = function(tpl) {
            return tpl.replace(/<!--\s*include (.+?)-->/ig, resolveInclude);
        },

        getTemplate     = function(tplId) {

            var tpl = cache.get(tplId),
                opt = options[tplId] || {};

            if (typeof tpl === "function") {
                tpl = tpl(tplId);
            }
            if (typeof tpl === "string" && !opt.text) {
                if (!opt.processed) {
                    tpl = processTextTemplate(tplId, tpl);
                }
                tpl = toFragment(tpl);
                cache.add(tplId, tpl);
            }
            else if (tpl && tpl.nodeType) {
                if ("content" in tpl) {
                    tpl = tpl.content;
                }
                else {
                    tpl = toFragment(tpl.childNodes);
                }
                cache.add(tplId, tpl);
            }

            return tpl;
        },

        processTextTemplate = function(tplId, tpl) {
            if (tpl.substr(0,5) === "<!--{") {
                var inx = tpl.indexOf("-->"),
                    opt = createGetter(tpl.substr(4, inx-4))({});

                options[tplId] = opt;
                options[tplId].processed = true;

                tpl = tpl.substr(inx + 3);

                if (opt.includes) {
                    tpl = resolveIncludes(tpl);
                }

                if (opt.text) {
                    return tpl;
                }
            }
            
            if (!options[tplId]) {
                options[tplId] = {};
            }

            options[tplId].processed = true;

            return toFragment(tpl);
        },

        findInPrebuilt = function(tplId) {
            if (__MetaphorJsPrebuilt['__tpls'][tplId]) {
                tpl = __MetaphorJsPrebuilt['__tpls'][tplId];
                delete __MetaphorJsPrebuilt['__tpls'][tplId];
                return tpl;
                //return processTextTemplate(tplId, tpl);
            }
        },

        findInScripts = function(tplId) {
            var tplNode = window.document.getElementById(tplId),
                tpl,
                tag;

            if (tplNode) {
                tag = tplNode.tagName.toLowerCase();
                if (tag === "script") {
                    tpl = tplNode.innerHTML;
                    tplNode.parentNode.removeChild(tplNode);
                    return tpl;
                }
                else {
                    return tplNode;
                }
            }
        },

        loadTemplate = function(tplUrl) {
            if (!cache.exists(tplUrl)) {
                return cache.add(tplUrl,
                    ajax(tplUrl, {dataType: 'fragment'})
                        .then(function(fragment){
                            return cache.add(tplUrl, fragment);
                        })
                );
            }
            return cache.get(tplUrl);
        },

        isExpression = function(str) {
            if (str.substr(0,1) === '.') {
                var second = str.substr(1,1);
                return !(second === '.' || second === '/');
            }
            return str.substr(0,1) === '{' || str.substr(0,5) === 'this.';
        };

    if (typeof __MetaphorJsPrebuilt !== "undefined" &&
                __MetaphorJsPrebuilt['__tpls']) {
        cache.addFinder(findInPrebuilt);
    }

    cache.addFinder(findInScripts);

    return cls({

        $class:             "MetaphorJs.Template",

        _watcher:           null,
        _tpl:               null,
        _renderer:          null,
        _initial:           true,
        _fragment:          null,
        _id:                null,
        _originalNode:      null,
        _intendedShadow:    false,
        _prevEl:            null,
        _nextEl:            null,

        scope:              null,
        node:               null,
        tpl:                null,
        url:                null,
        html:               null,
        ownRenderer:        true,
        initPromise:        null,
        tplPromise:         null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,
        shadow:             false,
        animate:            false,

        passAttrs:          null,

        $init: function(cfg) {

            var self    = this;

            extend(self, cfg, true, false);

            var shadowRootSupported =
                !!window.document.documentElement.createShadowRoot;

            if (!shadowRootSupported) {
                self._intendedShadow = self.shadow;
                self.shadow = false;
            }

            self.id     = nextUid();

            if (!self.scope) {
                self.scope = new Scope;
            }

            observable.createEvent("rendered-" + self.id, {
                returnResult: false,
                autoTrigger: true
            });

            self.tpl && (self.tpl = trim(self.tpl));
            self.url && (self.url = trim(self.url));

            var node    = self.node,
                tpl     = self.tpl || self.url;

            //node && removeAttr(node, "include");

            if (self.replace && node) {
                self._prevEl = window.document.createComment(self.id + " - start");
                self._nextEl = window.document.createComment(self.id + " - end");
                var parent = node.parentNode;
                if (parent) {
                    parent.insertBefore(self._prevEl, node);
                    parent.insertBefore(self._nextEl, node.nextSibling);
                }
            }

            if (self.shadow) {
                self._originalNode = node;
                self.node = node = node.createShadowRoot();
            }

            if (!node) {
                self.deferRendering = true;
            }

            if (tpl) {

                if (node && node.firstChild && !self.shadow) {
                    data(node, "mjs-transclude", toFragment(node.childNodes));
                }

                if (isExpression(tpl)) {
                    self._watcher = createWatchable(
                        self.scope,
                        tpl,
                        self.onChange,
                        self,
                        {filterLookup: filterLookup});
                    var val = self._watcher.getLastResult();
                    if (typeof val !== "string") {
                        extend(self, val, true, false);
                    }
                }

                self.resolveTemplate();

                if (!self.deferRendering || !self.ownRenderer) {
                    self.tplPromise.done(self.applyTemplate, self);
                }
            }
            else if (self.html) {
                self._watcher = createWatchable(
                    self.scope,
                    self.html,
                    self.onHtmlChange,
                    self,
                    {filterLookup: filterLookup});

                self.initPromise    = new Promise;
                self.onHtmlChange();
            }
            else {
                if (!self.deferRendering && self.ownRenderer) {
                    self.doRender();
                }
            }

            // moved from if (tpl)
            if (self.ownRenderer && self.parentRenderer) {
                self.parentRenderer.on("destroy",
                    self.onParentRendererDestroy,
                    self);
            }

            self.scope.$on("destroy", self.onScopeDestroy, self);
        },

        setAnimation: function(state) {
            this.animate = state;
        },

        doRender: function() {
            var self = this;
            if (!self._renderer) {
                self._renderer   = new Renderer(self.node, self.scope, null, self.passAttrs);
                self._renderer.on("rendered", self.onRendered, self);
                self._renderer.on("first-node", self.onFirstNodeReported, self);
                self._renderer.process();
            }
        },

        onFirstNodeReported: function(node) {
            observable.trigger("first-node-" + this.id, node);
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

            if (self.deferRendering && (self.node || self.node === false)) {

                self.deferRendering = false;
                if (self.tplPromise) {
                    self.tplPromise.done(
                        tpl ? self.applyTemplate : self.doRender,
                        self
                    );
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

            if (self._watcher && !tpl) {
                url     = null;
            }

            if (tpl && typeof tpl !== "string") {
                tpl     = tpl.tpl || tpl.url;
                url     = null;
            }

            self.initPromise    = new Promise;
            self.tplPromise     = new Promise;

            if (self.ownRenderer) {
                self.initPromise.resolve(false);
            }

            return new Promise(function(resolve, reject){
                if (tpl || url) {

                    if (url) {
                        resolve(getTemplate(tpl) || loadTemplate(url));
                    }
                    else {
                        resolve(getTemplate(tpl) || toFragment(tpl));
                    }
                }
                else {
                    reject();
                }
            })
                .done(function(fragment){
                    self._fragment = fragment;
                    self.tplPromise.resolve();
                })
                .fail(self.initPromise.reject, self.initPromise)
                .fail(self.tplPromise.reject, self.tplPromise);
        },

        onHtmlChange: function() {
            var self    = this,
                el      = self.node;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            var htmlVal = self._watcher.getLastResult();

            if (htmlVal) {
                self._fragment = toFragment(htmlVal);
                self.applyTemplate();
            }
            else if (el) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
        },

        onChange: function() {

            var self    = this,
                el      = self.node;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            var tplVal = self._watcher.getLastResult();

            if (tplVal) {
                self.resolveTemplate()
                    .done(self.applyTemplate, self);
            }
            else if (el) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
        },

        doApplyTemplate: function() {

            var self    = this,
                el      = self.node,
                frg,
                children,
                i, l;

            if (el) {
                if (self.replace) {
                    var next = self._nextEl, prev = self._prevEl;
                    while (prev.parentNode && prev.nextSibling && 
                            prev.nextSibling !== next) {
                        prev.parentNode.removeChild(prev.nextSibling);
                    }
                    /*for (i = 0, l = el.length; i < l; i++) {
                        if (el[i].parentNode) {
                            el[i].parentNode.removeChild(el[i]);
                        }
                    }*/
                }
                else if (el.firstChild) {
                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }
                }
            }

            if (self._intendedShadow) {
                self.makeTranscludes();
            }

            if (self.replace) {

                frg = clone(self._fragment);
                children = toArray(frg.childNodes);

                if (el && el.nodeType) {
                    var transclude = el ? data(el, "mjs-transclude") : null;

                    if (transclude) {
                        var tr = select("[{transclude}], [mjs-transclude], mjs-transclude", frg);
                        if (tr.length) {
                            data(tr[0], "mjs-transclude", transclude);
                        }
                    }

                    el.parentNode && el.parentNode.removeChild(el);
                }

                self._nextEl.parentNode.insertBefore(frg, self._nextEl);
                self.node = children;
                self.initPromise.resolve(children);
            }
            else {

                if (el) {
                    el.appendChild(clone(self._fragment));
                }
                else {
                    self.node = el = clone(self._fragment);
                }
                self.initPromise.resolve(el);
            }

            observable.trigger("before-render-" + self.id, self);

            if (self.ownRenderer) {
                self.doRender();
            }
        },

        applyTemplate: function() {

            var self        = this,
                el          = self.node,
                deferred    = new Promise;

            if (!self._initial && self.animate) {
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

        makeTranscludes: function() {

            var self    = this,
                fr      = self._fragment,
                cnts    = select("content", fr),
                el, next,
                tr, sel,
                i, l;

            for (i = 0, l = cnts.length; i < l;  i++) {

                tr      = window.document.createElement("transclude");
                el      = cnts[i];
                next    = el.nextSibling;
                sel     = getAttr(el, "select");

                sel && setAttr(tr, "select", sel);

                fr.removeChild(el);
                fr.insertBefore(tr, next);
            }
        },

        onParentRendererDestroy: function() {
            var self = this;

            if (!self.$destroyed && self._renderer &&
                !self._renderer.$destroyed) {
                self._renderer.$destroy();
            }
            self.$destroy();
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onDestroy: function() {

            var self = this;

            if (self._nextEl && self._nextEl.parentNode) {
                self._nextEl.parentNode.removeChild(self._nextEl);
            }
            
            if (self._prevEl && self._prevEl.parentNode) {
                self._prevEl.parentNode.removeChild(self._prevEl);
            }

            if (self.shadow) {
                self._originalNode.createShadowRoot();
            }

            if (self._watcher) {
                if (self.html) {
                    self._watcher.unsubscribeAndDestroy(self.onHtmlChange, self);
                }
                else {
                    self._watcher.unsubscribeAndDestroy(self.onChange, self);
                }
            }
        }

    }, {
        cache: cache
    });
}();

