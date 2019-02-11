require("../../app/Directive.js");
require("../../func/app/resolve.js");
require("../../lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.app.Directive.registerAttribute("view", 200, 
    function(scope, node, config, renderer) {

    MetaphorJs.app.Directive.resolveNode(node, "view", function(node){
        if (!renderer.destroyed) {
            var cfg = {scope: scope, node: node, config: config};

            MetaphorJs.app.resolve(
                "MetaphorJs.app.view.Component",
                cfg,
                node,
                [cfg]
            )
            .done(function(view){
                if (renderer.$destroyed || scope.$$destroyed) {
                    view.$destroy();
                }
                else {
                    renderer.on("destroy", view.$destroy, view);
                    scope.$on("destroy", view.$destroy, view);
                }
            });
        }
    });

    renderer.flowControl("ignoreInside", true);
});
