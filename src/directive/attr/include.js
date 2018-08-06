

var Directive = require("../../class/Directive.js"),
    toBool = require("../../func/toBool.js"),
    Template = require("../../class/Template.js");

Directive.registerAttribute("include", 1100,
    function(scope, node, tplExpr, parentRenderer, attr){

    var cfg = attr ? attr.config : {},
        asis = toBool(cfg.asis);

    var tpl = new Template({
        scope: scope,
        node: node,
        url: tplExpr,
        parentRenderer: parentRenderer,
        animate: !!cfg.animate,
        ownRenderer: !asis // do not render if asis=true
    });

    return false; // stop renderer
});
