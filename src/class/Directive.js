

var trim = require("../func/trim.js"),
    createWatchable = require("../../../metaphorjs-watchable/src/func/createWatchable.js"),
    undf = require("../var/undf.js"),
    isString = require("../func/isString.js"),
    filterLookup = require("../func/filterLookup.js"),
    defineClass = require("../../../metaphorjs-class/src/func/defineClass.js"),
    nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    nsGet = require("../../../metaphorjs-namespace/src/func/nsGet.js");


module.exports = function(){

    var attributes          = [],
        tags                = [],
        attributesSorted    = false,

        compare             = function(a, b) {
            //if (a is less than b by some ordering criterion)
            if (a.priority < b.priority) {
                return -1;
            }

            //if (a is greater than b by the ordering criterion)
            if (a.priority > b.priority) {
                return 1;
            }

            // a must be equal to b
            return 0;
        };

    return defineClass({

        $class: "Directive",

        watcher: null,
        scope: null,
        node: null,
        expr: null,
        mods: null,

        autoOnChange: true,

        $init: function(scope, node, expr) {

            var self        = this,
                val;

            expr            = trim(expr);

            //if (mods) {
            //    expr        = self.adjustExpression(expr, mods);
            //}

            //self.mods       = mods;
            self.node       = node;
            self.expr       = expr;
            self.scope      = scope;
            self.watcher    = createWatchable(scope, expr, self.onChange, self, {filterLookup: filterLookup});

            if (self.autoOnChange && (val = self.watcher.getLastResult()) !== undf) {
                self.onChange(val, undf);
            }

            scope.$on("destroy", self.onScopeDestroy, self);
            scope.$on("reset", self.onScopeReset, self);
        },

        adjustExpression: function(expr, mods) {
            return expr;
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onScopeReset: function() {

        },

        onChange: function() {},

        destroy: function() {
            var self    = this;

            if (self.scope) {
                self.scope.$un("destroy", self.onScopeDestroy, self);
                self.scope.$un("reset", self.onScopeReset, self);
            }

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
            }

            self.$super();
        }
    }, {

        getDirective: function(type, name) {
            return nsGet("directive." + type +"."+ name, true);
        },

        registerAttribute: function registerAttribute(name, priority, handler) {
            if (!nsGet("directive.attr." + name, true)) {
                attributes.push({
                    priority: priority,
                    name: name,
                    handler: nsAdd("directive.attr." + name, handler)
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
            if (!nsGet("directive.tag." + name, true)) {
                nsAdd("directive.tag." + name, handler)
            }
        },

        // components are case sensitive
        registerComponent: function(name, cmp) {
            if (!cmp) {
                cmp = name;
            }
            if (isString(cmp)) {
                cmp = nsGet(cmp, true);
            }
            if (!nsGet("directive.component." + name, true)) {
                nsAdd("directive.component." + name.toLowerCase(), cmp)
            }
        },

        getExprAndMods: function(value) {

            if (typeof value === "string" || !value) {
                return [
                    {expr: value, mods: null}
                ]
            }
            else {
                var list = [],
                    mods, i, l, ml;
                for (var key in value) {

                    if (key) {
                        ml = key.split(".");
                        mods = ml.length ? {} : null;

                        for (i = 0, l = ml.length; i < l; i++) {
                            mods[ml[i]] = true;
                        }
                    }
                    else {
                        ml = [];
                        mods = null;
                    }

                    list.push({
                        expr: value[key],
                        mods: mods,
                        mlist: ml
                    });
                }
                return list;
            }
        }
    });

}();


