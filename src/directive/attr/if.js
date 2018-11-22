
require("metaphorjs-animate/src/animate/animate.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js");


Directive.registerAttribute("if", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.If",
    parentEl: null,
    prevEl: null,
    nextEl: null,
    el: null,
    initial: true,
    cfg: null,
    animate: false,

    $init: function(scope, node, config, renderer, attrSet) {

        var self    = this;
        config.setType("value", "bool");
        config.setType("once", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        self.createCommentWrap(node, "if");
        self.$super(scope, node, config, renderer, attrSet);
    },

    onScopeDestroy: function() {

        var self    = this;
        self.wrapperOpen = null;
        self.wrapperClose = null;
        self.$super();
    },

    onChange: function() {
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
            self.initial || !self.config.get("animate") ?
                show() : MetaphorJs.animate.animate(node, "enter", show);
        }
        else {
            if (node.parentNode) {
                self.initial || !self.config.get("animate") ?
                    hide() : MetaphorJs.animate.animate(node, "leave").done(hide);
            }
        }

        self.$super(val);

        if (self.initial) {
            self.initial = false;
        }
        else {
            if (self.config.get("once")) {
                self.$destroy();
            }
        }
    }
}));
