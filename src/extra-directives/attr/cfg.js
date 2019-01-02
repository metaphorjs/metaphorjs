
require("../../func/dom/data.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("cfg", 200, function(scope, node, config) { 
    MetaphorJs.dom.data(node, "config", config);
});
