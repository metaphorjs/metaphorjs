
var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    resolveComponent = require("../../func/resolveComponent.js"),
    removeAttr = require("../../func/dom/removeAttr.js");

registerAttributeHandler("mjs-view", 200, function(scope, node, cls) {
    removeAttr(node, "mjs-view");
    resolveComponent(cls || "MetaphorJs.cmp.View", {scope: scope, node: node}, scope, node)
    return false;
});
