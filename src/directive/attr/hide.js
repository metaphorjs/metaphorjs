

var Directive = require("../../class/Directive.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js");

require("./show.js");

Directive.registerAttribute("hide", 500, defineClass({

    $extends: "attr.show",

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(!val);
        self.initial = false;
    }
}));