

(function(){

    var extend          = MetaphorJs.extend,
        bind            = MetaphorJs.bind,
        addListener     = MetaphorJs.addListener,
        removeListener  = MetaphorJs.removeListener,
        getValue        = MetaphorJs.getValue,
        setValue        = MetaphorJs.setValue,

        isSubmittable	= function(elem) {
            var type	= elem.type ? elem.type.toLowerCase() : '';
            return elem.nodeName.toLowerCase() == 'input' && type != 'radio' && type != 'checkbox';
        };

    var Input   = function(el, changeFn, changeFnContext, submitFn) {

        var self    = this,
            type;

        self.el             = el;
        self.cb             = changeFn;
        self.scb            = submitFn;
        self.cbContext      = changeFnContext;
        self.inputType      = type = el.getAttribute("mjs-input-type") || el.type.toLowerCase();
        self.listeners      = [];
        self.submittable    = isSubmittable(el);

        if (type == "radio") {
            self.initRadioInput();
        }
        else if (type == "checkbox") {
            self.initCheckboxInput();
        }
        else {
            self.initTextInput();
        }
    };

    extend(Input.prototype, {

        el: null,
        inputType: null,
        cb: null,
        scb: null,
        cbContext: null,
        listeners: [],
        radio: null,
        submittable: false,

        destroy: function() {

            var self        = this,
                type        = self.inputType,
                listeners   = self.listeners,
                radio       = self.radio,
                el          = self.el,
                i, ilen,
                j, jlen;

            for (i = 0, ilen = listeners.length; i < ilen; i++) {
                if (type == "radio") {
                    for (j = 0, jlen = radio.length; j < jlen; j++) {
                        removeListener(radio[j], listeners[i][0], listeners[i][1]);
                    }
                }
                else {
                    removeListener(el, listeners[i][0], listeners[i][1]);
                }
            }

            delete self.radio;
            delete self.el;
            delete self.cb;
            delete self.cbContext;
        },

        initRadioInput: function() {

            var self    = this,
                el      = self.el,
                type    = el.type,
                name    = el.name,
                radio,
                i, len;

            self.onRadioInputChangeDelegate = bind(self.onRadioInputChange, self);

            if (document.querySelectorAll) {
                radio = document.querySelectorAll("input[name="+name+"]");
            }
            else {
                var nodes = document.getElementsByTagName("input"),
                    node;

                radio = [];
                for (i = 0, len = nodes.length; i < len; i++) {
                    node = nodes[i];
                    if (node.type == type && node.name == name) {
                        radio.push(node);
                    }
                }
            }

            self.radio  = radio;
            self.listeners.push(["click", self.onRadioInputChangeDelegate]);

            for (i = 0, len = radio.length; i < len; i++) {
                addListener(radio[i], "click", self.onRadioInputChangeDelegate);
            }
        },

        initCheckboxInput: function() {

            var self    = this;

            self.onCheckboxInputChangeDelegate = bind(self.onCheckboxInputChange, self);

            self.listeners.push(["click", self.onCheckboxInputChangeDelegate]);
            addListener(self.el, "click", self.onCheckboxInputChangeDelegate);
        },

        initTextInput: function() {

            var browser     = MetaphorJs.browser,
                composing   = false,
                self        = this,
                node        = self.el,
                listeners   = self.listeners,
                timeout;

            // In composition mode, users are still inputing intermediate text buffer,
            // hold the listener until composition is done.
            // More about composition events: https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
            if (!browser.android) {

                var compositionStart    = function() {
                    composing = true;
                };

                var compositionEnd  = function() {
                    composing = false;
                    listener();
                };

                listeners.push(["compositionstart", compositionStart]);
                listeners.push(["compositionend", compositionEnd]);

                addListener(node, "compositionstart", compositionStart);
                addListener(node, "compositionend", compositionEnd);
            }

            var listener = self.onTextInputChangeDelegate = function() {
                if (composing) {
                    return;
                }
                self.onTextInputChange();
            };

            // if the browser does support "input" event, we are fine - except on IE9 which doesn't fire the
            // input event on backspace, delete or cut
            if (browser.hasEvent('input')) {
                listeners.push(["input", listener]);
                addListener(node, "input", listener);

            } else {

                var deferListener = function(ev) {
                    if (!timeout) {
                        timeout = window.setTimeout(function() {
                            listener(ev);
                            timeout = null;
                        }, 0);
                    }
                };

                var keydown = function(event) {
                    event = event || window.event;
                    var key = event.keyCode;

                    if (key == 13 && self.submittable && self.scb) {
                        return self.scb.call(self.callbackContext, event);
                    }

                    // ignore
                    //    command            modifiers                   arrows
                    if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                        return;
                    }

                    deferListener(event);
                };

                listeners.push(["keydown", keydown]);
                addListener(node, "keydown", keydown);

                // if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
                if (browser.hasEvent('paste')) {

                    listeners.push(["paste", deferListener]);
                    listeners.push(["cut", deferListener]);

                    addListener(node, "paste", deferListener);
                    addListener(node, "cut", deferListener);
                }
            }

            // if user paste into input using mouse on older browser
            // or form autocomplete on newer browser, we need "change" event to catch it

            listeners.push(["change", listener]);
            addListener(node, "change", listener);
        },

        onTextInputChange: function() {

            var self    = this,
                val     = self.el.value;

            switch (self.inputType) {
                case "number":
                    val     = parseInt(val, 10);
                    break;
            }

            self.cb.call(self.cbContext, val);
        },

        onCheckboxInputChange: function() {

            var self    = this,
                node    = self.el;

            self.cb.call(self.cbContext, node.checked ? (node.getAttribute("value") || true) : false);
        },

        onRadioInputChange: function(e) {

            e = e || window.event;

            var self    = this,
                trg     = e.target || e.srcElement;

            self.cb.call(self.cbContext, trg.value);
        },

        setValue: function(val) {

            var self    = this,
                type    = self.inputType,
                radio,
                i, len;

            if (type == "radio") {

                radio = self.radio;

                for (i = 0, len = radio.length; i < len; i++) {
                    if (radio[i].value == val) {
                        radio[i].checked = true;
                        break;
                    }
                }
            }
            else if (type == "checkbox") {
                var node        = self.el;
                node.checked    = val === true || val == node.value;
            }
            else {
                setValue(self.el, val);
            }
        },

        getValue: function() {

            var self    = this,
                type    = self.inputType,
                radio,
                i, l;

            if (type == "radio") {
                radio = self.radio;
                for (i = 0, l = radio.length; i < l; i++) {
                    if (radio[i].checked) {
                        return radio[i].value;
                    }
                }
                return null;
            }
            else if (type == "checkbox") {
                return self.el.checked ? (self.el.getAttribute("value") || true) : false;
            }
            else {
                return getValue(self.el);
            }
        }
    });

    window.MetaphorJs || (window.MetaphorJs = {});

    if (!MetaphorJs.lib) {
        MetaphorJs.lib = {};
    }

    MetaphorJs.lib.Input = Input;

}());