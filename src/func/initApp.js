
var error = require("./error.js"),
    resolveComponent = require("./resolveComponent.js"),
    Promise = require("../../../metaphorjs-promise/src/lib/Promise.js");

module.exports = function initApp(node, cls, data, autorun) {

    try {
        var p = resolveComponent(cls || "MetaphorJs.App", false, data, node, [node, data]);

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