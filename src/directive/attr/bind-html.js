

var Directive = require("../../class/Directive.js");

require("metaphorjs-shared/src/func/bind.js");

Directive.registerAttribute("bind-html", 1000, Directive.attr.Bind.$extend({

    $class: "MetaphorJs.Directive.attr.BindHtml",

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));