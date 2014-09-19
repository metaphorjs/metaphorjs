/**
 * @param {String} expr
 */
module.exports = function(){

    var cache = {};

    return function getRegExp(expr) {
        return cache[expr] || (cache[expr] = new RegExp(expr));
    };
}();