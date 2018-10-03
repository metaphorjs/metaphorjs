
require("./__init.js");
require("./getStyle.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's offset parent
 * @function MetaphorJs.dom.getOffsetParent
 * @param {DomNode} node 
 * @returns {DomNode}
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
