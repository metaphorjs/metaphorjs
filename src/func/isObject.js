
var varType = require("./varType.js");

module.exports = function(value) {
    return value !== null && typeof value == "object" && varType(value) > 2;
};