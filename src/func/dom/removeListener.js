require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Remove listeners from element's events
 * @function MetaphorJs.dom.removeListener
 * @param {HTMLElement} el 
 * @param {string} eventName
 * @param {function} fn
 */
module.exports = MetaphorJs.dom.removeListener = function(){

    var fn = null,
        prefix = null;

    return function dom_removeListener(el, event, func) {

        if (fn === null) {
            if (el.removeEventListener) {
                fn = "removeEventListener";
                prefix = "";
            }
            else {
                fn = "detachEvent";
                prefix = "on";
            }
            //fn = el.detachEvent ? "detachEvent" : "removeEventListener";
            //prefix = el.detachEvent ? "on" : "";
        }

        el[fn](prefix + event, func);
    }
}();