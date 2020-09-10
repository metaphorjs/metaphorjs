require("../../lib/Expression.js");
require("../../func/dom/getAttr.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerTag("bind", function(state, node, config, renderer) {

    var expr    = MetaphorJs.dom.getAttr(node, "value"),
        text    = MetaphorJs.lib.Expression.get(expr, state),
        frg     = window.document.createTextNode(text);

    node.parentNode.replaceChild(node, frg);
    renderer && renderer.flowControl("nodes", [frg]);
});