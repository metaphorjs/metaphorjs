
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.setAttr = function(el, name, value) {
    return el.setAttribute(name, value);
};