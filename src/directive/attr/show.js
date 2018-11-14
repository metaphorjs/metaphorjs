
require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-animate/src/animate/animate.js");

var raf = require("metaphorjs-animate/src/func/raf.js"),
    Directive = require("../../class/Directive.js");


Directive.registerAttribute("show", 500, Directive.$extend({

    $class: "MetaphorJs.Directive.attr.Show",
    initial: true,

    initialSet: function() {
        this.config.setProperty("animate", {type: "bool"});
        this.$super();
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = self.config.get("display") || "";
                }
            };

        self.initial || !self.config.get("animate") ? done() : MetaphorJs.animate.animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    return new MetaphorJs.lib.Promise(function(resolve){
                        raf(function(){
                            style.display = self.config.get("display") || "";
                            resolve();
                        });
                    });
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
