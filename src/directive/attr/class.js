
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

    Directive.registerAttribute("class", 1000, Directive.$extend({

        $class: "MetaphorJs.app.Directive.attr.Class",
        id: "class",
        
        _initial: true,
        _prev: null,

        initConfig: function() {
            var self = this,
                config = self.config;
            config.setType("animate", "bool");
            config.eachProperty(function(k) {
                if (k === 'value' || k.indexOf("value.") === 0) {
                    config.on(k, self.onScopeChange, self);
                }
            });
            self.$super();
        },

        initChange: function() {
            var self = this;
            if (self._autoOnChange) {
                self.onScopeChange();
            }
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

        onScopeChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.getCurrentValue(),
                prev    = self._prev,
                i;

            MetaphorJs.animate.stop(node);

            if (prev) {
                for (i in prev) {
                    if (prev.hasOwnProperty(i)) {
                        if (clss[i] === undf) {
                            toggleClass(node, i, false, false);
                        }
                    }
                }
            }

            for (i in clss) {
                if (clss.hasOwnProperty(i)) {
                    toggleClass(node, i, !!clss[i], 
                        !self._initial && 
                        self.config.get("animate"));
                }
            }

            self._prev = clss;
            self._initial = false;
        }
    }));

}());