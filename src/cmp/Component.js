(function(){

    "use strict";

    var cmps    = {},
        cmpInx  = -1;

    var getCmpId    = function(cmp) {
        cmpInx++;
        return cmp.id || "cmp-" + cmpInx;
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

    MetaphorJs.define("MetaphorJs.cmp.Component", "MetaphorJs.cmp.Observable", {

        id:             null,
        tag:            'div',
        el:             null,
        dom:            null,
        cls:            null,
        style:          null,
        renderTo:       null,
        html:           null,

        rendered:       false,
        hidden:         false,
        destroyed:      false,

        destroyEl:      true,

        initialize: function(cfg) {

            var self    = this;

            self.supr(cfg);

            if (self.dom && !self.el) {
                self.el     = $(self.dom);
            }

            if (self.el) {
                self.id     = self.el.attr('id');
                if (!self.dom) {
                    self.dom    = self.el.get(0);
                }
            }

            self.id         = getCmpId(self);

            registerCmp(self);

            self.initComponent();

            if (!self.dom && self.renderTo) {
                self.render();
            }
            else if (self.dom) {
                self.hidden     = self.el.is(':hidden');
                self.rendered   = true;
                if (self.html) {
                    self.el.html(self.html);
                    self.html   = null;
                }
                self.onRender();
            }

        },

        render: function(to) {

            var self        = this;

            if (self.rendered) {
                return;
            }

            var tag         = self.tag,
                el          = $('<'+tag+'></'+tag+'>');

            to = to || self.renderTo;

            if (self.cls) {
                el.addClass(self.cls);
            }

            if (self.style) {
                el.css(self.style);
            }

            el.attr('id', self.id);

            if (self.html) {
                el.html(self.html);
                self.html   = null;
            }

            if (self.hidden) {
                el.hide();
            }

            el.appendTo(to || 'body');

            self.el         = el;
            self.dom        = el.get(0);
            self.rendered   = true;
            self.onRender();

            self.renderTo   = null;
        },

        setContent: function(newContent) {

            var self    = this;

            if (self.rendered) {
                self.el.html(newContent);
            }
            else {
                self.html   = newContent;
            }
        },

        onRender: function() {

            var self    = this;

            self.el.attr("cmp-id", self.id);
            self.trigger('render', self);
            self.afterRender();
            self.trigger('afterrender', self);
        },

        show: function() {
            var self    = this;
            if (!self.hidden) {
                return;
            }
            if (self.trigger('beforeshow', self) === false) {
                return false;
            }
            self.el.show();
            self.hidden = false;
            self.onShow();
            self.trigger("show", self);
        },

        hide: function() {
            var self    = this;
            if (self.hidden) {
                return;
            }
            if (self.trigger('beforehide', self) === false) {
                return false;
            }
            self.el.hide();
            self.hidden = true;
            self.onHide();
            self.trigger("hide", self);
        },

        isHidden: function() {
            return this.hidden;
        },

        isRendered: function() {
            return this.rendered;
        },

        isDestroyed: function() {
            return this.destroyed;
        },

        getEl: function() {
            return this.el;
        },

        getDom: function() {
            return this.dom;
        },

        destroy: function() {

            var self    = this;

            if (self.destroyed) {
                return;
            }

            if (self.trigger('beforedestroy', self) === false) {
                return false;
            }

            self.onDestroy();
            self.destroyed  = true;

            self.trigger('destroy', self);

            if (self.destroyEl) {
                self.el.remove();
                self.el     = null;
                self.dom    = null;
            }

            self.supr();
            destroyCmp(self);
        },

        initComponent:  MetaphorJs.emptyFn,
        afterRender:    MetaphorJs.emptyFn,
        onShow:         MetaphorJs.emptyFn,
        onHide:         MetaphorJs.emptyFn,
        onDestroy:      MetaphorJs.emptyFn

    });

    MetaphorJs.getCmp           = getCmp;


    $.fn.createCmp = function(name, cfg) {

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

    $.fn.getCmp = function() {
        return getCmp(this.attr('cmp-id'));
    };

    $.fn.getParentCmp   = function() {

        if (!this.attr("cmp-id")) {
            var parent = this.parents("[cmp-id]").eq(0);
            if (parent.length) {
                return MetaphorJs.getCmp(parent.attr("cmp-id"));
            }
        }
        else {
            return MetaphorJs.getCmp(el.attr("cmp-id"));
        }

        return null;
    };


}());