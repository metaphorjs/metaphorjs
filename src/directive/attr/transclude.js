require("../../func/dom/transclude.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("transclude", 1000, 
    function(scope, node, config, renderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("'transclude' directive can only work with Node");
        }

        var onAttached = function(to) {
            renderer.process(MetaphorJs.dom.transclude(node));
        };
    
        renderer.on("attached", onAttached); 
        onAttached();

        return function() {
            renderer.un("attached", onAttached);
        };
});