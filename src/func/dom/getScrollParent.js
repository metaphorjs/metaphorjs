
var getStyle = require("./getStyle.js");

module.exports = function() {

    var rOvf        = /(auto|scroll)/,
        body,

        overflow    = function (node) {
            var style = getStyle(node);
            return style ? style["overflow"] + style["overflowY"] + style["overflowY"] : "";
        },

        scroll      = function (node) {
            return rOvf.test(overflow(node));
        };

    return function getScrollParent(node) {

        if (!body) {
            body = window.document.body;
        }

        var parent = node;

        while (parent) {
            if (parent === body) {
                return window;
            }
            if (scroll(parent)) {
                return parent;
            }
            parent = parent.parentNode;
        }

        return window;
    };
}();