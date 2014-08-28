

var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    toArray = require("../func/array/toArray.js");

nsAdd("filter.toArray", function(input){
    return toArray(input);
});