

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    animate = require("../../../../metaphorjs-animate/src/metaphorjs.animate.js"),
    stopAnimation = require("../../../../metaphorjs-animate/src/func/stopAnimation.js"),
    addClass = require("../../func/dom/addClass.js"),
    removeClass = require("../../func/dom/removeClass.js"),
    hasClass = require("../../func/dom/hasClass.js"),
    isArray = require("../../func/isArray.js"),
    isString = require("../../func/isString.js"),
    AttributeHandler = require("../../view/AttributeHandler.js");


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

    registerAttributeHandler("mjs-class", 1000, defineClass({

        $extends: AttributeHandler,

        initial: true,

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.watcher.getLastResult(),
                prev    = self.watcher.getPrevValue(),
                i;

            stopAnimation(node);

            if (isString(clss)) {
                if (prev) {
                    toggleClass(node, prev, false, false);
                }
                toggleClass(node, clss, null, !self.initial);
            }
            else if (isArray(clss)) {
                var l;
                for (i = -1, l = clss.length; ++i < l; toggleClass(node, clss[i], true, !self.initial)){}
            }
            else {
                for (i in clss) {
                    toggleClass(node, i, clss[i] ? true : false, !self.initial);
                }
            }

            self.initial = false;
        }
    }));

}());