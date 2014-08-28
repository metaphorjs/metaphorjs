
var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    resolveComponent = require("../../func/resolveComponent.js");

registerAttributeHandler("mjs-view", 200, function(scope, node, cls) {
    node.removeAttribute("mjs-view");
    resolveComponent(cls || "MetaphorJs.cmp.View", {scope: scope, node: node}, scope, node)
    return false;
});
