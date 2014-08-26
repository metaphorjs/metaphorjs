//#require aIndexOf.js

/**
 * @param {*} val
 * @param {[]} arr
 * @returns {boolean}
 */
var inArray = MetaphorJs.inArray = function(val, arr) {
    return arr ? (aIndexOf.call(arr, val) != -1) : false;
};