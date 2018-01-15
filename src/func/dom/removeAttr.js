
var restoreAttributeName = require("metaphorjs/src/func/dom/restoreAttributeName.js");

module.exports = function removeAttr(el, name, props) {
    if (props) {
        name = restoreAttributeName(name, props);
    }
    return el.removeAttribute(name);
};