

var Directive = require("../../class/Directive.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js");

require("./bind.js");

Directive.registerAttribute("bind-html", 1000, defineClass({

    $extends: "attr.bind",

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));