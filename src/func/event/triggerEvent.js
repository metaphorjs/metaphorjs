
module.exports = function(el, event) {

    var isStr   = typeof event == "string",
        type    = isStr ? event : event.type;

    if (el.fireEvent) {
        return el.fireEvent("on" + type);
    }
    else {
        event = isStr ? new Event(event) : event;
        return el.dispatchEvent(event);
    }

};