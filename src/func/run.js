
var onReady = require("../func/dom/onReady.js"),
    initApp = require("../func/initApp.js"),
    select  = require("../../../metaphorjs-select/src/metaphorjs.select.js"),
    getAttr = require("../func/dom/getAttr.js");

module.exports = function() {

    onReady(function() {

        var appNodes    = select("[mjs-app]"),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i];
            initApp(el, getAttr(el, "mjs-app"), null, true);
        }
    });

};