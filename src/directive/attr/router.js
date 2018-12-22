require("../../app/Directive.js");
require("../../func/app/resolve.js");
require("../../lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.app.Directive.registerAttribute("router", 200, 
    function(scope, node, config, parentRenderer) {

    config.setProperty("value", {
        defaultMode: MetaphorJs.lib.Config.MODE_STATIC,
        defaultValue: "MetaphorJs.app.view.Router"
    });

    var routes = [],
        r;

    config.eachProperty(function(k){
        if (k.indexOf("value.") === 0) {
            config.setDefaultMode(k, MetaphorJs.lib.Config.MODE_SINGLE);
            r = config.get(k);
            r['id'] = k.replace('value.', '');
            routes.push(r);
        }
    });

    var cfg = {scope: scope, node: node, config: config};

    if (routes.length !== 0) {
        cfg['route'] = routes;
    }

    MetaphorJs.app.resolve(
        config.get("value"),
        cfg,
        scope, node,
        [cfg]
    );

    return false;
});
