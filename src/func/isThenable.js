
var isFunction = require("./isFunction.js"),
    isObject = require("./isObject.js");

/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|boolean}
 */
module.exports = function(any) {
    var then;
    if (!any) {
        return false;
    }
    if (!isObject(any) && !isFunction(any)) {
        return false;
    }
    return isFunction((then = any.then)) ?
           then : false;
};