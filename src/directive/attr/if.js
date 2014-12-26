


var animate = require("metaphorjs-animate/src/func/animate.js"),
    Directive = require("../../class/Directive.js"),
    isAttached = require("../../func/dom/isAttached.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js");


Directive.registerAttribute("mjs-if", 500, Directive.$extend({

    parentEl: null,
    prevEl: null,
    el: null,
    initial: true,
    cfg: null,

    $init: function(scope, node, expr) {

        var self    = this;

        self.parentEl   = node.parentNode;
        self.prevEl     = node.previousSibling;

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
            node    = self.node;

        var show    = function(){
            if (self.prevEl) {
                parent.insertBefore(node, self.prevEl ? self.prevEl.nextSibling : null);
            }
            else {
                parent.appendChild(node);
            }
        };

        var hide    = function() {
            parent.removeChild(node);
        };

        if (val) {
            //if (!isAttached(node)) {
                self.initial ? show() : animate(node, "enter", show, true);
            //}
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
