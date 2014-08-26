//#require ../getRegExp.js

/**
 * @param {String} cls
 * @returns {RegExp}
 */
var getClsReg   = function(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};