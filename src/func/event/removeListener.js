

module.exports = function(){

    var fn = null,
        prefix = null;

    return function removeListener(el, event, func) {

        if (fn === null) {
            fn = el.detachEvent ? "detachEvent" : "removeEventListener";
            prefix = el.detachEvent ? "on" : "";
        }

        el[fn](prefix + event, func);
    }
}();