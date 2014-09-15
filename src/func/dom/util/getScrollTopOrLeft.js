
var undf = require("../../../var/undf.js");

module.exports = function(vertical) {

    var defaultST,
        wProp = vertical ? "pageYOffset" : "pageXOffset",
        sProp = vertical ? "scrollTop" : "scrollLeft",
        doc = document,
        body = doc.body,
        html = doc.documentElement;

    if(window[wProp] !== undf) {
        //most browsers except IE before #9
        defaultST = function(){
            return window[wProp];
        };
    }
    else{
        if (html.clientHeight) {
            defaultST = function() {
                return html[sProp];
            };
        }
        else {
            defaultST = function() {
                return body[sProp];
            };
        }
    }

    return function(node) {
        if (!node || node === window) {
            return defaultST();
        }
        else if (node && node.nodeType == 1 &&
            node !== body && node !== html) {
            return node[sProp];
        }
        else {
            return defaultST();
        }
    }

};