
var error = require("./error.js"),
    resolveComponent = require("./resolveComponent.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js");

module.exports = function(node, cls, data, autorun) {

    node.removeAttribute("mjs-app");

    try {
        var p = resolveComponent(cls || "MetaphorJs.cmp.App", false, data, node, [node, data]);

        if (autorun) {
            return p.then(function(app){
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