require("../../func/dom/getAttr.js");
require("../../func/dom/setAttr.js");
require("../../lib/Expression.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerTag("tag", function directive_tag_tag(scope, node, config, renderer) {

    var expr = getAttr(node, "value"),
        tag = MetaphorJs.lib.Expression.get(expr, scope),
        i, l, a;

    if (!tag) {
        node.parentNode.removeChild(node);
        renderer && renderer.flowControl("stop", true);
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

        renderer && renderer.flowControl("nodes", [el]);
    }

});