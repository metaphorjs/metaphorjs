


var animate = require("metaphorjs-animate/src/func/animate.js"),
    Directive = require("../../class/Directive.js"),
    isAttached = require("../../func/dom/isAttached.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js");


Directive.registerAttribute("mjs-if", 500, Directive.$extend({

    parentEl: null,
    prevEl: null,
    nextEl: null,
    el: null,
    initial: true,
    cfg: null,

    $init: function(scope, node, expr) {

        var self    = this;

        self.parentEl   = node.parentNode;
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;

        self.$super(scope, node, expr);

    },

    onScopeDestroy: function() {

        var self    = this;

        self.prevEl = null;
        self.parentEl = null;

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
        }
        else if (self.nextEl && self.nextEl.parentNode === parent) {
            next = self.nextEl;
        }

        var show    = function(){
            if (next) {
                parent.insertBefore(node, next);
            }
            else {
                parent.insertBefore(node, parent.firstChild);
                //parent.appendChild(node);
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
            if (!self.cfg) {
                self.cfg = getNodeConfig(node, self.scope);
            }
            if (self.cfg.ifOnce) {
                self.$destroy();
            }
        }
    }

}));
