require("../../app/Directive.js");
require("../../func/app/resolve.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");

MetaphorJs.app.Directive.registerAttribute("router", 200, 
    function(scope, node, config, parentRenderer) {
    var cfg = extend({scope: scope, node: node}, config.getValues()),
        cls = config.getValue("value")

    MetaphorJs.app.resolve(
        cls || "MetaphorJs.app.Router",
        cfg,
        scope, node,
        [cfg]
    );

    config.clear();
    return false;
});
