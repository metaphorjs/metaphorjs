
require("../../func/app/resolve.js");
require("../../lib/Config.js");
require("../../lib/State.js");

const Directive = require("../../app/Directive.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function(){

    var cmpAttr = function(state, node, config, renderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("cmp directive can only work with DOM nodes");
        }

        // if there is no instructions regarding component's state,
        // we create a new child state by default
        if (!config.has("state")) {
            state = state.$new();
        }

        cmpAttr.initConfig(config);

        var cmpName = config.get("value"),
            tag     = node.tagName.toLowerCase();

        config.removeProperty("value");

        var cfg = {
            state: state,
            node: node,
            config: config,
            parentRenderer: renderer,
            autoRender: true
        };

        if (MetaphorJs.directive.component[tag]) {
            cfg.directives = attrSet.directives;
            renderer.flowControl("stop", true);
        }

        var promise = MetaphorJs.app.resolve(cmpName, cfg, node, [cfg])
            .done(function(cmp){
                if (renderer.$destroyed || state.$$destroyed) {
                    cmp.$destroy();
                }
                else {
                    renderer.on("destroy", cmp.$destroy, cmp);
                    renderer.trigger(
                        "reference", "cmp", config.get("ref") || cmp.id, 
                        cmp, cfg, attrSet
                    );
                }
            });

        renderer.trigger("reference-promise", promise, cmpName, cfg, attrSet);
        renderer.flowControl("ignoreInside", true);
    };

    cmpAttr.initConfig = function(config, instance) {
        var ms = MetaphorJs.lib.Config.MODE_STATIC;

        config.setDefaultMode("value", ms);
        config.setDefaultMode("init", MetaphorJs.lib.Config.MODE_FUNC);
        config.setDefaultMode("as", ms);
        config.setDefaultMode("ref", ms);
        config.setDefaultMode("state", ms);
        config.setMode("into", ms);
        config.setType("cloak", "bool", ms);
    }

    cmpAttr.deepInitConfig = function(config) {
        var cmpName = config.get("value");
        var constr  = typeof cmpName === "string" ? ns.get(cmpName) : cmpName;
        if (!constr) {
            return;
        }
        if (constr.initConfig) {
            constr.initConfig(config);
        }
    };

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());