
var varType = require("./varType.js");

module.exports = function(value) {
    return varType(value) === 2;
};