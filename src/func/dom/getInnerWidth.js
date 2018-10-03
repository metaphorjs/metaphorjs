
require("./__init.js");
var _dom_getDimensions = require("./_/_getDimensions.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element inner width
 * @function MetaphorJs.dom.getInnerWidth
 * @param {DomNode} el
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getInnerWidth = _dom_getDimensions("inner", "Width");