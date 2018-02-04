
var Directive = require("../../class/Directive.js"),
    resolveComponent = require("../../func/resolveComponent.js");

Directive.registerAttribute("view", 200, function(scope, node, cls, parentRenderer, attr) {
    resolveComponent(
        cls || "MetaphorJs.View",
        {scope: scope, node: node},
        scope, node,
        [attr]
    );
    return false;
});
