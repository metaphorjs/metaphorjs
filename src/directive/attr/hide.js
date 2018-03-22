

var Directive = require("../../class/Directive.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js");

require("./show.js");

Directive.registerAttribute("hide", 500, defineClass({

    $extends: "directive.attr.show",

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