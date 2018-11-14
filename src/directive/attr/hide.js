

var Directive = require("../../class/Directive.js");

require("./show.js");

Directive.registerAttribute("hide", 500, Directive.attr.Show.$extend({

    $class: "MetaphorJs.Directive.attr.Hide",

    onChange: function(val) {
        var self    = this;
        self.runAnimation(!val);
        self.initial = false;
        self.saveStateOnChange(val);
    }
}));