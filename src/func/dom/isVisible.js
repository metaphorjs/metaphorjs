/**
 * @param {Element} el
 * @returns {boolean}
 */
module.exports = function isVisible(el) {
    return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};