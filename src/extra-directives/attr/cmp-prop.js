
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
     MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.registerAttribute("cmp-prop", 200,
    ['$parentCmp', '$node', '$nodeConfig', function(parentCmp, node, config) {
     config.setDefaultMode("value", MetaphorJs.lib.Config.MODE_STATIC);
     if (parentCmp) {
          parentCmp[config.get("value")] = node;
     }
}]);