
require("../../func/dom/getAttr.js");
require("../../app/ListRenderer.js");
require("../../lib/Expression.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


(function(){

    var types = [];

    function detectModelType(expr, scope) {
        var tmp = expr.split(" in "),
            model = tmp.length === 1 ? expr : tmp[1],
            obj = MetaphorJs.lib.Expression.get(model, scope),
            i = 0,
            l = types.length;

        for (; i < l; i++) {
            if (obj instanceof types[i][0]) {
                return types[i][1];
            }
        }

        return null;
    }

    var eachDirective = function eachDirective(scope, node, config, parentRenderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("'each' directive can only work with DOM nodes");
        }

        config.disableProperty("value");
        var tagMode = node.nodeName.toLowerCase() === "mjs-each",
            expr;
        if (tagMode) {
            expr = MetaphorJs.dom.getAttr(node, "value");
        }
        else {
            expr = config.getExpression("value");
        }

        var handler = detectModelType(expr, scope) || MetaphorJs.app.ListRenderer;

        return new handler(scope, node, config, parentRenderer, attrSet);
    };


    eachDirective.registerType = function(objectClass, handlerClass) {
        types.push([objectClass, handlerClass]);
    };

    eachDirective.$stopRenderer = true;
    eachDirective.$registerBy = "id";
    eachDirective.$prebuild = {
        skip: true
    };

    eachDirective.registerType(Array, MetaphorJs.app.ListRenderer);

    Directive.registerAttribute("each", 100, eachDirective);
    Directive.registerTag("each", eachDirective);

}());


