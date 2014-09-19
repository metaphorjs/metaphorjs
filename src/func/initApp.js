
var error = require("./error.js"),
    removeAttr = require("./dom/removeAttr.js"),
    resolveComponent = require("./resolveComponent.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js");

module.exports = function initApp(node, cls, data, autorun) {

    removeAttr(node, "mjs-app");

    try {
        var p = resolveComponent(cls || "MetaphorJs.cmp.App", false, data, node, [node, data]);

        if (autorun !== false) {
            return p.done(function(app){
                app.run();
                return app;
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