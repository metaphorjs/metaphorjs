
var Observable = require("../../../metaphorjs-observable/src/metaphorjs.observable.js"),
    ns = require("../../../metaphorjs-namespace/src/var/ns.js");

/**
 * @mixin ObservableMixin
 */
module.exports = ns.add("mixin.Observable", {

    /**
     * @type {Observable}
     */
    $$observable: null,
    $$callbackContext: null,

    $beforeInit: function(cfg) {

        var self = this;

        self.$$observable = new Observable;

        if (cfg && cfg.callback) {
            var ls = cfg.callback,
                context = ls.context,
                i;

            ls.context = null;

            for (i in ls) {
                if (ls[i]) {
                    self.$$observable.on(i, ls[i], context || self);
                }
            }

            cfg.callback = null;

            if (context) {
                self.$$callbackContext = context;
            }
        }
    },

    on: function() {
        var o = this.$$observable;
        return o.on.apply(o, arguments);
    },

    un: function() {
        var o = this.$$observable;
        return o.un.apply(o, arguments);
    },

    once: function() {
        var o = this.$$observable;
        return o.once.apply(o, arguments);
    },

    trigger: function() {
        var o = this.$$observable;
        return o.trigger.apply(o, arguments);
    },

    $beforeDestroy: function() {
        this.$$observable.trigger("beforedestroy", this);
    },

    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.destroy();
        self.$$observable = null;
    }
});