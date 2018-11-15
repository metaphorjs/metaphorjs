

var Directive = require("../../app/Directive.js");

Directive.registerAttribute("cmp-prop", 200,
    ['$parentCmp', '$node', '$nodeConfig', function(parentCmp, node, config) {
     config.lateInit();
       if (parentCmp) {
            parentCmp[config.get("value")] = node;
       }
}]);