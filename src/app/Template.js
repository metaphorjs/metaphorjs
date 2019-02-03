
require("../func/dom/data.js");
require("../func/dom/toFragment.js");
require("../func/dom/clone.js");
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs/src/func/dom/select.js");
require("../func/dom/getAttr.js");
require("../func/dom/setAttr.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-observable/src/lib/Observable.js");
require("metaphorjs-shared/src/lib/Cache.js");
require("../lib/Scope.js");
require("../lib/Expression.js");
require("../lib/MutationObserver.js");
require("../lib/Config.js");
require("./Renderer.js");
require("../func/dom/commentWrap.js");
require("metaphorjs-observable/src/lib/Observable.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    ajax = require("metaphorjs-ajax/src/func/ajax.js");

module.exports = MetaphorJs.app.Template = function() {

    var observable      = new MetaphorJs.lib.Observable,
        cache           = new MetaphorJs.lib.Cache,
        options         = {},
        shadowSupported = !!document.head.attachShadow,
        pblt,
        pbltOpt,

        //TODO: Check if this is a performance issue
        getFragmentContent  = function(frg) {
            var div = window.document.createElement("div");
            div.appendChild(MetaphorJs.dom.clone(frg));
            return div.innerHTML;
        },

        resolveInclude  = function(cmt, tplId) {
            var frg = getTemplate(tplId.trim());
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
                tpl = MetaphorJs.dom.toFragment(tpl);
                cache.add(tplId, tpl);
            }
            else if (tpl && tpl.nodeType) {
                // do not re-create fragments;
                if (tpl.nodeType !== window.document.DOCUMENT_FRAGMENT_NODE) { // document fragment
                    if ("content" in tpl) {
                        tpl = tpl.content;
                    }
                    else {
                        tpl = MetaphorJs.dom.toFragment(tpl.childNodes);
                    }
                    cache.add(tplId, tpl);
                }
            }

            return tpl;
        },

        processTextTemplate = function(tplId, tpl) {

            var opt, inx;

            if (tpl.substring(0,5) === "<!--{") {
                inx = tpl.indexOf("-->");
                opt = MetaphorJs.lib.Expression.get(tpl.substr(4, inx-4), {});
                options[tplId] = opt;
                tpl = tpl.substr(inx + 3);
            }

            if (!options[tplId]) {
                options[tplId] = {};
            }
            
            opt = options[tplId];           
            opt.processed = true;

            if (opt.includes) {
                tpl = resolveIncludes(tpl);
            }

            if (opt.text) {
                return tpl;
            }

            return MetaphorJs.dom.toFragment(tpl);
        },

        findInPrebuilt = function(tplId) {
            var tpl;
            if (!pblt) {
                pblt = MetaphorJs.prebuilt.templates;
                pbltOpt = MetaphorJs.prebuilt.templateOptions;
            }
            if (tpl = pblt[tplId]) {
                delete pblt[tplId];
                if (pbltOpt[tplId]) {
                    options[tplId] = pbltOpt[tplId];
                    delete pbltOpt[tplId];
                }
                return tpl;
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

        loadPromises = {},

        loadTemplate = function(name, url) {

            if (!cache.exists(name)) {
                if (!loadPromises[url]) {
                    loadPromises[url] = ajax(url, {dataType: 'fragment'})
                    .always(function(fragment) { // sync action
                        cache.add(name, fragment);
                    })
                    .then(function(fragment) { // async action
                        delete loadPromises[url];
                        return fragment;
                    });
                }

                return loadPromises[url];
            }
            return MetaphorJs.lib.Promise.resolve(cache.get(name));
        };

    if (MetaphorJs.prebuilt && MetaphorJs.prebuilt.templates) {
        cache.addFinder(findInPrebuilt);
    }

    cache.addFinder(findInScripts);

    var Template = function(cfg) {
        var self    = this;

        extend(self, cfg, true, false);

        self.id = nextUid();
        observable.createEvent("rendered-" + self.id, {
            returnResult: false,
            autoTrigger: true
        });

        self.scope = MetaphorJs.lib.Scope.$produce(self.scope);
        self.config = MetaphorJs.lib.Config.create(
            self.config, 
            {scope: self.scope}
        );

        MetaphorJs.lib.Observable.$initHost(this, cfg, observable);

        var config = self.config,
            sm = MetaphorJs.lib.Config.MODE_STATIC;

        config.setDefaultMode("name", sm);
        config.setDefaultMode("html", sm);
        config.on("name", self._onNameChange, self);
        config.on("html", self._onHtmlChange, self);
        config.setType("runRenderer", "bool", sm);
        config.setType("wrapInComments", "bool", sm);
        config.setType("useShadow", "bool", sm);
        config.setType("deferRendering", "bool", sm);
        config.setType("replaceNode", "bool", sm);

        if (!shadowSupported || config.get("replaceNode")) {
            config.setStatic("useShadow", false);
        }
        if (config.get("useShadow")) {
            config.setStatic("wrapInComments", false);
        }
        if (config.get("replaceNode")) {
            config.setStatic("wrapInComments", true);
        }

        var defer = config.get("deferRendering"),
            rr = config.get("runRenderer");

        self.childrenPromise = new MetaphorJs.lib.Promise;
        rr && self.childrenPromise.resolve(false);

        if (rr && self.parentRenderer) {
            self.parentRenderer.on("destroy",
                self._onParentRendererDestroy,
                self);
        }
        self.scope.$on("destroy", self._onScopeDestroy, self);

        self.resolve();

        if (!defer) {
            self.render();
        }
    };


    extend(Template.prototype, {

        _rendering:         false,
        _renderer:          null,
        _initial:           true,
        _fragment:          null,
        _template:          null,
        _prevEl:            null,
        _nextEl:            null,
        _shadowRoot:        null,

        scope:              null,
        node:               null,

        /**
         * @var {MetpahorJs.lib.Config}
         */
        config:             null,

        
        childrenPromise:    null,
        _resolvePromise:     null,
        parentRenderer:     null,

        setNode: function(node) {
            var self = this;
            if (self.node) {
                return;
            }
            self.node = node;
            if (self._resolvePromise && self._resolvePromise.isResolved() &&
                !self.config.get("deferRendering")) {
                self.render(true);
                self._fragment = null;
            }
        },

        render: function(anew) {

            var self    = this;

            if (self._rendering) {
                return;
            }
            if (!self._initial && !anew) {
                return;
            }

            self._rendering = true;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
                self._fragment = null;
            }

            self.config.setStatic("deferRendering", false);

            if (self._initial) {
                self._prepareTranscludes();
            }
            else {
                self._clearNode();
            }

            self._wrapInComments();
            self._createShadow();

            if (self.config.has("name") || 
                self.config.has("html")) {
                self.resolve()
                    .done(self._applyTemplate, self)    
                    .done(self._runRenderer, self);
            }
            else {
                self._runRenderer();
            }

            self._initial = false;
            self._rendering = false;
            return self.childrenPromise;
        },

        getRenderedFragment: function() {
            var self = this,
                els = [];

            if (self._nextEl) {
                els = self._collectBetweenComments();
                els.push(self._nextEl);
                els.unshift(self._prevEl);
                MetaphorJs.dom.toFragment(els)
            }
            else if (self._shadowRoot) {
                return MetaphorJs.dom.toFragment(self._shadowRoot.childNodes);
            }
            else if (self.node) {
                return MetaphorJs.dom.toFragment(self.node.childNodes);
            }
            else if (self._fragment) {
                return self._fragment;
            }

            return null;
        },

        resolve: function(renew) {
            var self    = this;

            if (self._resolvePromise) {
                if (renew) {
                    self._resolvePromise.$destroy();
                    self._resolvePromise = null;
                }
                else {
                    return self._resolvePromise;
                }
            }

            if (self.config.has("name")) {
                self._resolvePromise = self._resolveTemplate();
            }
            else if (self.config.has("html")) {
                self._resolvePromise = self._resolveHtml();
            }
            else if (self.node) {
                self._resolvePromise = MetaphorJs.lib.Promise.resolve(self.node);
            }
            else {
                self._resolvePromise = MetaphorJs.lib.Promise.reject();
            }

            self._resolvePromise.done(function(fragment){
                self._template = typeof fragment === "string" ? 
                        MetaphorJs.dom.toFragment(fragment) :
                        fragment;
            })
            .fail(self.childrenPromise.reject, self.childrenPromise);

            return self._resolvePromise;
        },

        createEvent: function(event, opt) {
            return observable.createEvent(event + "-" + this.id, opt);
        },

        on: function(event, fn, context, opt) {
            return observable.on(event + "-" + this.id, fn, context, opt);
        },

        un: function(event, fn, context) {
            return observable.un(event + "-" + this.id, fn, context);
        },


        _prepareTranscludes: function() {
            var self = this;
            if (self.node && !self.config.get("useShadow")) {
                MetaphorJs.dom.data(self.node, "mjs-transclude", 
                    MetaphorJs.dom.toFragment(self.node.childNodes));
            }
        },

        _wrapInComments: function() {
            var self = this;
            if (self.node && !self._prevEl && 
                self.config.get("wrapInComments")) {

                if (self.config.get("replaceNode")) {
                    var cmts = MetaphorJs.dom.commentWrap(self.node, self.id);
                    if (self.node.parentNode) {
                        self.node.parentNode.removeChild(self.node);
                    }
                }
                else {
                    var cmts = [
                        window.document.createComment("<" + self.id),
                        window.document.createComment(self.id + ">")
                    ];
                    self.node.appendChild(cmts[0]);
                    self.node.appendChild(cmts[1]);
                }

                self._prevEl = cmts[0];
                self._nextEl = cmts[1];
            }
        },

        _createShadow: function() {
            var self = this;
            if (self.node && !self._shadowRoot && 
                self.config.get("useShadow")) {
                self._shadowRoot = self.node.shadowRoot || 
                                    self.node.attachShadow({mode: "open"});
            }
        },

        _runRenderer: function() {
            var self = this,
                nodes;

            if (!self._renderer && self.config.get("runRenderer")) {

                observable.trigger("before-render-" + self.id, self);

                if (self._shadowRoot) {
                    nodes = self._shadowRoot;
                }
                else if (self._nextEl) {
                    nodes = self._collectBetweenComments();
                }
                else if (self.node) {
                    nodes = self.node;
                }
                else {
                    nodes = self._fragment;
                }

                if (!nodes) {
                    throw new Error("Cannot find what to render");
                }

                self._renderer   = new MetaphorJs.app.Renderer(self.scope);
                observable.relayEvent(self._renderer, "reference", "reference-" + self.id);
                observable.relayEvent(self._renderer, "rendered", "rendered-" + self.id);
                self._renderer.process(nodes);
            }
        },

        _resolveTemplate: function() {
            var tpl = this.config.get("name");
            return new MetaphorJs.lib.Promise(
                function(resolve, reject) {
                    tpl ? resolve(getTemplate(tpl)): reject();
                }
            )
        },

        _resolveHtml: function(renew) {
            var html = this.config.get("html");
            return new MetaphorJs.lib.Promise(
                function(resolve, reject) {
                    html ? resolve(html): reject();
                }
            )
        },

        _onHtmlChange: function() {
            if (!this.config.get("deferRendering")) {
                this.resolve(true);
                this.render(true);
            }
        },

        _onNameChange: function() {
            if (!this.config.get("deferRendering")) {
                this.resolve(true);
                this.render(true);
            }
        },

        _clearNode: function() {
            var self = this;

            if (self._nextEl) {
                // remove all children between prev and next
                var next = self._nextEl, prev = self._prevEl;
                while (prev && prev.parentNode && prev.nextSibling && 
                        prev.nextSibling !== next) {
                    prev.parentNode.removeChild(prev.nextSibling);
                }
            }
            else {
                // remove all children of main node
                var el = self._shadowRoot || self.node;
                while (el && el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
        },

        _collectBetweenComments: function() {
            var next = this._nextEl,
                prev = this._prevEl,
                node = prev,
                els = [];

            if (prev && next) {
                while (node && node.nextSibling && 
                        node.nextSibling !== next) {
                    els.push(node.nextSibling);
                    node = node.nextSibling;
                }
            }

            return els;
        },

        _applyTemplate: function() {
            var self    = this,
                frg, 
                el = self._shadowRoot || self.node,
                children;

            if (!self._template) {
                return;
            }

            frg = self._fragment || MetaphorJs.dom.clone(self._template);

            if (self._nextEl) {
                children = toArray(frg.childNodes);
                self._nextEl.parentNode.insertBefore(frg, self._nextEl);
                self.childrenPromise.resolve(children);
            }
            else if (el) {
                el.appendChild(frg);
                self.childrenPromise.resolve(el.childNodes);
            }
            else {
                self._fragment = frg;
            }
        },

        _onParentRendererDestroy: function() {
            var self = this;

            if (!self.$destroyed && self._renderer &&
                !self._renderer.$destroyed) {
                self._renderer.$destroy();
            }

            self.$destroy();
        },

        _onScopeDestroy: function() {
            this.$destroy();
        },

        $destroy: function() {

            var self = this;

            if (self._nextEl && self._nextEl.parentNode) {
                self._nextEl.parentNode.removeChild(self._nextEl);
            }

            if (self._prevEl && self._prevEl.parentNode) {
                self._prevEl.parentNode.removeChild(self._prevEl);
            }

            if (self.config) {
                self.config.clear();
                self.config = null;
            }
        }
    });


    Template.load = loadTemplate;
    Template.cache = cache;

    Template.prepareConfig = function(config, values) {
        if (typeof values === 'string') {
            config.setDefaultValue("name", values);
        }
        else if (values) {
            config.addProperties(values, "defaultValue");
        }
    };

    return Template;
}();

