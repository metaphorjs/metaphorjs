
require("../../lib/Expression.js");
require("../../lib/Input.js");
require("../../lib/Config.js");
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");

const Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

(function() {

const keys = {
    "enter": 13,
    "esc": 27,
    "escape": 27,
    "backspace": 8,
    "tab": 9,
    "shift": 16,
    "ctrl": 17,
    "alt": 18,
    "pause": 19,
    "caps": 20,
    "space": 32,
    "pageup": 33,
    "pagedown": 34,
    "end": 35,
    "home": 36,
    "left": 37,
    "up": 38,
    "right": 39,
    "down": 40,
    "insert": 45,
    "delete": 46,
    "0": 48,
    "1": 49,
    "2": 50,
    "3": 51,
    "4": 52,
    "5": 53,
    "6": 54,
    "7": 55,
    "8": 56,
    "9": 57,
    "a":	65,
    "b":	66,
    "c":	67,
    "d":	68,	
    "e":	69,
    "f":	70,
    "g":	71,
    "h":	72,
    "i":	73,
    "j":	74,
    "k":	75,
    "l":	76,
    "m":	77,
    "n":	78,
    "o":	79,
    "p":	80,
    "q":	81,
    "r":	82,
    "s":	83,
    "t":	84,
    "u":	85,
    "v":	86,
    "w":	87,
    "x":	88,
    "y":	89,
    "z":	90,
    "f1":   112,
    "f2":   113,
    "f3":   114,
    "f4":   115,
    "f5":   116,
    "f6":   117,
    "f7":   118,
    "f8":   119,
    "f9":   120,
    "f10":  121,
    "f11":  122,
    "f12":  123,
    "leftwin": 91,
    "rightwin": 92,
    "select": 93,
    "num0": 96,
    "num1": 97,
    "num2": 98,
    "num3": 99,
    "num4": 100,
    "num5": 101,
    "num6": 102,
    "num7": 103,
    "num8": 104,
    "num9": 105,
    "*": 106,
    "multiply": 106,
    "+": 107,
    "add": 107,
    "-": 109,
    "subtract": 109,
    "decimal": 110,
    "/": 111,
    "divide": 111,
    "numlock": 144,
    "scrolllock": 145,
    "semicolon": 186,
    "equal": 187,
    "comma": 188,
    "dash": 189,
    "period": 190,
    "forwardslash": 191,
    "graveaccent": 192,
    "openbracket": 219,
    "backslash": 220,
    "closebracket": 221,
    "quote": 222
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

const getNode = function(node, config, cb) {
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

const dir = function key_directive(scope, node, config, renderer, attrSet){

    dir.initConfig(config);

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
};


dir.initConfig = function(config) {
    config.disableProperty("value");
    config.eachProperty(function(k, prop){
        if (k.indexOf('value.') === 0) {
            if (prop.expression.charAt(0) !== '{') {
                config.setMode(k, MetaphorJs.lib.Config.MODE_FUNC);
            }
        }
    });
};

Directive.registerAttribute("key", 1000, dir);

}());