
require("../../func/dom/toFragment.js");
require("../../func/dom/getAttr.js");
require("../../lib/Expression.js");

var Directive = require("../../class/Directive.js"),
    toArray = require("metaphorjs-shared/src/func/array/toArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerTag("bind-html", function(scope, node) {

    var expr    = MetaphorJs.dom.getAttr(node, "value"),
        text    = MetaphorJs.lib.Expression.run(expr, scope),
        frg     = MetaphorJs.dom.toFragment(text),
        nodes   = toArray(frg.childNodes);

    node.parentNode.insertBefore(frg, node);
    node.parentNode.removeChild(node);

    return nodes;
});