

var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    animate = require("metaphorjs-animate/src/func/animate.js"),
    Directive = require("../../class/Directive.js");


Directive.registerAttribute("show", 500, defineClass({

    $extends: Directive,

    initial: true,
    display: "",

    $init: function(scope, node, expr, renderer, attrMap) {

        var self    = this,
            cfg     = attrMap['modifier']['show'] ?
                        attrMap['modifier']['show'].value : {};

        self.display = cfg.display || "";

        self.$super(scope, node, expr);
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = self.display;
                }
            };

        self.initial ? done() : animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    style.display = self.display;
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
