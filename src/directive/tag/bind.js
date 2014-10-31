
var Directive = require("../../class/Directive.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js"),
    getAttr = require("../../func/dom/getAttr.js");


Directive.registerTag("mjs-bind", function(scope, node) {

    var expr    = getAttr(node, "value"),
        text    = createGetter(expr)(scope),
        frg     = window.document.createTextNode(text),
        next    = node.nextSibling;

    node.parentNode.insertBefore(frg, next);
    node.parentNode.removeChild(node);

    return [frg];
});