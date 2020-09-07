
require("./__init.js");
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Is element visible on the page
 * @function MetaphorJs.dom.isVisible
 * @param {HTMLElement} el
 * @returns {boolean}
 */
module.exports = MetaphorJs.dom.isVisible = function dom_isVisible(el) {
    return el && !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};
