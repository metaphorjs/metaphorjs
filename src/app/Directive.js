
require("../lib/Expression.js");
require("../lib/MutationObserver.js");
require("../func/dom/commentWrap.js");

var undf = require("metaphorjs-shared/src/var/undf.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
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
            return b.priority - a.priority;
        }

    MetaphorJs.directive = MetaphorJs.directive || {
        attr: attr,
        tag: tag,
        component: component
    };

    return cls({

        watcher: null,
        stateFn: null,
        scope: null,
        node: null,
        mods: null,
        wrapperOpen: null,
        wrapperClose: null,

        $init: function(scope, node, config, renderer, attrSet) {

            var self        = this;

            self.config     = config;
            self.node       = node;
            self.scope      = scope;
            self.saveState  = config.saveState;

            if (self.saveState) {
                self.stateFn = MetaphorJs.lib.Expression.parse(self.saveState, {
                    setter: true,
                    setterOnly: true
                });
            }

            scope.$on("destroy", self.onScopeDestroy, self);
            scope.$on("reset", self.onScopeReset, self);

            self.initialSet();
        },

        initialSet: function() {
            var self = this;
            self.config.lateInit();
            self.config.on("value", self.onChange, self);
            if ((val = self.config.get("value")) !== undf) {
                self.onChange(val, undf);
            }
        },

        getChildren: function() {
            return null;
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

        onChange: function(val) {
            this.saveStateOnChange(val);
        },

        saveStateOnChange: function(val) {
            if (this.stateFn) {
                this.stateFn(this.scope, val);
            }
        },

        onDestroy: function() {
            var self    = this;

            if (self.scope) {
                self.scope.$un("destroy", self.onScopeDestroy, self);
                self.scope.$un("reset", self.onScopeReset, self);
            }

            if (self.watcher) {
                self.watcher.unsubscribe(self.onChange, self);
                self.watcher.$destroy(true);
            }

            if (self.wrapperOpen) {
                self.wrapperOpen.parentNode.removeChild(self.wrapperOpen);
            }
            if (self.wrapperClose) {
                self.wrapperClose.parentNode.removeChild(self.wrapperClose);
            }

            self.$super();
        }
    }, {

        /**
         * Get directive by name
         * @static
         * @method
         * @param {string} type 
         * @param {string} name 
         */
        getDirective: function(type, name) {
            return ns.get("MetaphorJs.directive." + type +"."+ name, true);
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
        }
    });
}());
