require("../../func/dom/transclude.js");

const Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("transclude", 1000, 
    function(state, node, config, renderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("'transclude' directive can only work with Node");
        }

        renderer.flowControl("nodes", MetaphorJs.dom.transclude(
            node, null, 
            renderer.trigger("transclude-sources")
        ));

});