
require("../../lib/Expression.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("init", 250, function() {
    
    var initDir = function(scope, node, config) {
        config.eachProperty(function(k, prop) {
            if (k === 'value' || k.indexOf('value.') === 0) {
                MetaphorJs.lib.Expression.run(prop.expression, scope, null, {
                    noReturn: true
                });
            }
        });
        config.clear();
    };

    initDir.$prebuild = {
        noReturn: true
    };

    return initDir;
}());