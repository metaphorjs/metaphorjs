

var Directive = require("../../class/Directive.js"),
    toBool = require("../../func/toBool.js"),
    Template = require("../../class/Template.js");

Directive.registerAttribute("include", 1100,
    function(scope, node, tplExpr, parentRenderer, attr){

    var cfg = attr ? attr.config : {},
        asis = toBool(cfg.asis),
        html = cfg.html,
        tplCfg = {
            scope: scope,
            node: node,
            parentRenderer: parentRenderer,
            animate: !!cfg.animate,
            ownRenderer: !asis // do not render if asis=true
        };

    if (html) {
        tplCfg['html'] = html;
    }
    else {
        tplCfg['url'] = tplExpr;
    }

    var tpl = new Template(tplCfg);

    return false; // stop renderer
});
