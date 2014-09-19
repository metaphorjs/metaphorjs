
var varType = require("./varType.js");

module.exports = function isRegExp(value) {
    return varType(value) === 9;
};