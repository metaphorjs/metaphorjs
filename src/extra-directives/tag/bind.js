
var Directive = require("../../class/Directive.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    getAttr = require("../../func/dom/getAttr.js");


Directive.registerTag("bind", function(scope, node) {

    var expr    = getAttr(node, "value"),
        text    = createGetter(expr)(scope),
        frg     = window.document.createTextNode(text);

    node.parentNode.insertBefore(frg, node);
    node.parentNode.removeChild(node);

    return [frg];
});