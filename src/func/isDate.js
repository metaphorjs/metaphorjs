
var varType = require("./varType.js");

module.exports = function isDate(value) {
    return varType(value) === 10;
};