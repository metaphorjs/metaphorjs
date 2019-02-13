
require("../../func/app/resolve.js");
require("../../lib/Config.js");
require("../../lib/Scope.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function(){

    var ctrlAttr = function(scope, node, config, renderer, attrSet) {

        var ms = MetaphorJs.lib.Config.MODE_STATIC;

        config.setDefaultMode("value", ms);
        config.setDefaultMode("as", ms);

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

    Directive.registerAttribute("controller", 200, ctrlAttr);

}());