var isString = require("../func/isString.js");

module.exports = function(){
    var node    = window.document.createElement("div");
    return isString(node.textContent) ? "textContent" : "innerText";
}();