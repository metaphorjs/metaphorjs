
var hasClass = require("./hasClass.js");

/**
 * @param {Element} el
 * @param {String} cls
 */
module.exports = function(el, cls) {
    if (cls && !hasClass(el, cls)) {
        el.className += " " + cls;
    }
};