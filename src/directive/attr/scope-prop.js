

var Directive = require("../../class/Directive.js");

Directive.registerAttribute("mjs-scope-prop", 200, function(scope, node, expr){
    scope[expr] = node;
});