
var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js");

registerAttributeHandler("mjs-config", 50, function(scope, node, expr){
    getNodeConfig(node, scope, expr);
});