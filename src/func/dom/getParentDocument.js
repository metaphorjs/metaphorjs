
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.getParentDocument = function dom_getParentDocument(node) {
    var fragType = window.document.DOCUMENT_FRAGMENT_NODE,
        parent = node.parentNode;
    while (parent) {
        if (parent.nodeType === fragType) {
            return parent;
        }
        parent = parent.parentNode;
    }
    return node.ownerDocument;
};