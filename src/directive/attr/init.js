

var Directive = require("../../class/Directive.js"),
    createFunc = require("../../../../metaphorjs-watchable/src/func/createFunc.js");

Directive.registerAttribute("mjs-init", 250, function(scope, node, expr){
    createFunc(expr)(scope);
});