(function(){

    "use strict";

    var cmps        = {},
        nextUid     = MetaphorJs.nextUid,
        $           = window.jQuery,
        getTemplate = MetaphorJs.getTemplate,
        Scope       = MetaphorJs.view.Scope,
        Renderer    = MetaphorJs.view.Renderer,
        dataFn      = MetaphorJs.data;

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
        propertyAttr:   null, //"mjs-cmp-prop",

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

            if (self.node) {
                self.id     = self.node.getAttribute("id");
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

            if (!self.node.parentNode && self.renderTo) {
                self.render(self.renderTo);
            }
            else if (self.node) {
                self.render();
            }

        },

        _createNode: function() {

            var self    = this,
                node, tmp, tpl;

            if (self.tag) {
                self.node   = document.createElement(self.tag);
            }
            else {
                tpl     = getTemplate(self.template) || self.template;

                if (typeof tpl == "string") {
                    tmp = document.createElement("div");
                    tmp.innerHTML = tpl;
                    tpl = MetaphorJs.toArray(tmp.childNodes);
                }

                if (tpl.length == 1) {
                    self.node   = tpl[0];
                }
                else {
                    self.node = node = document.createElement('div');

                    for (var i = 0, len = tpl.length; i < len; i++) {
                        node.appendChild(tpl[i]);
                    }
                }
            }
        },

        _applyTemplate: function() {

            var self        = this,
                node        = self.node,
                tpl         = getTemplate(self.template) || self.template,
                contents    = MetaphorJs.toArray(node.childNodes),
                clone,
                i, len, tmp;

            if (typeof tpl == "string") {
                tmp = document.createElement("div");
                tmp.innerHTML = tpl;
                clone = MetaphorJs.toArray(tmp.childNodes);
            }
            else {
                clone   = MetaphorJs.clone(tpl);
            }

            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }

            if (contents.length) {
                dataFn(self.node, "mjs-transclude", contents);
            }

            for (i = 0, len = clone.length; i < len; i++) {
                node.appendChild(clone[i]);
            }
        },

        _initElement: function() {

            var self    = this,
                node    = self.node,
                pa      = self.propertyAttr;

            node.setAttribute("id", self.id);
            node.setAttribute("cmp-id", self.id);

            if (self.hidden) {
                node.style.display = "none";
            }

            self.renderer   = new Renderer(self.node, self.scope);
            self.renderer.render();

            if (pa && window.jQuery) {

                $(node).find("["+pa+"]").each(function(){
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
         * @param {string|Element} to
         */
        render: function(to) {

            var self        = this;

            if (self.rendered) {
                return;
            }

            if (to) {
                to.appendChild(self.node);
            }

            self.hidden     = !MetaphorJs.isVisible(self.node);
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

                if (self.node.parentNode) {
                    self.node.parentNode.removeChild(self.node);
                }

                self.node   = null;
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

                cfg.node    = this;
                cmp         = MetaphorJs.create(name, cfg);

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