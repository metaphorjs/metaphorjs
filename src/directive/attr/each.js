
require("../../func/dom/getAttr.js");
require("../../class/ListRenderer.js");
require("../../lib/Expression.js");

var Directive = require("../../class/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


(function(){

    var types = [];

    function detectModelType(expr, scope) {
        var tmp = expr.split(" in "),
            model = tmp.length === 1 ? expr : tmp[1],
            obj = MetaphorJs.lib.Expression.run(model, scope),
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
        config.setProperty("value", {disabled: true});
        config.lateInit();
        var tagMode = node.nodeName.toLowerCase() === "mjs-each",
            expr;
        if (tagMode) {
            expr = MetaphorJs.dom.getAttr(node, "value");
        }
        else {
            expr = config.getProperty("value").expression;
        }
        var handler = detectModelType(expr, scope) || MetaphorJs.app.ListRenderer;
        return new handler(scope, node, expr, parentRenderer, attrSet);
    };


    eachDirective.registerType = function(objectClass, handlerClass) {
        types.push([objectClass, handlerClass]);
    };

    eachDirective.$stopRenderer = true;
    eachDirective.$registerBy = "id";

    eachDirective.registerType(Array, MetaphorJs.app.ListRenderer);

    Directive.registerAttribute("each", 100, eachDirective);
    Directive.registerTag("each", eachDirective);

}());


