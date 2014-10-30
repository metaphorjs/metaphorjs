

var Directive = require("../../class/Directive.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js");

Directive.registerAttribute("mjs-break-if", 500, function(scope, node, expr){

    var res = !!createGetter(expr)(scope);

    if (res) {
        node.parentNode.removeChild(node);
    }

    return !res;
});