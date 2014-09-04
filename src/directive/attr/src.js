

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    preloadImage = require("../../func/preloadImage.js"),
    async = require("../../func/async.js"),
    AttributeHandler = require("../../view/AttributeHandler.js");

registerAttributeHandler("mjs-src", 1000, defineClass(null, AttributeHandler, {

    initialize: function(scope, node, expr) {

        this.supr(scope, node, expr);

        node.removeAttribute("mjs-src");

    },

    onChange: function() {

        var self    = this,
            src     = self.watcher.getLastResult();

        async(function(){
            preloadImage(src).done(function(){
                if (self && self.node) {
                    self.node.src = src;
                    self.node.setAttribute("src", src);
                }
            });
        });
    }
}));