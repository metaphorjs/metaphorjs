
require("./__init.js");
require("./removeListener.js");
require("./addListener.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Execute callback when window is ready
 * @function MetaphorJs.dom.onReady
 * @param {function} fn {
 *  @param {Window} win
 * }
 * @param {Window} w optional window object
 */
module.exports = MetaphorJs.dom.onReady = function dom_onReady(fn, w) {

    var done    = false,
        top     = true,
        win     = w || window,
        root, doc,

        init    = function(e) {
            if (e.type == 'readystatechange' && doc.readyState != 'complete') {
                return;
            }

            MetaphorJs.dom.removeListener(e.type == 'load' ? win : doc, e.type, init);

            if (!done && (done = true)) {
                fn.call(win, e.type || e);
            }
        },

        poll = function() {
            try {
                root.doScroll('left');
            } 
            catch(thrownError) {
                setTimeout(poll, 50);
                return;
            }

            init('poll');
        };

    doc     = win.document;
    root    = doc.documentElement;

    if (doc.readyState == 'complete') {
        fn.call(win, 'lazy');
    }
    else {
        if (doc.createEventObject && root.doScroll) {
            try {
                top = !win.frameElement;
            } 
            catch(thrownError) {}

            top && poll();
        }
        MetaphorJs.dom.addListener(doc, 'DOMContentLoaded', init);
        MetaphorJs.dom.addListener(doc, 'readystatechange', init);
        MetaphorJs.dom.addListener(win, 'load', init);
    }
};