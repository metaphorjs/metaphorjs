
var Directive = require("../../class/Directive.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    Template = require("../../class/Template.js");

Directive.registerTag("include", function(scope, node, value, parentRenderer) {


    var tpl = new Template({
        scope: scope,
        node: node,
        url: getAttr(node, "src"),
        parentRenderer: parentRenderer,
        replace: true
    });

    return tpl.initPromise;

});
