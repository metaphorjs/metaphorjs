
var varType = require("./varType.js");

/**
 * @param {*} value
 * @returns {boolean}
 */
module.exports = function isArray(value) {
    return typeof value == "object" && varType(value) === 5;
};