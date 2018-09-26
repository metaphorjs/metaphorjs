
var Directive = require("../../class/Directive.js"),
    toFragment = require("../../func/dom/toFragment.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    undf = require("../../var/undf.js"),
    toArray = require("../../func/array/toArray.js");

Directive.registerTag("if", Directive.attr.If.$extend({
    $class: "MetaphorJs.Directive.tag.If",
    autoOnChange: false,
    children: null,
    childrenFrag: null,

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this;
        
        self.children = toArray(node.childNodes);
        self.childrenFrag = toFragment(self.children);
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
            parent.insertBefore(self.childrenFrag, self.nextEl);
        }
        else if (!self.initial) {
            var prev = self.prevEl, 
                next = self.nextEl, 
                children = [],
                sib;

            self.childrenFrag = window.document.createDocumentFragment();
            while (prev.parentNode && prev.nextSibling && 
                    prev.nextSibling !== next) {
                sib = prev.nextSibling;
                prev.parentNode.removeChild(sib);
                children.push(sib);
                self.childrenFrag.appendChild(sib);
            }
            self.children = children;
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

    onDestroy: function() {
        this.children = null;
        this.$super();
    }
}));
