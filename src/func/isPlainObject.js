
var varType = require("./varType.js");

module.exports = function(value) {
    return typeof value == "object" && varType(value) === 3;
};