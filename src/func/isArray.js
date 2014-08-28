
var toString = require("./toString.js"),
    isObject = require("./isObject.js"),
    isNumber = require("./isNumber.js");

/**
 * @param {*} value
 * @returns {boolean}
 */
module.exports = function(value) {
    return !!(value && isObject(value) && isNumber(value.length) &&
                toString.call(value) == '[object Array]' || false);
};