

var Directive = require("../../app/Directive.js"),
    async = require("metaphorjs-shared/src/func/async.js");

Directive.registerAttribute("in-focus", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.InFocus",
    id: "in-focus",

    _initConfig: function(config) {
        config.setType("value", "bool");
        this.$super(config);
    },

    onScopeChange: function(val) {
        var self    = this;
        if (val) {
            async(self.node.focus, self.node, [], 300);
        }
    }
}));
