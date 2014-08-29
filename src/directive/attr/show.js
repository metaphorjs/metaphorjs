

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    animate = require("../../../../metaphorjs-animate/src/metaphorjs.animate.js"),
    AttributeHandler = require("../../view/AttributeHandler.js");


registerAttributeHandler("mjs-show", 500, defineClass(null, AttributeHandler, {

    initial: true,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.supr(scope, node, expr);
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = "";
                }
            };

        self.initial ? done() : animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    style.display = "";
                }
            },
            true)
            .done(done);
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(val);

        self.initial = false;
    }
}));
