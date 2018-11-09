
require("../lib/Expression.js");
require("../lib/MutationObserver.js");

var undf = require("metaphorjs-shared/src/var/undf.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");


module.exports = MetaphorJs.app.Directive = (function() {

    var attr = {},
        tag = {},
        component = {};

    MetaphorJs.directive = MetaphorJs.directive || {
        attr: attr,
        tag: tag,
        component: component
    };

    var attributes          = [],
        attributesSorted    = false,
        compare             = function(a, b) {
            return b.priority - a.priority;
        },

        commentHolders      = function(node, name) {

            name = name || "";

            var before = window.document.createComment(name + " - start"),
                after = window.document.createComment(name + " - end"),
                parent = node.parentNode;

            parent.insertBefore(before, node);

            if (node.nextSibling) {
                parent.insertBefore(after, node.nextSibling);
            }
            else {
                parent.appendChild(after);
            }

            return [before, after];
        };

    return cls({

        watcher: null,
        stateFn: null,
        scope: null,
        node: null,
        expr: null,
        mods: null,

        autoOnChange: true,

        $init: function(scope, node, expr, renderer, attr) {

            var self        = this,
                config      = attr ? attr.config : {},
                val;

            expr            = expr.trim();

            self.node       = node;
            self.expr       = expr;
            self.scope      = scope;
            self.saveState  = config.saveState;
            self.watcher    = MetaphorJs.lib.MutationObserver.get(scope, expr, self.onChange, self);

            if (self.saveState) {
                self.stateFn = MetaphorJs.lib.Expression.parse(self.saveState, {
                    setter: true,
                    setterOnly: true
                });
            }

            if (self.autoOnChange && (val = self.watcher.getValue()) !== undf) {
                self.onChange(val, undf);
            }

            scope.$on("destroy", self.onScopeDestroy, self);
            scope.$on("reset", self.onScopeReset, self);
        },

        getChildren: function() {
            return null;
        },

        createCommentHolders: function(node, name) {
            var cmts = commentHolders(node, name || this.$class);
            this.prevEl = cmts[0];
            this.nextEl = cmts[1];
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onScopeReset: function() {

        },

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

            if (self.prevEl) {
                self.prevEl.parentNode.removeChild(self.prevEl);
            }
            if (self.nextEl) {
                self.nextEl.parentNode.removeChild(self.nextEl);
            }

            self.$super();
        }
    }, {

        getDirective: function(type, name) {
            return ns.get("MetaphorJs.directive." + type +"."+ name, true);
        },

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

        getAttributes: function getAttributes() {
            if (!attributesSorted) {
                attributes.sort(compare);
                attributesSorted = true;
            }
            return attributes;
        },

        registerTag: function registerTag(name, handler) {
            if (!tag[name]) {
                tag[name] = handler;
            }
        },

        // components are case sensitive
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

        commentHolders: commentHolders
    });

}());


