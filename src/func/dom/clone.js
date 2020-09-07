
require("./__init.js");

const isArray = require("metaphorjs-shared/src/func/isArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Clone dom node (or array of nodes)
 * @function MetaphorJs.dom.clone
 * @param {[]|Element} node
 * @returns {[]|Element}
 */
module.exports = MetaphorJs.dom.clone = function dom_clone(node) {

    var i, len, cloned;

    if (isArray(node)) {
        cloned = [];
        for (i = 0, len = node.length; i < len; i++) {
            cloned.push(dom_clone(node[i]));
        }
        return cloned;
    }
    else if (node) {
        switch (node.nodeType) {
            // element
            case window.document.ELEMENT_NODE:
                return node.cloneNode(true);
            // text node
            case window.document.TEXT_NODE:
                return window.document.createTextNode(node.innerText || node.textContent);
            // document fragment
            case window.document.DOCUMENT_FRAGMENT_NODE:
                return node.cloneNode(true);

            default:
                return null;
        }
    }

    return null;
};
