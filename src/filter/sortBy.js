
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js")
    sortArray = require("metaphorjs-shared/src/func/sortArray.js");

MetaphorJs.filter.sortBy = function(val, scope, field, dir) {
    return sortArray(val, field, dir);
};