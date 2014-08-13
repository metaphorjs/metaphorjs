

(function(){

    var Validator   = MetaphorJs.lib.Validator,
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
            return new Validator(this.node, this.scope);
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

                state.$invalid = vld.isValid();
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
            MetaphorJs.asyncError(new Error("Class '"+cls+"' not found"));
        }
        else {
            new constr(node, scope);
        }
    });
}());