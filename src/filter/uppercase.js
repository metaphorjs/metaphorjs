

require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter uppercase
 * Transform to upper case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.uppercase = function(val){
    return (""+val).toUpperCase();
};