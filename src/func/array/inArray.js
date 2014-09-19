
var aIndexOf = require("./aIndexOf.js");

/**
 * @param {*} val
 * @param {[]} arr
 * @returns {boolean}
 */
module.exports = function inArray(val, arr) {
    return arr ? (aIndexOf.call(arr, val) != -1) : false;
};