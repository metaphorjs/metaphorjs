

var Directive = require("../../class/Directive.js"),
    async = require("../../func/async.js");


Directive.registerAttribute("mjs-in-focus", 500, Directive.$extend({

    onChange: function() {

        var self    = this;

        if (self.watcher.getLastResult()) {
            async(self.node.focus, self.node, [], 300);
        }
    }

}));
