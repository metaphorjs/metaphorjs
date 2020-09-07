

require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter lowercase
 * Transform to lower case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.lowercase = function(val){
    return (""+val).toLowerCase();
};