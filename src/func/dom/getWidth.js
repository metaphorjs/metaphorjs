
require("./__init.js");
const _dom_getDimensions = require("./_/_getDimensions.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element width
 * @function MetaphorJs.dom.getWidth
 * @param {HTMLElement} el
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getWidth = _dom_getDimensions("", "Width");