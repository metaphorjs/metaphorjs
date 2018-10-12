
require("../../lib/Expression.js");

var Directive = require("../../class/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("init", 250, function(scope, node, expr){
    MetaphorJs.lib.Expression.run(expr, scope);
});