
module.exports = function getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
};