
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter get
 * @param {object} input
 * @param {string} prop {   
 *  Property name or path to property ("a.b.c")
 * }
 * @returns {*}
 */
MetaphorJs.filter.get = function(val, state, prop) {
    var tmp = (""+prop).split("."),
        key;

    while (key = tmp.shift()) {
        val = val[key];
        if (val === undefined) {
            return undefined;
        }
    }

    return val;
};

