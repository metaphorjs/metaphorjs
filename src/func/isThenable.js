
var isFunction = require("./isFunction.js"),
    isObject = require("./isObject.js");

/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|boolean}
 */
module.exports = function(any) {
    var then;
    if (!any || (!isObject(any) && !isFunction(any))) {
        return false;
    }
    return isFunction((then = any.then)) ?
           then : false;
};