
require("../../func/app/resolve.js");
require("../../lib/Config.js");
require("../../lib/State.js");

const Directive = require("../../app/Directive.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function(){

    var ctrlAttr = function(state, node, config, renderer, attrSet) {

        ctrlAttr.initConfig(config);
        var ctrlName = config.get("value");
        config.removeProperty("value");

        // if there is instructions regarding controller's state
        // we set this state for all children of current node
        if (config.has("state")) {
            renderer.flowControl("newState", state);
        }

        var cfg = {
            state: state,
            node: node,
            config: config,
            parentRenderer: renderer,
            attrSet: attrSet
        };

        MetaphorJs.app.resolve(ctrlName, cfg, node, [cfg])
            .done(function(ctrl) {
                if (renderer.$destroyed || state.$$destroyed) {
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
        config.setDefaultMode("state", ms);
    };

    ctrlAttr.deepInitConfig = function(config) {
        const ctrlName = config.get("value");
        const constr   = typeof ctrlName === "string" ? ns.get(ctrlName) : ctrlName;
        if (!constr) {
            return;
        }
        if (constr.initConfig) {
            constr.initConfig(config);
        }
    };

    Directive.registerAttribute("controller", 200, ctrlAttr);

}());