

(function(){

    "use strict";


    var vldId   = 0,

        validators      = {},

        m               = window.MetaphorJs,

        getValue        = m.getValue,
        extend          = m.extend,
        isArray         = m.isArray,
        trim            = m.trim,
        bind            = m.bind,
        addListener     = m.addListener,
        removeListener  = m.removeListener,
        addClass        = m.addClass,
        removeClass     = m.removeClass,
        Input           = m.lib.Input,
        select          = m.select,

        normalizeEvent  = m.normalizeEvent,

        eachNode        = function(el, fn, fnScope) {
            var i, len,
                children = el.childNodes;

            if (fn.call(fnScope, el) !== false) {
                for(i =- 1, len = children.length>>>0;
                    ++i !== len;
                    eachNode(children[i], fn, fnScope)){}
            }
        },


        Observable  = MetaphorJs.lib.Observable,


        // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
        checkable = function(elem) {
            return /radio|checkbox/i.test(elem.type);
        },

        // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
        getLength = function(value, el) {
            var l = 0;
            switch( el.nodeName.toLowerCase() ) {
                case 'select':
                    eachNode(el, function(node){
                        if (node.selected) {
                            l++;
                        }
                    });
                    return l;
                case 'input':
                    if (checkable(el)) {
                        eachNode(el.form, function(node){
                            if (node.type == el.type && node.name == el.name && node.checked) {
                                l++;
                            }
                        });
                        return l;
                    }
            }
            return value.length;
        },

        // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
        empty = function(value, element) {

            if (!element) {
                return value === undefined || value === '' || value === null;
            }

            switch(element.nodeName.toLowerCase()) {
                case 'select':{
                    // could be an array for select-multiple or a string, both are fine this way
                    var val = getValue(element);
                    return !val || val.length == 0;
                }
                case 'input':{
                    if (checkable(element))
                        return getLength(value, element) == 0;
                    break;
                }
            }

            return trim(value).length == 0;
        },

        format = function(str, params) {

            if (typeof params == "function") return str;

            if (!isArray(params)) {
                params = [params];
            }

            var i, l = params.length;

            for (i = -1; ++i < l;
                 str = str.replace(new RegExp("\\{" + i + "\\}", "g"), params[i])){}

            return str;
        },

        isField	= function(el) {
            var tag	= el.nodeName.toLowerCase(),
                type = el.type;
            if (tag == 'input' || tag == 'textarea' || tag == 'select') {
                if (type != "submit" && type != "reset") {
                    return true;
                }
            }
            return false;
        },

        methods = {};

    // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
    // i've changed most of the functions, but the result is the same.
    // this === field's api.
    extend(methods, {

        required: function(value, element, param) {
            if (param === false) {
                return true;
            }
            return !empty(value, element);
        },

        regexp: function(value, element, param) {
            var reg = param instanceof RegExp ? param : new RegExp(param);
            return empty(value, element) || reg.test(value);
        },

        notregexp: function(value, element, param) {
            var reg = param instanceof RegExp ? param : new RegExp(param);
            return empty(value, element) || !reg.test(value);
        },

        minlength: function(value, element, param) {
            return empty(value, element) ||
                   (
                       element ?
                       getLength(trim(value), element) >= param :
                       value.toString().length >= param
                       );
        },

        maxlength: function(value, element, param) {
            return empty(value, element) ||
                   (
                       element ?
                       getLength(trim(value), element) <= param:
                       value.toString().length <= param
                       );
        },

        rangelength: function(value, element, param) {
            var length = element ? getLength(trim(value), element) : value.toString().length;
            return empty(value, element) || ( length >= param[0] && length <= param[1] );
        },

        min: function(value, element, param) {
            return empty(value, element) || parseInt(value, 10) >= param;
        },

        max: function(value, element, param) {
            return empty(value, element) || parseInt(value, 10) <= param;
        },

        range: function(value, element, param) {
            value = parseInt(value, 10);
            return empty(value, element) || ( value >= param[0] && value <= param[1] );
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/email
        email: function(value, element) {
            // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
            return empty(value, element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/url
        url: function(value, element) {
            // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
            return empty(value, element) || /^((https?|ftp):\/\/|)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            //	/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/date
        date: function(value, element) {
            return empty(value, element) || !/Invalid|NaN/.test(new Date(value));
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
        dateiso: function(value, element) {
            return empty(value, element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/number
        number: function(value, element) {
            return empty(value, element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/digits
        digits: function(value, element) {
            return empty(value, element) || /^\d+$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/creditcard
        // based on http://en.wikipedia.org/wiki/Luhn
        creditcard: function(value, element) {

            if (empty(value, element)) {
                return true; // !! who said this field is required?
            }

            // accept only digits and dashes
            if (/[^0-9-]+/.test(value)) {
                return false;
            }

            var nCheck 	= 0,
                bEven 	= false,
                nDigit,
                cDigit;

            value = value.replace(/\D/g, "");

            for (var n = value.length - 1; n >= 0; n--) {

                cDigit = value.charAt(n);
                nDigit = parseInt(cDigit, 10);

                if (bEven) {
                    if ((nDigit *= 2) > 9) {
                        nDigit -= 9;
                    }
                }

                nCheck 	+= nDigit;
                bEven 	= !bEven;
            }

            return (nCheck % 10) == 0;
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/accept
        accept: function(value, element, param) {
            param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
            return empty(value, element) || value.match(new RegExp(".(" + param + ")$", "i"));
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/equalTo
        equalto: function(value, element, param, api) {
            // bind to the blur event of the target in order to revalidate whenever the target field is updated

            var f       = api.getValidator().getField(param),
                target  = f ? f.getElem() : param;

            var listener = function(){
                removeListener(target, "blur", listener);
                api.check();
            };

            return value == getValue(target);
        },

        notequalto: function(value, element, param, api) {

            var f       = api.getValidator().getField(param),
                target  = f ? f.getElem() : param;

            var listener = function(){
                removeListener(target, "blur", listener);
                api.check();
            };

            return value != getValue(target);
        },

        zxcvbn: function(value, element, param) {
            return zxcvbn(value).score >= parseInt(param);
        }
    });

    var messages	= {
        required: 		"This field is required.",
        remote:	 		"Please fix this field.",
        email: 			"Please enter a valid email address.",
        url: 			"Please enter a valid URL.",
        date: 			"Please enter a valid date.",
        dateISO: 		"Please enter a valid date (ISO).",
        number: 		"Please enter a valid number.",
        digits: 		"Please enter only digits.",
        creditcard: 	"Please enter a valid credit card number.",
        equalTo: 		"Please enter the same value again.",
        accept: 		"Please enter a value with a valid extension.",
        maxlength: 		"Please enter no more than {0} characters.",
        minlength: 		"Please enter at least {0} characters.",
        rangelength: 	"Please enter a value between {0} and {1} characters long.",
        range: 			"Please enter a value between {0} and {1}.",
        max: 			"Please enter a value less than or equal to {0}.",
        min: 			"Please enter a value greater than or equal to {0}."
    };













    /* ***************************** FIELD ****************************************** */


    var fieldDefaults = /*field-options-start*/{

        allowSubmit:		true,			// call form.submit() on field's ENTER keyup
        alwaysCheck:		false,			// run tests even the field is proven valid and hasn't changed since last check
        alwaysDisplayState:	false,
        data:				null,
        ignore:				null,			// put ignore:true to field config to ignore the field completely
        disabled:			false,			// make validator disabled for this field initially

        cls: {
            valid: 			'',				// css class for a valid form
            error:			'',				// css class for a not valid form
            ajax:			''				// css class for a form while it is being checked with ajax request
        },

        // if string is provided, considered errorBox: {tag: '...'}
        errorBox: {
            cls: 			'',				// add this class to the automatically created element
            fn:				null, 			// must return dom node (cancels auto creation), receives api as the only param
            tag:			'',				// create element automatically
            position:		'after',		// place it before|after the form element
            elem:			null,			// jquery or dom object or selector (already existing object)
            enabled:		true			// can be disabled later (toggleErrorBox())
        },

        // callbacks are case insensitive
        // you can use camel case if you like.
        callback: {

            scope:			null,

            destroy:		null,			// called when field's validator is being destroyed. fn(api)
            statechange:	null,			// when field's state has been changed. fn(api, (boolean) state)
            errorchange:	null,			// fn(api, error)
            submit:			null,			// when enter key was pressed. fn(api, event). return false to prevent submitting even
            // if the form is valid
            check:          null,           // called after each check (may not be relevant, if there is a ajax check) fn(api, valid)
            beforeAjax:		null,			// when ajax check is about to be executed. fn(api, requestData)
            afterAjax:		null,			// when ajax check ended. fn(api)

            displaystate:	null			// use this to display custom field state: fn(api, valid, error)
        },

        rules: 				{},				// {name: value}
        // {name: fn(fieldValue, dom, ruleValue, api)}
        // fn must return error message, false or true.
        messages: 			{}
    }/*field-options-end*/;


    var fixFieldShorthands = function(options) {

        if (!options) {
            return {};
        }

        var fix = function(level1, level2, type) {
            var value   = options[level1],
                yes     = false;

            if (value === undefined) {
                return;
            }

            switch (type) {
                case "string": {
                    yes     = typeof value == "string";
                    break;
                }
                case "function": {
                    yes     = typeof value == "function";
                    break;
                }
                case "boolean": {
                    if (value === true || value === false) {
                        yes = true;
                    }
                    break;
                }
            }
            if (yes) {
                options[level1] = {};
                options[level1][level2] = value;
            }
        };

        fix("errorBox", "enabled", "boolean");
        fix("errorBox", "tag", "string");
        fix("errorBox", "fn", "function");

        return options;
    };



    var Field = function(elem, options, vldr) {


        options             = options || {};

        var self            = this,
            cfg,
            scope;

        self._observable    = new Observable;

        extend(self, self._observable.getApi());

        self.cfg            = cfg = extend({}, fieldDefaults,
                fixFieldShorthands(Validator.fieldDefaults),
                fixFieldShorthands(options),
                true
        );

        self.input          = new Input(elem, self.onInputChange, self, self.onInputSubmit);

        self.elem           = elem;
        self.vldr           = vldr;
        self.callbackScope  = scope = cfg.callback.scope;
        self.enabled        = !elem.disabled;
        self.id             = elem.getAttribute('name') || elem.getAttribute.attr('id');
        self.data           = options.data;
        self.rules			= {};

        cfg.messages        = extend({}, messages, Validator.messages, cfg.messages, true);

        elem.setAttribute("data-validator", vldr.getVldId());

        if (self.input.radio) {
            self.initRadio();
        }

        for (var i in cfg.callback) {
            if (cfg.callback[i]) {
                self.on(i, cfg.callback[i], scope);
            }
        }

        if (cfg.rules) {
            self.setRules(cfg.rules, false);
        }

        self.readRules();

        self.prev 	= self.input.getValue();

        if (cfg.disabled) {
            self.disable();
        }
    };

    extend(Field.prototype, {

        vldr:           null,
        elem:           null,
        rules:          null,
        cfg:            null,
        callbackScope:  null,

        input:          null,

        enabled:		true,
        valid:			null,			// the field has been checked and is valid (null - not checked yet)
        dirty:			false,			// the field's value changed, hasn't been rechecked yet
        id:				null,
        prev:			'',
        error:			null,
        errorRule:      null,
        pending: 		null,
        rulesNum:		0,
        displayState:	false,
        data:			null,
        checking:		false,
        checkTmt:		null,
        errorBox:       null,
        customError:    false,

        getValidator: function() {
            return this.vldr;
        },

        initRadio: function() {

            var self    = this,
                radios  = self.input.radio,
                vldId   = self.vldr.getVldId(),
                i,l;

            for(i = 0, l = radios.length; i < l; i++) {
                radios[i].setAttribute("data-validator", vldId);
            }
        },

        /**
         * Set/add field rules
         */
        setRules: function(list, check) {

            var self    = this;

            check = check == undefined ? true : check;

            for (var i in list) {
                self.setRule(i, list[i], false);
            }

            if (check) {
                self.check(false);
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Set/add field rule
         */
        setRule: function(rule, value, check) {

            var self    = this,
                rules   = self.rules;

            check = check == undefined ? true : check;

            if (value === null) {
                if (rules[rule]) {
                    self.rulesNum--;
                }
                delete rules[rule];
            }
            else {
                if (!rules[rule]) {
                    self.rulesNum++;
                }
                rules[rule] = value;
                if (self.valid !== null) {
                    self.setValidState(false);
                }
            }

            if (check) {
                self.check(false);
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Set rule message
         */
        setMessage: function(rule, message) {
            this.cfg.messages[rule] = message;
            return this;
        },

        /**
         * Set rule messages
         */
        setMessages: function(messages) {

            var self = this;

            for (var i in messages) {
                self.setMessage(i, messages[i]);
            }
            return self;
        },

        /**
         * Get rule messages
         */
        getMessages: function() {
            return extend({}, this.cfg.messages);
        },

        /**
         * Read rules from attributes and classes
         * (this happens on init)
         */
        readRules: function() {

            var self        = this,
                elem        = self.elem,
                cls 		= elem.className,
                found		= {},
                val, i, name, len;

            for (i in methods) {

                if (methods.hasOwnProperty(i)) {

                    val = elem.getAttribute(i) || elem.getAttribute("data-validate-" + i);

                    if (val === null || val == undefined || val === false) {
                        continue;
                    }
                    if ((i == 'minlength' || i == 'maxlength') && parseInt(val, 10) == -1) {
                        continue;
                    }

                    found[i] = val;

                    val = elem.getAttribute("data-message-" + i);
                    val && self.setMessage(i, val);
                }
            }

            if ((val = elem.getAttribute('remote'))) {
                found['remote'] = val;
            }

            if (cls) {
                cls = cls.split(" ");
                for (i = 0, len = cls.length; i < len; i++) {

                    name = trim(cls[i]);

                    if (methods[name] || name == 'remote') {
                        found[name] = true;
                    }
                }
            }

            for (i in found) {
                self.setRule(i, found[i], false);
            }
        },

        /**
         * Get field rules
         */
        getRules: function() {
            return this.rules;
        },

        /**
         * @return boolean
         */
        hasRule: function(name) {
            return this.rules[name] ? true : false;
        },

        /**
         * Get field value
         */
        getValue: function() {
            return this.input.getValue();
        },

        /**
         * Get user data
         */
        getUserData: function() {
            return this.data;
        },


        /**
         * Set user data
         */
        setUserData: function(data) {
            var self    = this,
                old     = self.data;
            self.data = data;
            return old;
        },

        /**
         * @returns boolean
         */
        isEmpty: function() {
            var self = this;
            return empty(self.getValue(), self.elem);
        },

        /**
         * Enable field validation
         */
        enable: function() {
            var self = this;
            self.enabled = true;
            self.vldr.reset();
            return self;
        },

        /**
         * Disable field validation
         */
        disable: function() {
            var self = this;
            self.enabled = false;

            if (self.valid === false) {
                self.setValidState(true);
                self.doDisplayState();
            }
            return self;
        },

        enableDisplayState:	function() {
            this.displayState = true;
        },

        disableDisplayState:	function() {
            this.displayState = false;
        },

        isDisplayStateEnabled: function() {
            return this.displayState;
        },


        toggleErrorBox: function(state) {

            var self    = this,
                cfg     = self.cfg,
                prev    = cfg.errorBox.enabled;

            cfg.errorBox.enabled = state;

            if (!prev && state && state.displayState && self.valid() === false) {
                self.doDisplayState();
            }
        },

        isEnabled: function() {
            return this.enabled;
        },

        getElem: function() {
            return this.elem;
        },

        getName: function() {
            return this.id;
        },

        getError: function() {
            return this.error;
        },

        getErrorRule: function() {
            return this.errorRule;
        },

        isValid: function() {

            var self = this;

            if (!self.isEnabled()) {
                return true;
            }
            if (self.customError) {
                return false;
            }

            return (self.valid === true && !self.pending) || self.rulesNum === 0;
        },

        getExactValidState: function() {
            return this.valid;
        },

        setCustomError:	function(error, rule) {
            var self = this;
            self.customError = error ? true : false;
            self.setValidState(error ? false : true);
            self.setError(error === true ? null : error, rule);
            self.doDisplayState();
        },

        reset: function() {

            var self = this;

            self.abort();
            self.dirty 	= false;
            self.prev 	= '';

            self.setValidState(null);
            self.setError(null);
            self.doDisplayState();

            return self;
        },

        /**
         * Abort ajax check
         */
        abort: function() {
            var self = this;
            if (self.pending) {
                self.pending.abort();
                self.pending = null;
            }
            return self;
        },

        check: function(force) {

            var self = this,
                rules = self.rules,
                cfg = self.cfg,
                elem = self.elem;

            // disabled field validator always returns true
            if (!self.isEnabled()) {
                return true;
            }

            if (self.customError) {
                return false;
            }

            // if there are no rules, we return true
            if (self.rulesNum == 0 && self.valid !== false) {
                return true;
            }

            if (self.checking) {
                if (!self.checkTmt) {
                    self.checkTmt	= setTimeout(bind(self.checkTimeout, self), 100);
                }
                return self.valid === true;
            }

            self.checking = true;

            // nothing changed since last check
            // we need to find a way to indicate that (if) this field depends on others
            // and state.dirty doesn't really work in this case
            if (force !== true &&
                !rules.equalTo && !rules.notEqualTo &&
                !self.dirty && self.valid !== null &&
                !cfg.alwaysCheck) {

                if (!self.pending) {
                    self.doDisplayState();
                }

                self.checking = false;
                return self.valid === true;
            }

            var valid 			= true,
                remote 			= false,
                val				= self.getValue(),
                msg;

            for (var i in rules) {

                // we always call remote check after all others
                if (i == 'remote') {
                    if (self.dirty || cfg.alwaysCheck || self.valid === null || force === true) {
                        if (val || rules[i].checkEmpty) {
                            remote = true;
                        }
                    }
                    continue;
                }

                var fn = typeof rules[i] == "function" ? rules[i] : methods[i];

                if ((msg = fn.call(self.callbackScope, val, elem, rules[i], self)) !== true) {
                    valid = false;
                    self.setError(format(msg || cfg.messages[i] || "", rules[i]), i);
                    break;
                }
            }

            remote	= remote && valid;

            if (valid) {
                self.setError(null);
            }

            if (!remote) {
                self.setValidState(valid);
                self.doDisplayState();
            }
            else {
                self.ajaxCheck();
            }

            self.dirty = false;
            self.checking = false;

            self.trigger("check", self, self.valid);

            return self.valid === true && !remote;
        },

        doDisplayState: function() {

            var self        = this,
                cfg         = self.cfg,
                valid 		= self.isValid(),
                errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid,
                elem        = self.elem;

            if (!self.displayState && !cfg.alwaysDisplayState) {
                valid	= null;
            }

            if (self.valid === null) {
                valid 	= null;
            }

            if (errorCls) {
                valid === false ? addClass(elem, errorCls) : removeClass(elem, errorCls);
            }
            if (validCls) {
                valid === true ? addClass(elem, validCls) : removeClass(elem, validCls);
            }

            var box 	= self.getErrorBox(),
                error 	= self.error;

            if (box) {
                if (valid === false && error) {
                    box.innerHTML = state.error;
                }
                box.style.display = valid !== false || !error || !cfg.errorBox.enabled ? 'none' : 'block';
            }

            self.trigger('displaystate', self, valid, self.error);
        },

        /**
         * @returns jQuery
         */
        getErrorBox: function() {

            var self        = this,
                cfg         = self.cfg,
                eb			= cfg.errorBox;

            if (eb.tag || eb.fn || eb.selector) {
                if (!self.errorBox && eb.enabled) {
                    self.createErrorBox();
                }
                return self.errorBox;
            }
            else {
                return null;
            }
        },


        destroy: function() {

            var self = this;

            self.trigger('destroy', self);

            self.elem.removeAttribute("data-validator");

            if (self.errorBox) {
                self.errorBox.parentNode.removeChild(self.errorBox);
            }

            self.input.destroy();
            delete self.input;

            self._observable.destroy();

            delete self._observable;
            delete self.vldr;
            delete self.cfg;
            delete self.errorBox;
            delete self.rules;
            delete self.elem;
        },


        isPending: function() {
            return this.pending !== null;
        },

        setValidState: function(valid) {

            var self = this;

            if (self.valid !== valid) {
                self.valid = valid;
                self.trigger('statechange', self, valid);
            }
        },


        setError:		function(error, rule) {

            var self = this;

            if (self.error != error || self.errorRule != rule) {
                self.error = error;
                self.errorRule = rule;
                self.trigger('errorchange', self, error, rule);
            }
        },


        checkTimeout: function() {

            var self = this;

            self.checkTmt = null;
            if (self.checking) {
                return;
            }
            self.check(false);
        },

        onInputChange: function(val) {

            var self    = this,
                prev    = self.prev;

            if (prev !== val) {
                self.dirty = true;
                self.customError = false;
                self.abort();
                if (!self.pending) {
                    self.check(false);
                }

                self.prev = self.input.getValue();
            }
        },

        onInputSubmit: function(e) {

            e = normalizeEvent(e);

            if (!e.isDefaultPrevented || !e.isDefaultPrevented()) {
                var res = this.trigger("submit", this, e);
                if (res === false) {
                    e.preventDefault();
                    return false;
                }
            }
        },

        createErrorBox: function() {

            var self    = this,
                cfg     = self.cfg,
                eb		= cfg.errorBox,
                tag 	= eb.tag,
                cls		= eb.cls,
                fn		= eb.fn,
                pos		= eb.position,
                dom		= eb.elem;

            if (fn) {
                self.errorBox = fn.call(self.callbackScope, self);
            }
            else if(dom) {
                self.errorBox = dom;
            }
            else {
                self.errorBox = document.createElement(tag);
                self.errorBox.className = cls;

                var r = self.input.radio,
                    f = r ?
                        r[r - 1] :
                        self.elem;

                if (pos == 'appendParent') {
                    f.parentNode.appendChild(self.errorBox);
                }
                else if (pos == "before") {
                    f.parentNode.insertBefore(self.errorBox, f);
                }
                else {
                    f.parentNode.insertBefore(self.errorBox, f.nextSibling);
                }
            }
        },

        ajaxCheck: function() {

            var self    = this,
                rules   = self.rules,
                elem    = self.elem,
                rm		= rules['remote'],
                val 	= self.getValue(),
                cfg     = self.cfg;

            var ajax 	= extend({}, typeof rm == 'string' ? {url: rm} : rm, true);

            //ajax.success 	= self.onAjaxSuccess;
            //ajax.error 		= self.onAjaxError;
            ajax.data 		= ajax.data || {};
            ajax.data[
                ajax.paramName ||
                elem.getAttribute('name') ||
                elem.getAttribute('id')] = val;

            if (!ajax.handler) {
                ajax.dataType 	= 'text';
            }

            ajax.cache 		= false;

            if (cfg.cls.ajax) {
                addClass(elem, cfg.cls.ajax);
            }

            self.trigger('beforeAjax', self, ajax);

            var ajaxFn = window.MetaphorJs ? MetaphorJs.ajax : jQuery.ajax;

            self.pending = ajaxFn(ajax);

            self.pending.done(bind(self.onAjaxSuccess, self));
            self.pending.fail(bind(self.onAjaxError, self));
        },

        onAjaxSuccess: function(data) {

            var self    = this,
                rules   = self.rules,
                cfg     = self.cfg;

            self.pending 	= null;
            var valid 		= true;

            if (rules['remote'].handler) {

                var res = rules['remote'].handler.call(self.callbackScope, self, data);

                if (res !== true) {
                    self.setError(format(res || cfg.messages['remote'] || "", rules['remote']), 'remote');
                    valid 		= false;
                }
            }
            else {
                if (data) {
                    self.setError(data, 'remote');
                    valid 		= false;
                }
                else {
                    self.setError(null);
                }
            }

            if (cfg.cls.ajax) {
                removeClass(self.elem, cfg.cls.ajax);
            }

            self.setValidState(valid);
            self.doDisplayState();
            self.trigger('afterAjax', self);
        },

        onAjaxError: function(xhr, status) {

            var self    = this,
                cfg     = self.cfg;

            if (cfg.cls.ajax) {
                removeClass(self.elem, cfg.cls.ajax);
            }

            self.pending = null;

            if (status != 'abort' && xhr != "abort") {
                self.setValidState(false);
                self.doDisplayState();
                self.trigger('afterAjax', self);
            }
        }
    });





    /* ***************************** GROUP ****************************************** */



    var groupDefaults	= /*group-options-start*/{

        alwaysCheck:		false,			// run tests even the field is proven valid and hasn't changed since last check
        alwaysDisplayState:	false,
        disabled:			false,			// initialize disabled

        value:				null,			// fn(api, vals)
        elem:				null,			// dom node
        errorBox:			null,			// fieldId|dom|jquery|selector|fn(api)
        // fn must return dom|jquery object
        errorField:			null,			// fieldId - relay errors to this field

        data:				null,

        cls: {
            valid: 			'',				// css class for a valid form
            error:			''				// css class for a not valid form
        },

        fields:				[],
        rules:				{},
        messages:			{},

        callback:		{

            scope:			null,

            destroy:		null,
            statechange:	null,
            errorchange:	null,
            displaystate:	null
        }
    }/*group-options-end*/;



    var Group       = function(options, vldr) {

        options     = options || {};

        var self            = this,
            cfg,
            scope;

        self._observable    = new Observable;
        self._vldr          = vldr;

        extend(self, self._observable.getApi());

        self.cfg            = cfg = extend({},
                                groupDefaults,
                                Validator.groupDefaults,
                                options,
                                true
        );

        self.callbackScope  = scope = cfg.callback.scope;

        self.data           = options.data;

        self.el             = options.elem;


        self.fields         = {};
        self.rules		    = {};

        cfg.messages        = extend({}, messages, Validator.messages, cfg.messages, true);


        var i, len;

        if (cfg.callback) {
            for (i in cfg.callback) {
                if (cfg.callback[i]) {
                    self.on(i, cfg.callback[i], scope);
                }
            }
        }

        if (cfg.rules) {
            self.setRules(cfg.rules, false);
        }

        if (cfg.fields) {
            for (i = 0, len = options.fields.length; i < len; i++) {
                self.add(vldr.getField(cfg.fields[i]));
            }
        }

        self.enabled = !cfg.disabled;
    };

    extend(Group.prototype, {

        fields:         null,
        rules:          null,
        cfg:            null,
        callbackScope:  null,
        vldr:           null,
        enabled:		false,
        invalid:		null,
        valid:			null,
        displayState:	false,
        rulesNum:	    0,
        error:			null,
        data:			null,
        errorBox:		null,
        el:			    null,

        /**
         * Enable group
         */
        enable:		function() {
            this.enabled	= true;
            return this;
        },

        /**
         * Disable group
         */
        disable:	function() {
            this.enabled	= false;
            return this;
        },

        /**
         * Is group enabled
         * @return {boolean}
         */
        isEnabled:	function() {
            return this.enabled;
        },

        /**
         * Are all fields in this group valid
         * @return {boolean}
         */
        isValid:		function() {
            var self = this;
            return !self.enabled || (self.invalid === 0 && self.valid === true);
        },

        /**
         * @return {boolean|null}
         */
        getExactValidState: function() {
            return this.valid;
        },

        /**
         * Reset group
         */
        reset:		function() {
            var self = this;
            self.invalid	= 0;
            self.setValidState(null);
            self.setError(null);
            self.doDisplayState();
            return self;
        },

        /**
         * Get user data specified in group config
         */
        getUserData: function() {
            return this.data;
        },

        /**
         * Get group name
         */
        getName: function() {
            return this.cfg.name;
        },

        /**
         * Set group's rules
         * @param {object} list {rule: param}
         * @param {bool} check
         */
        setRules: 	function(list, check) {

            var self = this;

            check = check == undefined ? true : check;

            for (var i in list) {
                self.setRule(i, list[i], false);
            }

            if (check) {
                self.check();
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * @param rule
         * @param value
         * @param check
         */
        setRule:	function(rule, value, check) {

            var self = this,
                rules = self.rules;

            check = check == undefined ? true : check;

            if (value === null) {
                if (rules[rule]) {
                    self.rulesNum--;
                }
                delete rules[rule];
            }
            else {
                if (!rules[rule]) {
                    self.rulesNum++;
                }
                rules[rule] = value;
                if (self.valid !== null) {
                    self.setValidState(false);
                }
            }

            if (check) {
                self.check();
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Get group rules
         * @returns {name: value}
         */
        getRules:	function() {
            return extend({}, this.rules);
        },

        /**
         * @returns boolean
         */
        hasRule:	function(name) {
            return this.rules[name] ? true : false;
        },

        /**
         * Set group custom error
         */
        setError:	function(error) {

            var self = this,
                cfg = self.cfg;

            if (self.error != error) {

                if (cfg.errorField) {
                    self.vldr.getField(cfg.errorField).setError(error);
                    self.error = null;
                }
                else {
                    self.error = error;
                    self.trigger('errorchange', self, error);
                }
            }
        },

        /**
         * Get current error
         */
        getError: function() {
            return this.error;
        },

        /**
         * @returns {id: field}
         */
        getFields: function() {
            return this.fields;
        },

        enableDisplayState:		function() {
            this.displayState	= true;
            return this;
        },

        disableDisplayState:	function() {
            this.displayState	= false;
            return this;
        },

        check: function() {

            var self    = this,
                cfg     = self.cfg,
                fields  = self.fields,
                rules   = self.rules;

            if (!self.enabled || self.rulesNum == 0) {
                self.setValidState(null);
                self.doDisplayState();
                return true;
            }

            self.countInvalid();

            if (self.invalid > 0) {
                self.setValidState(null);
                self.doDisplayState();
                return true;
            }

            var vals	= {},
                valid	= true,
                val		= null,
                msg,
                i;

            if (cfg.value) {

                for (i in fields) {
                    vals[i]	= fields[i].getValue();
                }

                val	= cfg.value.call(self.callbackScope, vals, self);
            }

            for (i in rules) {

                var fn = typeof rules[i] == "function" ? rules[i] : methods[i];

                if ((msg = fn.call(self.callbackScope, val, null, rules[i], self, vals)) !== true) {

                    valid = false;

                    if (msg || cfg.messages[i]) {
                        self.setError(format(msg || cfg.messages[i] || "", rules[i]));
                    }
                    else {
                        self.setError(null);
                    }

                    break;
                }

            }

            if (valid) {
                self.setError(null);
            }

            self.setValidState(valid);
            self.doDisplayState();

            return self.valid === true;
        },

        doDisplayState:			function() {

            var self    = this,
                valid	= self.valid,
                cfg     = self.cfg;

            if (!self.displayState && !cfg.alwaysDisplayState) {
                valid	= null;
            }

            if (cfg.errorBox) {

                var ebox = self.getErrorBox();

                if (valid !== null) {

                    if (ebox) {
                        ebox.innerHTML = self.error || '';
                        ebox.style.display = self.valid === false ? 'block' : 'none';
                    }
                }
                else {
                    if (ebox) {
                        ebox.style.display = "none";
                    }
                }
            }

            var errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid;

            valid = self.valid;

            if (errorCls) {
                valid === false ? addClass(self.el, errorCls) : removeClass(self.el, errorCls);
            }
            if (validCls) {
                valid === true ? addClass(self.el, validCls) : removeClass(self.el, validCls);
            }

            self.trigger('displaystate', self, self.valid);
        },

        /**
         * @returns {Element}
         */
        getErrorBox: function() {

            var self    = this,
                cfg     = self.cfg,
                fields  = self.fields,
                eb	    = cfg.errorBox;

            if (fields[eb]) {
                return fields[eb].getErrorBox();
            }
            else if (!self.errorBox) {

                if (typeof cfg.errorBox == "function") {
                    self.errorBox	= cfg.errorBox.call(self.callbackScope, self);
                }
                else {
                    self.errorBox	= cfg.errorBox;
                }
            }

            return self.errorBox;
        },


        /**
         * Destroy group
         */
        destroy:	function() {

            var self    = this,
                fields  = self.fields;

            for (var i in fields) {
                if (fields[i]) {
                    self.setFieldEvents(fields[i], 'un');
                    delete fields[i];
                }
            }

            if (self.errorBox) {
                self.errorBox.parentNode.removeChild(self.errorBox);
            }

            self._observable.destroy();
            delete self._observable;
            delete self.vldr;
            delete self.rules;
            delete self.fields;
            delete self.cfg;
        },

        add:		function(field) {

            var self    = this,
                fields  = self.fields,
                id	    = field.getName();

            if (!fields[id]) {
                fields[id] 	= field;

                self.setFieldEvents(field, 'on');
            }
        },

        setFieldEvents:		function(f, mode) {
            var self = this;
            f[mode]('statechange', self.onFieldStateChange, self);
        },

        remove:		function(field) {

            var self    = this,
                fields  = self.fields,
                id	    = field.getName();

            if (fields[id]) {
                delete fields[id];
                self.setFieldEvents(field, 'un');
            }

            return self;
        },

        setValidState:			function(valid) {
            var self = this;
            if (self.valid !== valid) {
                self.valid = valid;
                self.trigger('statechange', self, valid);
            }
        },

        countInvalid:			function() {

            var self = this,
                fields = self.fields;

            self.invalid	= 0;
            for (var i in fields) {
                self.invalid += fields[i].isValid() ? 0 : 1;
            }
        },

        onFieldStateChange:		function(f, valid) {
            var self = this;
            self.trigger("fieldstatechange", self, f, valid);
            self.check();
        }
    });





    /* ***************************** FORM ****************************************** */


    var defaults = /*validator-options-start*/{

        form:               null,           // form element -- jquery

        all: 				{},				// {} of field properties which work as a preset
        fields: 			{},				// {field: properties}
        rules: 				{},				// {field: rules}

        cls: {
            valid: 			'',				// css class for a valid form
            error:			'',				// css class for a not valid form
            checking:		''				// css class for a form while it is being checked with ajax request
        },

        groups: 			{},				// see groupDefaults. {name: cfg}

        // callbacks are case insensitive
        // you can use camel case if you like.
        callback: {

            scope:			null,

            destroy:		null,			// when validator is being destroyd. fn(api)
            reset:			null,			// when the form was resetted. fn(api)
            beforesubmit:	null,			// when form is about to be submitted: valid and non-valid. fn(api)
            submit:			null,			// when form is about to be submitted: only valid. fn(api).
            // return false to prevent submitting
            statechange:	null,			// when form's state has been changed. fn(api, state)
            check:			null,			// fn(api) performe some additional out-of-form checks
            // if false is returned, form becomes invalid

            displaystate:	null,			// fn(api, valid)
            displaystatechange:	null		// fn(api, state)
        }
    }/*validator-options-end*/;


    var Validator = function(el, preset, options) {

        var self    = this,
            tag     = el.nodeName.toLowerCase(),
            cfg,
            scope;

        self.vldId  = ++vldId;

        validators[self.vldId] = self;

        el.setAttribute("data-validator", self.vldId);

        self.el     = el;

        if (preset && typeof preset != "string") {
            options         = preset;
            preset          = null;
        }

        self._observable    = new Observable;
        self.cfg            = cfg = extend({}, defaults, Validator.defaults, Validator[preset], options, true);
        self.callbackScope  = scope = cfg.callback.scope;

        self.isForm         = tag == 'form';
        self.isField        = /input|select|textarea/.test(tag);

        self.fields         = {};
        self.groups         = {};

        extend(self, self._observable.getApi());

        self.onRealSubmitClickDelegate  = bind(self.onRealSubmitClick, self);
        self.resetDelegate = bind(self.reset, self);
        self.onSubmitClickDelegate = bind(self.onSubmitClick, self);
        self.onFormSubmitDelegate = bind(self.onFormSubmit, self);

        delete cfg.callback.scope;

        var i, c;

        for (c in cfg.callback) {
            self.on(c, cfg.callback[c], scope);
        }

        self.initFields();

        var fields  = self.fields;

        for (i in cfg.rules) {
            if (!fields[i]) {
                continue;
            }
            fields[i].setRules(cfg.rules[i], false);
        }

        cfg.rules	= null;

        for (i in cfg.groups) {
            self.addGroup(i, cfg.groups[i]);
        }

        self.initForm('bind');

        delete cfg.rules;
        delete cfg.fields;
        delete cfg.groups;

        self.enabled = true;
    };

    extend(Validator.prototype, {

        vldId:          null,
        el:             null,
        cfg:            null,
        enabled: 		false,
        invalid:		null,					// array of invalid fields
        pending: 		0,						// number of pending requests
        grps:			0,						// number of invalid groups
        outside:		true,					// true - outside check passed or not present
        submitted:		false,
        displayState:	false,
        isForm: 		false,
        isField: 		false,
        submitButton: 	null,
        hidden:			null,
        callbackScope:  null,

        _observable:    null,

        fields:         null,
        groups:         null,

        getVldId:       function() {
            return this.vldId;
        },

        /**
         * @returns {Element}
         */
        getElem:        function() {
            return this.el;
        },

        /**
         * @return {Group}
         */
        getGroup: function(name) {
            return this.groups[name] || null;
        },

        /**
         * @return {Field}
         */
        getField:	function(id) {
            return this.fields[id] || null;
        },

        /**
         * Enable validator
         */
        enable: function() {
            this.enabled = true;
            return this;
        },

        /**
         * Disable validator
         */
        disable: function() {
            this.enabled = false;
            return this;
        },

        /**
         * @return boolean
         */
        isEnabled: function() {
            return this.enabled;
        },

        enableDisplayState:	function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups,
                i;

            if (self.displayState !== true) {

                self.displayState = true;

                for (i in fields) {
                    fields[i].enableDisplayState();
                }
                for (i in groups) {
                    groups[i].enableDisplayState();
                }

                self.trigger('displaystatechange', self, true);
            }

            return self;
        },

        disableDisplayState:	function() {

            var self    = this,
                groups  = self.groups,
                fields  = self.fields,
                i;

            if (self.displayState !== false) {

                self.displayState = false;

                for (i in fields) {
                    fields[i].disableDisplayState();
                }
                for (i in groups) {
                    groups[i].disableDisplayState();
                }

                self.trigger('displaystatechange', self, false);
            }

            return self;
        },

        /**
         * @return {boolean}
         */
        isDisplayStateEnabled:	function() {
            return this.displayState;
        },


        /**
         * Is form valid
         * @return {boolean}
         */
        isValid: function() {

            var self    = this;

            if (self.enabled === false) {
                return true;
            }
            return 	self.invalid === 0 &&
                      self.pending === 0 &&
                      self.grps === 0 &&
                      self.outside === true;
        },

        getErrors: function(plain) {

            var self    = this,
                ers     = plain == true ? [] : {},
                err,
                i, j,
                all     = [self.fields, self.groups],
                curr;

            if (!self.isEnabled()) {
                return ers;
            }

            for (j = 0; j < 2; j++) {

                curr = all[j];

                for (i in curr) {
                    if (curr[i].getExactValidState() === null) {
                        curr[i].check();
                    }

                    if (!curr[i].isValid()) {

                        err = curr[i].getError();

                        // it can be invalid, but have no error
                        if (err) {
                            if (plain) {
                                ers.push(err);
                            }
                            else {
                                ers[i] = err;
                            }
                        }
                    }
                }
            }

            return ers;
        },


        /**
         * Check form for errors
         */
        check: function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups;

            // disabled field validator always returns true
            if (!self.isEnabled()) {
                return true;
            }

            var prevValid	= self.isValid(),
                nowValid,
                i;

            for (i in fields) {
                fields[i].check();
            }

            for (i in groups) {
                groups[i].check();
            }

            self.outside 	= self.trigger('check', self) !== false;
            nowValid		= self.isValid();

            if (prevValid != nowValid) {
                self.doDisplayState();
                self.trigger('statechange', self, false);
            }

            return nowValid;
        },


        /**
         * Add field
         */
        add: function(node, fieldCfg) {

            var self    = this;

            if (!isField(node)) {
                return self;
            }
            if (node.getAttribute("data-no-validate") !== null) {
                return self;
            }
            if (node.getAttribute("data-validator") !== null) {
                return self;
            }

            var id 			= node.getAttribute('name') || node.getAttribute('id'),
                cfg         = self.cfg,
                fields      = self.fields,
                fcfg,
                name,
                f;

            if (!id) {
                return self;
            }

            fcfg 	= cfg.fields && cfg.fields[id] ? cfg.fields[id] : (fieldCfg || {});

            if (typeof fcfg == 'string') {
                fcfg 	= {rules: [fcfg]};
            }

            fcfg 	= extend({}, cfg.all || {}, fcfg, true);

            if (fcfg.ignore) {
                return self;
            }

            if (!fcfg.callback) {
                fcfg.callback = {
                    scope:	self.callbackScope
                };
            }

            f       = new Field(node, fcfg, self);
            fcfg    = null;
            id      = f.getName();

            if (fields[id]) {
                return self; // already added
            }

            fields[id] = f;

            self.setFieldEvents(f, 'on');

            if (self.displayState) {
                f.enableDisplayState();
            }

            if (self.isEnabled() && self.invalid !== null) {
                f.check();
            }

            return self;
        },

        /**
         * Add group of fields
         */
        addGroup:		function(name, cfg) {

            var self    = this,
                groups  = self.groups;

            if (!groups[name]) {

                cfg.name		= name;

                groups[name]	= new Group(cfg, self);
                self.setGroupEvents(groups[name], 'on');

                if (self.isEnabled() && self.invalid !== null) {
                    groups[name].check();
                }
            }
        },


        /**
         * Focus first invalid field
         */
        focusInvalid: function() {
            var fields  = this.fields;
            for (var i in fields) {
                if (!fields[i].isValid()) {
                    fields[i].getElem().focus();
                    return;
                }
            }
        },


        /**
         * Reset validator
         */
        reset: function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups,
                i;

            self.submitted 	= false;

            self.disableDisplayState();

            for (i in groups) {
                groups[i].reset();
            }

            for (i in fields) {
                fields[i].reset();
            }

            self.pending 		= 0;
            self.invalid 		= null;
            self.grps			= 0;
            self.outside		= false;

            self.doDisplayState();
            self.trigger('reset', self);

            return self;
        },


        /**
         * Submit form
         */
        submit: function() {

            var self    = this,
                el      = self.el;

            if (!self.isForm) {
                self.onSubmit();
                return;
            }

            if (typeof el.submit == "function") {

                if (self.trigger('beforesubmit', self) !== false &&
                    self.trigger('submit', self) !== false) {
                    el.submit();
                }
            }
            else {
                self.onSubmit();
            }
        },

        setFieldEvents: function(v, mode) {
            var self    = this;
            v[mode]('statechange', self.onFieldStateChange, self);
            v[mode]('beforeAjax', self.onBeforeAjax, self);
            v[mode]('afterAjax', self.onAfterAjax, self);
            v[mode]('submit', self.onFieldSubmit, self);
            v[mode]('destroy', self.onFieldDestroy, self);
        },

        setGroupEvents:	function(g, mode) {
            g[mode]('statechange', this.onGroupStateChange, this);
        },


        initFields: function() {

            var self    = this,
                el      = self.el,
                els, i, l;

            if (self.isField) {
                self.add(el);
                return self;
            }

            els = select("input, textarea, select", el);

            for (i = -1, l = els.length; ++i < l; self.add(els[i])){}

            return self;
        },

        initForm: function(mode) {

            var self    = this,
                el      = self.el,
                nodes   = el.getElementsByTagName("input"),
                submits = select(".submit", el),
                resets  = select(".reset", el),
                fn      = mode == "bind" ? addListener : removeListener,
                i, l,
                type,
                node;

            for (i = 0, l = nodes.length; i < l; i++) {
                node = nodes[i];
                type = node.type;
                if (type == "submit") {
                    fn(node, "click", self.onRealSubmitClickDelegate);
                }
                else if (type == "reset") {
                    fn(node, "click", self.resetDelegate);
                }
            }

            for (i = -1, l = submits.length;
                 ++i < l;
                 submits[i].type != "submit" && fn(submits[i], "click", self.onSubmitClickDelegate)
                ){}

            for (i = -1, l = resets.length;
                 ++i < l;
                 resets[i].type != "reset" && fn(resets[i], "click", self.resetDelegate)
                ){}

            if (self.isForm) {
                fn(el, "submit", self.onFormSubmitDelegate);
            }
        },

        onRealSubmitClick: function(e) {
            e = normalizeEvent(e || window.event);
            this.submitButton  = e.target || e.srcElement;
            return this.onSubmit(e);
        },

        onSubmitClick: function(e) {
            return this.onSubmit(normalizeEvent(e || window.event));
        },

        onFormSubmit: function(e) {
            e = normalizeEvent(e);
            if (!this.isValid()) {
                e.preventDefault();
                return false;
            }
            //return this.onSubmit(normalizeEvent(e || window.event));
        },

        onFieldSubmit: function(fapi, e) {

            var self    = this;

            self.enableDisplayState();
            self.submitted = true;

            return self.onSubmit(e);
        },

        onSubmit: function(e) {

            var self    = this;

            self.enableDisplayState();

            if (self.pending) {
                e && e.preventDefault();
                return false;
            }

            var buttonClicked = self.submitButton ? true : false;

            if (self.isForm) {

                if (self.hidden) {
                    self.el.removeChild(self.hidden);
                    self.hidden = null;
                }

                // submit button's value is only being sent with the form if you click the button.
                // since there can be a delay due to ajax checks and the form will be submitted later
                // automatically, we need to create a hidden field
                if (self.submitButton && /input|button/.test(self.submitButton.nodeName)) {
                    self.hidden = document.createElement("input");
                    self.hidden.type = "hidden";
                    self.hidden.setAttribute("name", self.submitButton.name)
                    self.hidden.value = self.submitButton.value;
                    self.el.appendChild(self.hidden);
                }
            }

            self.submitButton = null;

            if (!self.isValid()) {
                self.check();
                self.onFieldStateChange();

                if (self.pending) {
                    e && e.preventDefault();
                    return false;
                }
            }

            if (self.trigger('beforesubmit', self) === false || !self.isValid()) {

                if (e) {

                    e.preventDefault();
                    e.stopPropagation();
                }

                if (!self.pending) {
                    self.focusInvalid();
                    self.submitted = false;
                }

                self.trigger('failedsubmit', self, buttonClicked);
                return false;
            }

            if (!self.pending) {
                self.submitted = false;
            }

            return self.trigger('submit', self) !== false;
        },

        onFieldDestroy: function(f) {

            var elem 	= f.getElem(),
                id		= elem.getAttribute('name') || elem.getAttribute('id');

            delete this.fields[id];
        },

        onFieldStateChange: function(f, valid) {

            var self        = this,
                num 		= self.invalid,
                fields      = self.fields;

            self.invalid 	= 0;

            for (var i in fields) {
                self.invalid += fields[i].isValid() ? 0 : 1;
            }

            if (f) {
                self.trigger('fieldstatechange', self, f, valid);
            }

            if (num === null || (num !== null && self.invalid !== num)) {
                self.doDisplayState();
                self.trigger('statechange', self, self.isValid());
            }
        },

        onGroupStateChange:	function() {

            var self        = this,
                groups      = self.groups,
                num 		= self.grps;

            self.grps 	= 0;

            for (var i in groups) {
                self.grps += groups[i].isValid() ? 0 : 1;
            }

            if (num === null || (num !== null && self.grps !== num)) {
                self.doDisplayState();
                self.trigger('statechange', self, self.isValid());
            }
        },

        doDisplayState: function() {

            var self        = this,
                cfg         = self.cfg,
                valid 		= self.isValid(),
                errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid,
                el          = self.el;

            if (self.isField || !self.displayState) {
                valid		= null;
            }

            if (self.invalid === null) {
                valid = null;
            }

            if (errorCls) {
                valid === false ? addClass(el, errorCls) : removeClass(el, errorCls);
            }
            if (validCls) {
                valid === true ? addClass(el, validCls) : removeClass(el, validCls);
            }

            self.trigger('displaystate', self, valid);
        },

        onBeforeAjax: function() {
            var self = this;
            self.pending++;
            if (self.cfg.cls.ajax) {
                addClass(self.el, self.cfg.cls.ajax);
            }
        },

        onAfterAjax: function() {

            var self    = this,
                fields  = self.fields,
                cfg     = self.cfg;

            self.pending = 0;

            for (var i in fields) {
                self.pending += fields[i].isPending() ? 1 : 0;
            }

            self.doDisplayState();

            if (cfg.cls.ajax) {
                removeClass(self.el, cfg.cls.ajax);
            }

            if (self.submitted && self.pending == 0) {
                self.submitted = false;

                if (self.isValid()) {
                    self.submit();
                }
                else {
                    self.focusInvalid();
                }
            }
        },


        /**
         * Destroy validator
         */
        destroy: function() {

            var self    = this,
                groups  = self.groups,
                fields  = self.fields,
                i;

            self.reset();
            self.trigger('destroy', self);

            delete validators[self.vldId];

            for (i in groups) {
                if (groups.hasOwnProperty(i) && groups[i]) {
                    self.setGroupEvents(groups[i], 'un');
                    groups[i].destroy();
                    delete groups[i];
                }
            }

            for (i in fields) {
                if (fields.hasOwnProperty(i) && fields[i]) {
                    self.setFieldEvents(fields[i], 'un');
                    fields[i].destroy();
                    delete fields[i];
                }
            }

            self._observable.destroy();
            delete self._observable;

            self.initForm('unbind');

            delete self.fields;
            delete self.groups;
            delete self.el;
            delete self.cfg;
        }

    });





    Validator.defaults 		    = {};
    Validator.messages 		    = {};
    Validator.fieldDefaults 	= {};
    Validator.groupDefaults 	= {};
    Validator.addMethod 		= function(name, fn, message) {
        if (!methods[name]) {
            methods[name] = fn;
            if (message) {
                Validator.messages[name] = message;
            }
        }
    };
    Validator.getValidator      = function(el) {
        var vldId = el.getAttribute("data-validator");
        return validators[vldId] || null;
    };

    if (window.MetaphorJs && MetaphorJs.ns) {
        MetaphorJs.ns.register("MetaphorJs.lib.Validator", Validator);
    }
    else {
        window.MetaphorJs   = window.MetaphorJs || {};
        MetaphorJs.lib      = MetaphorJs.lib || {};
        MetaphorJs.lib.Validator   = Validator;
    }


    /*
    jQuery.fn.metaphorjsValidator = function(options, instanceName) {

        var dataName    = "metaphorjsValidator",
            preset;

        if (typeof options == "string" && options != "destroy") {
            preset          = options;
            options         = arguments[1];
            instanceName    = arguments[2];
        }

        instanceName    = instanceName || "default";
        options         = options || {};
        dataName        += "-" + instanceName;

        this.each(function() {

            var o = $(this),
                v = o.data(dataName);

            if (options == "destroy") {
                if (v) {
                    v.destroy();
                    o.data(dataName, null);
                }
            }
            else {
                if (!v) {
                    options.form            = o;
                    options.instanceName    = instanceName;
                    o.data(dataName, new validator(preset, options));
                }
                else {
                    throw new Error("MetaphorJs validator is already instantiated for this html element");
                }
            }
        });
    };*/


}());



(function(){

    var Validator   = MetaphorJs.lib.Validator,
        bind        = MetaphorJs.bind,
        createFn    = MetaphorJs.lib.Watchable.createFunc,
        eachNode    = function(el, fn, fnScope) {
            var i, len,
                children = el.childNodes;

            if (fn.call(fnScope, el) !== false) {
                for(i =- 1, len = children.length>>>0;
                    ++i !== len;
                    eachNode(children[i], fn, fnScope)){}
            }
        },
        isField	= function(el) {
            var tag	= el.nodeName.toLowerCase(),
                type = el.type;
            if (tag == 'input' || tag == 'textarea' || tag == 'select') {
                if (type != "submit" && type != "reset") {
                    return true;
                }
            }
            return false;
        };

    MetaphorJs.define("MetaphorJs.view.Validator", {

        node: null,
        scope: null,
        validator: null,
        scopeState: null,

        initialize: function(node, scope) {

            var self        = this;

            self.node       = node;
            self.scope      = scope;
            self.scopeState = {};
            self.validator  = self.createValidator();

            self.initScope();
            self.initScopeState();
            self.initValidatorEvents();
        },

        createValidator: function() {
            var self    = this,
                node    = self.node,
                cfg     = {},
                submit;

            if (submit = node.getAttribute("mjs-validator-submit")) {
                cfg.callback = {};
                cfg.callback.submit = function(fn, scope){
                    return function() {
                        try {
                            fn(scope);
                        }
                        catch(thrownError) {
                            MetaphorJs.error(thrownError);
                        }
                    }
                }(createFn(submit), self.scope);
            }

            return new Validator(node, cfg);
        },

        initValidatorEvents: function() {

            var self    = this,
                v       = self.validator;

            v.on('fieldstatechange', self.onFieldStateChange, self);
            v.on('statechange', self.onFormStateChange, self);
            v.on('displaystatechange', self.onDisplayStateChange, self);
            v.on('reset', self.onFormReset, self);
        },

        initScope: function() {

            var self    = this,
                scope   = self.scope,
                node    = self.node,
                name    = node.getAttribute('name') || node.getAttribute('id') || '$form';

            scope[name] = self.scopeState;
        },

        initScopeState: function() {

            var self    = this,
                node    = self.node,
                state   = self.scopeState,
                els, el,
                i, l,
                name;

            if (node.elements) {
                els     = node.elements;
            }
            else {
                els     = [];
                eachNode(node, function(el) {
                    if (isField(el)) {
                        els.push(el);
                    }
                });
            }

            for (i = -1, l = els.length; ++i < l;) {
                el = els[i];
                name = el.getAttribute("name") || el.getAttribute('id');

                if (name && !state[name]) {
                    state[name] = {
                        $error: null,
                        $invalid: null,
                        $pristine: true,
                        $errorMessage: null
                    };
                }
            }

            state.$invalid = false;
            state.$pristine = true;
            state.$submit = bind(self.validator.onFormSubmit, self.validator);
        },

        onDisplayStateChange: function(vld, state) {

            var self    = this;

            if (!state) {
                self.onFormReset(vld);
            }
            else {
                var state   = self.scopeState,
                    i,f;

                for (i in state) {
                    f = state[i];
                    if (f.$real) {
                        state[i] = f.$real;
                    }
                }

                state.$invalid = !vld.isValid();
                state.$pristine = false;

                self.scope.$check();
            }

        },

        onFormReset: function(vld) {

            var self    = this,
                state   = self.scopeState,
                i,f;

            for (i in state) {
                f = state[i];
                f.$error = null;
                f.$errorMessage = null;
                f.$invalid = null;
                f.$pristine = true;
            }

            state.$invalid = false;
            state.$pristine = true;

            self.scope.$check();
        },

        onFormStateChange: function(vld, valid) {

            var self    = this,
                state   = self.scopeState;

            state.$invalid = valid === false && vld.isDisplayStateEnabled();
            state.$pristine = false;

            self.scope.$check();
        },

        onFieldStateChange: function(vld, field, valid) {

            var self    = this,
                state   = self.scopeState,
                name    = field.getName(),
                ds      = vld.isDisplayStateEnabled(),
                fstate  = {
                    $error: field.getErrorRule(),
                    $errorMessage: field.getError(),
                    $invalid: valid === false,
                    $pristine: field.getExactValidState() === null
                };

            if (ds) {
                state[name] = fstate;
            }
            else {
                state[name].$real = fstate;
            }

            self.scope.$check();
        }

    });

    var g = MetaphorJs.ns.get;

    MetaphorJs.registerAttributeHandler("mjs-validate", 250, function(scope, node, expr) {

        var cls     = expr || "MetaphorJs.view.Validator",
            constr  = g(cls);

        if (!constr) {
            MetaphorJs.error(new Error("Class '"+cls+"' not found"));
        }
        else {
            new constr(node, scope);
        }
    });
}());

