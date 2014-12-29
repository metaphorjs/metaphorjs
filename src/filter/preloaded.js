
var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js"),
    preloadImage = require("../func/preloadImage.js");

module.exports = nsAdd("filter.preloaded", function(val, scope) {

    if (!val) {
        return false;
    }

    var promise = preloadImage.check(val);

    if (promise === true || promise === false) {
        return promise;
    }

    if (promise.isFulfilled()) {
        return true;
    }
    else {
        promise.always(function(){
            scope.$check();
        });
        return false;
    }

});