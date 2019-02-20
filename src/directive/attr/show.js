
require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-animate/src/animate/animate.js");
require("../../lib/Config.js");

var raf = require("metaphorjs-animate/src/func/raf.js"),
    Directive = require("../../app/Directive.js");


Directive.registerAttribute("show", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Show",
    id: "show",

    _initial: true,

    initConfig: function() {
        var config = this.config;
        config.setType("display", 
            "string", MetaphorJs.lib.Config.MODE_STATIC, "");
        config.setType("animate", 
            "bool", MetaphorJs.lib.Config.MODE_STATIC, false);
        this.$super();
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            initial = this._initial,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = self.config.get("display");
                }
                if (!initial) {
                    self.trigger(show?"show" : "hide", self.node);
                }
            };

        initial || !self.config.get("animate") ? 
            (initial ? done() : raf(done)) : 
            MetaphorJs.animate.animate(
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
                }
            )
            .done(done);
    },

    onScopeChange: function(val) {
        var self    = this;
        self.runAnimation(val);
        self._initial = false;
        self.$super(val);
    }
}));
