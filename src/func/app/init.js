
require("./__init.js");
require("./resolve.js");
require("../dom/getAttrSet.js");
require("../dom/removeAttr.js");
require("metaphorjs-promise/src/lib/Promise.js");

const error = require("metaphorjs-shared/src/func/error.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.init = function app_init(node, cls, data, autorun) {

    var attrs = MetaphorJs.dom.getAttrSet(node);
    var cfg = attrs.directives.app || {};
    attrs.__remove("directive", node, "app")

    try {
        var p = MetaphorJs.app.resolve(
                    cls || "MetaphorJs.app.App", 
                    extend({ state: data }, cfg), 
                    node, 
                    [node, data]
                );

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
        return MetaphorJs.lib.Promise.reject(thrownError);
    }
};