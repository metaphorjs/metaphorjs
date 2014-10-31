
var Directive = require("../../class/Directive.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js"),
    toFragment = require("../../func/dom/toFragment.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    toArray = require("../../func/array/toArray.js");


Directive.registerTag("mjs-bind-html", function(scope, node) {

    var expr    = getAttr(node, "value"),
        text    = createGetter(expr)(scope),
        frg     = toFragment(text),
        next    = node.nextSibling,
        nodes   = toArray(frg.childNodes);

    node.parentNode.insertBefore(frg, next);
    node.parentNode.removeChild(node);

    return nodes;
});