
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    sortArray = require("metaphorjs-shared/src/func/sortArray.js");

/**
 * @filter sortBy
 * Sort array of objects by object field
 * @param {array} input
 * @param {function|string|object} field {
 *  See <code>sortArray()</code> function
 * }
 * @param {string} dir
 * @returns {array}
 */
MetaphorJs.filter.sortBy = function(val, state, field, dir) {
    return sortArray(val, field, dir);
};