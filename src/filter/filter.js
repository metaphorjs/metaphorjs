
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    filterArray = require("../func/array/filterArray.js");

nsAdd("filter.filter", function(val, scope, by, opt) {
    return filterArray(val, by, opt);
});


