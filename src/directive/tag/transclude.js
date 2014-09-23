
var Directive = require("../../class/Directive.js"),
    transclude = require("../../func/dom/transclude.js");

Directive.registerTag("mjs-transclude", function(scope, node) {
    return transclude(node);
});