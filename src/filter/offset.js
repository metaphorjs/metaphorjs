
require("./__init.js");

var MetaphorJs = require("../MetaphorJs.js"),
    isArray = require("../func/isArray.js"),
    isString = require("../func/isString.js");

MetaphorJs.filter.offset = function(input, scope, offset){

    var isS = isString(input);

    if (!isArray(input) && !isS) {
        return input;
    }

    if (Math.abs(Number(offset)) === Infinity) {
        offset = Number(offset);
    } else {
        offset = parseInt(offset, 10);
    }

    if (isS) {
        return input.substr(offset);
    }
    else {
        return input.slice(offset);
    }
};