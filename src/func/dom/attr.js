
var undf = require("../../var/undf.js");

module.exports = function(el, name, value) {
    if (!el || !el.getAttribute) {
        return null;
    }
    if (value === undf) {
        return el.getAttribute(name);
    }
    else if (value === null) {
        return el.removeAttribute(name);
    }
    else {
        return el.setAttribute(name, value);
    }
};