

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    createFunc = require("../../../../metaphorjs-watchable/src/func/createFunc.js"),
    attr = require("../../func/dom/attr.js");

registerAttributeHandler("mjs-init", 250, function(scope, node, expr){
    attr(node, "mjs-init", null);
    createFunc(expr)(scope);
});