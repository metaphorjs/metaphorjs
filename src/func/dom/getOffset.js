
var elHtml = require("../../var/elHtml.js"),
    isAttached = require("./isAttached.js"),
    getScrollTop = require("./getScrollTop.js"),
    getScrollLeft = require("./getScrollLeft.js");

module.exports = function getOffset(node) {

    var box = {top: 0, left: 0};

    // Make sure it's not a disconnected DOM node
    if (!isAttached(node) || node === window) {
        return box;
    }

    // Support: BlackBerry 5, iOS 3 (original iPhone)
    // If we don't have gBCR, just use 0,0 rather than error
    if (node.getBoundingClientRect ) {
        box = node.getBoundingClientRect();
    }

    return {
        top: box.top + getScrollTop() - elHtml.clientTop,
        left: box.left + getScrollLeft() - elHtml.clientLeft
    };
};