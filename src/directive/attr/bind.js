require("../../lib/State.js");
require("../../lib/Text.js");
require("../../func/dom/isField.js");
require("../../lib/Input.js");
require("../../lib/Config.js");
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    Directive = require("../../app/Directive.js");

Directive.registerAttribute("bind", 1000, 
    Directive.$extend({
        $class: "MetaphorJs.app.Directive.attr.Bind",
        id: "bind",
        
        _apis: ["node", "input"],
        input: null,
        textRenderer: null,

        initDirective: function() {

            var self    = this,
                config  = self.config;

            if (self.input) {
                self.input.onChange(self.onInputChange, self);
            }

            self.optionsChangeDelegate = bind(self.onOptionsChange, self);
            MetaphorJs.dom.addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

            if (config.has("if")) {
                config.on("if", self.onIfChange, self);
            }

            if (config.get("recursive")) {
                config.disableProperty("value");
                config.disableProperty("recursive");
                self.textRenderer = new MetaphorJs.lib.Text(
                    self.state, 
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

        initNode: function(node) {
            var self = this;
            if (MetaphorJs.dom.isField(node)) {
                self.input = MetaphorJs.lib.Input.get(node);
            }
        },

        onInputChange: function() {

            var self = this,
                config = self.config,
                stateVal,
                inputVal;

            if (config.has("locked") && config.get("locked")) {
                stateVal = self.config.get("value") || null;
                inputVal = self.input.getValue() || null;
                if (stateVal != inputVal) {
                    async(() => self.onStateChange());
                }
            }
        },

        onTextRendererChange: function() {
            this.onStateChange();
        },

        onOptionsChange: function() {
            this.onStateChange();
        },

        onIfChange: function(val) {
            if (this.config.get("if")) {
                this.onStateChange();
            }
        },

        onStateChange: function() {
            var config = this.config;
            if (config.has("if") && !config.get("if")) {
                return;
            }
            var val = this.textRenderer ? 
                        this.textRenderer.getString() :
                        this.config.get("value")
            this.updateElement(val);
        },

        updateElement: function(val) {

            var self = this;

            if (self.input) {
                if (self.input.getValue() != val) {
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
                self.input.unChange(self.onInputChange, self);
                self.input.$destroy();
                self.input = null;
            }

            self.$super();
        }
    }, {
        initConfig: function(config, instance) {
            config.setType("if", "bool");
            config.setType("recursive", "bool");
            config.setType("once", "bool", MetaphorJs.lib.Config.MODE_STATIC);
            config.setType("locked", "bool");
        }
    }));