

var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    animate = require("metaphorjs-animate/src/func/animate.js"),
    stopAnimation = require("metaphorjs-animate/src/func/stopAnimation.js"),
    mhistory = require("metaphorjs-history/src/lib/History.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    currentUrl = require("metaphorjs-history/src/func/currentUrl.js"),
    parseLocation = require("metaphorjs-history/src/func/parseLocation.js"),
    UrlParam = require("metaphorjs-history/src/lib/UrlParam.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),

    filterLookup = require("../func/filterLookup.js"),
    extend = require("../func/extend.js"),
    data = require("../func/dom/data.js"),
    async = require("../func/async.js"),
    toFragment = require("../func/dom/toFragment.js"),
    resolveComponent = require("../func/resolveComponent.js"),
    isObject = require("../func/isObject.js"),
    isString = require("../func/isString.js"),
    isThenable = require("../func/isThenable.js"),

    nextUid = require("../func/nextUid.js"),

    addClass = require("../func/dom/addClass.js"),
    removeClass = require("../func/dom/removeClass.js");


module.exports = defineClass({

    $class: "View",

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

    $init: function(cfg, attr)  {

        var self    = this;

        extend(self, cfg, true, false);

        if (attr) {
            extend(self, attr.config, true, false);
        }

        self.routeMap = {};

        var node = self.node;

        if (node && node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        if (!self.id) {
            self.id = nextUid();
        }

        self.cmpCache = {};
        self.domCache = {};

        self.initView();

        self.scope.$app.registerCmp(self, self.scope, "id");

        if (self.route) {
            mhistory.init();
            mhistory.on("location-change", self.onLocationChange, self);
            self.initRoutes();
            self.onLocationChange();
        }
        else if (self.cmp) {
            self.watchable = createWatchable(self.scope, self.cmp, self.onCmpChange, self, {filterLookup: filterLookup});
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
                            params[param.name] = new UrlParam(extend({}, param, {enabled: false}, true, false));
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
            cmp     = self.watchable.getLastResult() || self.defaultCmp;

        if (cmp) {
            self.setComponent(cmp);
        }
        else if (self.defaultCmp) {
            self.setComponent(self.defaultCmp);
        }
    },

    onLocationChange: function() {

        var self        = this,
            url         = currentUrl(),
            loc         = parseLocation(url),
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
            removeClass(self.node, self.currentCls);
        }

        if (self.currentHtmlCls) {
            removeClass(window.document.documentElement, self.currentHtmlCls);
        }

        if (self.currentComponent) {

            animate(node, self.animate ? "leave" : null).done(function(){
                
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
            addClass(self.node, route.cls);
        }
        if (route.htmlCls) {
            self.currentHtmlCls = route.htmlCls;
            addClass(window.document.documentElement, route.htmlCls);
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
        stopAnimation(self.node);
        self.clearComponent();

        if (cview.teardown) {
            cview.teardown(cview, route, matches);
        }

        self.setRouteClasses(route);

        self.currentView = route;

        animate(node, self.animate ? "enter" : null, function(){

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

                if (route.cmp) {

                    return resolveComponent(
                        route.cmp || "MetaphorJs.Component",
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
                else if (route.setup) {
                    route.setup(route, matches);
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

        stopAnimation(self.node);
        self.clearComponent();
        self.currentView = null;

        animate(node, self.animate ? "enter" : null, function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;

            return resolveComponent(cls, cfg, scope, node, [cfg]).done(function(newCmp){
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



    destroy: function() {

        var self    = this;

        self.clearComponent();

        if (self.route) {
            mhistory.un("location-change", self.onLocationChange, self);

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
            self.watchable.unsubscribeAndDestroy(self.onCmpChange, self);
            self.watchable = null;
        }

        self.scope = null;
        self.currentComponent = null;

        self.$super();
    }
});


