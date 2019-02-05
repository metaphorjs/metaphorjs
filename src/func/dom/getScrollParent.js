
require("./__init.js");
require("./getStyle.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get element's scrolling parent
 * @function MetaphorJs.dom.getScrollParent
 * @param {HTMLElement} node
 * @returns {HTMLElement}
 */
module.exports = MetaphorJs.dom.getScrollParent = function() {

    var rOvf        = /(auto|scroll)/,
        body,

        overflow    = function (node) {
            var style = getStyle(node);
            return style ? style["overflow"] + style["overflowY"] + style["overflowY"] : "";
        },

        scroll      = function (node) {
            return rOvf.test(overflow(node));
        };

    return function dom_getScrollParent(node) {

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