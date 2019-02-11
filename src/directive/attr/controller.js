
require("../../func/app/resolve.js");
require("../../lib/Config.js");
require("../../lib/Scope.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

(function(){

    var ctrlAttr = function(scope, node, config, renderer, attrSet) {

        var ms = MetaphorJs.lib.Config.MODE_STATIC;

        config.setDefaultMode("value", ms);
        config.setType("sameScope", "bool", ms);
        config.setType("publicScope", "string", ms);
        config.setDefaultMode("as", ms);

        var ctrlName = config.get("value"),
            constr  = typeof ctrlName === "string" ?
                        ns.get(ctrlName) : ctrlName,
            newScope;

        if (!constr) {
            throw new Error("Controller " + ctrlName + " not found");
        }

        var sameScope   = config.get("sameScope") || constr.$sameScope;
        var publicScope = config.get("publicScope");

        if (publicScope) {
            newScope    =  MetaphorJs.lib.Scope.$get(publicScope);
            if (!newScope) {
                throw new Error("Public scope " + publicScope + " not found");
            }
        }
        else {
            newScope    = sameScope ? scope : scope.$new();
        }

        config.removeProperty("value");

        var cfg = {
            scope: newScope,
            node: node,
            config: config,
            parentRenderer: renderer,
            attrSet: attrSet
        };

        MetaphorJs.app.resolve(ctrlName, cfg, newScope, node, [cfg])
            .done(function(ctrl){
                if (renderer.$destroyed || newScope.$$destroyed) {
                    ctrl.$destroy();
                }
                else {
                    renderer.on("destroy", ctrl.$destroy, ctrl);
                }
            });
    };

    Directive.registerAttribute("controller", 200, ctrlAttr);

}());