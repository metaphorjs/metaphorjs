require("../../lib/Expression.js");

var Directive = require("../../class/Directive.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerTag("bind", function(scope, node) {

    var expr    = getAttr(node, "value"),
        text    = MetaphorJs.lib.Expression.run(expr, scope),
        frg     = window.document.createTextNode(text);

    node.parentNode.insertBefore(frg, node);
    node.parentNode.removeChild(node);

    return [frg];
});