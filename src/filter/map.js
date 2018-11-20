
require("./__init.js");
require("../lib/Expression.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

/**
 * @filter map
 * @param {array} input
 * @param {string} fnName {
 *  Either a namespace entry, or global function name or 
 *  expression to try against current scope. In any case
 *  it must resolve into a function that accepts 
 *  mapped item as first argument.
 *  @param {*} item
 *  @returns {*}
 * }
 * @returns {array} new array
 */
MetaphorJs.filter.map = function(array, scope, fnName) {

    var i, l,
        res = [],
        fn = ns.get(fnName, true) ||
                window[fnName] ||
                MetaphorJs.lib.Expression.get(fnName, scope);
    array = array || [];

    if (fn) {
        for (i = 0, l = array.length; i < l; i++) {
            res.push(fn(array[i]));
        }
    }

    return res;
};