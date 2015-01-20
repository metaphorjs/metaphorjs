

module.exports = function(){

    var fn = null,
        prefix = null;

    return function removeListener(el, event, func) {

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