
require("metaphorjs-animate/src/animate/animate.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    raf = require("metaphorjs-animate/src/func/raf.js");


Directive.registerAttribute("if", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.If",
    id: "if",

    _initial: true,
    
    initConfig: function() {
        var config = this.config;
        config.setType("animate", "bool", MetaphorJs.lib.Config.MODE_STATIC)
        config.setType("value", "bool");
        config.setType("once", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("onShow", null, MetaphorJs.lib.Config.MODE_FUNC);
        config.setType("onHide", null, MetaphorJs.lib.Config.MODE_FUNC);
        this.$super();
    },
    
    initDirective: function() {
        this.createCommentWrap(this.node, "if");
        this.$super();
    },
    

    onScopeChange: function() {
        var self    = this,
            config  = self.config,
            val     = config.get("value"),
            parent  = self.wrapperOpen.parentNode,
            node    = self.node,
            initial = self._initial,

            show    = function(){
                parent.insertBefore(node, self.wrapperClose);
                if (!initial) {
                    raf(self.trigger, self, ["show", node]);
                }
            },

            hide    = function() {
                parent.removeChild(node);
                if (!initial) {
                    raf(self.trigger, self, ["hide", node]);
                }
            };

        if (val) {
            initial || !self.config.get("animate") ?
                (initial ? show() : raf(show)) : 
                MetaphorJs.animate.animate(node, "enter", show);
        }
        else {
            if (node.parentNode) {
                initial || !self.config.get("animate") ?
                    (initial ? hide() : raf(hide)) : 
                    MetaphorJs.animate.animate(node, "leave").done(hide);
            }
        }

        self.$super(val);

        if (self._initial) {
            self._initial = false;
        }
        else {
            if (self.config.get("once")) {
                self.$destroy();
            }
        }
    }
}));
