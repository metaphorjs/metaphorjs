
require("../../func/dom/getAttr.js");
require("../../app/ListRenderer.js");
require("../../lib/Expression.js");
require("../../func/app/prebuilt.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    split = require("metaphorjs-shared/src/func/split.js");


(function(){

    var types = [];

    function detectModelType(expr, scope) {
        var i = 0,
            l = types.length,
            pb;
        
        if (MetaphorJs.app.prebuilt.isKey(expr)) {
            pb = MetaphorJs.app.prebuilt.get("config", expr);
        }
        else if (typeof expr !== "string") {
            pb = expr;
        }

        if (pb) {
            var obj = pb.getterFn(scope);
        }
        else {
            var tmp = expr.split(" in "),
                model = tmp.length === 1 ? expr : tmp[1],
                obj = MetaphorJs.lib.Expression.get(model, scope);
        }

        for (; i < l; i++) {
            if (obj instanceof types[i][0]) {
                return types[i][1];
            }
        }

        return null;
    }

    var eachDirective = function eachDirective(scope, node, config, renderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("'each' directive can only work with DOM nodes");
        }

        renderer && renderer.flowControl("stop", true);

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

        return new handler(scope, node, config, renderer, attrSet);
    };


    eachDirective.registerType = function(objectClass, handlerClass) {
        types.push([objectClass, handlerClass]);
    };

    eachDirective.deepInitConfig = function(config) {
        var prop = config.getProperty("value"),
            parts = this.splitExpression(prop.expression);
        prop.expression = parts.model;
        prop.inflate = prop.inflate || {};
        prop.inflate.itemName = parts.name;
    };

    eachDirective.splitExpression = function(expr) {
        var tmp = expr.split(" "),
            i, len,
            model, name,
            row;

        for (i = 0, len = tmp.length; i < len; i++) {

            row = tmp[i];

            if (row === "" || row === "in") {
                continue;
            }

            if (!name) {
                name = row;
            }
            else {
                model = tmp.slice(i).join(" ");
                break;
            }
        }

        return {
            model: model,
            name: name || "item"
        }
    };

    eachDirective.registerType(Array, MetaphorJs.app.ListRenderer);

    Directive.registerAttribute("each", 100, eachDirective);
    Directive.registerTag("each", eachDirective);

}());


