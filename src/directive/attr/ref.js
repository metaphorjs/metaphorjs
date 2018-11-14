

var Directive = require("../../class/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("ref", 200, function(scope, node, config){
    config.setProperty("value", {mode: MetaphorJs.lib.Config.MODE_STATIC});
    config.lateInit();
    scope[config.get("value")] = node;
});