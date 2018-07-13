

var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    animate = require("metaphorjs-animate/src/func/animate.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),
    Directive = require("../../class/Directive.js");


Directive.registerAttribute("show", 500, defineClass({

    $extends: Directive,

    animate: false,
    initial: true,
    display: "",

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this,
            cfg     = attr ? attr.config : {};

        self.display = cfg.display || "";
        self.animate = !!cfg.animate;

        self.$super(scope, node, expr, renderer, attr);
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

        self.initial || !self.animate ? done() : animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    var p = new Promise;
                    raf(function(){
                        style.display = self.display;
                        p.resolve();
                    });
                    return p;
                }
            })
            .done(done);
    },

    onChange: function(val) {
        var self    = this;
        self.runAnimation(val);
        self.initial = false;
        self.$super(val);
    }
}));
