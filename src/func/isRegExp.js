//#require toString.js

var isRegExp = function(value) {
    return toString.call(value) === '[object RegExp]';
};