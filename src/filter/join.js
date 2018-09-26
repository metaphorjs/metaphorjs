

require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js"),
    toArray = require("../func/array/toArray.js"),
    isArray = require("../func/isArray.js");

MetaphorJs.filter.join = function(input, scope, separator) {

    separator = separator || ", ";

    if (input && input.length) {
        if (!isArray(input)){
            input = toArray(input);
        }
        return input.join(separator);
    }

    return "";
};