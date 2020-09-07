require("./__init.js");
require("./getClsReg.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @function MetaphorJs.dom.hasClass
 * @param {HTMLElement} el
 * @param {String} cls
 * @returns {boolean}
 */
module.exports = MetaphorJs.dom.hasClass = function(el, cls) {
    return cls ? 
            el.classList ? 
                el.classList.contains(cls) : 
                MetaphorJs.dom.getClsReg(cls).test(el.className) : 
            false;
};