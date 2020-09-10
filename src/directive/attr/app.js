
require("../../app/Directive.js");
require("../../lib/Config.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


const appDirective = function(state, node, config, renderer) {
    renderer && renderer.flowControl("stop", true);
};

appDirective.$prebuild = {
    defaultMode: MetaphorJs.lib.Config.MODE_STATIC,
    ignore: true
};

MetaphorJs.app.Directive.registerAttribute("app", 100, appDirective);