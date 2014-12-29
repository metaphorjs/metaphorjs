
var addListener = require("./event/addListener.js"),
    Promise = require("../../../metaphorjs-promise/src/lib/Promise.js");


module.exports = function() {

    var cache = {},
        loading = {},
        cacheCnt = 0;


    var preloadImage = function preloadImage(src) {

        if (cache[src]) {
            return Promise.resolve(src);
        }

        if (loading[src]) {
            return loading[src];
        }

        if (cacheCnt > 1000) {
            cache = {};
            cacheCnt = 0;
        }

        var doc = window.document,
            img = doc.createElement("img"),
            style = img.style,
            deferred = new Promise;

        loading[src] = deferred;

        deferred.always(function(){
            delete loading[src];
        });

        addListener(img, "load", function() {
            cache[src] = true;
            cacheCnt++;
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            if (deferred) {
                deferred.resolve(src);
            }
            img = null;
            style = null;
            deferred = null;
        });

        deferred.abort = function() {
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            if (deferred) {
                deferred.reject();
            }
            img = null;
            style = null;
            deferred = null;
        };

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        img.src = src;
        doc.body.appendChild(img);

        return deferred;
    };

    preloadImage.check = function(src) {
        if (cache[src]) {
            return true;
        }
        return loading[src] || false;
    };

    return preloadImage;

}();