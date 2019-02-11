
require("../../lib/Config.js");
require("../../lib/Scope.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("scope", 1000, 
function(scope, node, config, renderer, attrSet) {

    config.setDefaultMode("value", MetaphorJs.lib.Config.MODE_STATIC);
    var newScope = MetaphorJs.lib.Scope.$produce(config.get("scope"), scope);

    renderer.flowControl("newScope", newScope);
    config.clear();
});
