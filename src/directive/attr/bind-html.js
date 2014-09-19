

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js");

require("./bind.js");

registerAttributeHandler("mjs-bind-html", 1000, defineClass({

    $extends: "attr.mjs-bind",

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));