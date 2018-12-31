
require("../../func/app/resolve.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

(function(){

    var cmpAttr = function(scope, node, config, parentRenderer, attrSet) { 

        config.setDefaultMode("value", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("sameScope", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("isolateScope", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultMode("as", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultMode("ref", MetaphorJs.lib.Config.MODE_STATIC);

        var cmpName = config.get("value"),
            constr  = typeof cmpName === "string" ?
                        ns.get(cmpName, true) : cmpName;

        if (!constr) {
            throw new Error("Component " + cmpName + " not found");
        }

        var sameScope       = config.get("sameScope") || constr.$sameScope,
            isolateScope    = config.get("isolateScope") || constr.$isolateScope;

        var newScope = isolateScope ? scope.$newIsolated() : 
                                        (sameScope ? scope : scope.$new());

        config.removeProperty("value");

        var cfg = {
            scope: newScope,
            node: node,
            config: config,
            parentRenderer: parentRenderer,
            destroyScope: !sameScope,
            autoRender: true
        };

        MetaphorJs.app.resolve(cmpName, cfg, newScope, node, [cfg])
            .done(function(cmp) {
                parentRenderer.trigger(
                    "reference", "cmp", config.get("ref") || cmp.id, cmp
                );
            });

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());