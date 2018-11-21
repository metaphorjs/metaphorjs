
require("../../lib/Expression.js");
require("../../lib/Input.js");
require("../../lib/Config.js");

var Directive = require("../../app/Directive.js"),
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

Directive.registerAttribute("key", 1000, function(scope, node, config, renderer, attrSet){

    config.setProperty("value", {disabled: true});
    config.eachProperty(function(k, prop){
        if (k.indexOf('value.') === 0) {
            if (prop.expression.charAt(0) !== '{') {
                config.setProperty(k, {mode: MetaphorJs.lib.Config.MODE_FUNC});
            }
        }
    });
    config.lateInit();

    var createHandler = function(name, cfg) {

        if (typeof cfg === "function") {
            cfg = {handler: cfg};
        }

        var h = cfg.handler;
        var context = cfg.context || scope;

        delete cfg.handler;
        delete cfg.context;

        if (!cfg.keyCode) {
            cfg.keyCode = keys[name] || parseInt(name,10);
        }

        var handler = function(e) {
            scope.$event = e;
            h(scope);
            scope.$event = null;
            scope.$check();
        };
        
        MetaphorJs.lib.Input.get(node).onKey(cfg, handler, context);

        return function() {
            MetaphorJs.lib.Input.get(node).unKey(cfg, handler, context);
        };
    };

    var cfgs = config.getAllValues(),
        name,
        uninstall = [];
    
    for (name in cfgs) {
        if (cfgs.hasOwnProperty(name) && cfgs[name]) {
            uninstall.push(createHandler(name, cfgs[name]));
        }
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