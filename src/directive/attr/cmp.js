
var Directive = require("../../class/Directive.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js"),
    extend = require("../../func/extend.js"),
    resolveComponent = require("../../func/resolveComponent.js"),
    nsGet = require("../../../../metaphorjs-namespace/src/func/nsGet.js");

(function(){

    var cmpAttr = function(scope, node, expr, parentRenderer, attrMap){


        var cmpName,
            as,
            tmp,
            i, len,
            part,
            nodeCfg = getNodeConfig(node, scope);



        tmp     = expr.split(' ');

        for (i = 0, len = tmp.length; i < len; i++) {

            part = tmp[i];

            if (part === '' || part === 'as') {
                continue;
            }

            if (!cmpName) {
                cmpName = part;
            }
            else {
                as      = part;
            }
        }


        var constr          = nsGet(cmpName, true),
            sameScope       = nodeCfg.sameScope || constr.$sameScope,
            isolateScope    = nodeCfg.isolateScope || constr.$isolateScope;

        scope       = isolateScope ? scope.$newIsolated() : (sameScope ? scope : scope.$new());

        attrMap.extendTarget("scope", scope);

        var cfg     = extend({
            scope: scope,
            node: node,
            as: as,
            parentRenderer: parentRenderer,
            destroyScope: !sameScope
        }, nodeCfg, attrMap.extendTarget("component"), false, false);

        resolveComponent(cmpName, cfg, scope, node);

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());