
var Directive = require("../../class/Directive.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    Template = require("../../class/Template.js");

Directive.registerTag("mjs-include", function(scope, node, value, parentRenderer) {

    var tpl = new Template({
        scope: scope,
        node: node,
        tpl: getAttr(node, "src"),
        parentRenderer: parentRenderer,
        replace: true
    });

    return tpl.initPromise;

});
