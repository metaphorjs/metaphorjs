require("../../func/dom/transclude.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("transclude", 1000, 
    function(scope, node, config, renderer, attrSet) {

        var onAttached = function(to) {
            renderer.process(MetaphorJs.dom.transclude(node));
        };
    
        renderer.on("attached", onAttached); 

        return {
            $destroy: function() {
                renderer.un("attached", onAttached);
            },
            getChildren: function() {
                return MetaphorJs.dom.transclude(node);
            }
        };
});