
require("./__init.js");
require("./isAttached.js");
require("./getScrollTop.js");
require("./getScrollLeft.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's offset
 * @function MetaphorJs.dom.getOffet
 * @param {HTMLElement} node
 * @returns {object} {
 *  @type {int} top
 *  @type {int} left
 * }
 */
module.exports = MetaphorJs.dom.getOffset = function dom_getOffset(node) {

    var box = {top: 0, left: 0},
        html = window.document.documentElement;

    // Make sure it's not a disconnected DOM node
    if (!MetaphorJs.dom.isAttached(node) || node === window) {
        return box;
    }

    // Support: BlackBerry 5, iOS 3 (original iPhone)
    // If we don't have gBCR, just use 0,0 rather than error
    if (node.getBoundingClientRect ) {
        box = node.getBoundingClientRect();
    }

    return {
        top: box.top + MetaphorJs.dom.getScrollTop() - html.clientTop,
        left: box.left + MetaphorJs.dom.getScrollLeft() - html.clientLeft
    };
};