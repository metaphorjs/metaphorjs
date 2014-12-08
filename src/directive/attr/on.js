
var Directive = require("../../class/Directive.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js");

Directive.registerAttribute("mjs-on", 1000, function(scope, node, expr){

    var cfgs = createGetter(expr)(scope);

    var toggle = function(mode) {

        var cfg, event, obj, i, l, fn;

        for (i = 0, l = cfgs.length; i < l; i++) {
            cfg = cfgs[i];
            event = cfg[0];
            obj = cfg[1];

            if (obj && event && (obj[mode] || obj['$' + mode])) {
                fn = obj[mode] || obj['$' + mode];
                fn.call(obj, event, scope.$check, scope);
            }
        }
    };

    toggle("on");

    return function() {
        toggle("un");
        cfgs = null;
    };
});