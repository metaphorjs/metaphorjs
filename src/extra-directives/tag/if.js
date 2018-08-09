
var Directive = require("../../class/Directive.js"),
    defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    toFragment = require("../../func/dom/toFragment.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    undf = require("../../var/undf.js"),
    toArray = require("../../func/array/toArray.js");

Directive.registerTag("if", defineClass({
    $class: "Directive.tag.If",
    $extends: "Directive.attr.If",
    autoOnChange: false,

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this;
        
        self.children = toArray(node.childNodes);
        expr = getAttr(node, "value");

        self.$super(scope, node, expr, renderer, attr);   
        
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        
        var val = self.watcher.getLastResult();
        self.onChange(val || false, undf);
    },

    getChildren: function() {
        return this.children;
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult(),
            parent  = self.prevEl.parentNode;

        if (val) {
            parent.insertBefore(toFragment(self.children), self.nextEl);
        }
        else if (!self.initial) {
            var i, l;
            for (i = 0, l = self.children.length; i < l; i++) {
                if (parent.contains(self.children[i])) {
                    parent.removeChild(self.children[i]);
                }
            }
        }

        if (self.initial) {
            self.initial = false;
        }
        else {
            if (self.cfg.once) {
                self.$destroy();
            }
        }
    },

    destroy: function() {
        this.children = null;
        this.$super();
    }
}));
