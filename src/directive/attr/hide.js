

var Directive = require("../../app/Directive.js");

require("./show.js");

Directive.registerAttribute("hide", 500, Directive.attr.Show.$extend({

    $class: "MetaphorJs.app.Directive.attr.Hide",
    id: "hide",

    onScopeChange: function(val) {
        var self    = this;
        self.runAnimation(!val);
        self._initial = false;
        self.saveStateOnChange(val);
    }
}));