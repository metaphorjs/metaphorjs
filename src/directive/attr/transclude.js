
var Directive = require("../../class/Directive.js"),
    transclude = require("../../func/dom/transclude.js");

Directive.registerAttribute("mjs-transclude", 1000, function(scope, node) {
    return transclude(node);
});