
require("../../lib/Config.js");
require("../../lib/Scope.js");

const Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("scope", 1000, function(){
    const dir = function scope_directive(scope, node, config, renderer, attrSet) {

        dir.initConfig(config);
        var newScope = MetaphorJs.lib.Scope.$produce(config.get("value"), scope);
    
        renderer.flowControl("newScope", newScope);
        config.clear();
    };

    dir.initConfig = function(config) {
        config.setDefaultMode("value", MetaphorJs.lib.Config.MODE_STATIC);
    };

    return dir;
}());
