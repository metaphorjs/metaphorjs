
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.filter.l = function(key, scope) {
    return scope.$app.lang.get(key);
};
