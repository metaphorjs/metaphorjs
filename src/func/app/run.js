
require("./__init.js");
require("./init.js");
require("../dom/onReady.js");
require("../dom/select.js");
require("../dom/getAttr.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Run application
 * @function MetaphorJs.app.run
 * @param {Window} win
 * @param {object} appData
 */
module.exports = MetaphorJs.app.run = function app_run(w, appData) {

    const win = w || window;

    if (!win) {
        throw new Error("Window object neither defined nor provided");
    }

    MetaphorJs.dom.onReady(function() {

        const appNodes = MetaphorJs.dom.select("[mjs-app]", win.document);
        let i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i];
            MetaphorJs.app.init(
                el,
                MetaphorJs.dom.getAttr(el, "mjs-app"),
                appData,
                true
            );
        }
    }, win);

};