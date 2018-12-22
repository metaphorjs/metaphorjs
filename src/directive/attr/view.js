require("../../app/Directive.js");
require("../../func/app/resolve.js");
require("../../lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.app.Directive.registerAttribute("view", 200, 
    function(scope, node, config, parentRenderer) {

    var cfg = {scope: scope, node: node, config: config};

    MetaphorJs.app.resolve(
        "MetaphorJs.app.view.Component",
        cfg,
        scope, node,
        [cfg]
    );

    return false;
});
