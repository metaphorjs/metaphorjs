
var select = require("./select.js");

/**
 * @param {Element} el
 * @param {String} selector
 * @returns {boolean}
 */
module.exports = function(el, selector) {

    var els = select(selector, el.parentNode),
        i, l;

    for (i = -1, l = els.length; ++i < l;) {
        if (els[i] === el) {
            return true;
        }
    }
    return false;
};