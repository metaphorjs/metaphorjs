
require("metaphorjs-observable/src/lib/Observable.js");
require("../func/dom/getInputValue.js");
require("../func/dom/setInputValue.js");
require("metaphorjs/src/func/dom/addListener.js");
require("metaphorjs/src/func/dom/removeListener.js");
require("metaphorjs/src/func/dom/isAttached.js");
require("metaphorjs/src/func/browser/isAndroid.js");
require("metaphorjs/src/func/browser/hasEvent.js");
require("metaphorjs/src/func/dom/getAttr.js");
require("metaphorjs/src/func/dom/normalizeEvent.js");
require("metaphorjs/src/func/dom/select.js");

var bind    = require("metaphorjs-shared/src/func/bind.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.lib.Input = function(){

var observable = new MetaphorJs.lib.Observable,
    id = 0;

var Input = function(el, changeFn, changeFnContext, cfg) {

    if (el.$$input) {
        if (changeFn) {
            el.$$input.on("change", changeFn, changeFnContext);
        }
        return el.$$input;
    }

    var self    = this;

    cfg = cfg || {};

    //self.observable     = new MetaphorJs.lib.Observable;
    self.el             = el;
    self.id             = ++id;
    self.inputType      = el.type.toLowerCase();
    self.dataType       = cfg.type || MetaphorJs.dom.getAttr(el, "data-type") || self.inputType;
    self.listeners      = [];

    if (changeFn) {
        self.on("change", changeFn, changeFnContext);
    }
};

extend(Input.prototype, {

    el: null,
    inputType: null,
    dataType: null,
    listeners: null,
    radio: null,
    keydownDelegate: null,
    changeInitialized: false,

    $destroy: function() {

        var self        = this,
            i;

        //self.observable.$destroy();
        observable.destroyEvent("change-" + self.id);
        observable.destroyEvent("key-" + self.id);
        self._addOrRemoveListeners(MetaphorJs.dom.removeListener, true);

        self.el.$$input = null;

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }
    },

    _addOrRemoveListeners: function(fn, onlyUsed) {

        var self        = this,
            type        = self.inputType,
            listeners   = self.listeners,
            radio       = self.radio,
            el          = self.el,
            used,
            i, ilen,
            j, jlen;

        for (i = 0, ilen = listeners.length; i < ilen; i++) {

            used = !!listeners[i][2];

            if (used === onlyUsed) {
                if (type === "radio") {
                    for (j = 0, jlen = radio.length; j < jlen; j++) {
                        fn(radio[j], listeners[i][0], listeners[i][1]);
                    }
                }
                else {
                    fn(el, listeners[i][0], listeners[i][1]);
                }
                listeners[i][2] = !onlyUsed;
            }
        }
    },

    initInputChange: function() {

        var self = this,
            type = self.inputType;

        if (type === "radio") {
            self.initRadioInput();
        }
        else if (type === "checkbox") {
            self.initCheckboxInput();
        }
        else {
            self.initTextInput();
        }

        self._addOrRemoveListeners(MetaphorJs.dom.addListener, false);

        self.changeInitialized = true;
    },

    initRadioInput: function() {

        var self    = this,
            el      = self.el,
            name    = el.name,
            parent;

        if (MetaphorJs.dom.isAttached(el)) {
            parent  = el.ownerDocument;
        }
        else {
            parent = el;
            while (parent.parentNode) {
                parent = parent.parentNode;
            }
        }

        self.radio  = MetaphorJs.dom.select("input[name="+name+"]", parent);

        self.onRadioInputChangeDelegate = bind(self.onRadioInputChange, self);
        self.listeners.push(["click", self.onRadioInputChangeDelegate, false]);
    },

    initCheckboxInput: function() {

        var self    = this;

        self.clicked = false;

        self.onCheckboxInputChangeDelegate = bind(self.onCheckboxInputChange, self);
        self.onCheckboxInputClickDelegate = bind(self.onCheckboxInputClick, self);
        self.listeners.push(["click", self.onCheckboxInputClickDelegate, false]);
        self.listeners.push(["change", self.onCheckboxInputChangeDelegate, false]);
    },

    initTextInput: function() {

        var composing   = false,
            self        = this,
            listeners   = self.listeners,
            timeout;

        // In composition mode, users are still inputing intermediate text buffer,
        // hold the listener until composition is done.
        // More about composition events:
        // https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
        if (!MetaphorJs.browser.isAndroid()) {

            var compositionStart    = function() {
                composing = true;
            };

            var compositionEnd  = function() {
                composing = false;
                listener();
            };

            listeners.push(["compositionstart", compositionStart, false]);
            listeners.push(["compositionend", compositionEnd, false]);
        }

        var listener = self.onTextInputChangeDelegate = function(ev) {
            if (composing) {
                return;
            }
            self.onTextInputChange(ev);
        };

        var deferListener = function(ev) {
            if (!timeout) {
                timeout = setTimeout(function() {
                    listener(ev);
                    timeout = null;
                }, 0);
            }
        };

        var keydown = function(event) {
            event = event || window.event;
            var key = event.keyCode;

            // ignore
            //    command            modifiers                   arrows
            if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                return;
            }

            deferListener(event);
        };

        // if the browser does support "input" event, we are fine - except on
        // IE9 which doesn't fire the
        // input event on backspace, delete or cut
        if (MetaphorJs.browser.hasEvent('input')) {

            listeners.push(["input", listener, false]);

        } else {

            listeners.push(["keydown", keydown, false]);

            // if user modifies input value using context menu in IE,
            // we need "paste" and "cut" events to catch it
            if (MetaphorJs.browser.hasEvent('paste')) {
                listeners.push(["paste", deferListener, false]);
                listeners.push(["cut", deferListener, false]);
            }
        }


        // if user paste into input using mouse on older browser
        // or form autocomplete on newer browser, we need "change" event to catch it

        listeners.push(["change", listener, false]);
    },

    processValue: function(val) {

        switch (this.dataType) {
            case "number":
            case "float":
            case "double":
                if (val === "" || isNaN(val = parseFloat(val))) {
                    val = undf;
                }
                break;
            case "int":
            case "integer":
                if (val === "" || isNaN(val = parseInt(val, 10))) {
                    val = undf;
                }
                break;
            case "bool":
            case "boolean":
                return !(val === "false" || val === "0" || val === 0 ||
                        val === "off" || val === false || val === "");

        }

        return val;
    },

    onTextInputChange: function(ev) {

        var self    = this,
            val     = self.getValue();

        observable.trigger("change-"+self.id, self.processValue(val));
    },


    _checkboxChange: function() {
        var self    = this,
            node    = self.el;

        observable.trigger("change-"+self.id, self.processValue(
            node.checked ? (MetaphorJs.dom.getAttr(node, "value") || true) : false)
        );
    },

    onCheckboxInputChange: function() {
        if (!this.clicked) {
            this._checkboxChange();
        }
        this.clicked = false;
    },

    onCheckboxInputClick: function() {
        this._checkboxChange();
        this.clicked = true;
    },

    onRadioInputChange: function(e) {

        e = e || window.event;

        var self    = this,
            trg     = e.target || e.srcElement;

        observable.trigger("change-"+self.id, self.processValue(trg.value));
    },

    setValue: function(val) {

        var self    = this,
            type    = self.inputType,
            radio,
            i, len;

        val = self.processValue(val);

        if (type === "radio") {

            radio = self.radio;

            for (i = 0, len = radio.length; i < len; i++) {
                radio[i].checked = self.processValue(radio[i].value) == val;
            }
        }
        else if (type === "checkbox") {
            var node        = self.el;
            node.checked    = val === true || val == self.processValue(node.value);
        }
        else {

            if (val === undf) {
                val = "";
            }

            MetaphorJs.dom.setInputValue(self.el, val);
        }

        self.triggerChange();
    },

    getValue: function() {

        var self    = this,
            type    = self.inputType,
            radio,
            i, l;

        if (type === "radio") {
            radio = self.radio;
            for (i = 0, l = radio.length; i < l; i++) {
                if (radio[i].checked) {
                    return self.processValue(radio[i].value);
                }
            }
            return null;
        }
        else if (type === "checkbox") {
            return self.processValue(self.el.checked ? (MetaphorJs.dom.getAttr(self.el, "value") || true) : false);
        }
        else {
            return self.processValue(MetaphorJs.dom.getInputValue(self.el));
        }
    },


    on: function(event, fn, ctx, opt) {
        var self = this;
        if (event === "change" && !self.changeInitialized) {
            self.initInputChange();
        }
        else if (event === "key" && !self.keydownDelegate) {
            self.keydownDelegate = bind(self.keyHandler, self);
            self.listeners.push(["keydown", self.keydownDelegate, false]);
            MetaphorJs.dom.addListener(self.el, "keydown", self.keydownDelegate);
            observable.createEvent("key-"+self.id, {
                returnResult: false,
                triggerFilter: self.keyEventFilter
            });
        }
        return observable.on(event+"-"+self.id, fn, ctx, opt);
    },

    un: function(event, fn, ctx) {
        return observable.un(event+"-"+this.id, fn, ctx);
    },

    onChange: function(fn, context) {
        return this.on("change", fn, context);
    },

    unChange: function(fn, context) {
        return this.un("change", fn, context);
    },

    onKey: function(key, fn, context, args) {
        return this.on("key", fn, context, {
            key: key,
            prepend: args
        });
    },

    unKey: function(key, fn, context) {
        this.un("key", fn, context);
    },

    keyEventFilter: function(l, args) {

        var key = l.key,
            e = args[0];

        if (typeof key !== "object") {
            return key === e.keyCode;
        }
        else {
            if (key.ctrlKey !== undf && key.ctrlKey !== e.ctrlKey) {
                return false;
            }
            if (key.shiftKey !== undf && key.shiftKey !== e.shiftKey) {
                return false;
            }
            return !(key.keyCode !== undf && key.keyCode !== e.keyCode);
        }
    },

    keyHandler: function(event) {
        observable.trigger(
            "key-"+this.id, 
            MetaphorJs.dom.normalizeEvent(event || window.event)
        );
    },

    triggerChange: function() {
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            this.el.dispatchEvent(evt);
        }
        else {
            this.el.fireEvent("onchange");
        }
    }


}, true, false);


Input.get = function(node, scope) {
    if (node.$$input) {
        return node.$$input;
    }
    if (scope && scope.$app && !node.type) {
        var cmp = scope.$app.getParentCmp(node, true);
        if (cmp && cmp.getInputApi) {
            return cmp.getInputApi();
        }
    }
    return new Input(node);
};

Input.getValue = MetaphorJs.dom.getInputValue;
Input.setValue = MetaphorJs.dom.setInputValue;



return Input;

}();