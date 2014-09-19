
var varType = require("./varType.js");

module.exports = function isNumber(value) {
    return varType(value) === 1;
};