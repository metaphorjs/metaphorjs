
require("../../func/dom/toFragment.js");
require("../../func/dom/getAttr.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerTag("if", Directive.attr.If.$extend({
    $class: "MetaphorJs.app.Directive.tag.If",
    _autoOnChange: false,
    children: null,
    childrenFrag: null,

    initDirective: function(scope, node, config, renderer, attrSet) {

        var self    = this;

        self.children = toArray(node.childNodes);
        self.childrenFrag = MetaphorJs.dom.toFragment(self.children);

        renderer && renderer.flowControl("nodes", self.children);

        self.createCommentWrap();
        self.$super(scope, node, config, renderer, attrSet);   

        if (node.parentNode) {
            node.parentNode.removeChild(node); 
        }
    },

    initConfig: function() {
        this.config.setProperty("value", {
            expression: MetaphorJs.dom.getAttr(this.node, "value")
        });
        this.$super();
    },

    onScopeChange: function() {
        var self    = this,
            val     = self.config.get("value"),
            prev    = self.wrapperOpen,
            next    = self.wrapperClose,
            parent  = prev.parentNode;

        if (val) {
            parent.insertBefore(self.childrenFrag, next);
        }
        else if (!self.initial) {
            var children = [],
                sib;

            self.childrenFrag = window.document.createDocumentFragment();
            while (prev.nextSibling && prev.nextSibling !== next) {
                sib = prev.nextSibling;
                parent.removeChild(sib);
                children.push(sib);
                self.childrenFrag.appendChild(sib);
            }
            self.children = children;
        }

        if (self.initial) {
            self.initial = false;
        }
        else {
            if (self.config.get("once")) {
                self.$destroy();
            }
        }
    },

    onDestroy: function() {
        this.children = null;
        this.childrenFrag = null;
        this.$super();
    }
}, {
    initConfig: function(config) {
        config.setType("once", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("value", "bool");
    }
}));
