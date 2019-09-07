require("./__init.js");

var toArray = require("metaphorjs-shared/src/func/toArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Returns array of nodes or an empty array
 * @function MetaphorJs.dom.select
 * @param {string} selector
 * @param {HTMLElement} root to look into
 */
module.exports = MetaphorJs.dom.select = function dom_select(selector, root) {
    root = root || window.document;
    return toArray(root.querySelectorAll(selector));
}