
require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js");

MetaphorJs.filter.l = function(key, scope) {
    return scope.$app.lang.get(key);
};
