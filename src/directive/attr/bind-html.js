

var Directive = require("../../class/Directive.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js");

require("./bind.js");

Directive.registerAttribute("mjs-bind-html", 1000, defineClass({

    $extends: "attr.mjs-bind",

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));