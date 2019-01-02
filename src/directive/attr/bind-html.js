
require("./bind.js");
var Directive = require("../../app/Directive.js");

Directive.registerAttribute("bind-html", 1000, 
    Directive.attr.Bind.$extend({
        $class: "MetaphorJs.app.Directive.attr.BindHtml",
        _initNode: function(node) {
            if (node.getDomApi) {
                this.node = node.getDomApi("bind-html");
            }
        },
        updateElement: function(val) {
            this.node.innerHTML = val;
        }
    }));