
var Directive = require("../../class/Directive.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    getAttrMap = require("../../func/dom/getAttrMap.js"),
    setAttr = require("../../func/dom/setAttr.js");


Directive.registerTag("tag", function(scope, node) {

    var expr = getAttr(node, "value"),
        tag = createGetter(expr)(scope);

    if (!tag) {
        node.parentNode.removeChild(node);
        return false;
    }
    else {
        var el = window.document.createElement(tag),
            next = node.nextSibling,
            attrMap = getAttrMap(node),
            k;

        while (node.firstChild) {
            el.appendChild(node.firstChild);
        }

        delete attrMap['value'];

        for (k in attrMap) {
            setAttr(el, k, attrMap[k]);
        }

        node.parentNode.insertBefore(el, next);
        node.parentNode.removeChild(node);

        return [el];
    }

});