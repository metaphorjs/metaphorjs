require("../../func/dom/transclude.js");
const Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerTag("transclude", function(state, node, config, renderer) {
    renderer && renderer.flowControl("nodes", MetaphorJs.dom.transclude(node, true));
});