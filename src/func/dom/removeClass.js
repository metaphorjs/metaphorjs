
var getClsReg = require("./getClsReg.js");

/**
 * @param {Element} el
 * @param {String} cls
 */
module.exports = function removeClass(el, cls) {
    if (cls) {
        el.className = el.className.replace(getClsReg(cls), '');
    }
};