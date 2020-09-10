
require("../../lib/Expression.js");
require("../../lib/Config.js");

const Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("init", 250, function() {
    
    const initDir = function(state, node, config) {
        initDir.initConfig(config);
        config.eachProperty(function(k, prop) {
            if (k === 'value' || k.indexOf('value.') === 0) {
                var fn = config.get(k);
                fn && fn(state);
            }
        });
        config.clear();
    };

    initDir.initConfig = function(config) {
        var mf = MetaphorJs.lib.Config.MODE_FUNC;
        config.eachProperty(function(k, prop) {
            if (k === 'value' || k.indexOf('value.') === 0) {
                config.setDefaultMode(k, mf);
            }
        });
    };

    return initDir;
}());