
require("./__init.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Remove specific style from element
 * @function MetaphorJs.dom.removeStyle
 * @param {HTMLElement} node
 * @param {string} name Style property name
 */
module.exports = MetaphorJs.dom.removeStyle = (function() {

    var div = window.document.createElement("div");

    if (div.style && div.style.removeProperty) {
        return function(node, name) {
            node.style.removeProperty(name);
        };
    }
    else {
        return function(node, name) {
            node.style.removeAttribute(name);
        };
    }

}());