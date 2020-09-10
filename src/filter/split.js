

require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    getRegExp = require("metaphorjs-shared/src/func/getRegExp.js");

/**
 * @filter split
 * Split string into parts
 * @param {string} input
 * @param {string|RegExp} separator {
 *  Can also pass "/regexp/" as a string 
 * }
 * @param {int} limit
 * @returns {array}
 */
MetaphorJs.filter.split = function(input, state, sep, limit) {

    limit       = limit || undefined;
    sep         = sep || "/\\n|,/";

    if (!input) {
        return [];
    }

    input       = "" + input;

    if (sep.substr(0,1) === '/' && sep.substr(sep.length - 1) === "/") {
        sep = getRegExp(sep.substring(1, sep.length-1));
    }

    var list = input.split(sep, limit),
        i, l;

    for (i = -1, l = list.length; ++i < l; list[i] = list[i].trim()){}

    return list;
};
