//#require getClsReg.js

/**
 * @param {Element} el
 * @param {String} cls
 * @returns {boolean}
 */
var hasClass = MetaphorJs.hasClass = function(el, cls) {
    return cls ? getClsReg(cls).test(el.className) : false;
};