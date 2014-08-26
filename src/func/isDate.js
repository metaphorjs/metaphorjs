//#require toString.js

var isDate = function(value) {
    return toString.call(value) === '[object Date]';
};