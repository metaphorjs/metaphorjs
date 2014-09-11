
var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    resolveComponent = require("../../func/resolveComponent.js"),
    attr = require("../../func/dom/attr.js");

registerAttributeHandler("mjs-view", 200, function(scope, node, cls) {
    attr(node, "mjs-view", null);
    resolveComponent(cls || "MetaphorJs.cmp.View", {scope: scope, node: node}, scope, node)
    return false;
});
