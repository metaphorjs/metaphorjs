
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    filterArray = require("metaphorjs-shared/src/func/filterArray.js");

/**
 * @filter filter
 * See <code>filterArray</code> function
 * @param {array} input
 * @param {string|boolean|regexp|function} by
 * @param {string|boolean|null} opt true | false | "strict"
 * @returns {array}
 */
MetaphorJs.filter.filter = function(val, scope, by, opt) {
    return filterArray(val, by, opt);
};
