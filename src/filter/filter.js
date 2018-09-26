
require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js"),
    filterArray = require("../func/array/filterArray.js");

MetaphorJs.filter.filter = function(val, scope, by, opt) {
    return filterArray(val, by, opt);
};


