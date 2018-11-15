

var Directive = require("../../app/Directive.js");

require("./show.js");

Directive.registerAttribute("hide", 500, Directive.attr.Show.$extend({

    $class: "MetaphorJs.app.Directive.attr.Hide",

    onChange: function(val) {
        var self    = this;
        self.runAnimation(!val);
        self.initial = false;
        self.saveStateOnChange(val);
    }
}));