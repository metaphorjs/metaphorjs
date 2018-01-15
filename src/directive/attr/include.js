

var Directive = require("../../class/Directive.js"),
    Template = require("../../class/Template.js");

Directive.registerAttribute("include", 1100, function(scope, node, tplExpr, parentRenderer){

    var tpl = new Template({
        scope: scope,
        node: node,
        url: tplExpr,
        parentRenderer: parentRenderer
    });

    if (tpl.ownRenderer) {
        return false;
    }
    else {
        return tpl.initPromise;
    }
});
