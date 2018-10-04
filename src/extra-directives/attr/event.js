require("../../lib/EventHandler.js");

var Directive = require("../../class/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function() {

    Directive.registerAttribute("event", 1000, function(scope, node, expr){

        var eh = new MetaphorJs.lib.EventHandler(scope, node, expr);

        return function(){
            eh.$destroy();
            eh = null;
        };
    });
}());