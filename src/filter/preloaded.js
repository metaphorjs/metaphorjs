
var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js"),
    preloadImage = require("../func/preloadImage.js"),
    isThenable = require("../func/isThenable.js");

module.exports = (function(){

    var preloaded = nsAdd("filter.preloaded", function(val, scope) {

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

    });

    preloaded.$undeterministic = true;

    return preloaded;
}());