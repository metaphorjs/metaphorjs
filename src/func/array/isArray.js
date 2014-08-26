//#require ../toString.js

/**
 * @param {*} value
 * @returns {boolean}
 */
var isArray = MetaphorJs.isArray = function(value) {
    return !!(value && typeof value == 'object' &&
              typeof value.length == 'number' &&
                toString.call(value) == '[object Array]' || false);
};