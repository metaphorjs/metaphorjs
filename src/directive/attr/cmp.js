
require("../../func/app/resolve.js");

var Directive = require("../../class/Directive.js"),
    extend = require("../../func/extend.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

(function(){

    var cmpAttr = function(scope, node, config, parentRenderer, attrSet){

        config.lateInit();
        config.setProperty("sameScope", {type: "bool"});
        config.setProperty("isolateScope", {type: "bool"});

        var cmpName = config.get("value"),
            constr  = typeof cmpName === "string" ?
                        ns.get(cmpName, true) : cmpName,
            nodecfg = config.getValues();

        if (!constr) {
            throw new Error("Component " + cmpName + " not found");
        }

        var sameScope       = nodecfg.sameScope || constr.$sameScope,
            isolateScope    = nodecfg.isolateScope || constr.$isolateScope;

        var newScope = isolateScope ? scope.$newIsolated() : 
                                        (sameScope ? scope : scope.$new());

        var cfg     = extend({
            scope: newScope,
            node: node,
            parentRenderer: parentRenderer,
            destroyScope: !sameScope
        }, nodecfg, false, false);

        MetaphorJs.app.resolve(cmpName, cfg, newScope, node, [cfg])
            .done(function(cmp){
                if (attrSet.ref) {
                    scope[attrSet.ref] = cmp;
                }
            });

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());