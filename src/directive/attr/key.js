
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

Directive.registerAttribute("key", 1000, function(scope, node, config, renderer, attrSet){

    config.setProperty("value", {disabled: true});
    config.eachProperty(function(k, prop){
        if (k.indexOf('value.') === 0) {
            if (prop.expression.charAt(0) !== '{') {
                config.setProperty(k, {mode: MetaphorJs.lib.Config.MODE_GETTER});
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
        
        Input.get(node).onKey(cfg, handler, context);

        return function() {
            Input.get(node).unKey(cfg, handler, context);
        };
    };

    var cfgs = config.getAllValues(),
        name;
    
    for (name in cfgs) {
        uninstall.push(createHandler(name, cfgs[name]));
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