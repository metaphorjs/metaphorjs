

var Directive = require("../../class/Directive.js"),
    defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    animate = require("metaphorjs-animate/src/func/animate.js"),
    stopAnimation = require("metaphorjs-animate/src/func/stopAnimation.js"),
    addClass = require("../../func/dom/addClass.js"),
    removeClass = require("../../func/dom/removeClass.js"),
    hasClass = require("../../func/dom/hasClass.js"),
    isArray = require("../../func/isArray.js"),
    isString = require("../../func/isString.js"),
    undf = require("../../var/undf.js");


(function(){

    var toggleClass = function(node, cls, toggle, doAnim) {

        var has;

        if (toggle !== null) {
            if (toggle == hasClass(node, cls)) {
                return;
            }
            has = !toggle;
        }
        else {
            has = hasClass(node, cls);
        }

        if (has) {
            if (doAnim) {
                animate(node, [cls + "-remove"], null, true).done(function(){
                    removeClass(node, cls);
                });
            }
            else {
                removeClass(node, cls);
            }
        }
        else {
            if (doAnim) {
                animate(node, [cls + "-add"], null, true).done(function(){
                    addClass(node, cls);
                });
            }
            else {
                addClass(node, cls);
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
                if (i == '_') {
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

    Directive.registerAttribute("mjs-class", 1000, defineClass({

        $extends: Directive,

        initial: true,

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = flatten(self.watcher.getLastResult()),
                prev    = flatten(self.watcher.getPrevValue()),
                i;

            stopAnimation(node);

            for (i in prev) {
                if (prev.hasOwnProperty(i)) {
                    if (clss[i] === undf) {
                        toggleClass(node, i, false, false);
                    }
                }
            }

            for (i in clss) {
                if (clss.hasOwnProperty(i)) {
                    toggleClass(node, i, clss[i] ? true : false, !self.initial);
                }
            }

            self.initial = false;
        }
    }));

}());