
var Directive = require("../../class/Directive.js"),
    extend = require("../../func/extend.js"),
    resolveComponent = require("../../func/resolveComponent.js"),
    nsGet = require("../../../../metaphorjs-namespace/src/func/nsGet.js");

(function(){

    var cmpAttr = function(scope, node, cmpName, parentRenderer, attrMap){


        var constr  = nsGet(cmpName, true),
            nodecfg = attrMap['modifier']['cmp'] ?
                        attrMap['modifier']['cmp'].value : {};

        if (!constr) {
            throw "Component " + cmpName + " not found";
        }

        var sameScope       = nodecfg.sameScope || constr.$sameScope,
            isolateScope    = nodecfg.isolateScope || constr.$isolateScope;

        scope       = isolateScope ? scope.$newIsolated() : (sameScope ? scope : scope.$new());

        attrMap.extendTarget("scope", scope);

        var cfg     = extend({
            scope: scope,
            node: node,
            parentRenderer: parentRenderer,
            destroyScope: !sameScope
        }, attrMap.extendTarget("component"), false, false);

        resolveComponent(cmpName, cfg, scope, node);

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());