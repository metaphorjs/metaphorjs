
var Directive = require("../../app/Directive.js");

Directive.registerAttribute("break-if", 500, function(scope, node, config, renderer) {

    config.setType("value", "bool");

    var res = config.get("value");

    if (res) {
        node.parentNode.removeChild(node);
    }

    renderer && renderer.flowControl("stop", !!res);
});