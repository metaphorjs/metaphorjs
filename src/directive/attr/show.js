
require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-animate/src/animate/animate.js");
require("../../lib/Config.js");

var raf = require("metaphorjs-animate/src/func/raf.js"),
    Directive = require("../../app/Directive.js");


Directive.registerAttribute("show", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Show",
    id: "show",

    _initial: true,

    _initConfig: function(config) {
        config.setType("display", 
            "string", MetaphorJs.lib.Config.MODE_STATIC, "");
        config.setType("animate", 
            "bool", MetaphorJs.lib.Config.MODE_STATIC, false);
        this.$super(config);
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = self.config.get("display");
                }
            };

        self._initial || !self.config.get("animate") ? done() : MetaphorJs.animate.animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    return new MetaphorJs.lib.Promise(function(resolve){
                        raf(function(){
                            style.display = self.config.get("display");
                            resolve();
                        });
                    });
                }
            })
            .done(done);
    },

    onScopeChange: function(val) {
        var self    = this;
        self.runAnimation(val);
        self._initial = false;
        self.$super(val);
    }
}));
