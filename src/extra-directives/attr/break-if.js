
var Directive = require("../../app/Directive.js");

Directive.registerAttribute("break-if", 500, function(scope, node, config) {

    config.setType("value", "bool");

    var res = config.get("value");

    if (res) {
        node.parentNode.removeChild(node);
    }

    return !res;
});