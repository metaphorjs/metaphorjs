
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

        if (self.parentRenderer) {
            self._parentRenderer = self.parentRenderer;
            delete self.parentRenderer;
        }
        self.id = nextUid();
        observable.createEvent("rendered-" + self.id, {
            returnResult: false,
            autoTrigger: true
        });
        observable.createEvent("attached-" + self.id);

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
        config.setType("useComments", "bool", sm);
        config.setType("useShadow", "bool", sm);
        config.setType("deferRendering", "bool", sm);
        config.setType("makeTranscludes", "bool", sm);

        config.setProperty("useComments", "defaultValue", true, /*override: */false);
        config.setProperty("makeTranscludes", "defaultValue", true, /*override: */false);

        !shadowSupported && config.setStatic("useShadow", false);
        config.get("useShadow") && config.setStatic("useComments", false);
        config.get("useShadow") && config.setStatic("makeTranscludes", false);

        if (config.get("runRenderer") && self._parentRenderer) {
            self._parentRenderer.on("destroy",
                self._onParentRendererDestroy, self
            );
        }
        self.scope.$on("destroy", self._onScopeDestroy, self);

        self._collectInitialNodes(self.attachTo || self.replaceNode);
        self.resolve();

        if (!config.get("deferRendering")) {
            self.render();
        }
    };


    extend(Template.prototype, {

        _rendering:         false,
        _renderer:          null,
        _attached:          false,
        _initial:           true,
        _fragment:          null,
        _template:          null,
        _nodes:             null,
        _prevEl:            null,
        _nextEl:            null,
        _attachTo:          null,
        _attachBefore:      null,
        _replaceNode:       null,
        _shadowRoot:        null,
        _resolvePromise:    null,
        _pubResolvePromise: null,
        _parentRenderer:    null,

        attachTo:           null,
        attachBefore:       null,
        replaceNode:        null,
        rootNode:           null,

        /**
         * @var {MetpahorJs.lib.Scope}
         */
        scope:              null,

        /**
         * @var {MetpahorJs.lib.Config}
         */
        config:             null,        

        render: function() {

            var self    = this;

            if (self._rendering || !self._initial) {
                return;
            }

            self._rendering = true;
            self.config.setStatic("deferRendering", false);

            if (self.config.has("name") || 
                self.config.has("html")) {
                self._prepareTranscludes();
                self.resolve()   
                    .done(self._runRenderer, self)
                    .done(self.tryToAttach, self);
            }
            else {
                self._runRenderer();
                self.tryToAttach();
            }

            self._initial = false;
            self._rendering = false;
        },

        attach: function(parent, before) {

            var self = this;

            if (self._attachTo !== parent) {

                self._attached && self.detach();
                self._nextEl && self._removeComments();
                self._shadowRoot && self._destroyShadow();

                delete self.attachTo;
                delete self.attachBefore;

                self._attachTo = parent;
                self._attachBefore = before;  

                self._createShadow();
                self._createComments();

                if (self._nodes) {
                    self._attach();
                }
            }
        },

        replace: function(node, attachTo) {

            var self = this;

            if (self._replaceNode !== node || 
                self._attachTo !== attachTo) {

                // can't replace node if it is not attached
                if (!node.parentNode) {
                    return;
                }

                self._attached && self.detach();
                self._nextEl && self._removeComments();
                self._shadowRoot && self._destroyShadow();
                delete self.replaceNode;
                delete self.attachTo;

                self._replaceNode = node;
                self._attachTo = attachTo;
                self._attachBefore = null;

                if (attachTo) {
                    self._replaceNodeWithNode(node, attachTo);
                    self._createShadow();
                }   
                else {
                    self._replaceNodeWithComments(node);
                }

                if (self._nodes) {
                    self._attach();
                }

                return true;
            }
        },

        tryToAttach: function() {
            var self = this;
            if (self._attached) {
                return;
            }
            // new attachment via replace
            if (self.replaceNode && self.replaceNode.parentNode) {
                self.replace(self.replaceNode, self.attachTo);
            }
            // new attachment via append
            else if (self.attachTo && self.attachTo.parentNode) {
                self.attach(self.attachTo, self.attachBefore);
            }
            // reattaching to previous
            else if (self._nextEl || self._attachTo || self._shadowRoot) {
                self._attach();
            }
        },

        isAttached: function() {
            return this._attached;
        },

        detach: function() {
            var self = this;

            if (!self._attached) {
                return;
            }

            self._nodes = self._clear();            
        },

        resolve: function(renew) {
            var self    = this;

            if (self._resolvePromise) {
                if (renew) {
                    self._resolvePromise.$destroy();
                    self._resolvePromise = null;
                    self._pubResolvePromise.$destroy();
                    self._pubResolvePromise = null;
                    self._nodes = null;
                    self._template = null;
                    self._fragment = null;
                }
                else {
                    return self._pubResolvePromise;
                }
            }

            self._pubResolvePromise = new MetaphorJs.lib.Promise;

            if (self.config.has("name")) {
                self._resolvePromise = self._resolveTemplate();
            }
            else if (self.config.has("html")) {
                self._resolvePromise = self._resolveHtml();
            }
            else {
                self._resolvePromise = MetaphorJs.lib.Promise.resolve();
            }

            return self._resolvePromise.done(self._onTemplateResolved, self);
        },

        _onTemplateResolved: function(fragment) {
            var self = this,
                root = self.rootNode;

            if (self._attached) {
                self._clear();
            }

            if (fragment) {
                self._template = typeof fragment === "string" ? 
                                MetaphorJs.dom.toFragment(fragment) :
                                fragment;
                self._fragment = MetaphorJs.dom.clone(self._template);

                if (root) {
                    while (root.firstChild) {
                        root.removeChild(root.firstChild);
                    }
                    root.appendChild(self._fragment);
                    if (!root.parentNode) {
                        self._fragment.appendChild(root);
                    }
                    self._nodes = [root];
                }
                else {
                    self._nodes = toArray(self._fragment.childNodes);
                }
            }
            else if (root) {
                self._nodes = [root];
            }

            self._pubResolvePromise.resolve();
        },

        _collectInitialNodes: function(parent) {
            var self = this;
            if (!self.config.has("name") && !self.config.has("html")) {
                parent = parent || self._attachTo || self.attachTo;
                parent && (self._nodes = toArray(parent.childNodes));
            }
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
            var self = this,
                saveIn, takeFrom;

            if (self.replaceNode) {
                saveIn = self.replaceNode.parentNode;
                takeFrom = self.replaceNode;
            }
            else if (self.attachTo) {
                saveIn = takeFrom = self.attachTo;
            }

            if (saveIn && takeFrom && 
                self.config.get("makeTranscludes") && 
                takeFrom.firstChild && 
                !MetaphorJs.dom.data(saveIn, "mjs-transclude")) {

                MetaphorJs.dom.data(saveIn, "mjs-transclude", 
                    MetaphorJs.dom.toFragment(takeFrom.childNodes));
            }
        },

        _replaceNodeWithComments: function(node) {
            var self = this,
                cmts = MetaphorJs.dom.commentWrap(node, self.id);
            node.parentNode && node.parentNode.removeChild(node);
            self._prevEl = cmts[0];
            self._nextEl = cmts[1];
        },

        _replaceNodeWithNode: function(replacedNode, withNode) {
            var frg = MetaphorJs.dom.toFragment(replacedNode.childNodes);
            replacedNode.parentNode && 
                replacedNode.parentNode.replaceChild(replacedNode, withNode);
            withNode.appendChild(frg);
        },

        _createComments: function() {
            var self = this,
                parent = self._attachTo,
                before = self._attachBefore;

            if (parent && !self._prevEl && self.config.get("useComments")) {
                var cmts = [
                        window.document.createComment("<" + self.id),
                        window.document.createComment(self.id + ">")
                    ];
                parent.insertBefore(cmts[0], before);
                parent.insertBefore(cmts[1], before);
                self._prevEl = cmts[0];
                self._nextEl = cmts[1];
            }
        },

        _removeComments: function() {
            var self = this,
                next = self._nextEl,
                prev = self._prevEl;

            next.parentNode && next.parentNode.removeChild(next);
            prev.parentNode && prev.parentNode.removeChild(prev);
            self._nextEl = null;
            self._prevEl = null;
        },

        _createShadow: function() {
            var self = this;
            if (self._attachTo && !self._shadowRoot && 
                self.config.get("useShadow")) {
                self._shadowRoot = self._attachTo.shadowRoot || 
                                    self._attachTo.attachShadow({mode: "open"});
            }
        },

        _destroyShadow: function() {
            this._shadowRoot = null;
        },

        _runRenderer: function() {
            var self = this;

            if (self.config.get("runRenderer")) {
                if (self._renderer) {
                    self._renderer.$destroy();
                    self._renderer = null;
                }

                observable.trigger("before-render-" + self.id, self);

                self._renderer   = new MetaphorJs.app.Renderer(self.scope);
                observable.relayEvent(self._renderer, "reference", "reference-" + self.id);
                observable.relayEvent(self._renderer, "rendered", "rendered-" + self.id);
                self._renderer.process(self._nodes);
            }
        },

        _resolveTemplate: function() {
            var tpl = this.config.get("name");
            
            return new MetaphorJs.lib.Promise(
                function(resolve, reject) {
                    if (tpl) {
                        tpl = getTemplate(tpl);
                        tpl ? resolve(tpl) : reject();
                    }
                    else reject();
                }
            )
            
        },

        _resolveHtml: function() {
            var html = this.config.get("html");
            return new MetaphorJs.lib.Promise(
                function(resolve, reject) {
                    html ? resolve(html): reject();
                }
            )
        },

        _onHtmlChange: function() {
            var self = this;
            if (!self.config.get("deferRendering")) {
                self.resolve(true)   
                    .done(self._runRenderer, self)
                    .done(self.tryToAttach, self);
            }
        },

        _onNameChange: function() {
            var self = this;
            if (!self.config.get("deferRendering")) {
                self.resolve(true)   
                    .done(self._runRenderer, self)
                    .done(self.tryToAttach, self);
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

        _attach: function() {
            var self = this,
                i, l, 
                nodes = self._nodes,
                child,
                attached = false,
                next = self._nextEl,
                parent = self._shadowRoot || self._attachTo,
                before = self._attachBefore;

            if (!nodes || self._attached) {
                return;
            }

            // without the fragment we're in no-template mode
            // processing parent's children
            if (self._fragment || self.rootNode) {

                for (i = 0, l = nodes.length; i < l; i++) {
                    child = nodes[i];

                    // between comments mode
                    if (next) {
                        next.parentNode.insertBefore(child, next);
                        attached = true;
                    }
                    // shadow or normal parent
                    else if (parent) {
                        if (before) {
                            parent.insertBefore(child, before);
                        }
                        else {
                            parent.appendChild(child);
                        }
                        attached = true;
                    }
                }

                if (attached && self._renderer) {
                    self._renderer.attached(self._attachTo);
                }
            }
            else attached = true;

            self._attached = attached;
            if (attached) {
                observable.trigger("attached-" + self.id, self, nodes);
            }
        },

        _clear: function() {
            var self = this,
                nodes = [], 
                i, l, n, parent;

            // remove all children between prev and next
            if (self._nextEl) {
                nodes = self._collectBetweenComments();
            }
            else {
                // remove all children of main node
                var parent = self._shadowRoot || self._attachTo;
                if (parent) {
                    nodes = toArray(parent.childNodes);
                }
            }

            for (i = 0, l = nodes.length; i < l; i++) {
                n = nodes[i];
                n.parentNode && n.parentNode.removeChild(n);
            }

            self._attached = false;

            if (self._renderer) {
                self._renderer.detached();
                observable.trigger("detached-" + self.id, self, nodes);
            }

            return nodes;
        },

        _onParentRendererDestroy: function() {
            var self = this;

            if (!self.$destroyed && self._parentRenderer &&
                !self._parentRenderer.destroyed) {
                self._parentRenderer.$destroy();
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

            observable.destroyEvent("rendered-" + self.id);
            observable.destroyEvent("attached-" + self.id);

            if (self.config) {
                self.config.clear();
                self.config = null;
            }
        }
    });


    Template.load = loadTemplate;
    Template.cache = cache;

    Template.add = function(name, tpl) {
        Template.cache.add(name, tpl);
    };

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

