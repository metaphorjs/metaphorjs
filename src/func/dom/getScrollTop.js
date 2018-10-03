
require("./__init.js");
var _getScrollTopOrLeft = require("./_/_getScrollTopOrLeft.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's vertical scroll position
 * @function MetaphorJs.dom.getScrollLeft
 * @param {DomNode} element
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getScrollLeft = _getScrollTopOrLeft(true);
