
require("./__init.js");
var _dom_getDimensions = require("./_/_getDimensions.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element outer width
 * @function MetaphorJs.dom.getOuterWidth
 * @param {DomNode} el
 * @returns {int}
 */
module.exports = MetaphorJs.dom.getOuterWidth = _dom_getDimensions("outer", "Width");