
var Directive = require("../../app/Directive.js");

Directive.registerAttribute("break-if", 500, function(scope, node, config) {

    config.setProperty("value", {type: "bool"});
    config.lateInit();

    var res = config.get("value");

    if (res) {
        node.parentNode.removeChild(node);
    }

    return !res;
});