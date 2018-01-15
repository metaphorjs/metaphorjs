
var Directive = require("../../class/Directive.js"),
    transclude = require("../../func/dom/transclude.js");

Directive.registerAttribute("transclude", 1000, function(scope, node) {
    return transclude(node);
});