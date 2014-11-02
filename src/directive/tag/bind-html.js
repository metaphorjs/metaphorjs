
var Directive = require("../../class/Directive.js"),
    createWatchable = require("../../../../metaphorjs-watchable/src/func/createWatchable.js"),
    toFragment = require("../../func/dom/toFragment.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    toArray = require("../../func/array/toArray.js"),
    ns = require("../../../../metaphorjs-namespace/src/var/ns.js");


Directive.registerTag("mjs-bind-html", function(scope, node) {

    var expr    = getAttr(node, "value"),
        w       = createWatchable(scope, expr, null, null, null, ns),
        text    = w.getLastResult(),
        //text    = createGetter(expr)(scope),
        frg     = toFragment(text),
        next    = node.nextSibling,
        nodes   = toArray(frg.childNodes);

    node.parentNode.insertBefore(frg, next);
    node.parentNode.removeChild(node);

    w.unsubscribeAndDestroy();

    return nodes;
});