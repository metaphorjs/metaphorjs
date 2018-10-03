
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    filterArray = require("metaphorjs-shared/src/func/filterArray.js");

MetaphorJs.filter.filter = function(val, scope, by, opt) {
    return filterArray(val, by, opt);
};


