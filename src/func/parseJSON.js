
var isUndefined = require("./isUndefined.js");

module.exports = function() {

    return isUndefined(JSON) ?
           function(data) {
               return JSON.parse(data);
           } :
           function(data) {
               return (new Function("return " + data))();
           };
}();

