
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Is node attached to DOM
 * @function MetaphorJs.dom.isAttached
 * @param {HTMLElement} node
 * @returns {boolean}
 */
module.exports = MetaphorJs.dom.isAttached = function dom_isAttached(node) {

    if (node === window) {
        return true;
    }
    if (node.nodeType == window.document.TEXT_NODE) {
        if (node.parentElement) {
            return dom_isAttached(node.parentElement);
        }
        else {
            return true;
        }
    }

    var html = window.document.documentElement;

    return node === html ? true : html.contains(node);
};
