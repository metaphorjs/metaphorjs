
var Directive = require("../../class/Directive.js"),
    resolveComponent = require("../../func/resolveComponent.js");

Directive.registerAttribute("mjs-view", 200, function(scope, node, cls) {
    resolveComponent(cls || "MetaphorJs.View", {scope: scope, node: node}, scope, node);
    return false;
});
