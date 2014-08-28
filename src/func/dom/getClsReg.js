
var getRegExp = require("../getRegExp.js");

/**
 * @param {String} cls
 * @returns {RegExp}
 */
module.exports = function(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};