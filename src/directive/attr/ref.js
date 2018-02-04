

var Directive = require("../../class/Directive.js");

Directive.registerAttribute("ref", 200, function(scope, node, expr){
    scope[expr] = node;
});