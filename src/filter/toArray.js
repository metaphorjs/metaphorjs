

var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    toArray = require("../func/array/toArray.js"),
    isPlainObject = require("../func/isPlainObject.js");

nsAdd("filter.toArray", function(input){

    if (isPlainObject(input)) {
        var list = [],
            k;
        for (k in input) {
            if (input.hasOwnProperty(k)) {
                list.push({key: k, value: input[k]});
            }
        }
        return list;
    }

    return toArray(input);
});