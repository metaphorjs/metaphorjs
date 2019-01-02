

var Directive = require("../../app/Directive.js"),
    async = require("metaphorjs-shared/src/func/async.js");

Directive.registerAttribute("in-focus", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.InFocus",

    $init: function(scope, node) {
        if (node.getDomApi) {
            arguments[1] = node.getDomApi();
        }
        this.$super.apply(this, arguments);
    },

    initialSet: function() {
        this.config.setType("value", "bool");
        this.$super();
    },

    onChange: function(val) {
        var self    = this;
        if (val) {
            async(self.node.focus, self.node, [], 300);
        }
    }
}));
