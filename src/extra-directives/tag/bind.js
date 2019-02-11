require("../../lib/Expression.js");
require("../../func/dom/getAttr.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerTag("bind", function(scope, node, config, renderer) {

    var expr    = MetaphorJs.dom.getAttr(node, "value"),
        text    = MetaphorJs.lib.Expression.get(expr, scope),
        frg     = window.document.createTextNode(text);

    node.parentNode.replaceChild(node, frg);
    renderer && renderer.flowControl("nodes", [frg]);
});