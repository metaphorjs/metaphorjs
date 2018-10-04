
require("./__init.js");
require("./select.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Check if given element matches selector
 * @function MetaphorJs.dom.is
 * @param {Element} el
 * @param {string} selector
 * @returns {boolean}
 */
module.exports = MetaphorJs.dom.is = function(el, selector) {

    var els = MetaphorJs.dom.select(selector, el.parentNode),
        i, l;

    for (i = -1, l = els.length; ++i < l;) {
        if (els[i] === el) {
            return true;
        }
    }
    return false;
};