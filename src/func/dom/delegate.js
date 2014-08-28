
var normalizeEvent = require("../event/normalizeEvent.js"),
    is = require("./is.js"),
    delegates = require("../../var/delegates.js"),
    addListener = require("../event/addListener.js");


module.exports = function(el, selector, event, fn) {

    var key = selector + "-" + event,
        listener    = function(e) {
            e = normalizeEvent(e);
            if (is(e.target, selector)) {
                return fn(e);
            }
            return null;
        };

    if (!delegates[key]) {
        delegates[key] = [];
    }

    delegates[key].push({el: el, ls: listener, fn: fn});

    addListener(el, event, listener);
};