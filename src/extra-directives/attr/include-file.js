
var Directive = require("../../class/Directive.js");

Directive.registerAttribute("include-file", 900, function(scope, node, filePath){

    var r = require,
        fs = r("fs");

    node.innerHTML = fs.readFileSync(filePath).toString();
});