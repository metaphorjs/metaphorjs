
var Directive = require("../../class/Directive.js"),
    transclude = require("../../func/dom/transclude.js");

Directive.registerAttribute("mjs-transclude", 900, function(scope, node) {
    return transclude(node);
});