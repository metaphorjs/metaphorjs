
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    preloadImage = require("../func/preloadImage.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js");

(function(){

    var preloaded = MetaphorJs.filter.preloaded = function(val, scope) {

        if (!val) {
            return false;
        }

        var promise = preloadImage.check(val);

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