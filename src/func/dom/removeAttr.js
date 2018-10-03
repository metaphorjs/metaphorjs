
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Remove element's attribute
 * @function MetaphorJs.dom.removeAttr
 * @param {DomNode} node 
 * @param {string} name
 */
module.exports = MetaphorJs.dom.removeAttr = function dom_removeAttr(el, name) {
    return el.removeAttribute(name);
};