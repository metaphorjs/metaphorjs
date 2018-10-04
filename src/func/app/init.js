
require("./__init.js");
require("./resolve.js");
require("../dom/getAttrSet.js");
require("../dom/removeAttr.js");
require("metaphorjs-promise/src/lib/Promise.js");

var error = require("metaphorjs-shared/src/func/error.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.init = function app_init(node, cls, data, autorun) {

    var attrDirs = MetaphorJs.directive.attr;

    var attrs = MetaphorJs.dom.getAttrSet(node, function(name) {
        return !!attrDirs[name];
    });

    var cfg = attrs.directive.app ? attrs.directive.app.config : {},
        i, l;

    if (attrs.subnames['app']) {
        for (i = 0, l = attrs.subnames['app'].length; i < l; i++) {
            MetaphorJs.dom.removeAttr(node, attrs.subnames[i]);
        }
    }

    try {
        var p = MetaphorJs.app.resolve(
                    cls || "MetaphorJs.App", 
                    extend({}, cfg), 
                    data, 
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