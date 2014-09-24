

var documentElement = require("../../var/documentElement.js"),
    getStyle = require("./getStyle.js");

module.exports = function getOffsetParent(node) {

    var offsetParent = node.offsetParent || documentElement;

    while (offsetParent && (offsetParent != documentElement &&
                              getStyle(offsetParent, "position") == "static")) {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || documentElement;

};