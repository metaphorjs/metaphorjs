require("../__init.js");
require("../../lib/History.js");
require("../../lib/UrlParam.js");
require("../../lib/Config.js");
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-animate/src/animate/stop.js");
require("metaphorjs-shared/src/func/browser/parseLocation.js");
require("../../func/dom/data.js");
require("../../func/dom/toFragment.js");
require("../../func/app/resolve.js");
require("../../func/dom/addClass.js")
require("../../func/dom/removeClass.js")
require("../../lib/MutationObserver.js");
require("./Base.js");

var extend = require("metaphorjs-shared/src/func/extend.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.view.Router = MetaphorJs.app.view.Base.$extend({

    initView: function() {

        var self = this;

        self.routeMap = {};
        self.cmpCache = {};
        self.domCache = {};
        self.route = self.route || [];

        MetaphorJs.lib.History.init();
        MetaphorJs.lib.History.on("location-change", self.onLocationChange, self);
        self.initRoutes();
        self.onLocationChange();
    },

    initRoutes: function() {

        var self = this,
            routes = self.route,
            params,
            param,
            route,
            i, l,
            j, z;

        for (i = 0, l = routes.length; i < l; i++) {
            route = routes[i];
            route.id = route.id || nextUid();

            if (route.params) {
                params = {};
                for (j = 0, z = route.params.length; j < z; j++) {
                    param = route.params[j];
                    if (param.name) {
                        params[param.name] = new MetaphorJs.lib.UrlParam(
                            extend({}, param, {enabled: false}, true, false)
                        );
                    }
                }
                route.params = params;
            }

            self.routeMap[route.id] = route;
        }
    },


    onLocationChange: function() {

        var self        = this,
            url         = MetaphorJs.lib.History.current(),
            loc         = MetaphorJs.browser.parseLocation(url),
            path        = loc.pathname + loc.search + loc.hash,
            routes      = self.route,
            def,
            i, len,
            r, matches;

        for (i = 0, len = routes.length; i < len; i++) {
            r = routes[i];

            if (r.regexp && (matches = loc.pathname.match(r.regexp))) {
                self.resolveRoute(r, matches);
                return;
            }
            else if (r.regexpFull && (matches = path.match(r.regexp))) {
                self.resolveRoute(r, matches);
                return;
            }
            if (r['default'] && !def) {
                def = r;
            }
        }
    
        var tmp = self.onNoMatchFound(loc);

        if (tmp) {
            if (isThenable(tmp)) {
                tmp.done(self.resolveRoute, self);
                tmp.fail(function(){
                    self.finishOnLocationChange(def);
                });
            }
            else {
                self.resolveRoute(tmp);
            }
        }
        else {
            self.finishOnLocationChange(def);
        }
    },

    finishOnLocationChange: function(def) {
        var self = this;
        if (def) {
            self.resolveRoute(def);
        }
        else if (self.config.hasExpression("defaultCmp")) {
            self.setComponent(self.config.get("defaultCmp"));
        }
    },

    resolveRoute: function(route, matches) {

        var self = this;

        matches = matches || [];

        if (route.resolve) {
            var promise = route.resolve.call(self, route, matches);
            if (isThenable(promise)) {
                promise.done(function(){
                    self.setRouteComponent(route, matches);
                });
            }
            else if (promise) {
                self.setRouteComponent(route, matches);
            }
        }
        else {
            self.setRouteComponent(route, matches);
        }

    },


    onNoMatchFound: function() {},

    toggleRouteParams: function(route, fn) {
        if (route.params) {
            for (var i in route.params) {
                route.params[i][fn]();
            }
        }
    },

    setRouteClasses: function(route) {
        var self    = this;

        if (route.cls) {
            self.currentCls = route.cls;
            MetaphorJs.dom.addClass(self.node, route.cls);
        }
        if (route.htmlCls) {
            self.currentHtmlCls = route.htmlCls;
            MetaphorJs.dom.addClass(window.document.documentElement, route.htmlCls);
        }
    },

    onRouteFail: function(route) {},

    setRouteComponent: function(route, matches) {

        var self    = this,
            node    = self.node,
            params  = route.params,
            cview   = self.currentView || {};

        if (route.id === cview.id) {
            if (self.currentComponent && self.currentComponent.onViewRepeat) {
                self.currentComponent.onViewRepeat();
            }
            return;
        }

        if (route.ttlTmt) {
            clearTimeout(route.ttlTmt);
        }

        self.beforeRouteCmpChange(route);

        self.toggleRouteParams(cview, "disable");
        self.toggleRouteParams(route, "enable");
        MetaphorJs.animate.stop(self.node);
        self.clearComponent();

        if (cview.teardown) {
            cview.teardown(cview, route, matches);
        }

        self.setRouteClasses(route);

        self.currentView = route;

        MetaphorJs.animate.animate(node, self.config.get("animate") ? "enter" : null, function(){

            var args    = matches || [],
                cfg     = {
                    destroyEl: false,
                    node: node,
                    destroyScope: true,
                    scope: route.$isolateScope ?
                           self.scope.$newIsolated() :
                           self.scope.$new()
                };

            if (route.config) {
                cfg.config = route.config;
            }
            if (route.template) {
                cfg.template = route.template;
            }

            args.shift();

            if (params) {
                extend(cfg, params, false, false);
            }

            args.unshift(cfg);

            if (self.cmpCache[route.id]) {
                self.currentComponent = self.cmpCache[route.id];
                node.appendChild(self.domCache[route.id]);
                self.currentComponent.unfreeze(self);
                self.afterRouteCmpChange();
                self.afterCmpChange();
            }
            else {

                if (route.setup) {
                    route.setup(route, matches);
                }
                else {

                    return MetaphorJs.app.resolve(
                        route.cmp || "MetaphorJs.app.Component",
                        cfg,
                        cfg.scope,
                        node,
                        args
                    )
                    .done(function (newCmp) {

                        self.currentComponent = newCmp;

                        if (route.keepAlive) {
                            newCmp[self.id] = route.id;
                            self.cmpCache[route.id] = newCmp;
                            self.domCache[route.id] = window.document.createDocumentFragment();
                            newCmp.on("destroy", self.onCmpDestroy, self);
                        }

                        self.afterRouteCmpChange();
                        self.afterCmpChange();
                    })
                    .fail(function(){
                        self.onRouteFail(route);
                    });
                }
            }
        });
    },



    clearComponent: function() {
        var self    = this,
            node    = self.node,
            cview   = self.currentView || {};

        if (self.currentCls) {
            MetaphorJs.dom.removeClass(self.node, self.currentCls);
        }

        self.currentView = null;

        if (self.currentHtmlCls) {
            MetaphorJs.dom.removeClass(window.document.documentElement, self.currentHtmlCls);
        }

        if (self.currentComponent) {

            MetaphorJs.animate.animate(node, self.config.get("animate") ? "leave" : null).done(function(){
                
                if (!cview.keepAlive) {

                    if (self.currentComponent &&
                        !self.currentComponent.$destroyed &&
                        !self.currentComponent.$destroying) {
                        self.currentComponent.$destroy();
                    }

                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                }
                else {
                    self.currentComponent.freeze(self);
                    var frg = self.domCache[cview.id];
                    while (node.firstChild) {
                        frg.appendChild(node.firstChild);
                    }
                    if (cview.ttl) {
                        cview.ttlTmt = async(self.onCmpTtl, self, [cview], cview.ttl);
                    }
                }

                self.currentComponent = null;
            });
        }
    },


    onCmpTtl: function(currentView) {

        var self = this,
            id = currentView.id;
        route.ttlTmt = null;

        if (self.cmpCache[id]) {
            self.cmpCache[id].$destroy();
            delete self.cmpCache[id];
            delete self.domCache[id];
        }
    },

    onCmpDestroy: function(cmp) {

        var self = this,
            id = cmp[self.id];

        if (id && self.cmpCache[id]) {
            delete self.cmpCache[id];
            delete self.domCache[id];
        }
    },


    beforeRouteCmpChange: function(route) {},
    afterRouteCmpChange: function() {},



    onDestroy: function() {

        var self    = this,
            i, l, j

        MetaphorJs.lib.History.un("location-change", self.onLocationChange, self);

        for (i = 0, l = self.route.length; i < l; i++) {
            if (self.route[i].params) {
                for (j in self.route[i].params) {
                    self.route[i].params[j].$destroy();
                }
            }
        }

        self.route = null;
        self.$super();
    }
});


