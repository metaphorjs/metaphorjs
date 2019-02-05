
require("./__init.js");

require("./__init.js");
require("./getClsReg.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Remove element's class
 * @function MetaphorJs.dom.removeClass
 * @param {HTMLElement} el
 * @param {string} cls
 */
module.exports = MetaphorJs.dom.removeClass = function(el, cls) {
    if (cls) {
        el.className = el.className.replace(MetaphorJs.dom.getClsReg(cls), '');
    }
};