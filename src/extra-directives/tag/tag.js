require("../../func/dom/getAttr.js");
require("../../func/dom/setAttr.js");

var Directive = require("../../class/Directive.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerTag("tag", function directive_tag_tag(scope, node) {

    var expr = getAttr(node, "value"),
        tag = createGetter(expr)(scope),
        i, l, a;

    if (!tag) {
        node.parentNode.removeChild(node);
        return false;
    }
    else {
        var el = window.document.createElement(tag),
            next = node.nextSibling,
            attrs = node.attributes;

        while (node.firstChild) {
            el.appendChild(node.firstChild);
        }

        for (i = 0, l = attrs.length; i < l; i++) {
            a = attrs[i];
            if (a.name !== "value") {
                MetaphorJs.dom.setAttr(el, a.name, a.value);
            }
        }

        node.parentNode.insertBefore(el, next);
        node.parentNode.removeChild(node);

        return [el];
    }

});