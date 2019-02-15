require("../../lib/Scope.js");
require("../../lib/Text.js");
require("../../func/dom/isField.js");
require("../../lib/Input.js");
require("../../lib/Config.js");
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    Directive = require("../../app/Directive.js");

Directive.registerAttribute("bind", 1000, 
    Directive.$extend({
        $class: "MetaphorJs.app.Directive.attr.Bind",
        id: "bind",
        
        _apis: ["node", "input"],
        _focus: false,
        input: null,
        textRenderer: null,

        _initDirective: function() {

            var self    = this,
                config  = self.config;

            if (self.input) {
                self.input.onChange(self.onInputChange, self);
                if (config.get("preserveInput")) {
                    self.focusDelegate = bind(self.onInputFocus, self);
                    self.blurDelegate = bind(self.onInputBlur, self);
                    MetaphorJs.dom.addListener(self.node, "focus", self.focusDelegate);
                    MetaphorJs.dom.addListener(self.node, "blur", self.blurDelegate);
                }
            }

            self.optionsChangeDelegate = bind(self.onOptionsChange, self);
            MetaphorJs.dom.addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

            if (config.get("recursive")) {
                config.disableProperty("value");
                config.disableProperty("recursive");
                self.textRenderer = new MetaphorJs.lib.Text(
                    self.scope, 
                    config.getExpression("value"), 
                    {
                        recursive: true, 
                        fullExpr: true,
                        once: config.get("once")
                    }
                );
                self.textRenderer.subscribe(self.onTextRendererChange, self);
                self.onTextRendererChange();
            }
            else {
                self.$super();
            }
        },

        _initConfig: function(config) {
            this.$super(config);
            config.setType("recursive", "bool");
            config.setType("once", "bool", MetaphorJs.lib.Config.MODE_STATIC);
            config.setType("locked", "bool");
            config.setType("preserveInput", "bool");
        },

        _initNode: function(node) {
            var self = this;
            if (MetaphorJs.dom.isField(node)) {
                self.input = MetaphorJs.lib.Input.get(node);
            }
        },


        onInputFocus: function() {
            this._focus = true;
        },

        onInputBlur: function() {
            this._focus = false;
        },

        
        onInputChange: function(val) {
            var self = this,
                cfgVal = self.config.get("value") || null;
            val = val || null;
            if (self.config.get("locked") && val != cfgVal) {
                self.onScopeChange(cfgVal);
            }
        },

        onTextRendererChange: function() {
            this.onScopeChange(this.textRenderer.getString());
        },

        onOptionsChange: function() {
            this.onScopeChange(
                this.textRenderer ? 
                    this.textRenderer.getString() :
                    this.config.get("value")
            );
        },

        onScopeChange: function(text) {
            this.updateElement(text);
        },

        updateElement: function(val) {

            var self = this;

            if (self.input) {
                if (!self._focus) {
                    self.input.setValue(val);
                }
            }
            else {
                self.node[typeof self.node.textContent === "string" ? "textContent" : "innerText"] = val;
            }
        },

        onDestroy: function() {

            var self    = this;

            MetaphorJs.dom.removeListener(
                self.node, "optionschange", 
                self.optionsChangeDelegate);

            if (self.textRenderer) {
                self.textRenderer.$destroy();
                self.textRenderer = null;
            }

            if (self.input) {
                self.inputApi.unChange(self.onInputChange, self);
                self.input.$destroy();
                self.input = null;

                if (config.get("preserveInput")) {
                    self.focusDelegate = bind(self.onInputFocus, self);
                    self.blurDelegate = bind(self.onInputBlur, self);
                    MetaphorJs.dom.removeListener(self.node, "focus", self.focusDelegate);
                    MetaphorJs.dom.removeListener(self.node, "blur", self.blurDelegate);
                }
            }

            self.$super();
        }
    }));