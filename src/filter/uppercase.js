

require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter uppercase
 * Transform to upper case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.uppercase = function(val){
    return (""+val).toUpperCase();
};