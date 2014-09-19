

var elHtml = require("../../var/elHtml.js"),
    getStyle = require("./getStyle.js");

module.exports = function getOffsetParent(node) {

    var offsetParent = node.offsetParent || elHtml;

    while (offsetParent && (offsetParent != elHtml &&
                              getStyle(offsetParent, "position") == "static")) {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || elHtml;

};