

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    createFunc = require("../../../../metaphorjs-watchable/src/func/createFunc.js");

registerAttributeHandler("mjs-init", 250, function(scope, node, expr){
    node.removeAttribute("mjs-init");
    createFunc(expr)(scope);
});