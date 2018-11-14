
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-animate/src/animate/stop.js");
require("../../func/dom/addClass.js");
require("../../func/dom/removeClass.js");
require("../../func/dom/hasClass.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    undf = require("metaphorjs-shared/src/var/undf.js");

/*
value is always an object in the end
{class: "condition", class: "condition"}

array turns into _: []
{_: [class, class]}
(which is then turned into {class: true, class: true}
DO NOT put class="{}" when using class.name="{}"
 */


(function(){

    var toggleClass = function(node, cls, toggle, doAnim) {

        var has;

        if (toggle !== null) {
            if (toggle === MetaphorJs.dom.hasClass(node, cls)) {
                return;
            }
            has = !toggle;
        }
        else {
            has = MetaphorJs.dom.hasClass(node, cls);
        }

        if (has) {
            if (doAnim) {
                MetaphorJs.animate.animate(node, [cls + "-remove"]).done(function(){
                    MetaphorJs.dom.removeClass(node, cls);
                });
            }
            else {
                MetaphorJs.dom.removeClass(node, cls);
            }
        }
        else {
            if (doAnim) {
                MetaphorJs.animate.animate(node, [cls + "-add"]).done(function(){
                    MetaphorJs.dom.addClass(node, cls);
                });
            }
            else {
                MetaphorJs.dom.addClass(node, cls);
            }
        }
    };


    var flatten = function(values) {
        var clss = {},
            i, l, val,
            j, jl;

        for (i = 0, l = values.length; i < l; i++) {
            val = values[i];

            if (typeof val === 'string') {
                clss[val] = true;
                continue;
            }
            else if (isArray(val)) {
                for (j = -1, jl = val.length; ++j < jl; clss[val[j]] = true){}
            }
            for (j in val) {
                if (j === '_') {
                    for (j = -1, jl = val._.length; ++j < jl;
                         clss[val._[j]] = true){}
                }
                else {
                    clss[j] = val[j];
                }
            }
        }

        return clss;
    };

    Directive.Class = Directive.registerAttribute("class", 1000, Directive.$extend({

        initial: true,
        prev: null,

        $init: function(scope, node, config, renderer) {
            config.setProperty("animate", {type: "bool"});
            config.eachProperty(function(k){
                if (k.indexOf("value.") === 0) {
                    config.on(k, self.onChange, self);
                }
            });
            this.$super(scope, node, config);
        },

        getCurrentValue: function() {
            var all = this.config.getAllValues(),
                values = [];
            
            if (all[""]) {
                values.push(all['']);
                delete all[''];
            }
            values.push(all);
            
            return flatten(values);
        },

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.getCurrentValue(),
                prev    = self.prev,
                i;

            MetaphorJs.animate.stop(node);

            for (i in prev) {
                if (prev.hasOwnProperty(i)) {
                    if (clss[i] === undf) {
                        toggleClass(node, i, false, false);
                    }
                }
            }

            for (i in clss) {
                if (clss.hasOwnProperty(i)) {
                    toggleClass(node, i, !!clss[i], 
                        !self.initial && 
                        self.config.get("animate"));
                }
            }

            self.initial = false;
        }
    }));

}());