
var isUndefined = require("../isUndefined.js"),
    isString = require("../isString.js");

/**
 * @param {*} list
 * @returns {[]}
 */
module.exports = function(list) {
    if (list && !isUndefined(list.length) && !isString(list)) {
        for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
        return a;
    }
    else if (list) {
        return [list];
    }
    else {
        return [];
    }
};