
var Directive = require("../../class/Directive.js"),
    extend = require("../../func/extend.js"),
    resolveComponent = require("../../func/resolveComponent.js"),
    nsGet = require("../../../../metaphorjs-namespace/src/func/nsGet.js");

(function(){

    var cmpAttr = function(scope, node, cmpName, parentRenderer, attr){

        var constr  = nsGet(cmpName, true),
            nodecfg = attr ? attr.config : {};

        if (!constr) {
            throw "Component " + cmpName + " not found";
        }

        var sameScope       = nodecfg.sameScope || constr.$sameScope,
            isolateScope    = nodecfg.isolateScope || constr.$isolateScope;

        scope       = isolateScope ? scope.$newIsolated() : (sameScope ? scope : scope.$new());

        var cfg     = extend({
            scope: scope,
            node: node,
            parentRenderer: parentRenderer,
            destroyScope: !sameScope
        }, nodecfg, false, false);

        resolveComponent(cmpName, cfg, scope, node);

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());