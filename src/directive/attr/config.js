
var Directive = require("../../class/Directive.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js");

Directive.registerAttribute("config", 50, function(scope, node, expr){
    getNodeConfig(node, scope, expr);
});