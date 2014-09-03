
var undf = require("../../var/undf.js");

module.exports = function() {
    if(window.pageXOffset !== undf) {
        //most browsers except IE before #9
        return function(){
            return window.pageXOffset;
        };
    }
    else{
        var B = document.body; //IE 'quirks'
        var D = document.documentElement; //IE with doctype
        if (D.clientWidth) {
            return function() {
                return D.scrollLeft;
            };
        }
        else {
            return function() {
                return B.scrollLeft;
            };
        }
    }
}();