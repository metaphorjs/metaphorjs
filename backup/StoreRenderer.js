
require("../lib/Expression.js");
require("../lib/MutationObserver.js");
require("../app/ListRenderer.js")

var bind = require("metaphorjs-shared/src/func/bind.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.StoreRenderer = MetaphorJs.app.ListRenderer.$extend({

    store: null,

    $constructor: function(scope, node, config, parentRenderer, attrSet) {

        var cfg = config.getAll();

        if (cfg.pullNext) {
            if (cfg.buffered) {
                cfg.bufferedPullNext = true;
                cfg.buffered = false;
            }

            this.$plugins.push(
                typeof cfg.pullNext === "string" ?
                    cfg.pullNext : "MetaphorJs.plugin.ListPullNext");
        }

        this.$super(scope, node, config, parentRenderer, attrSet);
    },

    afterInit: function(scope, node, config, parentRenderer, attrSet) {

        var self            = this,
            store;

        self.store          = store = MetaphorJs.lib.Expression.get(self.model, scope);
        self.watcher        = MetaphorJs.lib.MutationObserver.get(store, "this.current", self.onChange, self);
        
        if (self.trackByFn !== false) {
            self.trackByFn      = bind(store.getRecordId, store);
        }
        
        self.griDelegate    = bind(store.indexOfId, store);
        self.bindStore(store, "on");
    },

    bindStore: function(store, fn) {

        var self    = this;

        store[fn]("update", self.onStoreUpdate, self);
        store[fn]("clear", self.onStoreUpdate, self);
        store[fn]("destroy", self.onStoreDestroy, self);
    },

    onStoreUpdate: function() {
        this.watcher.check();
    },

    getListItem: function(list, index) {
        return this.store.getRecordData(list[index]);
    },

    onStoreDestroy: function() {
        var self = this;
        if (self.watcher) {
            self.onStoreUpdate();
            self.watcher.unsubscribe(self.onChange, self);
            self.watcher.$destroy(true);
            self.watcher = null;
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


