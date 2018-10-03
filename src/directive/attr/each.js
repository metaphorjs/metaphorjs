


var Directive = require("../../class/Directive.js"),
    evaluate = require("metaphorjs-watchable/src/func/evaluate.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    ListRenderer = require("../../class/ListRenderer.js");


(function(){

    var types = [];

    function detectModelType(expr, scope) {
        var tmp = expr.split(" in "),
            model = tmp.length === 1 ? expr : tmp[1],
            obj = evaluate(model, scope, {filterLookup: filterLookup}),
            i = 0,
            l = types.length;

        for (; i < l; i++) {
            if (obj instanceof types[i][0]) {
                return types[i][1]
            }
        }

        return null;
    }

    var eachDirective = function eachDirective(scope, node, expr, parentRenderer, attr) {
        var tagMode = node.nodeName.toLowerCase() === "mjs-each";
        if (tagMode) {
            expr = getAttr(node, "value");
        }
        var handler = detectModelType(expr, scope) || ListRenderer;
        return new handler(scope, node, expr, parentRenderer, attr);
    };


    eachDirective.registerType = function(objectClass, handlerClass) {
        types.push([objectClass, handlerClass]);
    };

    eachDirective.$stopRenderer = true;
    eachDirective.$registerBy = "id";

    eachDirective.registerType(Array, ListRenderer);

    Directive.registerAttribute("each", 100, eachDirective);
    Directive.registerTag("each", eachDirective);

}());


