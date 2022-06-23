
require("../../lib/Config.js");
require("../../lib/State.js");

const Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("state", 1000, function(){
    const dir = function state_directive(state, node, config, renderer, attrSet) {

        dir.initConfig(config);
        var newState = MetaphorJs.lib.State.$produce(config.get("value"), state);
    
        renderer.flowControl("newState", newState);
        config.clear();
    };

    dir.initConfig = function(config) {
        config.setDefaultMode("value", MetaphorJs.lib.Config.MODE_STATIC);
    };

    return dir;
}());
