
require("./__init.js");
var _getScrollTopOrLeft = require("./_/_getScrollTopOrLeft.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's vertical scroll position
 * @function MetaphorJs.dom.getScrollTop
 * @param {DomNode} element
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getScrollTop = _getScrollTopOrLeft(true);
