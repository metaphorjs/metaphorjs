(function(){

    "use strict";

    var m           = window.MetaphorJs,
        extend      = m.extend,
        nextUid     = m.nextUid,
        emptyFn     = m.emptyFn,
        g           = m.ns.get,
        Promise     = m.lib.Promise,
        Template    = m.view.Template,
        toFragment  = m.toFragment,
        isAttached  = m.isAttached,
        dataFn      = m.data,
        Scope       = m.view.Scope,
        Provider    = m.lib.Provider,
        addClass    = m.addClass,
        removeClass = m.removeClass;


    var getCmpId    = function(cmp) {
        return cmp.id || "cmp-" + nextUid();
    };

    /**
     * @namespace MetaphorJs
     * @class MetaphorJs.cmp.Component
     * @extends MetaphorJs.cmp.Observable
     */
    MetaphorJs.define("MetaphorJs.cmp.Component", "MetaphorJs.cmp.Base", {

        /**
         * @access protected
         * @var string
         */
        id:             null,

        originalId:     false,

        /**
         * @var Element
         * @access protected
         */
        node:           null,

        /**
         * @var string|Element
         * @access protected
         */
        renderTo:       null,

        /**
         * @var {boolean}
         */
        autoRender:     true,

        /**
         * @var bool
         * @access protected
         */
        rendered:       false,

        /**
         * @var bool
         * @access protected
         */
        hidden:         false,

        /**
         * @var bool
         * @access protected
         */
        destroyEl:      true,

        destroyScope:   false,

        /**
         * @var {MetaphorJs.view.Scope}
         */
        scope:          null,

        /**
         * @var {MetaphorJs.view.Template}
         */
        template:       null,

        templateUrl:    null,

        /**
         * @var string
         */
        tag:            null,


        /**
         * @constructor
         * @param {object} cfg {
         *      @type string id Element id
         *      @type string|Element el
         *      @type string|Element renderTo
         *      @type bool hidden
         *      @type bool destroyEl
         * }
         */
        initialize: function(cfg) {

            var self    = this;

            if (!self.scope) {
                self.scope = new Scope;
            }

            self.supr(cfg);

            if (cfg.as) {
                self.scope[cfg.as] = self;
            }

            if (self.node) {
                self.id     = self.node.getAttribute("id");
                if (self.id) {
                    self.originalId = true;
                }
            }

            self.id         = getCmpId(self);

            if (!self.node) {
                self._createNode();
            }

            self.initComponent.apply(self, arguments);

            if (self.scope.$app){
                self.scope.$app.registerCmp(self);
            }

            var tpl = self.template,
                url = self.templateUrl;

            if (!tpl || !(tpl instanceof Template)) {
                self.template = tpl = new Template({
                    scope: self.scope,
                    node: self.node,
                    deferRendering: !tpl,
                    ownRenderer: true,
                    tpl: tpl,
                    url: url
                });
            }
            else if (tpl instanceof Template) {
                // it may have just been created
                self.template.node = self.node;
            }

            if (self.parentRenderer) {
                self.parentRenderer.on("destroy", self.onParentRendererDestroy, self);
            }

            self._initElement();

            if (self.autoRender) {

                if (tpl.initPromise) {
                    tpl.initPromise.done(self.render, self);
                }
                else {
                    self.render();
                }
            }
        },

        _createNode: function() {

            var self    = this;
            self.node   = document.createElement(self.tag || 'div');
        },

        _initElement: function() {

            var self    = this,
                node    = self.node;

            node.setAttribute("id", self.id);
            node.setAttribute("cmp-id", self.id);

            if (self.hidden) {
                node.style.display = "none";
            }
        },

        render: function() {

            var self        = this;

            if (self.rendered) {
                return;
            }

            self.trigger('render', self);

            self.template.on("rendered", self.onRenderingFinished, self);
            self.template.startRendering();
        },

        onRenderingFinished: function() {
            var self = this;

            if (self.renderTo) {
                self.renderTo.appendChild(self.node);
            }
            else if (!isAttached(self.node)) {
                document.body.appendChild(self.node);
            }

            self.rendered   = true;
            self.afterRender();
            self.trigger('afterrender', self);
        },


        /**
         * @access public
         * @method
         */
        show: function() {
            var self    = this;
            if (!self.hidden) {
                return;
            }
            if (self.trigger('beforeshow', self) === false) {
                return false;
            }

            self.node.style.display = "block";

            self.hidden = false;
            self.onShow();
            self.trigger("show", self);
        },

        /**
         * @access public
         * @method
         */
        hide: function() {
            var self    = this;
            if (self.hidden) {
                return;
            }
            if (self.trigger('beforehide', self) === false) {
                return false;
            }

            self.node.style.display = "none";

            self.hidden = true;
            self.onHide();
            self.trigger("hide", self);
        },

        /**
         * @access public
         * @return bool
         */
        isHidden: function() {
            return this.hidden;
        },

        /**
         * @access public
         * @return bool
         */
        isRendered: function() {
            return this.rendered;
        },

        /**
         * @access public
         * @return bool
         */
        isDestroyed: function() {
            return this.destroyed;
        },

        /**
         * @access public
         * @return Element
         */
        getEl: function() {
            return this.node;
        },

        /**
         * @method
         * @access protected
         */
        initComponent:  emptyFn,

        /**
         * @method
         * @access protected
         */
        afterRender:    emptyFn,

        /**
         * @method
         * @access protected
         */
        onShow:         emptyFn,

        /**
         * @method
         * @access protected
         */
        onHide:         emptyFn,

        onParentRendererDestroy: function() {
            this.destroy();
        },

        onDestroy:      function() {

            var self    = this;

            if (self.template) {
                self.template.destroy();
                delete self.template;
            }

            if (self.destroyEl) {
                if (isAttached(self.node)) {
                    self.node.parentNode.removeChild(self.node);
                }
            }
            else {
                self.node.removeAttribute("cmp-id");
                if (!self.originalId) {
                    self.node.removeAttribute("id");
                }
            }

            if (self.destroyScope && self.scope) {
                self.scope.$destroy();
            }

            delete self.scope;
            delete self.node;

            self.supr();
        }

    });

    /**
     * @md-end-class
     */

    MetaphorJs.resolveComponent = function(cmp, cfg, scope, node, args) {

        var hasCfg  = cfg !== false;

        cfg         = cfg || {};
        args        = args || [];

        scope       = scope || cfg.scope; // || new Scope;
        node        = node || cfg.node;

        cfg.scope   = cfg.scope || scope;
        cfg.node    = cfg.node || node;

        var constr      = typeof cmp == "string" ? g(cmp) : cmp;

        if (!constr) {
            throw "Component " + cmp + " not found";
        }

        if (scope && constr.isolateScope) {
            cfg.scope   = scope = scope.$newIsolated();
        }

        var i,
            defers      = [],
            tpl         = constr.template || cfg.template || null,
            tplUrl      = constr.templateUrl || cfg.templateUrl || null,
            app         = scope ? scope.$app : null,
            gProvider   = Provider.global(),
            injectFn    = app ? app.inject : gProvider.inject,
            injectCt    = app ? app : gProvider,
            cloak       = node ? node.getAttribute("mjs-cloak") : null,
            inject      = {
                $node: node || null,
                $scope: scope || null,
                $config: cfg || null,
                $args: args || null
            };

        if (constr.resolve) {

            for (i in constr.resolve) {
                (function(name){
                    var d = new Promise,
                        fn;

                    defers.push(d.done(function(value){
                        inject[name] = value;
                        cfg[name] = value;
                        args.push(value);
                    }));

                    fn = constr.resolve[i];

                    if (typeof fn == "function") {
                        d.resolve(fn(scope, node));
                    }
                    else {
                        d.resolve(injectFn.call(injectCt, fn, null, false, extend({}, inject, cfg, false, false)));
                    }

                }(i));
            }
        }

        if (hasCfg && (tpl || tplUrl)) {

            cfg.template = new Template({
                scope: scope,
                node: node,
                deferRendering: true,
                ownRenderer: true,
                tpl: tpl,
                url: tplUrl
            });

            defers.push(cfg.template.initPromise);

            if (node && node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }
        }

        hasCfg && args.unshift(cfg);

        var p;

        if (defers.length) {
            p = new Promise;

            Promise.all(defers).done(function(){
                p.resolve(injectFn.call(injectCt, constr, null, true, extend({}, inject, cfg, false, false), args));
            });
        }
        else {
            p = Promise.resolve(
                injectFn.call(injectCt, constr, null, true, extend({}, inject, cfg, false, false), args)
            );
        }

        if (node && p.isPending() && cloak !== null) {
            cloak ? addClass(node, cloak) : node.style.visibility = "hidden";
            p.done(function() {
                cloak ? removeClass(node, cloak) : node.style.visibility = "";
            });
        }

        return p;
    };


}());