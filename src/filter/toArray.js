

require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js")
    toArray = require("metaphorjs-shared/src/array/toArray.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js");

MetaphorJs.filter.toArray = function(input){

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
};