
var Directive = require("../../class/Directive.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js"),
    toFragment = require("../../func/dom/toFragment.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    toArray = require("../../func/array/toArray.js");


Directive.registerTag("if", function(scope, node) {

    var expr = getAttr(node, "value"),
        res = !!createGetter(expr)(scope);

    if (!res) {
        node.parentNode.removeChild(node);
        return false;
    }
    else {
        var nodes = toArray(node.childNodes),
            frg = toFragment(node.childNodes),
            next = node.nextSibling;

        node.parentNode.insertBefore(frg, next);
        node.parentNode.removeChild(node);

        return nodes;
    }

});