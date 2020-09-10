require("../../app/Directive.js");
require("../../func/app/resolve.js");
require("../../lib/Config.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.app.Directive.registerAttribute("view", 200, 
    function(state, node, config, renderer) {

    MetaphorJs.app.Directive.resolveNode(node, "view", function(node){
        if (!renderer.$destroyed) {
            const cfg = { state, node, config };

            MetaphorJs.app.resolve(
                "MetaphorJs.app.view.Component",
                cfg,
                node,
                [cfg]
            )
            .done(function(view){
                if (renderer.$destroyed || state.$$destroyed) {
                    view.$destroy();
                }
                else {
                    renderer.on("destroy", view.$destroy, view);
                    state.$on("destroy", view.$destroy, view);
                }
            });
        }
    });

    renderer.flowControl("ignoreInside", true);
});
