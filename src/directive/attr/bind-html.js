

var Directive = require("../../app/Directive.js");

Directive.BindHtml = Directive.registerAttribute("bind-html", 1000, 
    Directive.Bind.$extend({
        updateElement: function(val) {
            this.node.innerHTML = val;
        }
    }));