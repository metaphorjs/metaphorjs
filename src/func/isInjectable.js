/**
 * @param {*} any
 * @returns {boolean}
 */
var isInjectable = MetaphorJs.isInjectable = function(any) {
    return any && ((any.length && typeof any[any.length - 1] == "function") ||
                    any.inject);
};