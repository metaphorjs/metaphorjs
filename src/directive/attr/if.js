


var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    animate = require("../../../../metaphorjs-animate/src/metaphorjs.animate.js"),
    AttributeHandler = require("../../view/AttributeHandler.js");


registerAttributeHandler("mjs-if", 500, defineClass(null, AttributeHandler, {

    parentEl: null,
    prevEl: null,
    el: null,
    initial: true,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.parentEl   = node.parentNode;
        self.prevEl     = node.previousSibling;

        self.supr(scope, node, expr);
    },

    onScopeDestroy: function() {

        var self    = this;

        delete self.prevEl;
        delete self.parentEl;

        self.supr();
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
            if (!isAttached(node)) {
                self.initial ? show() : animate(node, "enter", show, true);
            }
        }
        else {
            if (isAttached(node)) {
                self.initial ? hide() : animate(node, "leave", null, true).done(hide);
            }
        }

        self.initial = false;
    }
}));
