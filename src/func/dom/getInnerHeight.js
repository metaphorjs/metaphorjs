
require("./__init.js");
var _dom_getDimensions = require("./_/_getDimensions.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element inner height
 * @function MetaphorJs.dom.getInnerHeight
 * @param {HTMLElement} el
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getInnerHeight = _dom_getDimensions("inner", "Height");