
require("./__init.js");
require("metaphorjs-shared/src/lib/Cache.js");
require("metaphorjs-select/src/func/is.js");
require("./addListener.js");
require("./normalizeEvent.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js")

/**
 * Delegate dom event
 * @function MetaphorJs.dom.delegate
 * @param {DomNode} el Dom node to add event listener to
 * @param {string} selector Event target selector
 * @param {string} event Event name
 * @param {function} fn {
 *  Event handler
 *  @param {object} event
 * }
 */
module.exports = MetaphorJs.dom.delegate = function dom_delegate(el, selector, event, fn) {

    var delegates = MetaphorJs.lib.Cache.global().get("dom/delegates", []);

    var key = selector + "-" + event,
        listener    = function(e) {
            e = MetaphorJs.dom.normalizeEvent(e);
            var trg = e.target;
            while (trg) {
                if (MetaphorJs.dom.is(trg, selector)) {
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

    MetaphorJs.dom.addListener(el, event, listener);
};