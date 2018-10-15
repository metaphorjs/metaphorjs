
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-animate/src/animate/stop.js");
require("../../func/dom/addClass.js");
require("../../func/dom/removeClass.js");
require("../../func/dom/hasClass.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
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

    var flatten = function(obj) {

        var list = {},
            i, j, l;

        if (!obj) {
            return list;
        }

        if (isString(obj)) {
            list[obj] = true;
        }
        else if (isArray(obj)) {
            for (i = -1, l = obj.length; ++i < l; list[obj[i]] = true){}
        }
        else {
            for (i in obj) {
                if (i === '_') {
                    for (j = -1, l = obj._.length; ++j < l;
                         list[obj._[j]] = true){}
                }
                else {
                    list[i] = obj[i];
                }
            }
        }

        return list;
    };

    Directive.Class = Directive.registerAttribute("class", 1000, Directive.$extend({

        initial: true,
        animate: false,

        $init: function(scope, node, expr, renderer, attr) {

            var self = this, 
                values = attr ? attr.values : null,
                cfg = attr ? attr.config : {},
                k,
                parts;

            self.animate = !!cfg.animate;

            if (values) {
                parts = [];
                if (expr) {
                    if (expr.substr(0,1) != '[') {
                        expr = '[' + expr + ']';
                    }
                    parts.push('_: ' + expr);
                }
                for (k in values) {
                    parts.push("'" + k + "'" + ': ' + values[k]);
                }
                expr = '{' + parts.join(', ') + '}';
            }

            this.$super(scope, node, expr);
        },

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = flatten(self.watcher.getLastResult()),
                prev    = flatten(self.watcher.getPrevValue()),
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
                    toggleClass(node, i, !!clss[i], !self.initial && self.animate);
                }
            }

            self.initial = false;
        }
    }));

}());