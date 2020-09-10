

require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter linkify
 * Transform text links into html links
 * @param {string} input Text
 * @param {string} target Optional target parameter
 * @returns {string}
 */
MetaphorJs.filter.linkify = function(input, state, target){
    target = target ? ' target="'+target+'"' : "";
    if (input) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return input.replace(exp, '<a href="$1"'+target+'>$1</a>');
    }
    return "";
};