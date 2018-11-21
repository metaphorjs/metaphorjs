

require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js");

/**
 * @filter toArray
 * @code src-docs/code/filter/toArray.js
 * @param {*} input
 * @returns {array}
 */
MetaphorJs.filter.toArray = function(input) {

    if (isPlainObject(input)) {
        var list = [],
            k;
        for (k in input) {
            if (input.hasOwnProperty(k)) {
                list.push({key: k, value: input[k]});
            }
        }
        return list;
    }

    return toArray(input);
};