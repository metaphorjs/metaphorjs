
var onReady = require("../func/dom/onReady.js"),
    initApp = require("../func/initApp.js"),
    select  = require("metaphorjs-select/src/func/select.js"),
    getAttr = require("../func/dom/getAttr.js");

module.exports = function run(w, appData) {

    var win = w || window;

    if (!win) {
        throw "Window object neither defined nor provided";
    }

    onReady(function() {

        var appNodes    = select("[mjs-app]", win.document),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i];
            initApp(
                el,
                getAttr(el, "mjs-app"),
                appData,
                true
            );
        }
    }, win);

};