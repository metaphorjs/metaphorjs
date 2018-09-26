
require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js")
    sortArray = require("../func/array/sortArray.js");

MetaphorJs.filter.sortBy = function(val, scope, field, dir) {
    return sortArray(val, field, dir);
};