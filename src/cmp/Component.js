(function(){

    "use strict";

    var cmps        = {},
        nextUid     = MetaphorJs.nextUid,
        emptyFn     = MetaphorJs.emptyFn,
        g           = MetaphorJs.ns.get,
        Promise     = MetaphorJs.lib.Promise,
        Template    = MetaphorJs.view.Template,
        trim        = MetaphorJs.trim,
        toExpression    = MetaphorJs.lib.Watchable.toExpression;


    var getCmpId    = function(cmp) {
        return cmp.id || "cmp-" + nextUid();
    };

    var registerCmp = function(cmp) {
        cmps[cmp.id]   = cmp;
    };

    var destroyCmp  = function(cmp) {
        delete cmps[cmp.id];
    };

    var getCmp      = function(id) {
        return cmps[id] || null;
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

        /**
         * @var {MetaphorJs.view.Scope}
         */
        scope:          null,

        /**
         * @var {MetaphorJs.view.Template}
         */
        template:       null,

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

            registerCmp(self);

            self.initComponent.apply(self, arguments);


            if (!self.node) {
                self._createNode();
            }

            var tpl = self.template;

            if (!tpl || !(tpl instanceof Template)) {
                self.template = tpl = new Template({
                    scope: self.scope,
                    node: self.node,
                    deferRendering: true,
                    ownRenderer: true,
                    tpl: toExpression(trim(tpl))
                });
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

            if (self.renderTo) {
                self.renderTo.appendChild(self.node);
            }

            self.hidden     = !MetaphorJs.isVisible(self.node);
            self.rendered   = true;

            self.template.startRendering();

            self.trigger('render', self);
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
                return;
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
                return;
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
                if (self.node.parentNode) {
                    self.node.parentNode.removeChild(self.node);
                }
            }
            else {
                self.node.removeAttribute("cmp-id");
                if (!self.originalId) {
                    self.node.removeAttribute("id");
                }
            }

            self.scope.$destroy();
            delete self.scope;
            delete self.node;

            self.supr();
            destroyCmp(self);
        }

    });

    /**
     * @md-end-class
     */

    /**
     * @function MetaphorJs.getCmp
     * @param string id
     */
    MetaphorJs.getCmp           = getCmp;


    MetaphorJs.resolveComponent = function(cmp, cfg, scope, node, parentRenderer, args) {

        var constr  = typeof cmp == "string" ? g(cmp) : cmp,
            i,
            defers  = [],
            tpl     = constr.template || cfg.template;

        args        = args || [];

        if (constr.resolve) {

            for (i in constr.resolve) {
                (function(name){
                    var d = new Promise;
                    defers.push(d.done(function(value){
                        cfg[name] = value;
                    }));
                    d.resolve(constr.resolve[i](scope, node));
                }(i));
            }
        }
        if (tpl) {

            cfg.template = new Template({
                scope: scope,
                node: node,
                deferRendering: true,
                ownRenderer: true,
                tpl: toExpression(trim(tpl))
            });

            defers.push(cfg.template.initPromise);
        }

        var deferred = defers.length;

        if (deferred) {
            node.style.visibility = 'hidden';
        }

        args.unshift(cfg);

        return Promise.all(defers).then(function(){
            if (deferred) {
                node.style.visibility = 'visible';
            }
            return constr.__instantiate.apply(null, args);
        });
    };


}());