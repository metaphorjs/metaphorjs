
var error = require("./error.js"),
    resolveComponent = require("./resolveComponent.js"),
    getAttrSet = require("./dom/getAttrSet.js"),
    removeAttr = require("./dom/removeAttr.js"),
    extend = require("./extend.js"),
    nsGet = require("metaphorjs-namespace/src/func/nsGet.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js");

module.exports = function initApp(node, cls, data, autorun) {


    var attrs = getAttrSet(node, function(name) {
        return !!nsGet("directive.attr." + name, true);
    });

    var cfg = attrs.directive.app ? attrs.directive.app.config : {},
        i, l;

    if (attrs.subnames['app']) {
        for (i = 0, l = attrs.subnames['app'].length; i < l; i++) {
            removeAttr(node, attrs.subnames[i]);
        }
    }

    try {
        var p = resolveComponent(cls || "MetaphorJs.App", extend({}, cfg), data, node, [node, data]);

        if (autorun !== false) {
            return p.done(function(app){
                app.run();
            });
        }
        else {
            return p;
        }
    }
    catch (thrownError) {
        error(thrownError);
        return Promise.reject(thrownError);
    }
};