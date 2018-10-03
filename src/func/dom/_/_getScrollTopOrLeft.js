
var undf = require("metaphorjs-shared/src/var/undf.js");

module.exports = function(vertical) {

    var defaultST,
        wProp = vertical ? "pageYOffset" : "pageXOffset",
        sProp = vertical ? "scrollTop" : "scrollLeft",
        doc = window.document,
        body = doc.body,
        html = doc.documentElement;

    var ret = function(scroll, allowNegative) {
        if (scroll < 0 && allowNegative === false) {
            return 0;
        }
        return scroll;
    };

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

    return function(node, allowNegative) {
        if (!node || node === window) {
            return ret(defaultST(), allowNegative);
        }
        else if (node && node.nodeType == 1 &&
            node !== body && node !== html) {
            return ret(node[sProp], allowNegative);
        }
        else {
            return ret(defaultST(), allowNegative);
        }
    }

};