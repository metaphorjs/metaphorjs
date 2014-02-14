
MetaphorJs.define("MetaphorJs.data.Record", "MetaphorJs.cmp.Observable", {

    id:             null,
    data:           null,
    orig:           null,
    modified:       null,
    loaded:         false,
    dirty:          false,
    destroyed:      false,
    model:          null,
    standalone:     true,
    stores:         null,

    // (id, data, cfg)
    // (id, cfg)
    // (cfg)
    initialize: function(id, data, cfg) {

        var self    = this,
            args    = arguments.length;

        if (args == 1) {
            cfg     = id;
            id      = null;
            data    = null;
        }
        else if (args == 2) {
            cfg     = data;
            data    = null;
        }

        self.orig       = {};
        self.stores     = [];
        self.modified   = {};
        self.supr(cfg);

        if (typeof self.model == "string") {
            self.model  = MetaphorJs.create(self.model);
        }
        else if (!MetaphorJs.is(self.model, "MetaphorJs.data.Model")) {
            self.model  = MetaphorJs.create("MetaphorJs.data.Model", self.model);
        }

        self.id     = id;

        if (data) {
            self.import(data);
        }
        else {
            self.load();
        }

        if (self.getClass() != "MetaphorJs.data.Record") {
            MetaphorJs.data.Model.addToCache(self);
        }
    },

    isLoaded: function() {
        return this.loaded;
    },

    isStandalone: function() {
        return this.standalone;
    },

    isDirty: function() {
        return this.dirty;
    },

    attachStore: function(store) {
        var self    = this,
            sid     = store.getId();

        if (self.stores.indexOf(sid) == -1) {
            self.stores.push(sid);
        }
    },

    detachStore: function(store) {
        var self    = this,
            sid     = store.getId(),
            inx;

        if (!self.destroyed && (inx = self.stores.indexOf(sid)) != -1) {
            self.stores.splice(inx, 1);

            if (self.stores.length == 0 && !self.standalone) {
                self.destroy();
            }
        }
    },

    setDirty: function(dirty) {
        var self    = this;
        if (self.dirty != dirty) {
            self.dirty  = dirty ? true : false;
            self.trigger("dirtychange", self, dirty);
        }
    },

    import: function(data) {

        var self        = this,
            processed   = {},
            name;

        if (data) {
            for (name in data) {
                processed[name] = self.model.restoreField(self, name, data[name]);
            }

            self.data   = processed;
        }

        self.orig       = $.extend({}, self.data);
        self.modified   = {};
        self.loaded     = true;
        self.setDirty(false);
    },

    storeData: function(data) {

        var self        = this,
            processed   = {},
            name;

        for (name in data) {
            processed[name] = self.model.storeField(self, name, data[name]);
        }

        return processed;
    },



    getId: function() {
        return this.id;
    },

    getData: function() {
        return $.extend({}, this.data);
    },

    getChanged: function() {
        return $.extend({}, this.modified);
    },

    isChanged: function(key) {
        return this.modified[key] || false;
    },

    get: function(key) {
        return this.data[key];
    },

    setId: function(id) {
        if (!this.id && id) {
            this.id = id;
        }
    },

    set: function(key, value) {

        var self    = this,
            prev    = self.data[key];

        value           = self.model.restoreField(self, key, value);
        self.data[key]  = value;

        if (prev != value) {
            self.modified[key]  = true;
            self.setDirty(true);
            self.trigger("change", self, key, value, prev);
            self.trigger("change-"+key, self, key, value, prev);
        }
    },

    revert: function() {
        var self    = this;
        if (self.dirty) {
            self.data       = $.extend({}, self.orig);
            self.modified   = {};
            self.setDirty(false);
        }
    },

    load: function() {
        var self    = this;
        self.trigger("beforeload", self);
        return self.model.loadRecord(self.id, function(id, data) {
            self.setId(id);
            self.import(data);
            self.trigger("load", self);
        });
    },

    save: function() {
        var self    = this;
        self.trigger("beforesave", self);
        return self.model.saveRecord(self, function(id, data) {
            self.setId(id);
            self.import(data);
            self.trigger("save", self);
        });
    },

    delete: function() {
        var self    = this;
        self.trigger("beforedelete", self);
        return self.model.deleteRecord(self, function(){
            self.trigger("delete", self);
            self.destroy();
        });
    },


    destroy: function() {

        var self    = this;

        if (self.destroyed) {
            return;
        }

        self.destroyed  = true;

        self.trigger("destroy", self);

        self.data       = null;
        self.orig       = null;
        self.modified   = null;
        self.model      = null;
        self.stores     = null;

        MetaphorJs.data.Model.removeFromCache(self.getClass(), self.id);

        self.supr();
    }

});