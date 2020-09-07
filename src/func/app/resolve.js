require("./__init.js");
require("metaphorjs-shared/src/lib/Provider.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("../dom/toFragment.js");
require("../dom/data.js");
require("../dom/addClass.js");
require("../dom/removeClass.js");
require("../../app/Template.js")
require("../../lib/Config.js");

const extend = require("metaphorjs-shared/src/func/extend.js"),
    error = require("metaphorjs-shared/src/func/error.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    isFunction = require("metaphorjs-shared/src/func/isFunction.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.resolve = function app_resolve(cmp, cfg, node, args) {

    cfg         = cfg || {};
    args        = args || [];

    node        = node || cfg.node;
    var scope   = cfg.scope; 
    var config  = cfg.config || null;

    cfg.config  = config;
    cfg.scope   = cfg.scope || scope;
    cfg.node    = cfg.node || node;

    if (args.length === 0) {
        args.push(cfg);
    }

    if (config) {
        if (!(config instanceof MetaphorJs.lib.Config)) {
            config = new MetaphorJs.lib.Config(config, {
                scope: scope
            }, /*scalarAs: */"defaultValue");
        }
    }

    var constr      = isString(cmp) ? ns.get(cmp) : cmp;
    if (!constr) {
        throw new Error("Component " + cmp + " not found");
    }

    var i,
        defers      = [],
        app         = scope ? scope.$app : null,
        gProvider   = MetaphorJs.lib.Provider.global(),
        injectFn    = app ? app.inject : gProvider.inject,
        injectCt    = app ? app : gProvider,
        cloak       = config && config.has("cloak") ? config.get("cloak") : null,
        inject      = {
            $node: node || null,
            $scope: scope || null,
            $config: config || null,
            $args: args || null
        };

    if (constr.resolve) {

        for (i in constr.resolve) {
            (function(name){
                var d = new MetaphorJs.lib.Promise,
                    fn;

                defers.push(d.done(function(value){
                    inject[name] = value;
                    cfg[name] = value;
                    args.push(value);
                }));

                fn = constr.resolve[i];

                if (isFunction(fn)) {
                    d.resolve(fn(scope, node, config));
                }
                else {
                    d.resolve(
                        injectFn.call(
                            injectCt, fn, null, extend({}, inject, cfg, false, false)
                        )
                    );
                }

                d.fail(function(reason){
                    if (reason instanceof Error) {
                        error(reason);
                    }
                });

            }(i));
        }
    }

    var p;

    if (defers.length) {
        p = new MetaphorJs.lib.Promise;
        MetaphorJs.lib.Promise.all(defers)
            .done(function(values){
                p.resolve(
                    injectFn.call(
                        injectCt, constr, null, extend({}, inject, cfg, false, false), args
                    )
                );
            })
            .fail(p.reject, p);
    }
    else {
        p = MetaphorJs.lib.Promise.resolve(
            injectFn.call(
                injectCt, constr, null, extend({}, inject, cfg, false, false), args
            )
        );
    }

    if (node && p.isPending() && cloak !== null) {
        cloak !== true ? MetaphorJs.dom.addClass(node, cloak) : node.style.visibility = "hidden";
        p.then(function() {
            cloak !== true ? MetaphorJs.dom.removeClass(node, cloak) : node.style.visibility = "";
        });
    }

    if (node) {
        p.then(function(){
            MetaphorJs.dom.removeClass(node, "mjs-cloak");
        });
    }

    return p;
};

