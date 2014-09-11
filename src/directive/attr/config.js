
var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js"),
    attr = require("../../func/dom/attr.js"),
    data = require("../../func/dom/data.js");

registerAttributeHandler("mjs-config", 50, function(scope, node, expr){
    attr(node, "mjs-config", null);
    data(node, "config", createGetter(expr)(scope));
});