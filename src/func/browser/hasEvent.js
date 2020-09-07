
require("./__init.js");
require("./isIE.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Check if current browser supports event
 * @function MetaphorJs.browser.hasEvent
 * @param {string} event
 * @return {boolean}
 */
module.exports = MetaphorJs.browser.hasEvent = function(){

    var eventSupport = {},
        divElm;

    return function browser_hasEvent(event) {
        // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
        // it. In particular the event is not fired when backspace or delete key are pressed or
        // when cut operation is performed.

        if (eventSupport[event] === undefined) {

            if (event === 'input' && MetaphorJs.browser.isIE() == 9) {
                return eventSupport[event] = false;
            }
            if (!divElm) {
                divElm = window.document.createElement('div');
            }

            eventSupport[event] = !!('on' + event in divElm);
        }

        return eventSupport[event];
    };
}();