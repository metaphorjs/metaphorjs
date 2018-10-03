

var Directive = require("../../class/Directive.js"),
    async = require("metaphorjs-shared/src/func/async.js");


Directive.registerAttribute("in-focus", 500, Directive.$extend({

    $class: "MetaphorJs.Directive.attr.InFocus",

    onChange: function() {

        var self    = this;

        if (self.watcher.getLastResult()) {
            async(self.node.focus, self.node, [], 300);
        }
    }

}));
