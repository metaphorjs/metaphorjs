
require("../../app/Directive.js");
require("../../lib/Config.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


var appDirective = function(scope, node, config, renderer) {
    renderer && renderer.flowControl("stop", true);
};

appDirective.$prebuild = {
    defaultMode: MetaphorJs.lib.Config.MODE_STATIC,
    ignore: true
};

MetaphorJs.app.Directive.registerAttribute("app", 100, appDirective);