require("../../lib/Expression.js");

var Directive = require("../../class/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("break-if", 500, function(scope, node, expr){

    var res = !!MetaphorJs.lib.Expression.parse(expr)(scope);

    if (res) {
        node.parentNode.removeChild(node);
    }

    return !res;
});