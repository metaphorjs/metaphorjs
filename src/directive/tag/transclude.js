
var registerTagHandler = require("../../func/directive/registerTagHandler.js"),
    transclude = require("../../func/dom/transclude.js");

registerTagHandler("mjs-transclude", 900, function(scope, node) {
    return transclude(node);
});