
var uaString = require("../../var/uaString.js");

module.exports = function(){

    var android = parseInt((/android (\d+)/.exec(uaString) || [])[1], 10) || false;

    return function() {
        return android;
    };

}();