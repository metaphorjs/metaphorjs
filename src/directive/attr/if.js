
require("metaphorjs-animate/src/animate/animate.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js");


Directive.registerAttribute("if", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.If",
    id: "if",

    _initial: true,
    
    initConfig: function() {
        var config = this.config;
        config.setType("animate", "bool", MetaphorJs.lib.Config.MODE_STATIC)
        config.setType("value", "bool");
        config.setType("once", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        this.$super();
    },
    
    initDirective: function() {
        this.createCommentWrap(this.node, "if");
        this.$super();
    },
    

    onScopeChange: function() {
        var self    = this,
            val     = self.config.get("value"),
            parent  = self.wrapperOpen.parentNode,
            node    = self.node;

        var show    = function(){
            parent.insertBefore(node, self.wrapperClose);
        };

        var hide    = function() {
            parent.removeChild(node);
        };

        if (val) {
            self._initial || !self.config.get("animate") ?
                show() : MetaphorJs.animate.animate(node, "enter", show);
        }
        else {
            if (node.parentNode) {
                self._initial || !self.config.get("animate") ?
                    hide() : MetaphorJs.animate.animate(node, "leave").done(hide);
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
