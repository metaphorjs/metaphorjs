//#require hasClass.js

/**
 * @param {Element} el
 * @param {String} cls
 */
var addClass = MetaphorJs.addClass = function(el, cls) {
    if (cls && !hasClass(el, cls)) {
        el.className += " " + cls;
    }
};