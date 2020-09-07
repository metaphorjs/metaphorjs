require("./__init.js");
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Set element's style
 * @function MetaphorJs.dom.setStyle
 * @param {HTMLElement} el
 * @param {string} name
 * @param {*} value
 */
module.exports = MetaphorJs.dom.setStyle = function dom_setStyle(el, name, value) {

    if (!el || !el.style) {
        return;
    }

    var props,
        style = el.style,
        k;

    if (typeof name === "string") {
        props = {};
        props[name] = value;
    }
    else {
        props = name;
    }

    for (k in props) {
        style[k] = props[k];
    }
};