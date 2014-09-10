
var varType = require("./varType.js");

module.exports = function(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" && varType(value) === 3 && !value.nodeType;
};