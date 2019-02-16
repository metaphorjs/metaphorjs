
require("metaphorjs-promise/src/lib/Promise.js");
require("../lib/Expression.js");
require("../lib/MutationObserver.js");
require("../func/dom/commentWrap.js");
require("../lib/Config.js");
require("../func/dom/isField.js");
require("../lib/Input.js");

var undf = require("metaphorjs-shared/src/var/undf.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    isThenable = require("metaphorjs-shared/src/func/isThenable.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");


module.exports = MetaphorJs.app.Directive = (function() {

    var attr = {},
        tag = {},
        component = {},
        attributes          = [],
        attributesSorted    = false,
        compare             = function(a, b) {
            return a.priority - b.priority;
        }

    MetaphorJs.directive = MetaphorJs.directive || {
        attr: attr,
        tag: tag,
        component: component
    };

    return cls({

        scope: null,
        node: null,
        component: null,
        attrSet: null,
        renderer: null,
        wrapperOpen: null,
        wrapperClose: null,

        _apis: ["node"],
        _autoOnChange: true,
        _stateFn: null,
        _initPromise: null,
        _nodeAttr: null,
        _initial: true,
        _asyncInit: false,

        $init: function(scope, node, config, renderer, attrSet) {

            var self        = this;

            self.scope      = scope;
            self.config     = config;
            self.renderer   = renderer;
            self.attrSet    = attrSet;
            self._nodeAttr  = node;

            self._initConfig();
            self._initScope();

            self._asyncInit && self._initAsyncInit();
            self._initNodeAttr(node);

            self._initPromise ? 
                self._initPromise.done(self._initDirective, self) :
                self._initDirective();
        },

        _initAsyncInit: function() {
            var self = this;
            self._initPromise = new MetaphorJs.lib.Promise;
            var asnc = new MetaphorJs.lib.Promise;
            self._initPromise.after(asnc);

            async(function(){
                if (!self.$destroyed) {
                    asnc.resolve();
                }
            });
        },

        _initNodeAttr: function(node) {
            var self = this;

            if (node instanceof window.Node) {
                self.node = node;
                self._initNode(node);
                self._initPromise && self._initPromise.resolve();
            }
            else if (node.$is && node.$is("MetaphorJs.app.Component")) {
                self.component = node;
                self._initComponent(node);
                self._initPromise && self._initPromise.resolve();
            }
            else if (isThenable(node)) {
                node.done(self._initNodeAttr, self);
            }
        },

        _initConfig: function() {
            var config = this.config;
            config.setDefaultMode("saveState", MetaphorJs.lib.Config.MODE_SETTER);
            if (config.has("saveState")) {
                self._stateFn = config.get("saveSate");
            }
        },

        _initScope: function() {
            var self = this,
                scope = self.scope;
            scope.$on("destroy", self.onScopeDestroy, self);
            scope.$on("reset", self.onScopeReset, self);
        },

        _initComponent: function(component) {
            var self = this,
                apis = self._apis,
                i, l, res;
            for (i = 0, l = apis.length; i < l; i++) {
                res = self._initApi(component, apis[i]);
                if (isThenable(res)) {
                    !self._initPromise && 
                        (self._initPromise = new MetaphorJs.lib.Promise);
                    self._initPromise.after(res);
                }
            }
        },

        _initNode: function(node) {
            if (this._apis.indexOf("input") !== -1 && 
                MetaphorJs.dom.isField(node)) {
                this.input = MetaphorJs.lib.Input.get(node, this.scope);
            }
        },

        _initApi: function(component, apiType) {
            var self = this,
                api = component.getApi(apiType, self.id);
            if (isThenable(api)) {
                return api.done(function(api){
                    self._onApiResolved(apiType, api);
                });
            }
            else self._onApiResolved(apiType, api);
        },

        _onApiResolved: function(apiType, api) {
            this[apiType] = api;
        },

        _initDirective: function() {
            this._initChange();
        },

        _initChange: function() {
            var self = this,
                val;
            self.config.on("value", self.onScopeChange, self);
            if (self._autoOnChange && (val = self.config.get("value")) !== undf) {
                self.onScopeChange(val, undf);
            }
        },

        createCommentWrap: function(node, name) {
            var cmts = MetaphorJs.dom.commentWrap(node, name || this.$class);
            this.wrapperOpen = cmts[0];
            this.wrapperClose = cmts[1];
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onScopeReset: function() {},

        onScopeChange: function(val) {
            this.saveStateOnChange(val);
        },

        saveStateOnChange: function(val) {
            if (this._stateFn) {
                this._stateFn(this.scope, val);
            }
        },

        onDestroy: function() {
            var self    = this;

            if (isThenable(self.node)) {
                self.node.$destroy();
            }

            if (self._initPromise) {
                self._initPromise.$destroy();   
            }

            if (self.scope) {
                self.scope.$un("destroy", self.onScopeDestroy, self);
                self.scope.$un("reset", self.onScopeReset, self);
            }

            if (self.config) {
                self.config.$destroy();
            }

            if (self.wrapperOpen && self.wrapperOpen.parentNode) {
                self.wrapperOpen.parentNode.removeChild(self.wrapperOpen);
            }
            if (self.wrapperClose && self.wrapperClose.parentNode) {
                self.wrapperClose.parentNode.removeChild(self.wrapperClose);
            }

            self.$super();
        }
    }, {

        attr: {},
        tag: {},

        /**
         * Get directive by name
         * @static
         * @method
         * @param {string} type 
         * @param {string} name 
         */
        getDirective: function(type, name) {
            return ns.get("MetaphorJs.directive." + type +"."+ name);
        },

        /**
         * Register attribute directive
         * @param {string} name Attribute name
         * @param {int} priority 
         * @param {function|MetaphorJs.app.Directive} handler 
         */
        registerAttribute: function registerAttribute(name, priority, handler) {
            if (!attr[name]) {
                attributes.push({
                    priority: priority,
                    name: name,
                    handler: attr[name] = handler
                });
                attributesSorted = false;
            }
        },

        /**
         * Get attribute directives sorted by priority
         * @static
         * @method
         * @returns {array}
         */
        getAttributes: function getAttributes() {
            if (!attributesSorted) {
                attributes.sort(compare);
                attributesSorted = true;
            }
            return attributes;
        },

        /**
         * Register tag directive
         * @param {string} name Tag name (case insensitive)
         * @param {function|MetaphorJs.app.Directive} handler 
         */
        registerTag: function registerTag(name, handler) {
            if (!tag[name]) {
                tag[name] = handler;
            }
        },

        /**
         * Register tag component
         * @param {string} name Tag name (case sensitive)
         * @param {MetaphorJs.app.Component} cmp 
         */
        registerComponent: function(name, cmp) {
            if (!cmp) {
                cmp = name;
            }
            if (isString(cmp)) {
                cmp = ns.get(cmp, true);
            }
            if (!component[name]) {
                component[name] = cmp;
            }
        },

        /**
         * Resolve received something into a dom node.
         * @param {Promise|Node|Component} node 
         * @param {string} directive Directive name
         * @param {function} cb {
         *  @param {Node} node
         *  @param {MetaphorJs.app.Component} cmp
         * }
         * @param {string} apiType {
         *  node|input|...
         *  @default resolveNode
         * }
         */
        resolveNode: function(node, directive, cb, apiType) {
            if (node instanceof window.Node){
                cb(node);
            }
            else if (node.getApi) {
                var cmp = node;
                node = node.getApi(apiType || "node", directive);
                if (isThenable(node)) {
                    node.done(function(node){
                        cb(node, cmp);
                    });
                }
                else if (node) {
                    cb(node, cmp);
                }
            }
        }
    });
}());
