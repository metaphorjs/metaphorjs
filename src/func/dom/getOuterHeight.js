
require("./__init.js");
var _dom_getDimensions = require("./_/_getDimensions.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element outer height
 * @function MetaphorJs.dom.getOuterHeight
 * @param {DomNode} el
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getOuterHeight = _dom_getDimensions("outer", "Height");