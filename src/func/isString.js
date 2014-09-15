
var varType = require("./varType.js");

module.exports = function(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
};