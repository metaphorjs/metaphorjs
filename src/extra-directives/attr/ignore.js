

const Directive = require("../../app/Directive.js");

Directive.registerAttribute("ignore", 0, function(state, node, config, renderer){
    renderer && renderer.flowControl("stop", true);
});
