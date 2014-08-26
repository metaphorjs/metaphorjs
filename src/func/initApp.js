//#require resolveComponent.js
//#require error.js
//#require ../vars/Promise.js

var initApp = MetaphorJs.initApp = function(node, cls, data) {

    node.removeAttribute("mjs-app");

    try {
        return resolveComponent(cls || "MetaphorJs.cmp.App", false, data, node, [node, data]);
    }
    catch (thrownError) {
        error(thrownError);
        return Promise.reject(thrownError);
    }
};