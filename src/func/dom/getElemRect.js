
var getScrollTop = require("./getScrollTop.js"),
    getScrollLeft = require("./getScrollLeft.js");

module.exports = function(el) {

    var rect,
        st = getScrollTop(),
        sl = getScrollLeft(),
        bcr;

    if (el === window) {

        var doc = document.documentElement;

        rect = {
            left: 0,
            right: doc.clientWidth,
            top: st,
            bottom: doc.clientHeight + st,
            width: doc.clientWidth,
            height: doc.clientHeight
        };
    }
    else {
        if (el.getBoundingClientRect) {
            bcr = el.getBoundingClientRect();
            rect = {
                left: bcr.left + sl,
                top: bcr.top + st,
                right: bcr.right + sl,
                bottom: bcr.bottom + st
            };

            rect.width = rect.right - rect.left;
            rect.height = rect.bottom - rect.top;
        }
        else {
            var style = el.style;
            rect = {
                left: (parseInt(style.left, 10) || 0) + sl,
                top: (parseInt(style.top, 10) || 0) + st,
                width: el.offsetWidth,
                height: el.offsetHeight,
                right: 0,
                bottom: 0
            };
        }
    }

    rect.getCenter = function() {
        return this.width / 2;
    };

    rect.getCenterX = function() {
        return this.left + this.width / 2;
    };

    return rect;
};