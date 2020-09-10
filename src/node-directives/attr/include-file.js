
const Directive = require("../../app/Directive.js");

Directive.registerAttribute("include-file", 900, function(state, node, config){

    var r = require,
        fs = r("fs"),
        filePath = config.get("value");

    node.innerHTML = fs.readFileSync(filePath).toString();
});

