
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

MetaphorJs.filter.pl = function(number, scope, key) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
};