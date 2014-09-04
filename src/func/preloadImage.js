
var addListener = require("./event/addListener.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js");


module.exports = function() {

    var cache = {},
        cacheCnt = 0;


    return function(src) {

        if (cache[src]) {
            return Promise.resolve(src);
        }

        if (cacheCnt > 1000) {
            cache = {};
            cacheCnt = 0;
        }

        var img = document.createElement("img"),
            style = img.style,
            deferred = new Promise;

        addListener(img, "load", function() {
            cache[src] = true;
            cacheCnt++;
            document.body.removeChild(img);
            deferred.resolve(src);
        });

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        img.src = src;
        document.body.appendChild(img);

        return deferred;
    };

}();