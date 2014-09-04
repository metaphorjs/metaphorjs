
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    sortArray = require("../func/array/sortArray.js");

nsAdd("filter.sortBy", function(val, scope, field, dir) {
    return sortArray(val, field, dir);
});