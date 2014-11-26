
var Directive = require("../../class/Directive.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js"),
    Input = require("metaphorjs-input/src/metaphorjs.input.js");

Directive.registerAttribute("mjs-key", 1000, function(scope, node, expr){

    var cfg = createGetter(expr)(scope),
        handler = cfg.handler,
        context = cfg.context || scope;

    delete cfg.handler;
    delete cfg.context;

    Input.get(node).onKey(cfg, handler, context);

    return function() {
        Input.get(node).unKey(cfg, handler, context);
    };
});