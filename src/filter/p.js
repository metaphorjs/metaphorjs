
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.filter.p = function(key, scope, number) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
};
