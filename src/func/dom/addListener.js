require("./__init.js");

var _mousewheelHandler = require("./_/_mousewheelHandler.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @function MetaphorJs.dom.addListener
 * @param {HTMLElement} el
 * @param {string} eventName
 * @param {function} func {
 *  @param {object} event
 * }
 */
module.exports = MetaphorJs.dom.addListener = function(){

    var fn = null,
        prefix = null;

    return function dom_addListener(el, event, func) {

        if (fn === null) {
            if (el.addEventListener) {
                fn = "addEventListener";
                prefix = "";
            }
            else {
                fn = "attachEvent";
                prefix = "on";
            }
            //fn = el.attachEvent ? "attachEvent" : "addEventListener";
            //prefix = el.attachEvent ? "on" : "";
        }


        if (event === "mousewheel") {
            func = _mousewheelHandler(func);
            var events = _mousewheelHandler.events(),
                i, l;
            for (i = 0, l = events.length; i < l; i++) {
                el[fn](prefix + events[i], func, false);
            }
        }
        else {
            el[fn](prefix + event, func, false);
        }

        return func;
    }

}();