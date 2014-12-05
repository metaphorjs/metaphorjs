

var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    animate = require("metaphorjs-animate/src/metaphorjs.animate.js"),
    stopAnimation = require("metaphorjs-animate/src/func/stopAnimation.js"),
    mhistory = require("metaphorjs-history/src/metaphorjs.history.js"),
    createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    currentUrl = require("metaphorjs-history/src/func/currentUrl.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),

    extend = require("../func/extend.js"),
    data = require("../func/dom/data.js"),
    toFragment = require("../func/dom/toFragment.js"),
    resolveComponent = require("../func/resolveComponent.js"),
    isObject = require("../func/isObject.js"),
    isString = require("../func/isString.js"),

    nextUid = require("../func/nextUid.js"),

    getNodeConfig = require("../func/dom/getNodeConfig.js"),
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

    watchable: null,
    defaultCmp: null,

    currentCls: null,
    currentHtmlCls: null,

    $init: function(cfg)  {

        var self    = this;

        extend(self, cfg, true, false);

        var node = self.node,
            viewCfg = getNodeConfig(node, self.scope);

        extend(self, viewCfg, true, false);

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
            mhistory.on("locationChange", self.onLocationChange, self);
            self.initRouteIds();
            self.onLocationChange();
        }
        else if (self.cmp) {
            self.watchable = createWatchable(self.scope, self.cmp, self.onCmpChange, self, null, ns);
            self.onCmpChange();
        }
    },

    initView: function() {

    },

    initRouteIds: function() {

        var self = this,
            routes = self.route,
            i, l;

        for (i = 0, l = routes.length; i < l; i++) {
            routes[i].id = routes[i].id || nextUid();
        }
    },

    onCmpChange: function() {

        var self    = this,
            cmp     = self.watchable.getLastResult() || self.defaultCmp;

        self.clearComponent();

        if (cmp) {
            self.setComponent(cmp);
        }
    },

    onLocationChange: function() {

        var self    = this,
            url     = currentUrl(),
            routes  = self.route,
            cview   = self.currentView || {},
            def,
            i, len,
            r, matches;

        for (i = 0, len = routes.length; i < len; i++) {
            r = routes[i];

            if (r.reg && (matches = url.match(r.reg))) {
                self.changeRouteComponent(r, matches);
                return;
            }
            if (r['default'] && !def) {
                def = r;
            }
        }

        if (def) {
            if (def.id == cview.id) {
                return;
            }
            self.clearComponent();
            self.setRouteClasses(def);
            self.setRouteComponent(def, []);
        }
        else if (self.defaultCmp) {
            self.clearComponent();
            self.currentView = null;
            self.setComponent(self.defaultCmp);
        }
    },

    changeRouteComponent: function(route, matches) {
        var self = this,
            cview = self.currentView || {};

        if (route.id == cview.id) {
            return;
        }

        stopAnimation(self.node);
        self.clearComponent();
        self.setRouteClasses(route);
        self.setRouteComponent(route, matches);
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

            animate(node, "leave", null, true).done(function(){

                if (!cview.keepAlive) {
                    self.currentComponent.destroy();
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                }
                else {
                    var frg = self.domCache[cview.id];
                    while (node.firstChild) {
                        frg.appendChild(node.firstChild);
                    }
                }

                self.currentComponent = null;
            });
        }

    },

    setRouteComponent: function(route, matches) {

        var self    = this,
            node    = self.node,
            params  = route.params;

        self.currentView = route;

        animate(node, "enter", function(){

            var args    = matches || [],
                cfg     = {
                    destroyEl: false,
                    node: node,
                    scope: route.$isolateScope ?
                           self.scope.$newIsolated() :
                           self.scope.$new()
                },
                i, l;

            if (route.as) {
                cfg.as = route.as;
            }
            if (route.template) {
                cfg.template = route.template;
            }

            args.shift();

            if (params) {
                for (i = -1, l = params.length; ++i < l; cfg[params[i]] = args[i]){}
            }

            if (self.cmpCache[route.id]) {
                self.currentComponent = self.cmpCache[route.id];
                node.appendChild(self.domCache[route.id]);
            }
            else {
                return resolveComponent(
                    route.cmp || "MetaphorJs.Component",
                    cfg,
                    cfg.scope,
                    node,
                    null,
                    args
                )
                    .done(function (newCmp) {
                        self.currentComponent = newCmp;

                        if (route.keepAlive) {
                            self.cmpCache[route.id] = newCmp;
                            self.domCache[route.id] = window.document.createDocumentFragment();
                        }
                    });
            }

        }, true);
    },

    setComponent: function(cmp) {

        var self    = this,
            node    = self.node;

        animate(node, "enter", function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;

            return resolveComponent(cls, cfg, scope, node).done(function(newCmp){
                self.currentComponent = newCmp;
            });

        }, true);
    },

    destroy: function() {

        var self    = this;

        self.clearComponent();

        if (self.route) {
            mhistory.un("locationchange", self.onLocationChange, self);
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


