
require("./__init.js");
const _getScrollTopOrLeft = require("./_/_getScrollTopOrLeft.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's vertical scroll position
 * @function MetaphorJs.dom.getScrollTop
 * @param {HTMLElement} element
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getScrollTop = _getScrollTopOrLeft(true);
