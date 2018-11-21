require("../lib/History.js");
require("../lib/UrlParam.js");
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-animate/src/animate/stop.js");
require("metaphorjs-shared/src/func/browser/parseLocation.js");
require("../func/dom/data.js");
require("../func/dom/toFragment.js");
require("../func/app/resolve.js");
require("../func/dom/addClass.js")
require("../func/dom/removeClass.js")
require("../lib/MutationObserver.js");

var cls = require("metaphorjs-class/src/cls.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    isObject = require("metaphorjs-shared/src/func/isObject.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.Router = cls({

    /**
     * [
     *  {
     *      reg: /.../,
     *      cmp: 'Cmp.Name',
     *      params: [name, name...], // param index in array is the same as reg match number - 1
     *      template: '',
     *      isolateScope: bool
     *  }
     * ]
     */
    route: null,
    node: null,
    scope: null,
    cmp: null,
    id: null,

    currentViewId: null,
    currentComponent: null,
    cmpCache: null,
    domCache: null,
    currentView: null,

    routeMap: null,

    watchable: null,
    defaultCmp: null,

    currentCls: null,
    currentHtmlCls: null,

    scrollOnChange: true,
    animate: false,

    $init: function(cfg)  {

        var self    = this;

        extend(self, cfg, true, false);
 
        self.routeMap = {};

        var node = self.node;

        if (node && node.firstChild) {
            MetaphorJs.dom.data(node, "mjs-transclude", MetaphorJs.dom.toFragment(node.childNodes));
        }

        if (!self.id) {
            self.id = nextUid();
        }

        self.cmpCache = {};
        self.domCache = {};

        self.initView();
        self.scope.$app.registerCmp(self, self.scope, "id");        

        if (self.route) {
            MetaphorJs.lib.History.init();
            MetaphorJs.lib.History.on("location-change", self.onLocationChange, self);
            self.initRoutes();
            self.onLocationChange();
        }
        else if (self.cmp) {
            self.watchable = MetaphorJs.lib.MutationObserver.get(
                self.scope, self.cmp, self.onCmpChange, self);
            self.onCmpChange();
        }
    },

    initView: function() {

    },

    initRoutes: function() {

        var self = this,
            routes = self.route,
            params,
            param,
            route,
            i, l,
            j, z;

        if (routes) {
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
        }
    },





    onCmpChange: function() {

        var self    = this,
            cmp     = self.watchable.getValue() || self.defaultCmp;

        if (cmp) {
            self.setComponent(cmp);
        }
        else if (self.defaultCmp) {
            self.setComponent(self.defaultCmp);
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

        if (routes) {
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
        else if (self.defaultCmp) {
            self.setComponent(self.defaultCmp);
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


    onNoMatchFound: function() {



    },





    clearComponent: function() {
        var self    = this,
            node    = self.node,
            cview   = self.currentView || {};

        if (self.currentCls) {
            MetaphorJs.dom.removeClass(self.node, self.currentCls);
        }

        if (self.currentHtmlCls) {
            MetaphorJs.dom.removeClass(window.document.documentElement, self.currentHtmlCls);
        }

        if (self.currentComponent) {

            MetaphorJs.animate.animate(node, self.animate ? "leave" : null).done(function(){
                
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
                    self.currentComponent.freezeByView(self);
                    //self.currentComponent.trigger("view-hide", self, self.currentComponent);
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

    onCmpTtl: function(route) {

        var self = this,
            id = route.id;
        route.ttlTmt = null;

        if (self.cmpCache[id]) {
            self.cmpCache[id].$destroy();
            delete self.cmpCache[id];
            delete self.domCache[id];
        }
    },




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

    onRouteFail: function(route) {

    },

    setRouteComponent: function(route, matches) {

        var self    = this,
            node    = self.node,
            params  = route.params,
            cview   = self.currentView || {};

        if (route.id == cview.id) {
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

        MetaphorJs.animate.animate(node, self.animate ? "enter" : null, function(){

            var args    = matches || [],
                cfg     = {
                    destroyEl: false,
                    node: node,
                    destroyScope: true,
                    scope: route.$isolateScope ?
                           self.scope.$newIsolated() :
                           self.scope.$new()
                };

            if (route.as) {
                cfg.as = route.as;
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
                self.currentComponent.unfreezeByView(self);
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

                        if (route.onFail) {
                            route.onFail.call(self);
                        }
                        else {
                            self.onRouteFail(route);
                        }
                    });
                }
            }
        });
    },


    onCmpDestroy: function(cmp) {

        var self = this,
            routeId = cmp[self.id];

        if (routeId && self.cmpCache[routeId]) {
            delete self.cmpCache[routeId];
            delete self.domCache[routeId];
        }
    },



    setComponent: function(cmp) {

        var self    = this,
            node    = self.node;

        self.beforeCmpChange(cmp);

        MetaphorJs.animate.stop(self.node);
        self.clearComponent();
        self.currentView = null;

        MetaphorJs.animate.animate(node, self.animate ? "enter" : null, function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.app.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;

            return MetaphorJs.app.resolve(cls, cfg, scope, node, [cfg]).done(function(newCmp){
                self.currentComponent = newCmp;
                self.afterCmpChange();
            });

        });
    },



    beforeRouteCmpChange: function(route) {

    },

    afterRouteCmpChange: function() {

    },

    beforeCmpChange: function(cmpCls) {

    },

    afterCmpChange: function() {
        var self = this;
        if (self.scrollOnChange) {
            raf(function () {
                self.node.scrollTop = 0;
            });
        }
    },



    onDestroy: function() {

        var self    = this;

        self.clearComponent();

        if (self.route) {
            MetaphorJs.lib.History.un("location-change", self.onLocationChange, self);

            var i, l, j;

            for (i = 0, l = self.route.length; i < l; i++) {
                if (self.route[i].params) {
                    for (j in self.route[i].params) {
                        self.route[i].params[j].$destroy();
                    }
                }
            }

            self.route = null;
        }

        if (self.watchable) {
            self.watchable.unsubscribe(self.onCmpChange, self);
            self.watchable.$destroy(true);
            self.watchable = null;
        }

        if (self.node) {
            MetaphorJs.dom.data(self.node, "mjs-transclude", null, "remove");
        }

        self.scope = null;
        self.currentComponent = null;

        self.$super();
    }
});


