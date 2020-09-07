
require("../../func/app/resolve.js");
require("../../lib/Config.js");
require("../../lib/Scope.js");

const Directive = require("../../app/Directive.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function(){

    var ctrlAttr = function(scope, node, config, renderer, attrSet) {

        ctrlAttr.initConfig(config);
        var ctrlName = config.get("value");
        config.removeProperty("value");

        // if there is instructions regarding controller's scope
        // we set this scope for all children of current node
        if (config.has("scope")) {
            renderer.flowControl("newScope", scope);
        }

        var cfg = {
            scope: scope,
            node: node,
            config: config,
            parentRenderer: renderer,
            attrSet: attrSet
        };

        MetaphorJs.app.resolve(ctrlName, cfg, node, [cfg])
            .done(function(ctrl) {
                if (renderer.$destroyed || scope.$$destroyed) {
                    ctrl.$destroy();
                }
                else {
                    renderer.on("destroy", ctrl.$destroy, ctrl);
                }
            });
    };

    ctrlAttr.initConfig = function(config, instance) {
        var ms = MetaphorJs.lib.Config.MODE_STATIC;
        config.setDefaultMode("value", ms);
        config.setDefaultMode("as", ms);
        config.setDefaultMode("scope", ms);
    };

    ctrlAttr.deepInitConfig = function(config) {
        var ctrlName = config.get("value");
        var constr   = typeof ctrlName === "string" ? ns.get(ctrlName) : ctrlName;
        if (!constr) {
            return;
        }
        if (constr.initConfig) {
            constr.initConfig(config);
        }
    };

    Directive.registerAttribute("controller", 200, ctrlAttr);

}());