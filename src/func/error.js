
var async = require("./async.js"),
    isUndefined = require("./isUndefined.js");

module.exports = function(e) {

    var stack = e.stack || (new Error).stack;

    async(function(){
        if (!isUndefined(console) && console.log) {
            console.log(e);
            if (stack) {
                console.log(stack);
            }
        }
    });
};