/**
 * @param {Element} el
 * @returns {boolean}
 */
module.exports = function(el) {
    return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};