
require("./__init.js");
require("./getStyle.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's offset parent
 * @function MetaphorJs.dom.getOffsetParent
 * @param {HTMLElement} node 
 * @returns {HTMLElement}
 */
module.exports = MetaphorJs.dom.getOffsetParent = function dom_getOffsetParent(node) {

    var html = window.document.documentElement,
        offsetParent = node.offsetParent || html;

    while (offsetParent && 
            (offsetParent != html &&
                MetaphorJs.dom.getStyle(offsetParent, "position") === "static")) {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || html;
};
