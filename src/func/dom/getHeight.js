
require("./__init.js");
var _dom_getDimensions = require("./_/_getDimensions.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element height
 * @function MetaphorJs.dom.getHeight
 * @param {HTMLElement} el
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getHeight = _dom_getDimensions("", "Height");