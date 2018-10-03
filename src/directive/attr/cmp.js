
var Directive = require("../../class/Directive.js"),
    extend = require("../../func/extend.js"),
    resolveComponent = require("../../func/resolveComponent.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

(function(){

    var cmpAttr = function(scope, node, cmpName, parentRenderer, attr){

        var constr  = typeof cmpName === "string" ?
                        ns.get(cmpName, true) : cmpName,
            nodecfg = attr ? attr.config : {};

        if (!constr) {
            throw new Error("Component " + cmpName + " not found");
        }

        var sameScope       = nodecfg.sameScope || constr.$sameScope,
            isolateScope    = nodecfg.isolateScope || constr.$isolateScope;

        var newScope = isolateScope ? scope.$newIsolated() : (sameScope ? scope : scope.$new());

        var cfg     = extend({
            scope: newScope,
            node: node,
            parentRenderer: parentRenderer,
            destroyScope: !sameScope
        }, nodecfg, false, false);

        resolveComponent(cmpName, cfg, newScope, node, [cfg])
            .done(function(cmp){
                if (nodecfg.ref) {
                    scope[nodecfg.ref] = cmp;
                }
            });

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());