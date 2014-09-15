

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    createFunc = require("../../../../metaphorjs-watchable/src/func/createFunc.js"),
    removeAttr = require("../../func/dom/removeAttr.js");

registerAttributeHandler("mjs-init", 250, function(scope, node, expr){
    removeAttr(node, "mjs-init");
    createFunc(expr)(scope);
});