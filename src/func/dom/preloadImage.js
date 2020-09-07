
require("./__init.js");
require("./addListener.js");
require("metaphorjs-promise/src/lib/Promise.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.preloadImage = function() {

    var cache = {},
        loading = {},
        cacheCnt = 0;

    function dom_preloadImage(src) {

        if (cache[src] !== undefined) {
            if (cache[src] === false) {
                return MetaphorJs.lib.Promise.reject(src);
            }
            else {
                return MetaphorJs.lib.Promise.resolve(cache[src]);
            }
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
            deferred = new MetaphorJs.lib.Promise;

        loading[src] = deferred;

        deferred.always(function(){
            delete loading[src];
        });

        MetaphorJs.dom.addListener(img, "load", function() {
            if (!cache[src]) {
                cache[src] = {
                    src:    src,
                    width:  img ? img.width : null,
                    height: img ? img.height : null
                };
                cacheCnt++;
            }
            if (deferred) {
                deferred.resolve(cache[src]);
            }
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            img = null;
            style = null;
            deferred = null;
        });

        MetaphorJs.dom.addListener(img, "error", function() {
            cache[src] = false;
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            if (deferred) {
                deferred.reject(src);
            }
        });

        deferred.abort = function() {
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            if (deferred) {
                deferred.reject(src);
            }
            img = null;
            style = null;
            deferred = null;
        };

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        doc.body.appendChild(img);
        img.src = src;

        return deferred;
    };

    dom_preloadImage.check = function(src) {
        if (cache[src] !== undefined) {
            return cache[src];
        }
        return loading[src] || null;
    };

    return dom_preloadImage;

}();