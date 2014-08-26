/**
 * @param {*} obj
 * @returns {boolean}
 */
var isPlainObject = MetaphorJs.isPlainObject = function(obj) {
    return !!(obj && obj.constructor === Object);
};