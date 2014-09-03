
var undf = require("../../var/undf.js");

module.exports = function() {
    if(window.pageYOffset !== undf) {
        //most browsers except IE before #9
        return function(){
            return window.pageYOffset;
        };
    }
    else{
        var B = document.body; //IE 'quirks'
        var D = document.documentElement; //IE with doctype
        if (D.clientHeight) {
            return function() {
                return D.scrollTop;
            };
        }
        else {
            return function() {
                return B.scrollTop;
            };
        }
    }
}();