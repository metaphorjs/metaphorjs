/**
 * @param {Element} el
 * @returns {boolean}
 */
var isVisible = MetaphorJs.isVisible = function(el) {
    return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};