
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    preloadImage = require("../func/preloadImage.js");

nsAdd("filter.preloaded", function(val, scope) {

    var promise = preloadImage(val);

    if (promise.isFulfilled()) {
        return true;
    }
    else {
        promise.done(function(){
            scope.$check();
        });
        return false;
    }

});