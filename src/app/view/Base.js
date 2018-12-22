
require("../__init.js");
require("../../func/dom/data.js");
require("../../func/dom/toFragment.js");
require("../../func/dom/addClass.js");
require("../../func/dom/removeClass.js");
require("metaphorjs-animate/src/animate/animate.js");
require("../../lib/Config.js");
require("../../func/app/resolve.js");

var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),
    isObject = require("metaphorjs-shared/src/func/isObject.js"),
    isString = require("metaphorjs-shared/src/func/isString.js");

module.exports = MetaphorJs.app.view.Base = cls({

    $init: function(cfg)  {

        var self    = this;

        extend(self, cfg, true, false);

        if (!self.config) {
            self.config = new MetaphorJs.lib.Config(null, {
                scope: self.scope
            });
        }

        self.initConfig();

        var node = self.node;

        if (node && node.firstChild) {
            MetaphorJs.dom.data(node, "mjs-transclude", 
                MetaphorJs.dom.toFragment(node.childNodes));
        }

        if (!self.id) {
            self.id = nextUid();
        }

        self.scope.$app.registerCmp(self, self.scope, "id");        
        self.initView();
    },

    initView: function() {},

    initConfig: function() {
        var config = this.config;
        config.setType("scrollOnChange", "bool", MetaphorJs.lib.Config.MODE_STATIC);
        config.setDefaultMode("defaultCmp", MetaphorJs.lib.Config.MODE_STATIC);
    },


    clearComponent: function() {
        var self    = this,
            node    = self.node;

        if (self.currentComponent) {

            MetaphorJs.animate.animate(node, self.config.get("animate") ? "leave" : null).done(function(){

                if (self.currentComponent &&
                    !self.currentComponent.$destroyed &&
                    !self.currentComponent.$destroying) {
                    self.currentComponent.$destroy();
                }

                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }

                self.currentComponent = null;
            });
        }
    },

    onCmpDestroy: function(cmp) {},

    setComponent: function(cmp) {

        var self    = this,
            node    = self.node;

        self.beforeCmpChange(cmp);
        MetaphorJs.animate.stop(self.node);
        self.clearComponent();

        MetaphorJs.animate.animate(node, self.config.get("animate") ? "enter" : null, function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.app.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;

            return MetaphorJs.app.resolve(cls, cfg, scope, node, [cfg]).done(function(newCmp){
                newCmp.on("destroy", self.onCmpDestroy, self);
                self.currentComponent = newCmp;
                self.afterCmpChange();
            });
        });
    },

    beforeCmpChange: function(cmpCls) {},

    afterCmpChange: function() {
        var self = this;
        if (self.config.get("scrollOnChange")) {
            raf(function () {
                self.node.scrollTop = 0;
            });
        }
    },

    onDestroy: function() {

        var self = this;

        self.clearComponent();

        if (self.node) {
            MetaphorJs.dom.data(self.node, "mjs-transclude", null, "remove");
        }

        self.scope = null;
        self.currentComponent = null;
        self.currentView = null;

        self.$super();
    }
});