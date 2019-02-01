require("./__init.js");
require("metaphorjs-shared/src/lib/Provider.js");
require("metaphorjs-promise/src/lib/Promise.js");
require("../dom/toFragment.js");
require("../dom/data.js");
require("../dom/addClass.js");
require("../dom/removeClass.js");
require("../../app/Template.js")
require("../../lib/Config.js");

var extend = require("metaphorjs-shared/src/func/extend.js"),
    error = require("metaphorjs-shared/src/func/error.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    isFunction = require("metaphorjs-shared/src/func/isFunction.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.resolve = function app_resolve(cmp, cfg, scope, node, args) {

    cfg         = cfg || {};
    args        = args || [];

    scope       = scope || cfg.scope; // || new Scope;
    node        = node || cfg.node;
    var config  = cfg.config || null;

    cfg.config  = config;
    cfg.scope   = cfg.scope || scope;
    cfg.node    = cfg.node || node;

    if (args.length === 0) {
        args.push(cfg);
    }

    if (config) {

        if (isPlainObject(config)) {
            config = new MetaphorJs.lib.Config(config, {
                scope: scope
            });
        }

        config.setType("cloak", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        config.setType("animate", "bool", MetaphorJs.lib.Config.MODE_STATIC);
    }

    var constr      = isString(cmp) ? ns.get(cmp) : cmp;
    if (!constr) {
        throw new Error("Component " + cmp + " not found");
    }

    var i,
        defers      = [],
        tpl         = constr.template || cfg.template || null,
        app         = scope ? scope.$app : null,
        gProvider   = MetaphorJs.lib.Provider.global(),
        injectFn    = app ? app.inject : gProvider.inject,
        injectCt    = app ? app : gProvider,
        cloak       = config ? config.get("cloak") : null,
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

    if (tpl) {

        var tplConfig = new MetaphorJs.lib.Config(null, {scope: scope});
        MetaphorJs.app.Template.prepareConfig(tplConfig, tpl);
        tplConfig.addProperties({
            deferRendering: true,
            runRenderer: true
        });

        cfg.template = new MetaphorJs.app.Template({
            scope: scope,
            node: node,
            config: tplConfig
        });

        defers.push(cfg.template.childrenPromise);
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

