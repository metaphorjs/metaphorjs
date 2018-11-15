require("../../func/dom/transclude.js");
var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerTag("transclude", function(scope, node) {
    return MetaphorJs.dom.transclude(node, true);
});