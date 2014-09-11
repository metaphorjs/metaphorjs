
var registerTagHandler = require("../../func/directive/registerTagHandler.js"),
    attr = require("../../func/dom/attr.js"),
    Template = require("../../view/Template.js");

registerTagHandler("mjs-include", 900, function(scope, node, value, parentRenderer) {

    var tpl = new Template({
        scope: scope,
        node: node,
        tpl: attr(node, "src"),
        parentRenderer: parentRenderer,
        replace: true
    });

    return tpl.initPromise;

});
