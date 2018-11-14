require("../../func/dom/transclude.js");

var Directive = require("../../class/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("transclude", 1000, function(scope, node) {
    return MetaphorJs.dom.transclude(node);
});