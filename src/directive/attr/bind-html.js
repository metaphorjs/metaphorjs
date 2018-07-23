

var Directive = require("../../class/Directive.js"),
    defineClass = require("metaphorjs-class/src/func/defineClass.js");

require("./bind.js");

Directive.registerAttribute("bind-html", 1000, defineClass({

    $class: "Directive.attr.BindHtml",
    $extends: "Directive.attr.Bind",

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));