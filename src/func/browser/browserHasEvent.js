
var isIE = require("./isIE.js"),
    undf = require("../../var/undf.js");

/**
 * @param {String} event
 * @return {boolean}
 */
module.exports = function(){

    var eventSupport = {};

    return function browserHasEvent(event) {
        // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
        // it. In particular the event is not fired when backspace or delete key are pressed or
        // when cut operation is performed.

        if (eventSupport[event] === undf) {

            if (event == 'input' && isIE() == 9) {
                return eventSupport[event] = false;
            }

            var divElm = window.document.createElement('div');
            eventSupport[event] = !!('on' + event in divElm);
        }

        return eventSupport[event];
    };
}();