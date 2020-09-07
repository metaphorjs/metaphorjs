
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter ucfirst
 * Transform first character to upper case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.ucfirst = function(val){
    return val.substr(0, 1).toUpperCase() + val.substr(1);
};