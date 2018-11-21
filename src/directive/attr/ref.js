require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("ref", 200, function(scope, node, config){
    config.setProperty("value", {defaultMode: MetaphorJs.lib.Config.MODE_STATIC});
    config.lateInit();
    scope[config.get("value")] = node;
});