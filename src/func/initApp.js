
var error = require("./error.js"),
    resolveComponent = require("./resolveComponent.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js");

module.exports = function(node, cls, data) {

    node.removeAttribute("mjs-app");

    try {
        return resolveComponent(cls || "MetaphorJs.cmp.App", false, data, node, [node, data]);
    }
    catch (thrownError) {
        error(thrownError);
        return Promise.reject(thrownError);
    }
};