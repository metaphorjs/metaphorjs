
var Directive = require("../../class/Directive.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    createFunc = require("metaphorjs-watchable/src/func/createFunc.js"),
    Input = require("metaphorjs-input/src/lib/Input.js");

Directive.registerAttribute("key", 1000, function(scope, node, expr){

    var cfg = createGetter(expr)(scope),
        handler = cfg.handler,
        context = cfg.context || scope;

    delete cfg.handler;
    delete cfg.context;

    if (typeof handler === "string") {
        var h = createFunc(handler);
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
});