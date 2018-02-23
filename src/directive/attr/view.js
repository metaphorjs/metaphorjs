
var Directive = require("../../class/Directive.js"),
    resolveComponent = require("../../func/resolveComponent.js");

Directive.registerAttribute("view", 200, function(scope, node, cls, parentRenderer, attr) {
    var cfg = {scope: scope, node: node};
    resolveComponent(
        cls || "MetaphorJs.View",
        cfg,
        scope, node,
        [cfg, attr]
    );
    return false;
});
