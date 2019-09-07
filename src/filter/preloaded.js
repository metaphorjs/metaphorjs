
require("./__init.js");
require("../func/dom/preloadImage.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js");

(function(){

    /**
     * @filter preloaded
     * Will return true once image is loaded. It will trigger scope check 
     * automatically once the image is loaded.
     * @param {string} input Image url
     * @returns {boolean} 
     */
    var preloaded = MetaphorJs.filter.preloaded = function(val, scope) {

        if (!val) {
            return false;
        }

        var promise = MetaphorJs.dom.preloadImage.check(val);

        if (promise === true || !promise) {
            return !!promise;
        }

        if (isThenable(promise)) {
            promise.always(function(){
                scope.$check();
            });
            return false;
        }
        else {
            return true;
        }
    };

    preloaded.$undeterministic = true;

    return preloaded;
}());