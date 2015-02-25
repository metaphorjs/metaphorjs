
var normalizeEvent = require("../event/normalizeEvent.js"),
    is = require("metaphorjs-select/src/func/is.js"),
    delegates = require("../../var/delegates.js"),
    addListener = require("../event/addListener.js");


module.exports = function delegate(el, selector, event, fn) {

    var key = selector + "-" + event,
        listener    = function(e) {
            e = normalizeEvent(e);
            var trg = e.target;
            while (trg) {
                if (is(trg, selector)) {
                    return fn(e);
                }
                trg = trg.parentNode;
            }
            return null;
        };

    if (!delegates[key]) {
        delegates[key] = [];
    }

    delegates[key].push({el: el, ls: listener, fn: fn});

    addListener(el, event, listener);
};