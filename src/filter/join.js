

var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    toArray = require("../func/array/toArray.js"),
    isArray = require("../func/isArray.js");

nsAdd("filter.join", function(input, scope, separator) {

    separator = separator || ", ";

    if (input && input.length) {
        if (!isArray(input)){
            input = toArray(input);
        }
        return input.join(separator);
    }

    return "";
});