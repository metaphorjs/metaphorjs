
var addListener = require("./event/addListener.js"),
    Promise = require("../../../metaphorjs-promise/src/lib/Promise.js");


module.exports = function() {

    var cache = {},
        cacheCnt = 0;


    return function preloadImage(src) {

        if (cache[src]) {
            return Promise.resolve(src);
        }

        if (cacheCnt > 1000) {
            cache = {};
            cacheCnt = 0;
        }

        var doc = window.document,
            img = doc.createElement("img"),
            style = img.style,
            deferred = new Promise;

        addListener(img, "load", function() {
            cache[src] = true;
            cacheCnt++;
            doc.body.removeChild(img);
            deferred.resolve(src);
        });

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        img.src = src;
        doc.body.appendChild(img);

        return deferred;
    };

}();