
require("../../lib/Expression.js");

var Directive = require("../../class/Directive.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    Input = require("metaphorjs-input/src/lib/Input.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function(){

var keys = {
    "enter": 13,
    "esc": 27,
    "backspace": 8
};

/*
value is always an array in the end:
[{keyCode: 1, handler: fn}, {...}]

DO NOT MIX {key}="{...}" with  {key.enter}="{...}"

NO:
{key}="{...}"
{key.enter}="{...}"

YES:
{key}="{...}"

or

{key}="[{...}]"
{key.enter}="{...}"

 */

Directive.registerAttribute("key", 1000, function(scope, node, expr, renderer, attr){

    var values = attr ? attr.values : null,
        parts, k, part, i, l;

    if (values) {

        parts = [];

        for (k in values) {
            part = values[k];

            if (keys[k]) {
                k = keys[k];
            }

            if (part.substr(0,1) === '{') {
                parts.push('{keyCode: ' + k + ', ' + part.substr(1));
            }
            else {
                parts.push('{keyCode: ' + k + ', handler: "' + part + '"}');
            }
        }
        expr = '[' + parts.join(',') + ']';
    }

    var allCfg = MetaphorJs.lib.Expression.parse(expr)(scope),
        uninstall = [];

    if (!isArray(allCfg)) {
        allCfg = [allCfg];
    }

    var createHandler = function(cfg) {

        var handler = cfg.handler;
        var context = cfg.context || scope;
        var h;

        delete cfg.handler;
        delete cfg.context;

        if (typeof handler === "string") {
            h = MetaphorJs.lib.Expression.parse(handler);
            handler = function(){
                return function(e) {
                    scope.$event = e;
                    h(scope);
                    scope.$event = null;
                    scope.$check();
                };
            }(scope);
        }

        Input.get(node).onKey(cfg, handler, context);

        return function() {
            Input.get(node).unKey(cfg, handler, context);
        };
    };

    for (i = 0, l = allCfg.length; i < l; i++) {
        uninstall.push(createHandler(allCfg[i]));
    }

    return function() {
        var i, l;
        for (i = 0, l = uninstall.length; i < l; i++) {
            uninstall[i]();
        }
        uninstall = null;
    };
});

}());