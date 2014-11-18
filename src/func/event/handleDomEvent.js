
var addListener = require("./addListener.js"),
    trim = require("../trim.js"),
    undf = require("../../var/undf.js"),
    normalizeEvent = require("./normalizeEvent.js");

module.exports = function(node, scope, cfg){

    var handler,
        keyCode,
        preventDefault = true,
        returnValue = false,
        stopPropagation = false,
        events = cfg.event,
        i, l;

    if (typeof events == "string") {
        events = events.split(",");
    }

    handler = cfg.handler;
    cfg.preventDefault !== undf && (preventDefault = cfg.preventDefault);
    cfg.stopPropagation !== undf && (stopPropagation = cfg.stopPropagation);
    cfg.returnValue !== undf && (returnValue = cfg.returnValue);
    cfg.keyCode !== undf && (keyCode = cfg.keyCode);

    var fn = function(e){

        e = normalizeEvent(e || window.event);

        if (keyCode) {
            if (typeof keyCode == "number" && keyCode != e.keyCode) {
                return null;
            }
            else if (keyCode.indexOf(e.keyCode) == -1) {
                return null;
            }
        }

        scope.$event = e;

        if (handler) {
            handler(scope);
        }

        scope.$event = null;

        scope.$root.$check();

        stopPropagation && e.stopPropagation();
        preventDefault && e.preventDefault();

        return returnValue;
    };

    for (i = 0, l = events.length; i < l; i++) {
        addListener(node, trim(events[i]), fn);
    }

    return fn;
};