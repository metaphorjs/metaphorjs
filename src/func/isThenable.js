
var isFunction = require("./isFunction.js");

/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|boolean}
 */
module.exports = function isThenable(any) {
    if (!any || !any.then) {
        return false;
    }
    var then, t;
    //if (!any || (!isObject(any) && !isFunction(any))) {
    if (((t = typeof any) != "object" && t != "function")) {
        return false;
    }
    return isFunction((then = any.then)) ?
           then : false;
};