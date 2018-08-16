
var Directive = require("../../class/Directive.js"),
    toArray = require("metaphorjs/src/func/array/toArray.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    createFunc = require("metaphorjs-watchable/src/func/createFunc.js");

    /*
        Update scope on given event.
        Not exactly template's business, but still
    */
Directive.registerAttribute("update-on", 1000,
    function(scope, node, expr, renderer, attr){

    var values = attr ? attr.values : null,
        cfg = attr ? attr.config : {},
        parts, k, part,
        execFn;

    if (values) {

        parts = [];

        for (k in values) {
            part = values[k];
            parts.push("['" + k + "', " + part + ']');
        }
        expr = '[' + parts.join(',') + ']';
    }

    var cfgs = createGetter(expr)(scope);

    if (cfg.code) {
        var code = createFunc(cfg.code);
        execFn = function() {
            scope.$event = toArray(arguments);
            code(scope);
            scope.$event = null;
            scope.$check();
        };
    }
    else {
        execFn = scope.$check;
    }

    var toggle = function(mode) {

        var cfg, event, obj, i, l, fn;

        for (i = 0, l = cfgs.length; i < l; i++) {
            cfg = cfgs[i];
            event = cfg[0];
            obj = cfg[1];

            if (obj.$destroyed || obj.$destroying) {
                continue;
            }

            if (obj && event && (fn = (obj[mode] || obj['$' + mode]))) {
                fn.call(obj, event, execFn, scope);
            }
        }
    };

    toggle("on");

    return function() {
        if (toggle) {
            toggle("un");
            cfgs = null;
            toggle = null;
        }
    };
});