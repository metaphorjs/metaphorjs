
require("./__init.js");

var getRegExp = require("metaphorjs-shared/src/func/getRegExp.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @param {String} cls
 * @returns {RegExp}
 */
module.exports = MetaphorJs.dom.getClsReg = function(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};