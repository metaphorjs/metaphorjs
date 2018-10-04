
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Trigger DOM event on element
 * @function MetaphorJs.dom.triggerEvent
 * @param {DomNode} el
 * @param {string} event
 */
module.exports = MetaphorJs.dom.triggerEvent = function dom_triggerEvent(el, event) {

    var isStr   = typeof event === "string",
        type    = isStr ? event : event.type;

    if (el.fireEvent) {
        return el.fireEvent("on" + type);
    }
    else {
        event = isStr ? new Event(event) : event;
        return el.dispatchEvent(event);
    }
};