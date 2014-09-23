
var Directive = require("../../class/Directive.js"),
    createFunc = require("../../../../metaphorjs-watchable/src/func/createFunc.js"),
    normalizeEvent = require("../../func/event/normalizeEvent.js"),
    removeAttr = require("../../func/dom/removeAttr.js"),
    addListener = require("../../func/event/addListener.js"),
    Scope = require("../../lib/Scope.js"),
    error = require("../../func/error.js");

(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress', 'submit',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'enter'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            var eventName = name;

            if (eventName == "enter") {
                eventName = "keyup";
            }

            Directive.registerAttribute("mjs-" + name, 1000, function(scope, node, expr){

                var fn  = createFunc(expr);

                addListener(node, eventName, function(e){

                    e = normalizeEvent(e || window.event);

                    if (name == "enter" && e.keyCode != 13) {
                        return null;
                    }

                    scope.$event = e;

                    fn(scope);

                    scope.$event = null;

                    scope.$root.$check();

                    e.preventDefault();
                    return false;
                });
            });
        }(events[i]));
    }

}());
