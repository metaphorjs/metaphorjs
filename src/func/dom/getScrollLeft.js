
require("./__init.js");
var _getScrollTopOrLeft = require("./_/_getScrollTopOrLeft.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's horizontal scroll position
 * @function MetaphorJs.dom.getScrollLeft
 * @param {HTMLElement} element
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getScrollLeft = _getScrollTopOrLeft(false);
