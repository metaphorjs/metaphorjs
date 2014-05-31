(function(){

    var profileTime = function(prev, comment) {

        var time    = (new Date).getTime();

        if (prev) {
            console.log(comment, time - prev);
        }

        return time;
    };


    "use strict";

    var cmps        = {},
        nextUid     = MetaphorJs.nextUid,
        $           = window.jQuery,
        getTemplate = MetaphorJs.getTemplate,
        Scope       = MetaphorJs.view.Scope,
        Renderer    = MetaphorJs.view.Renderer;

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

        /**
         * @access protected
         * @var jQuery
         */
        el:             null,

        /**
         * @var Element
         * @access protected
         */
        node:           null,

        /**
         * @var string|jQuery|Element
         * @access protected
         */
        renderTo:       null,

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
         * @var MetaphorJs.view.Renderer
         */
        renderer:      null,

        /**
         * @var MetaphorJs.view.Scope
         */
        scope:          null,

        /**
         * @var string
         */
        template:       null,

        /**
         * @var string
         */
        propertyAttr:   "mjs-cmp-prop",

        /**
         * @var string
         */
        tag:            null,

        /**
         * @constructor
         * @param {object} cfg {
         *      @type string id Element id
         *      @type string|jQuery|Element el
         *      @type string|Element|jQuery renderTo
         *      @type bool hidden
         *      @type bool destroyEl
         * }
         */
        initialize: function(cfg) {

            var self    = this;

            self.supr(cfg);

            if (self.node && !self.el) {
                self.el     = $(self.node);
            }

            if (self.el) {
                self.id     = self.el.attr('id');
                if (!self.node) {
                    self.node    = self.el.get(0);
                }
            }

            self.id         = getCmpId(self);

            registerCmp(self);

            self.initComponent();

            if (!self.node) {
                self._createNode();
            }
            else if (self.template) {
                self._applyTemplate();
            }

            self._initElement();

            if (!self.node.parentElement && self.renderTo) {
                self.render(self.renderTo);
            }
            else if (self.node) {
                self.render();
            }

        },

        _createNode: function() {

            var self    = this,
                tpl,
                el;

            if (self.tag) {
                self.node   = document.createElement(self.tag);
                self.el     = $(self.node);
            }
            else {
                tpl     = getTemplate(self.template) || self.template;
                el      = $(tpl);

                if (el.length == 1) {
                    self.el     = el;
                    self.node   = el.get(0);
                }
                else {
                    self.node   = document.createElement('div');
                    self.el     = $(self.node);
                    self.el.append(el);
                }
            }
        },

        _applyTemplate: function() {

            var self        = this,
                tpl         = getTemplate(self.template) || self.template,
                contents    = $(self.node.childNodes),
                el          = self.el;

            if (contents.length) {
                contents.remove();
                el.data("mjs-transclude", contents);
            }

            el.empty();
            el.append(tpl.clone());
        },

        _initElement: function() {

            var self    = this,
                el      = self.el,
                node    = self.node,
                pa      = self.propertyAttr;

            node.setAttribute("id", self.id);
            node.setAttribute("cmp-id", self.id);

            if (self.hidden) {
                el.hide();
            }

            self.renderer   = new Renderer(self.node, self.scope);
            self.renderer.render();

            if (pa) {

                el.find("["+pa+"]").each(function(){
                    var elem    = $(this),
                        prop    = elem.attr(pa);

                    if (!self[prop]) {
                        self[prop]  = elem;
                    }
                    else {
                        self[prop].add(elem);
                    }
                });
            }

        },

        /**
         * @param {string|Element|jQuery} to
         */
        render: function(to) {

            var self        = this;

            if (self.rendered) {
                return;
            }

            if (to) {
                $(to).append(self.el);
            }

            self.hidden     = self.el.is(':hidden');
            self.rendered   = true;

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
            self.el.show();
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
            self.el.hide();
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
         * @return jQuery
         */
        getEl: function() {
            return this.el;
        },

        /**
         * @access public
         * @return DOM
         */
        getDom: function() {
            return this.dom;
        },

        /**
         * @method
         * @access protected
         */
        initComponent:  MetaphorJs.emptyFn,

        /**
         * @method
         * @access protected
         */
        afterRender:    MetaphorJs.emptyFn,

        /**
         * @method
         * @access protected
         */
        onShow:         MetaphorJs.emptyFn,

        /**
         * @method
         * @access protected
         */
        onHide:         MetaphorJs.emptyFn,


        onDestroy:      function() {

            var self    = this;

            if (self.destroyEl) {
                self.el.remove();
                self.el     = null;
                self.dom    = null;
            }

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


    if (window.jQuery) {


        /**
         * @namespace
         * @function $.fn.createCmp
         * @param {string} name
         * @param {object} cfg See MetaphorJs.cmp.Component constructor
         * @returns jQuery
         */
        jQuery.fn.createCmp = function(name, cfg) {

            var cmp = null;

            if (name && typeof name != "string") {
                cfg     = name;
                name    = null;
            }

            name    = name || "MetaphorJs.cmp.Component";
            cfg     = cfg || {};

            this.each(function() {

                var o   = $(this),
                    id  = o.attr('cmp-id');

                if (id) {
                    cmp     = getCmp(id);
                    return false;
                }

                cfg.el      = o;
                cfg.dom     = this;

                cmp     = MetaphorJs.create(name, cfg);

                return false;
            });

            return cmp;
        };

        /**
         * @function $.fn.getCmp
         * @return MetaphorJs.cmp.Component
         */
        jQuery.fn.getCmp = function() {
            return getCmp(this.attr('cmp-id'));
        };

        /**
         * @function $.fn.getParentCmp
         * @return MetaphorJs.cmp.Component
         */
        jQuery.fn.getParentCmp   = function() {

            if (!this.attr("cmp-id")) {
                var parent = this.parents("[cmp-id]").eq(0);
                if (parent.length) {
                    return MetaphorJs.getCmp(parent.attr("cmp-id"));
                }
            }
            else {
                return MetaphorJs.getCmp(this.attr("cmp-id"));
            }

            return null;
        };

    }


}());