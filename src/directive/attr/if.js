


var animate = require("metaphorjs-animate/src/func/animate.js"),
    Directive = require("../../class/Directive.js");


Directive.registerAttribute("if", 500, Directive.$extend({

    parentEl: null,
    prevEl: null,
    nextEl: null,
    el: null,
    initial: true,
    cfg: null,

    $init: function(scope, node, expr, parentRenderer, attr) {

        var self    = this;

        self.parentEl   = node.parentNode;
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;

        self.cfg        = attr ? attr.config : {};

        self.$super(scope, node, expr);
    },

    onScopeDestroy: function() {

        var self    = this;

        self.prevEl = null;
        self.parentEl = null;
        self.nextEl = null;

        self.$super();
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult(),
            parent  = self.parentEl,
            node    = self.node,
            next;

        if (self.prevEl && self.prevEl.parentNode === parent) {
            next = self.prevEl.nextSibling;
            if (!next) {
                next = false;
            }
        }
        else if (self.nextEl && self.nextEl.parentNode === parent) {
            next = self.nextEl;
        }

        var show    = function(){

            var np = self.cfg.position;

            if (np === "append") {
                parent.appendChild(node);
            }
            else if (np === "prepend") {
                parent.insertBefore(node, parent.firstChild);
            }
            else if (next) {
                parent.insertBefore(node, next);
            }
            else if (next === false) {
                parent.appendChild(node);
            }
            else {
                parent.insertBefore(node, parent.firstChild);
            }
        };

        var hide    = function() {
            parent.removeChild(node);
        };

        if (val) {
            self.initial ? show() : animate(node, "enter", show, true);
        }
        else {
            if (node.parentNode) {
                self.initial ? hide() : animate(node, "leave", null, true).done(hide);
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
    }

}));
