
require("../../lib/Expression.js");
require("../../lib/Input.js");
require("../../lib/Config.js");
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function() {

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

var getNode = function(node, config, cb) {
    Directive.resolveNode(node, "key", function(node, cmp){
        if (cmp) {
            config.setProperty("targetComponent", {
                mode: MetaphorJs.lib.Config.MODE_STATIC,
                value: cmp
            });
        }
        cb(node);
    });
};


Directive.registerAttribute("key", 1000, function(scope, node, config, renderer, attrSet){

    config.disableProperty("value");
    config.eachProperty(function(k, prop){
        if (k.indexOf('value.') === 0) {
            if (prop.expression.charAt(0) !== '{') {
                config.setMode(k, MetaphorJs.lib.Config.MODE_FUNC);
            }
        }
    });

    var createHandler = function(node, name, cfg) {

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
            scope.$eventCmp = config.get("targetComponent");
            h(scope);
            scope.$event = null;
            scope.$eventCmp = null;
            scope.$check();
        };
        
        MetaphorJs.lib.Input.get(node).onKey(cfg, handler, context);

        return function() {
            MetaphorJs.lib.Input.get(node).unKey(cfg, handler, context);
        };
    };

    var cfgs = config.getAllValues(),
        name,
        uninstall = [],
        init = function(node) {
            if (cfgs) {
                for (name in cfgs) {
                    if (cfgs.hasOwnProperty(name) && cfgs[name]) {
                        uninstall.push(createHandler(node, name, cfgs[name]));
                    }
                }
            }
        };

    if (window.document.readyState === "complete") {
        getNode(node, config, init);
    }
    MetaphorJs.dom.addListener(window, "load", function(){
        getNode(node, config, init);
    });

    return function() {
        var i, l;
        for (i = 0, l = uninstall.length; i < l; i++) {
            uninstall[i]();
        }
        uninstall = null;
    };
});

}());