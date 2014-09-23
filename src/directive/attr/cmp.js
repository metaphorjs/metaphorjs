
var Directive = require("../../class/Directive.js"),
    removeAttr = require("../../func/dom/removeAttr.js"),
    data = require("../../func/dom/data.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js"),
    extend = require("../../func/extend.js"),
    resolveComponent = require("../../func/resolveComponent.js"),
    nsGet = require("../../../../metaphorjs-namespace/src/func/nsGet.js");

(function(){

    var cmpAttr = function(scope, node, expr, parentRenderer){


        var cmpName,
            as,
            tmp,
            i, len,
            part,
            nodeCfg = getNodeConfig(node, scope);

        tmp     = expr.split(' ');

        for (i = 0, len = tmp.length; i < len; i++) {

            part = tmp[i];

            if (part == '' || part == 'as') {
                continue;
            }

            if (!cmpName) {
                cmpName = part;
            }
            else {
                as      = part;
            }
        }


        var cfg     = extend({
            scope: scope,
            node: node,
            as: as,
            parentRenderer: parentRenderer,
            destroyScope: true
        }, nodeCfg, false, false);

        var constr = nsGet(cmpName, true);

        resolveComponent(cmpName, cfg, scope, node);

        return !!constr.$shadow;
    };

    cmpAttr.$breakScope = true;

    Directive.registerAttribute("mjs-cmp", 200, cmpAttr);

}());