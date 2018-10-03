
require("./__init.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get node attribute value
 * @function MetaphorJs.dom.getAttr
 * @param {DomNode} node
 * @returns {string}
 */
module.exports = MetaphorJs.dom.getAttr = function dom_getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
};