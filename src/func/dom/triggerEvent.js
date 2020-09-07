
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Trigger DOM event on element
 * @function MetaphorJs.dom.triggerEvent
 * @param {HTMLElement} el
 * @param {string} event
 */
module.exports = MetaphorJs.dom.triggerEvent = function dom_triggerEvent(el, event) {

    var isStr   = typeof event === "string",
        type    = isStr ? event : event.type;

    if (el.fireEvent) {
        return el.fireEvent("on" + type);
    }
    else {
        if (isStr) {
            if (document.createEvent) {
                event = document.createEvent("Event");
                event.initEvent(type, true, true);
            }
            else {
                event = new Event(event);
            }
        }
        
        return el.dispatchEvent(event);
    }
};