require("../../lib/Expression.js");

var Directive = require("../../app/Directive.js");

    /*
        Update scope on given event.
        Not exactly template's business, but still
    */
Directive.registerAttribute("update-on", 1000,
    function(scope, node, config, renderer, attrSet) {

        var toggle = function(mode) {
            config.eachProperty(function(k){
                if (k.indexOf("value.")===0) {
                    var event = k.replace('value.', ''),
                        obj = config.get(k);
                    if (obj.$destroyed || obj.$destroying) {
                        return;
                    }
                    if (obj && (fn = (obj[mode] || obj['$' + mode]))) {
                        fn.call(obj, event, scope.$check, scope);
                    }
                }
            });
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