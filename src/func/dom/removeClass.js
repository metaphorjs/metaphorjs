//#require getClsReg.js

/**
 * @param {Element} el
 * @param {String} cls
 */
var removeClass = MetaphorJs.removeClass = function(el, cls) {
    if (cls) {
        el.className = el.className.replace(getClsReg(cls), '');
    }
};