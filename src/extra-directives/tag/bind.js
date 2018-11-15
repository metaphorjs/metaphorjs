require("../../lib/Expression.js");
require("../../func/dom/getAttr.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerTag("bind", function(scope, node) {

    var expr    = MetaphorJs.dom.getAttr(node, "value"),
        text    = MetaphorJs.lib.Expression.run(expr, scope),
        frg     = window.document.createTextNode(text);

    node.parentNode.insertBefore(frg, node);
    node.parentNode.removeChild(node);

    return [frg];
});