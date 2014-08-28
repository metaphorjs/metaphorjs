
var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    transclude = require("../../func/dom/transclude.js");

registerAttributeHandler("mjs-transclude", 1000, function(scope, node) {
    return transclude(node);
});