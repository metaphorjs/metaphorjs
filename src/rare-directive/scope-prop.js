

var Directive = require("../../class/Directive.js");

Directive.registerAttribute("scope-prop", 200, function(scope, node, expr){
    scope[expr] = node;
});