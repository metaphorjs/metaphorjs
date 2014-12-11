

var Directive = require("../../class/Directive.js");

Directive.registerAttribute("mjs-cmp-prop", 200,
    ['$parentCmp', '$node', '$attrValue', function(parentCmp, node, expr){

       if (parentCmp) {
            parentCmp[expr] = node;
       }
}]);