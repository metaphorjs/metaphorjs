
require("./__init.js");
require("./hasClass.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @function MetaphorJs.dom.addClass
 * @param {HTMLElement} el
 * @param {string} cls
 */
module.exports = MetaphorJs.dom.addClass = function dom_addClass(el, cls) {
    if (cls && !MetaphorJs.dom.hasClass(el, cls)) {
        el.className += " " + cls;
    }
};