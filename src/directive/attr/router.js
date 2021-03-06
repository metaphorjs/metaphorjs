require("../../app/Directive.js");
require("../../func/app/resolve.js");
require("../../lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.app.Directive.registerAttribute("router", 200, function(){

    var dir = function router_directive(scope, node, config, renderer, attrSet) {

        dir.initConfig(config);
    
        var routes = [],
            r;
    
        config.eachProperty(function(k){
            if (k.indexOf("value.") === 0) {
                r = config.get(k);
                r['id'] = k.replace('value.', '');
                routes.push(r);
            }
        });
    
        MetaphorJs.app.Directive.resolveNode(node, "router", function(node){
            if (!renderer.$destroyed) {
                var cfg = {scope: scope, node: node, config: config};
    
                if (routes.length !== 0) {
                    cfg['route'] = routes;
                }
            
                MetaphorJs.app.resolve(
                    config.get("value"),
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
    }

    dir.initConfig = function(config) {
        var ms = MetaphorJs.lib.Config.MODE_STATIC;
        config.setDefaultMode("scope", ms);
        config.setDefaultMode("id", ms);
        config.setProperty("value", {
            defaultMode: ms,
            defaultValue: "MetaphorJs.app.view.Router"
        });
        config.eachProperty(function(k){
            if (k.indexOf("value.") === 0) {
                config.setDefaultMode(k, MetaphorJs.lib.Config.MODE_SINGLE);
            }
        });
    };

    return dir;
}());
