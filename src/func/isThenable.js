
/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|false}
 */
var isThenable = MetaphorJs.isThenable = function(any) {
    var then;
    if (!any) {
        return false;
    }
    if (typeof any != "object" && typeof any != "function") {
        return false;
    }
    return typeof (then = any.then) == "function" ?
           then : false;
};