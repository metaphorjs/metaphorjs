var toString = require("./toString.js");

module.exports = function(value) {
    return toString.call(value) === '[object Date]';
};