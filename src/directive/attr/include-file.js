
var Directive = require("../../class/Directive.js"),
    Template = require("../../class/Template.js");

Directive.registerAttribute("mjs-include-file", 900, function(scope, node, filePath){

    var r = require,
        fs = r("fs");

    node.innerHTML = fs.readFileSync(filePath).toString();
});