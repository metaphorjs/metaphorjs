
var isArray = require("./isArray.js"),
    isRegExp = require("./isRegExp.js"),
    isObject = require('./isObject.js'),
    isDate = require("./isDate.js"),
    isWindow = require("./isWindow.js");

module.exports = function(){

    var copy = function(source, destination){
        if (isWindow(source)) {
            throw new Error("Cannot copy window object");
        }

        if (!destination) {
            destination = source;
            if (source) {
                if (isArray(source)) {
                    destination = copy(source, []);
                } else if (isDate(source)) {
                    destination = new Date(source.getTime());
                } else if (isRegExp(source)) {
                    destination = new RegExp(source.source);
                } else if (isObject(source)) {
                    destination = copy(source, {});
                }
            }
        } else {
            if (source === destination) {
                throw new Error("Objects are identical");
            }
            if (isArray(source)) {
                destination.length = 0;
                for ( var i = 0; i < source.length; i++) {
                    destination.push(copy(source[i]));
                }
            } else {
                var key;
                for (key in destination) {
                    delete destination[key];
                }
                for (key in source) {
                    destination[key] = copy(source[key]);
                }
            }
        }
        return destination;
    };

    return copy;
}();