

require("./__init.js");
require("metaphorjs-shared/src/lib/Cache.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter moment
 * Pass given input value through numeral.js lib
 * @param {string|int} input 
 * @param {string} format number format
 * @returns {string}
 */
MetaphorJs.filter.numeral = function(val, scope, format) {
    return numeral(val).format(
        MetaphorJs.lib.Cache.global().get(format, format)
    );
};