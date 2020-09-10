
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    isString = require("metaphorjs-shared/src/func/isString.js");

/**
 * @filter offset
 * Get slice of array or string starting from offset
 * @param {array|string} input
 * @param {int} offset
 * @returns {array|string}
 */
MetaphorJs.filter.offset = function(input, state, offset) {

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