

var Directive = require("../../app/Directive.js"),
    async = require("metaphorjs-shared/src/func/async.js");

Directive.registerAttribute("in-focus", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Autofocus",
    id: "autofocus",

    _initConfig: function() {
        this.config.setType("value");
        this.$super();
    },

    _initChange: function(){},

    _initDirective: function() {

        var self = this,
            val = self.config.get("value");

        if (""+parseInt(val) === val) {
            val = parseInt(val);
        }
        else {
            if (val === "false") val = false;
            else val = !!val;
        }

        if (val) {
            var set = function() {
                self.node.focus();
                self.$destroy();
            };
            async(set, null, [], val === true ? 300 : val);
        }
    }
}));
