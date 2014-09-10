
module.exports = function(fn) {

    return fn.__instantiate ||
           fn.__isMetaphorClass ||
           fn.prototype.constructor !== fn ?

           true : false;
};