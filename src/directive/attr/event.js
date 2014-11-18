
var Directive = require("../../class/Directive.js"),
    handleDomEvent = require("../../func/event/handleDomEvent.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js");

(function() {

    Directive.registerAttribute("mjs-event", 1000, function(scope, node, expr){
        handleDomEvent(node, scope, createGetter(expr)(scope));
    });
}());