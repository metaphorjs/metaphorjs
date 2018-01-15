
var Directive = require("../../class/Directive.js"),
    EventHandler = require("../../lib/EventHandler.js");

(function() {

    Directive.registerAttribute("event", 1000, function(scope, node, expr){

        var eh = new EventHandler(scope, node, expr);

        return function(){
            eh.$destroy();
            eh = null;
        };
    });
}());