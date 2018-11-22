require("../../app/Directive.js");
require("../../func/app/resolve.js");
require("../../lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.app.Directive.registerAttribute("router", 200, 
    function(scope, node, config, parentRenderer) {

    config.setProperty("scrollOnChange", {
        type: "bool",
        defaultMode: MetaphorJs.lib.Config.MODE_STATIC
    });
    config.setProperty("value", {
        defaultMode: MetaphorJs.lib.Config.MODE_STATIC,
        defaultValue: "MetaphorJs.app.Router"
    });
    config.setDefaultMode("defaultCmp", MetaphorJs.lib.Config.MODE_STATIC);

    var cfg = {scope: scope, node: node, config: config};

    MetaphorJs.app.resolve(
        config.get("value"),
        cfg,
        scope, node,
        [cfg]
    );

    return false;
});
