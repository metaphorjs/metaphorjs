
require("../lib/Expression.js");
require("../lib/Config.js");
require("../lib/MutationObserver.js");
require("../app/ListRenderer.js");
require("../func/app/prebuilt");

var bind = require("metaphorjs-shared/src/func/bind.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.StoreRenderer = MetaphorJs.app.ListRenderer.$extend({

    store: null,

    $constructor: function(scope, node, config, parentRenderer, attrSet) {

        config.setDefaultMode("pullNext", MetaphorJs.lib.Config.MODE_STATIC);

        if (config.hasValue("pullNext") && config.get("pullNext")) {
            if (config.hasValue("buffered")) {
                config.setStatic("bufferedPullNext", true);
                config.setStatic("buffered", false);
            }

            var plg = config.get("pullNext");
            this.$plugins.push(
                typeof plg === "string" ? plg : "MetaphorJs.plugin.ListPullNext");
        }

        this.$super(scope, node, config, parentRenderer, attrSet);
    },

    initDataSource: function() {

        var self            = this,
            store;

        self.store          = store = MetaphorJs.lib.Expression.get(
                                    self.listSourceExpr, 
                                    self.scope
                                );
        if (self._trackBy !== false) {
            self._trackByFn = bind(store.getRecordId, store);
        }

        self._mo            = MetaphorJs.lib.MutationObserver.get(
                                store, "current", 
                                self.onChange, self);
        self._griDelegate   = bind(store.indexOfId, store);
        self.bindStore(store, "on");
    },

    bindStore: function(store, fn) {

        var self    = this;

        store[fn]("update", self.onStoreUpdate, self);
        store[fn]("clear", self.onStoreUpdate, self);
        store[fn]("destroy", self.onStoreDestroy, self);
    },

    onStoreUpdate: function() {
        this._mo.check();
    },

    getListItem: function(list, index) {
        return this.store.getRecordData(list[index]);
    },

    onStoreDestroy: function() {
        var self = this;
        if (self._mo) {
            self.onStoreUpdate();
            self._mo.unsubscribe(self.onChange, self);
            self._mo.$destroy(true);
            self._mo = null;
        }
    },

    onDestroy: function() {
        var self = this;
        if (!self.store.$destroyed) {
            self.bindStore(self.store, "un");
        }
        self.$super();
    }

});


