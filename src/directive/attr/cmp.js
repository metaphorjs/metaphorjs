
require("../../func/app/resolve.js");
require("../../lib/Config.js");
require("../../lib/Scope.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

(function(){

    var cmpAttr = function(scope, node, config, renderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("cmp directive can only work with DOM nodes");
        }
        
        var ms = MetaphorJs.lib.Config.MODE_STATIC;

        config.setDefaultMode("value", ms);
        config.setType("sameScope", "bool", ms);
        config.setType("publicScope", "string", ms);
        config.setDefaultMode("as", ms);
        config.setDefaultMode("ref", ms);
        config.setMode("into", ms);

        var cmpName = config.get("value"),
            constr  = typeof cmpName === "string" ?
                        ns.get(cmpName, true) : cmpName,
            tag     = node.tagName.toLowerCase(),
            newScope;

        if (!constr) {
            throw new Error("Component " + cmpName + " not found");
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
            destroyScope: !sameScope,
            autoRender: true
        };

        if (MetaphorJs.directive.component[tag]) {
            cfg.directives = attrSet.directives;
        }

        var res = MetaphorJs.app.resolve(cmpName, cfg, newScope, node, [cfg])
            .done(function(cmp) {
                renderer.trigger(
                    "reference", "cmp", 
                    config.get("ref") || cmp.id, cmp, 
                    cfg, attrSet
                );
            });

        renderer.trigger(
            "reference-promise", 
            res, cmpName, 
            cfg, attrSet
        );

        attrSet.renderer.ignoreInside = true;
    };

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());