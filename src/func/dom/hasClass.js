require("./__init.js");
require("./getClsReg.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @function MetaphorJs.dom.hasClass
 * @param {Element} el
 * @param {String} cls
 * @returns {boolean}
 */
module.exports = MetaphorJs.dom.hasClass = function(el, cls) {
    return cls ? MetaphorJs.dom.getClsReg(cls).test(el.className) : false;
};