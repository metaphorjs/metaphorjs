
var isString = require("../func/isString.js");

module.exports = function(){
    var node    = document.createTextNode("");
    return isString(node.textContent) ? "textContent" : "nodeValue";
}();