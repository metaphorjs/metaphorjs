
require("../../func/dom/toFragment.js");
require("../../func/dom/getAttr.js");
require("../../lib/Expression.js");

var Directive = require("../../app/Directive.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerTag("bind-html", function(scope, node, config, renderer) {

    var expr    = MetaphorJs.dom.getAttr(node, "value"),
        text    = MetaphorJs.lib.Expression.get(expr, scope),
        frg     = MetaphorJs.dom.toFragment(text),
        nodes   = toArray(frg.childNodes);

    node.parentNode.replaceChild(node, frg);
    renderer && renderer.flowControl("nodes", nodes);
});