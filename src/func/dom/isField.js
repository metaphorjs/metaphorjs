require("./__init.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Is given element a field
 * @function MetaphorJs.dom.isField
 * @param {HTMLElement} node
 * @returns {boolean}
 */
module.exports = MetaphorJs.dom.isField = function dom_isField(el) {
    var tag	= el && el.nodeName ? el.nodeName.toLowerCase() : null,
        type = el.type;
    if (tag == 'input' || tag == 'textarea' || tag == 'select') {
        if (type != "submit" && type != "reset" && type != "button") {
            return true;
        }
    }
    return false;
};