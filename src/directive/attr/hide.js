

var Directive = require("../../class/Directive.js");

require("./show.js");

Directive.registerAttribute("hide", 500, Directive.attr.Show.$extend({

    $class: "MetaphorJs.Directive.attr.Hide",

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this;

        self.$super(scope, node, expr, renderer, attr);
        self.display = null;
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(!val);
        self.initial = false;

        self.saveStateOnChange(val);
    }
}));