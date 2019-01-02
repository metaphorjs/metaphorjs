
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
                if (tpl.nodeType !== 11) { // document fragment
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

        if (!self.scope) {
            self.scope = new MetaphorJs.lib.Scope;
        }
        if (!self.config) {
            self.config = new MetaphorJs.lib.Config(null, {
                scope: self.scope
            });
        }
        else if (!(self.config instanceof MetaphorJs.lib.Config)) {
            self.config = new MetaphorJs.lib.Config(
                self.config, 
                {
                    scope: self.scope
                }
            );
        }

        var config = self.config,
            node = self.node;

        config.setDefaultMode("name", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultMode("html", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("animate", "bool", 
                        MetaphorJs.lib.Config.MODE_STATIC, self.animate);
        self.name && config.setDefaultValue("name", self.name);
        self.html && config.setDefaultValue("html", self.html);

        if (self.replace && node && node.parentNode) {
            var cmts = MetaphorJs.dom.commentWrap(node, self.id);
            self._prevEl = cmts[0];
            self._nextEl = cmts[1];
        }

        if (!node) {
            self.deferRendering = true;
        }

        if ((config.has("name") || config.has("html")) && 
            node && node.firstChild) {
            MetaphorJs.dom.data(node, "mjs-transclude", 
                MetaphorJs.dom.toFragment(node.childNodes));
        }

        self.childrenPromise    = new MetaphorJs.lib.Promise;

        MetaphorJs.lib.Observable.$initHost(this, cfg, observable);

        if (self.ownRenderer) {
            self.childrenPromise.resolve(false);
        }

        if (config.has("name")) {
            config.on("name", self._onChange, self);
            self._resolveTemplate()
                .done(function(){
                    if (!self.deferRendering || !self.ownRenderer) {
                        self._applyTemplate();
                    }
                });
        }
        else if (config.has("html")) {
            config.on("html", self._onHtmlChange, self);
            if (!self.deferRendering || !self.ownRenderer) {
                self._resolveHtml();
            }
        }
        else {
            // run renderer on given node without any templates
            if (!self.deferRendering && self.ownRenderer) {
                self._runRenderer();
            }
        }

        if (self.ownRenderer && self.parentRenderer) {
            self.parentRenderer.on("destroy",
                self._onParentRendererDestroy,
                self);
        }

        self.scope.$on("destroy", self._onScopeDestroy, self);
    };

    extend(Template.prototype, {

        _renderer:          null,
        _initial:           true,
        _fragment:          null,
        _prevEl:            null,
        _nextEl:            null,

        scope:              null,
        node:               null,
        config:             null,
        ownRenderer:        true,
        childrenPromise:    null,
        resolvePromise:     null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,
        animate:            false,

        _runRenderer: function() {
            var self = this;
            if (!self._renderer) {
                self._renderer   = new MetaphorJs.app.Renderer(
                        self.node, self.scope
                );
                observable.relayEvent(self._renderer, "reference", "reference-" + self.id);
                observable.relayEvent(self._renderer, "first-node", "first-node-" + self.id);
                observable.relayEvent(self._renderer, "rendered", "rendered-" + self.id);
                self._renderer.process();
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

        moveTo: function(parent, before) {
            var self = this,
                el,
                moved = false,
                els = [], i, l, j, jl;
            self._prevEl && els.push(self._prevEl);
            self.node && els.push(self.node);
            self._nextEl && els.push(self._nextEl);

            for (i = 0, l = els.length; i < l; i++) {
                el = els[i];
                if (isArray(el)) 
                    for (j = -1, jl = el.length; ++j < jl;) {
                        if (el[j].parentNode !== parent) {
                            moved = true;
                        }
                        parent.insertBefore(el[j], before);
                    }
                else {
                    if (el.parentNode !== parent) {
                        moved = true;
                    }
                    parent.insertBefore(el, before);
                } 
            }

            return moved;
        },

        startRendering: function() {

            var self    = this;
            if (self.deferRendering && 
                (self.node || self.node === false)) {
                self.deferRendering = false;

                if (self.config.has("name")) {
                    self._resolveTemplate().done(self._applyTemplate, self);
                }
                else if (self.config.has("html")) {
                    self._resolveHtml();
                }
                else {
                    self._runRenderer();
                }
            }

            return self.childrenPromise;
        },

        _resolveTemplate: function(renew) {

            var self    = this;

            if (self.resolvePromise) {
                if (renew) {
                    self.resolvePromise.$destroy();
                    self.resolvePromise = null;
                }
                else {
                    return self.resolvePromise;
                }
            }

            return self.resolvePromise = new MetaphorJs.lib.Promise(
                function(resolve, reject) {
                    var tpl = self.config.get("name");
                    if (tpl) {
                        resolve(getTemplate(tpl) || loadTemplate(tpl));
                    }
                    else {
                        reject();
                    }
                }
            )
            .done(function(fragment){
                self._fragment = fragment;
            })
            .fail(self.childrenPromise.reject, self.childrenPromise);
        },

        _resolveHtml: function() {
            var self = this,
                htmlVal = self.config.get("html");

            if (htmlVal) {
                self._fragment = MetaphorJs.dom.toFragment(htmlVal);
                self._applyTemplate();
            }
        },

        _onHtmlChange: function() {
            var self    = this;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            if (self.deferRendering) {
                return;
            }

            //self._clearNode();
            self._resolveHtml();
            
        },

        _onChange: function() {

            var self    = this;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            //self._clearNode();

            var tplVal = self.config.get("name");

            if (tplVal) {
                self._resolveTemplate(true)
                    .done(self._applyTemplate, self);
            }
        },

        _clearNode: function() {
            var self = this;

            if (!self.node) {
                return;
            }

            if (self.replace) {
                var next = self._nextEl, prev = self._prevEl;
                while (prev.parentNode && prev.nextSibling && 
                        prev.nextSibling !== next) {
                    prev.parentNode.removeChild(prev.nextSibling);
                }
            }
            else {
                var el = self.node;
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
        },

        _doApplyTemplate: function() {

            var self    = this,
                el      = self.node,
                frg,
                children;

            self._clearNode();

            if (self.replace) {

                frg = MetaphorJs.dom.clone(self._fragment);
                children = toArray(frg.childNodes);

                if (el && el.nodeType) {
                    
                    var transclude = el ? MetaphorJs.dom.data(el, "mjs-transclude") : null;

                    if (transclude) {
                        var tr = MetaphorJs.dom.select(
                            "[{transclude}], [mjs-transclude], mjs-transclude", frg, true);
                        if (tr.length) {
                            MetaphorJs.dom.data(tr[0], "mjs-transclude", transclude);
                        }
                    }

                    el.parentNode && el.parentNode.removeChild(el);
                }

                self._nextEl.parentNode.insertBefore(frg, self._nextEl);
                self.node = children;
                self.childrenPromise.resolve(children);
            }
            else {

                if (el) {
                    el.appendChild(MetaphorJs.dom.clone(self._fragment));
                }
                else {
                    self.node = el = MetaphorJs.dom.clone(self._fragment);
                }

                self.childrenPromise.resolve(el);
            }

            observable.trigger("before-render-" + self.id, self);

            if (self.ownRenderer) {
                self._runRenderer();
            }
        },

        _applyTemplate: function() {

            var self        = this,
                el          = self.node,
                initial     = self._initial,
                deferred    = new MetaphorJs.lib.Promise;

            self._initial = false;

            if (!initial && self.config.get("animate")) {
                MetaphorJs.animate.animate(el, "leave")
                    .done(self._doApplyTemplate, self)
                    .done(deferred.resolve, deferred);
                MetaphorJs.animate.animate(el, "enter");
            }
            else {
                self._doApplyTemplate();
                deferred.resolve();
            }

            return deferred;
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

    Template.cache = cache;

    Template.prepareConfig = function(def, tplConfig) {
        if (typeof def === 'string') {
            tplConfig.setProperty("name", {
                expression: def,
                mode: MetaphorJs.lib.Config.MODE_STATIC
            });
        }
        else if (def) {
            if (def.name || def.nameExpression) {
                tplConfig.setProperty("name", {
                    expression: def.name || def.nameExpression,
                    mode: def.nameExpression ? 
                        MetaphorJs.lib.Config.MODE_DYNAMIC :
                        MetaphorJs.lib.Config.MODE_STATIC
                });
            }
            if (def.html || def.htmlExpression) {
                tplConfig.setProperty("html", {
                    expression: def.html || def.htmlExpression,
                    mode: def.htmlExpression ? 
                        MetaphorJs.lib.Config.MODE_DYNAMIC :
                        MetaphorJs.lib.Config.MODE_STATIC
                });
            }
        }
    };

    return Template;
}();

