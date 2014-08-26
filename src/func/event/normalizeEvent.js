//#require ../../lib/NormalizedEvent.js

var normalizeEvent = MetaphorJs.normalizeEvent = function(){

    var NormalizedEvent = MetaphorJs.lib.NormalizedEvent;

    return function(originalEvent) {
        return new NormalizedEvent(originalEvent);
    };
}();
