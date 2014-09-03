
var varType = require("./varType.js");

/**
 * @param {*} value
 * @returns {boolean}
 */
module.exports = function(value) {
    return varType(value) === 5;
};