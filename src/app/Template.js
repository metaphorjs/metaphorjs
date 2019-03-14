
require("../func/dom/data.js");
require("../func/dom/toFragment.js");
require("../func/dom/clone.js");
require("metaphorjs-animate/src/animate/animate.js");
require("../func/dom/select.js");
require("../func/dom/getAttrSet.js");
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
require("../func/dom/isAttached.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    copy = require("metaphorjs-shared/src/func/copy.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    ajax = require("metaphorjs-ajax/src/func/ajax.js");

module.exports = MetaphorJs.app.Template = function() {

    var observable      = new MetaphorJs.lib.Observable,
        cache           = new MetaphorJs.lib.Cache,
        options         = {},
        shadowSupported = !!(window.document.head && window.document.head.attachShadow),
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

            //if (opt.includes) {
            tpl = resolveIncludes(tpl);
            //}

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
        self._virtualSets = {};
        self._namedNodes = {};
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
        config.setType("passReferences", "bool", sm);

        config.setProperty("useComments", "defaultValue", true, /*override: */false);
        config.setProperty("makeTranscludes", "defaultValue", true, /*override: */false);
        config.setProperty("passReferences", "defaultValue", false, /*override: */false);

        !shadowSupported && config.setStatic("useShadow", false);
        config.get("useShadow") && config.setStatic("useComments", false);
        config.get("useShadow") && config.setStatic("makeTranscludes", false);

        /*if (config.get("runRenderer") && self._parentRenderer) {
            self._parentRenderer.on("destroy",
                self._onParentRendererDestroy, self
            );
        }*/
        self.scope.$on("destroy", self._onScopeDestroy, self);

        self._collectInitialNodes(self.attachTo || self.replaceNode);
        self.resolve();

        if (!config.get("deferRendering")) {
            self.render();
        }
    };


    extend(Template.prototype, {

        _rendering:         false,
        _rendered:          false,
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
        _virtualSets:       null,
        _namedNodes:        null,

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
                    .done(self.attachOrReplace, self);
            }
            else {
                self._runRenderer();
                self.attachOrReplace();
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

                if (self._rendered) {
                    if (window.requestAnimationFrame && 
                        MetaphorJs.dom.isAttached(self._attachTo)) {
                        requestAnimationFrame(function(){
                            self._rafAttach();
                        });
                    }
                    else {
                        self._rafAttach();
                    }
                }
            }
        },

        _rafAttach: function() {
            var self = this;

            if (self.$destroyed) {
                return;
            }

            self._createShadow();
            self._createComments();

            if (self._nodes) {
                self._doAttach();   
            }
            else {
                self._setAttached();
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

                if (self._rendered) {
                    if (window.requestAnimationFrame) {
                        requestAnimationFrame(function(){
                            self._rafReplace();
                        });
                    }
                    else self._rafReplace();
                }

                return true;
            }
        },

        _rafReplace: function() {
            var self = this;

            if (self.$destroyed) {
                return;
            }

            if (self._attachTo) {
                self._replaceNodeWithNode(node, self._attachTo);
                self._createShadow();
            }   
            else {
                self._replaceNodeWithComments(self._replaceNode);
            }

            if (self._nodes) {
                self._doAttach();
            }
            else self._setAttached();
        },

        attachOrReplace: function() {
            var self = this;
            if (self._attached || !self._rendered) {
                return;
            }
            // new attachment via replace
            if (self.replaceNode && self.replaceNode.parentNode) {
                self.replace(self.replaceNode, self.attachTo);
            }
            // new attachment via append
            else if (self.attachTo) {
                if (self.attachBefore) {
                    self.attachBefore.parentNode && 
                        self.attach(self.attachTo, self.attachBefore);
                }
                else self.attach(self.attachTo);
            }
            // reattaching to previous
            else if (self._nextEl || self._attachTo || self._shadowRoot) {
                self._doAttach();
            }
            else if (self._nodes && self._nodes.length && 
                    MetaphorJs.dom.isAttached(self._nodes[0])) {
                self._setAttached();
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
            var self    = this,
                config = self.config;

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

            if (config.has("name")) {
                config.get("name") && 
                    (self._resolvePromise = self._resolveTemplate());
            }
            else if (config.has("html")) {
                config.get("html") &&
                    (self._resolvePromise = self._resolveHtml());
            }

            !self._resolvePromise &&
                (self._resolvePromise = MetaphorJs.lib.Promise.resolve());

            self._resolvePromise.fail(self._onTemplateNotFound, self);

            return self._resolvePromise.done(self._onTemplateResolved, self);
        },

        getVirtualSet: function(ref) {
            return this._virtualSets[ref] ? copy(this._virtualSets[ref]) : null;
        },

        setNamedNode: function(ref, node) {
            var self = this,
                nodes = self._namedNodes[ref];

            if (node['__namedRenderer'] && node['__namedRenderer'][ref]) {
                return;
            }

            if (!nodes) {
                nodes = self._namedNodes[ref] = [];
            }

            if (node && nodes.indexOf(node) === -1) {
                nodes.push(node);
                if (self._renderer && self._virtualSets[ref]) {
                    self._renderer.processNode(node, self.scope, self.getVirtualSet(ref));
                }
            }
        },

        removeNamedNode: function(ref, node) {
            var nodes = this._namedNodes[ref],
                inx;
            if (!nodes || (inx = nodes.indexOf(node)) !== -1) {
                nodes.splice(inx, 1);
            }
        },


        _extractVirtualSets: function(frag) {
            var self = this,
                node = frag.firstChild,
                cmtType = window.document.COMMENT_NODE,
                data, next;
            while (node) {
                next = node.nextSibling;
                if (node.nodeType === cmtType) {
                    data = node.textContent || node.data;
                    if (data.substring(0,1) === '<' && 
                        data.substring(data.length-1) === '>') {
                        self._processVirtualSet(data);
                        frag.removeChild(node);
                    }
                }
                node = next;
            }
        },

        _processVirtualSet: function(data) {
            var div = window.document.createElement("div");
            div.innerHTML = data;
            var node = div.firstChild;
            if (node) {
                var ref = node.tagName.toLowerCase(),
                    attrSet = MetaphorJs.dom.getAttrSet(node);
                this._virtualSets[ref] = attrSet;
            }
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

                self._extractVirtualSets(self._fragment);

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

        _onTemplateNotFound: function() {
            throw new Error("Template " + this.config.get("name") + " not found");
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
                
                self._destroyRenderer();

                observable.trigger("before-render-" + self.id, self);

                self._renderer   = new MetaphorJs.app.Renderer;

                if (self.config.get("passReferences") && self._parentRenderer) {
                    self._renderer.on(
                        "reference", 
                        self._parentRenderer.trigger,
                        self._parentRenderer,
                        {
                            prepend: ["reference"]
                        }
                    );
                }

                self._renderer.on("transclude-sources", self._onTranscludeSource, self);
                // after renderer had its course, the list of nodes may have changed.
                // we need to reflect this in _nodes before attaching stuff
                self._renderer.on("rendered", self._collectedNodesAfterRendered, self);
                // then we apply directives to all named nodes we have at the moment
                self._renderer.on("rendered", self._processNamedNodes, self);
                // then send the 'rendered' signal up the chain
                observable.relayEvent(self._renderer, "rendered", "rendered-" + self.id);

                observable.relayEvent(self._renderer, "reference", "reference-" + self.id);
                
                if (self._nodes) {
                    self._renderer.process(self._nodes, self.scope);
                }
                else {
                    self._renderer.trigger("rendered", self._renderer);
                }
            }
        },

        _onTranscludeSource: function() {
            return this._replaceNode || this.replaceNode || 
                    this._attachTo || this.attachTo;
        },

        _collectedNodesAfterRendered: function() {
            var self = this;
            self._rendered = true;
            if (self._fragment) {
                this._nodes = toArray(self._fragment.childNodes);
            }
        },

        _processNamedNodes: function() {
            var self = this,
                vnodes = self._namedNodes,
                vsets = self._virtualSets,
                ref, i, l,
                node, nr, attrSet,
                attr;

            for (ref in vnodes) {
                if (vsets[ref]) {
                    for (i = 0, l = vnodes[ref].length; i < l; i++) {
                        node = vnodes[ref][i];
                        nr = node['__namedRenderer'] || {};
                        nr[ref] = self._renderer.id;
                        node['__namedRenderer'] = nr;
                        attrSet = self.getVirtualSet(ref);

                        if (attrSet.rest && node.nodeType === window.document.ELEMENT_NODE) {
                            for (attr in attrSet.rest) {
                                node.setAttribute(attr, attrSet.rest[attr]);
                            }
                        }
                        self._renderer.processNode(node, self.scope, attrSet);
                    }
                }
            }
        },

        _destroyRenderer: function() {
            var self = this;

            self._rendered = false;

            if (self._renderer) {
                var id = self._renderer.id,
                    vnodes = self._namedNodes,
                    ref, i, l,
                    node, nr;
                self._renderer.$destroy();
                self._renderer = null;

                for (ref in vnodes) {
                    for (i = 0, l = vnodes[ref].length; i < l; i++) {
                        node = vnodes[ref][i];
                        nr = node['__namedRenderer'];
                        nr && nr[ref] === id && (nr[ref] = null);
                    }
                }
                self._namedNodes = {};
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
                    .done(self.attachOrReplace, self);
            }
        },

        _onNameChange: function() {
            var self = this;
            if (!self.config.get("deferRendering")) {
                self.resolve(true)   
                    .done(self._runRenderer, self)
                    .done(self.attachOrReplace, self);
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

        _doAttach: function() {
            
            var self = this,
                i, l, 
                nodes= self._nodes,
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

                // if we have children in the fragment,
                // we use them (they might have changed since)
                // this template has been rendered
                // because of inner templates and renderers
                if (self._fragment && self._fragment.firstChild) {
                    self._nodes = nodes = toArray(self._fragment.childNodes);
                }

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
            }
            else attached = true;

            self._attached = attached;
            if (attached) {
                self._setAttached(nodes);
            }
        },

        _setAttached: function(nodes) {
            var self = this;
            self._attached = true;
            observable.trigger("attached-" + self.id, self, nodes);
            if (self._renderer) {
                self._renderer.attached(self._attachTo);
            }
        },

        _collectNodes: function() {
            var self = this,
                nodes = [], parent;

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

            return nodes;
        },

        _clear: function() {
            var self = this,
                nodes = self._collectNodes(), 
                i, l, n;

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

        /*_onParentRendererDestroy: function() {
            //var self = this;

            if (!self.$destroyed && self._renderer &&
                !self._renderer.$destroyed) {
                self._renderer.$destroy();
            }

            this.$destroy();
        },*/

        _onScopeDestroy: function() {
            this.$destroy();
        },

        $destroy: function() {

            var self = this;

            self.$destroyed = true;

            if (self._nextEl && self._nextEl.parentNode) {
                self._nextEl.parentNode.removeChild(self._nextEl);
            }

            if (self._prevEl && self._prevEl.parentNode) {
                self._prevEl.parentNode.removeChild(self._prevEl);
            }

            if (self._renderer) {
                self._renderer.$destroy();
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

    Template.get = getTemplate;

    Template.prepareConfig = function(config, values) {
        if (typeof values === 'string') {
            config.setDefaultValue("name", values);
        }
        else if (values) {
            if (!values.name && !values.html && values.expression) {
                values.name = {expression: values.expression};
            }
            config.addProperties(values, "defaultValue");
        }
    };

    return Template;
}();

