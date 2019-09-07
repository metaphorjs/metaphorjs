

var Directive = require("../../app/Directive.js");

Directive.registerAttribute("ignore", 0, function(scope, node, config, renderer){
    renderer && renderer.flowControl("stop", true);
});
