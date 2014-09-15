
var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js"),
    removeAttr = require("../../func/dom/removeAttr.js"),
    data = require("../../func/dom/data.js");

registerAttributeHandler("mjs-config", 50, function(scope, node, expr){
    removeAttr(node, "mjs-config");
    data(node, "config", createGetter(expr)(scope));
});