
require("./__init.js");
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's style object
 * @function MetaphorJs.dom.getStyle
 * @param {HTMLElement} node
 * @returns {DomStyle}
 */

 /**
 * Get element's style property
 * @function MetaphorJs.dom.getStyle
 * @param {HTMLElement} node
 * @param {string} prop
 * @param {boolean} numeric return as number
 * @returns {string|int}
 */
module.exports = MetaphorJs.dom.getStyle = function dom_getStyle(node, prop, numeric) {

    var style, val;

    if (window.getComputedStyle) {
        if (node === window) {
            return prop? (numeric ? 0 : null) : {};
        }
        style = window.getComputedStyle(node, null);
        val = prop ? style[prop] : style;
    }
    else {
        style = node.currentStyle || node.style || {};
        val = prop ? style[prop] : style;
    }

    return numeric ? parseFloat(val) || 0 : val;
};
