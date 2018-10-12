
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    undf = require("metaphorjs-shared/src/var/undf.js");

/**
 * @filter collect
 * @param {array} input Array of objects
 * @param {string} field Field name to collect from objects
 * @returns {array}
 */
MetaphorJs.filter.collect = function(input, scope, prop) {

    var res = [],
        i, l, val;

    if (!input) {
        return res;
    }

    for (i = 0, l = input.length; i < l; i++) {
        val = input[i][prop];
        if (val != undf) {
            res.push(val);
        }
    }

    return res;
};