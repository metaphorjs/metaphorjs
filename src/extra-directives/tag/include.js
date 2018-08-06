
var Directive = require("../../class/Directive.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    toBool = require("../../func/toBool.js"),
    Template = require("../../class/Template.js");

Directive.registerTag("include", function(scope, node, value, parentRenderer, attr) {

    var cfg = (attr ? attr.config : {}) || {},
        asis = toBool(cfg.asis);

    var tpl = new Template({
        scope: scope,
        node: node,
        url: getAttr(node, "src"),
        parentRenderer: parentRenderer,
        replace: true,
        ownRenderer: !asis // if asis, do not render stuff
    });

    return false; // stop renderer
});
