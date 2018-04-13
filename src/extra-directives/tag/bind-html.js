
var Directive = require("../../class/Directive.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    toFragment = require("../../func/dom/toFragment.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    toArray = require("../../func/array/toArray.js"),
    filterLookup = require("../../func/filterLookup.js");


Directive.registerTag("bind-html", function(scope, node) {

    var expr    = getAttr(node, "value"),
        w       = createWatchable(scope, expr, null, null, {filterLookup: filterLookup}),
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