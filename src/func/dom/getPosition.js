
require("./__init.js");
require("./getStyle.js");
require("./getOffsetParent.js");
require("./getOffset.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get node position relative to offset parent or specific node
 * @function MetaphorJs.dom.getPosition
 * @param {HTMLElement} node 
 * @param {HTMLElement} to 
 * @return {object} {
 *  @type {int} top
 *  @type {int} left
 * }
 */
module.exports = MetaphorJs.dom.getPosition = function dom_getPosition(node, to) {

    var offsetParent, offset,
        parentOffset = {top: 0, left: 0},
        html = window.document.documentElement;

    if (node === window || node === html) {
        return parentOffset;
    }

    // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
    // because it is its only offset parent
    if (MetaphorJs.dom.getStyle(node, "position" ) == "fixed") {
        // Assume getBoundingClientRect is there when computed position is fixed
        offset = node.getBoundingClientRect();
    }
    else if (to) {
        var thisOffset = MetaphorJs.dom.getOffset(node),
            toOffset = MetaphorJs.dom.getOffset(to),
            position = {
                left: thisOffset.left - toOffset.left,
                top: thisOffset.top - toOffset.top
            };

        if (position.left < 0) {
            position.left = 0;
        }
        if (position.top < 0) {
            position.top = 0;
        }
        return position;
    }
    else {
        // Get *real* offsetParent
        offsetParent = MetaphorJs.dom.getOffsetParent(node);

        // Get correct offsets
        offset = MetaphorJs.dom.getOffset(node);

        if (offsetParent !== html) {
            parentOffset = MetaphorJs.dom.getOffset(offsetParent);
        }

        // Add offsetParent borders
        parentOffset.top += MetaphorJs.dom.getStyle(offsetParent, "borderTopWidth", true);
        parentOffset.left += MetaphorJs.dom.getStyle(offsetParent, "borderLeftWidth", true);
    }

    // Subtract parent offsets and element margins
    return {
        top: offset.top - parentOffset.top - MetaphorJs.dom.getStyle(node, "marginTop", true),
        left: offset.left - parentOffset.left - MetaphorJs.dom.getStyle(node, "marginLeft", true)
    };
};