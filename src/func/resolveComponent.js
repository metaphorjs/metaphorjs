//#require dom/toFragment.js
//#require dom/data.js
//#require dom/addClass.js
//#require dom/removeClass.js
//#require nsGet.js
//#require ../vars/Template.js
//#require ../vars/Promise.js
//#require ../vars/Provider.js

var resolveComponent = MetaphorJs.resolveComponent = function(cmp, cfg, scope, node, args) {

    var hasCfg  = cfg !== false;

    cfg         = cfg || {};
    args        = args || [];

    scope       = scope || cfg.scope; // || new Scope;
    node        = node || cfg.node;

    cfg.scope   = cfg.scope || scope;
    cfg.node    = cfg.node || node;

    var constr      = typeof cmp == "string" ? nsGet(cmp) : cmp;

    if (!constr) {
        throw "Component " + cmp + " not found";
    }

    if (scope && constr.$isolateScope) {
        cfg.scope   = scope = scope.$newIsolated();
    }

    var i,
        defers      = [],
        tpl         = constr.template || cfg.template || null,
        tplUrl      = constr.templateUrl || cfg.templateUrl || null,
        app         = scope ? scope.$app : null,
        gProvider   = Provider.global(),
        injectFn    = app ? app.inject : gProvider.inject,
        injectCt    = app ? app : gProvider,
        cloak       = node ? node.getAttribute("mjs-cloak") : null,
        inject      = {
            $node: node || null,
            $scope: scope || null,
            $config: cfg || null,
            $args: args || null
        };

    if (constr.resolve) {

        for (i in constr.resolve) {
            (function(name){
                var d = new Promise,
                    fn;

                defers.push(d.done(function(value){
                    inject[name] = value;
                    cfg[name] = value;
                    args.push(value);
                }));

                fn = constr.resolve[i];

                if (typeof fn == "function") {
                    d.resolve(fn(scope, node));
                }
                else if (typeof fn == "string") {
                    d.resolve(injectFn.resolve(fn));
                }
                else {
                    d.resolve(injectFn.call(injectCt, fn, null, false, extend({}, inject, cfg, false, false)));
                }

            }(i));
        }
    }

    if (hasCfg && (tpl || tplUrl)) {

        cfg.template = new Template({
            scope: scope,
            node: node,
            deferRendering: true,
            ownRenderer: true,
            tpl: tpl,
            url: tplUrl
        });

        defers.push(cfg.template.initPromise);

        if (node && node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }
    }

    hasCfg && args.unshift(cfg);

    var p;

    if (defers.length) {
        p = new Promise;

        Promise.all(defers).done(function(){
            p.resolve(injectFn.call(injectCt, constr, null, true, extend({}, inject, cfg, false, false), args));
        });
    }
    else {
        p = Promise.resolve(
            injectFn.call(injectCt, constr, null, true, extend({}, inject, cfg, false, false), args)
        );
    }

    if (node && p.isPending() && cloak !== null) {
        cloak ? addClass(node, cloak) : node.style.visibility = "hidden";
        p.done(function() {
            cloak ? removeClass(node, cloak) : node.style.visibility = "";
        });
    }

    return p;
};

