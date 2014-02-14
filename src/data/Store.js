
(function(){

"use strict";

var storeId     = 0;
var allStores   = {};


MetaphorJs.define("MetaphorJs.data.Store", "MetaphorJs.cmp.Observable",
    {
        id:             null,
        autoLoad:       false,
        clearOnLoad:    true,

        model:          null,       //"MetaphorJs.data.Record",

        loaded:         false,
        loading:        false,
        local:          false,

        items:          null,
        map:            null,
        keys:           null,
        length:         0,
        totalLength:    0,
        start:          0,
        pages:          null,

        filtered:       false,
        filterBackup:   null,
        filterFn:       null,
        filterScope:    null,
        filterParams:   null,

        initialize:     function(url, options, initialData) {

            var self        = this;

            self.items      = [];
            self.map        = {};
            self.keys       = [];
            self.loaded     = false;

            if (url && typeof url != "string") {
                initialData = options;
                options     = url;
                url         = null;
            }

            options         = options || {};

            self.supr(options);

            self.id             = self.id || ++storeId;
            allStores[self.id]  = self;

            if (typeof self.model == "string") {
                self.model  = MetaphorJs.create(self.model);
            }
            else if (!MetaphorJs.is(self.model, "MetaphorJs.data.Model")) {
                self.model  = MetaphorJs.create("MetaphorJs.data.Model", self.model);
            }

            if (url || options.url) {
                self.model.store.load    = url || options.url;
            }


            if (!self.local && self.autoLoad) {
                self.load();
            }
            else if (initialData) {
                if ($.isArray(initialData)) {
                    self.loadArray(initialData);
                }
                else {
                    self.loadAjaxData(initialData);
                }
            }

            if (self.local) {
                self.loaded     = true;
            }
        },

        getId: function() {
            return this.id;
        },

        isLoaded: function() {
            return this.loaded;
        },

        isLocal: function() {
            return this.local;
        },

        setLocal: function(state) {
            this.local  = state ? true : false;
        },

        isLoading: function() {
            return this.loading;
        },

        isFiltered: function() {
            return this.filtered;
        },

        getLength: function() {
            return this.length;
        },

        getTotalLength: function() {
            return this.filtered ?
                        this.length : (this.totalLength || this.length);
        },

        getPagesCount: function() {

            var self    = this;

            if (self.pageSize !== null) {
                return parseInt(self.totalLength / self.pageSize);
            }
            else {
                return 1;
            }
        },

        setParam: function(k, v) {
            this.model.store.extra[k] = v;
        },

        getParam: function(k) {
            return this.model.store.extra[k];
        },

        getAjaxData: function() {
            return this.ajaxData;
        },

        hasDirty: function() {
            if (this.model.isPlain()) {
                return false;
            }
            var ret = false;
            this.each(function(rec){
                if (rec.isDirty()) {
                    ret = true;
                    return false;
                }
            });
            return ret;
        },

        getDirty: function() {
            var recs    = [];
            if (this.model.isPlain()) {
                return recs;
            }
            this.each(function(rec){
                if (rec.isDirty()) {
                    recs.push(rec);
                }
            });
            return recs;
        },




        import: function(recs) {
            var self    = this;

            self.suspendAllEvents();

            for (var i = 0; i < recs.length; i++) {
                self.add(recs[i]);
            }

            self.resumeAllEvents();
            self.loaded     = true;
            self.loading    = false;

            self.trigger("load", self);
        },

        load: function(params) {

            var self    = this,
                ms      = self.model.store,
                sp      = ms.start,
                lp      = ms.limit;

            params      = params || {};

            if (self.pageSize !== null && !params[sp] && !params[lp]) {
                params[sp]    = self.start;
                params[lp]    = self.pageSize;
            }

            return self.model.loadStore(self, params, function(data, total) {
                self.import(data);
                self.totalLength    = parseInt(total);
            });
        },

        save: function() {

            var self    = this,
                recs    = {},
                cnt     = 0;

            if (self.model.isPlain()) {
                return;
            }

            self.each(function(rec) {
                if (rec.isDirty()) {
                    recs[rec.getId()] = rec.storeData(rec.getData());
                    cnt++;
                }
            });

            if (cnt) {
                return self.model.saveStore(self, recs, function(data){

                    var i, len,
                        id, rec;

                    if (data && data.length) {
                        for (i = 0, len = data.length; i < len; i++) {

                            id      = self.getRecordId(data[i]);
                            rec     = self.getById(id);

                            if (rec) {
                                rec.import(data[i]);
                            }
                        }
                    }

                    self.trigger("save", self);
                });
            }
        },

        deleteById: function(ids) {

            var self    = this,
                i, len, rec;

            if (!ids) {
                return;
            }

            if (!$.isArray(ids)) {
                ids = [ids];
            }

            for (i = 0, len = ids.length; i < len; i++){
                rec = self.getById(ids[i]);
                if (rec instanceof MetaphorJs.data.Record) {
                    rec.destroy();
                }
                else {
                    self.removeId(ids[i]);
                }
            }

            return self.model.deleteRecords(self, ids, function(){
                self.trigger("delete", self, ids);
            });
        },

        deleteAt: function(inx) {
            var self    = this,
                rec     = self.getAt(inx);
            if (rec) {
                return self.deleteRecord(rec);
            }
        },

        delete: function(rec) {
            var self    = this;
            if (rec) {
                return self.deleteById(self.getRecordId(rec));
            }
        },

        deleteRecords: function(recs) {
            var ids     = [],
                self    = this,
                i, len;

            for (i = 0, len = recs.length; i < len; i++) {
                ids.push(self.getRecordId(recs[i]));
            }

            if (ids.length) {
                return self.deleteById(ids);
            }
        },

        loadAjaxData: function(data) {

            var self    = this;

            self.model._processStoreResponse("load", data, function(data, total) {
                self.import(data);
                self.totalLength    = parseInt(total);
            });
        },

        loadArray: function(recs, add) {

            var self    = this;

            if (self.trigger("beforeload", self) === false) {
                return;
            }

            if (!add && self.clearOnLoad && self.length > 0) {
                self.clear();
            }

            if ($.isArray(recs)) {
                self.import(recs);
                self.totalLength    = self.length;
            }
        },

        /**
         * Load store if not loaded or call provided callback
         */
        loadOr: function(cb, cbScope) {

            var self    = this;

            if (self.local) {
                return;
            }

            if (!self.isLoading()) {
                if (!self.isLoaded()) {
                    self.load();
                }
                else if (cb) {
                    cb.call(cbScope || self);
                }
            }
        },

        addNextPage: function() {

            var self    = this;

            if (!self.local && self.length < self.totalLength) {
                self.load({
                    start:      self.length,
                    limit:      self.pageSize
                }, true);
            }
        },

        loadNextPage: function() {

            var self    = this;

            if (!self.local) {
                self.start += self.pageSize;
                self.load();
            }
        },

        loadPrevPage: function() {

            var self    = this;

            if (!self.local) {
                self.start -= self.pageSize;
                self.load();
            }
        },





        getRecordId: function(rec) {
            if (rec instanceof MetaphorJs.data.Record) {
                return rec.getId();
            }
            else {
                return rec[this.model.getStoreProp("load", "id")] || null;
            }
        },

        processRawDataItem: function(item) {

            var self    = this;

            if (item instanceof MetaphorJs.data.Record) {
                return item;
            }

            if (self.model.isPlain()) {
                return item;
            }
            else {

                var type    = self.model.type,
                    id      = self.getRecordId(item),
                    r;

                if (id) {
                    r       = MetaphorJs.data.Model.getFromCache(type, id);
                }

                if (!r) {
                    r       = MetaphorJs.create(type, id, item, {
                        model:      self.model,
                        standalone: false
                    });
                }

                return r;
            }
        },

        /**
         * @protected
         */
        bindRecord: function(mode, rec) {
            var self = this;
            rec[mode]("change", self.onRecordChange, self);
            rec[mode]("destroy", self.onRecordDestroy, self);
            rec[mode]("dirtychange", self.onRecordDirtyChange, self);
            return rec;
        },

        onRecordDirtyChange: function(rec) {
            this.trigger("update", this, rec);
        },

        onRecordChange: function(rec, k, v, prev) {
            this.trigger("update", this, rec);
        },

        onRecordDestroy: function(rec) {
            this.remove(rec);
        },















        add: function(id, rec, silent) {

            var self    = this;

            if (self.filtered) {
                throw new Error("Cannot add to filtered store");
            }

            if (typeof id != "string" && typeof id != "number") {

                rec = arguments[0];

                if ($.isArray(rec)) {

                    if (!rec.length) {
                        return;
                    }

                    var prevLength  = self.length;

                    for (var i = 0, len = rec.length; i < len; i++) {
                        rec[i]  = self.processRawDataItem(rec[i]);
                        self.add(self.getRecordId(rec[i]), rec[i], true);
                    }

                    if (!silent) {
                        // fn(index, rec)
                        self.trigger('add', prevLength, rec);
                    }
                    return;
                }
                else {
                    rec = self.processRawDataItem(rec);
                    id  = self.getRecordId(rec);
                }
            }

            if (typeof id != 'undefined' && id !== null){
                var old = self.map[id];
                if(typeof old != 'undefined'){
                    self.replace(id, rec);
                    return;
                }
                self.map[id] = rec;
            }

            self.length++;
            self.items.push(rec);
            self.keys.push(id);

            if (rec instanceof MetaphorJs.data.Record) {
                rec.attachStore(self);
                self.bindRecord("on", rec);
            }

            if (!silent) {
                self.trigger('add', self.length - 1, [rec]);
            }
        },

        removeAt: function(index) {

            var self    = this;

            if(index < self.length && index >= 0){
                self.length--;
                var rec = self.items[index];
                self.items.splice(index, 1);
                var id = self.keys[index];
                if(typeof id != 'undefined'){
                    delete self.map[id];
                }
                self.keys.splice(index, 1);
                self.trigger('remove', rec, id);

                if (rec instanceof MetaphorJs.data.Record) {
                    self.bindRecord("un", rec);
                    rec.detachStore(self);
                    return rec = null;
                }
                else {
                    return rec;
                }
            }
            return false;
        },

        insert: function(index, id, rec, silent) {
            var self = this;

            if (self.filtered) {
                throw new Error("Cannot insert into filtered store");
            }

            if(arguments.length == 2){
                rec = arguments[1];
                id = self.getRecordId(rec);
            }
            rec = self.processRawDataItem(rec);
            if(self.containsId(id)){
                self.suspendAllEvents();
                self.removeId(id);
                self.resumeAllEvents();
            }
            if(index >= self.length){
                return self.add(id, rec, silent);
            }
            self.length++;
            self.items.splice(index, 0, rec);
            if(typeof id != 'undefined' && id !== null){
                self.map[id] = rec;
            }
            self.keys.splice(index, 0, id);

            if (rec instanceof MetaphorJs.data.Record) {
                rec.attachStore(self);
                self.bindRecord("on", rec);
            }

            if (!silent) {
                self.trigger('add', index, [rec]);
            }

            return rec;
        },

        replace: function(id, rec) {
            var self    = this,
                old,
                index;

            if(arguments.length == 1){
                rec     = arguments[0];
                id      = self.getRecordId(rec);
            }

            rec         = self.processRawDataItem(rec);
            old         = self.map[id];

            if(typeof id == 'undefined' || id === null || typeof old == 'undefined'){
                return self.add(id, rec);
            }

            if (old instanceof MetaphorJs.data.Record) {
                self.bindRecord("un", old);
                old.detachStore(self);
            }

            index               = self.indexOfId(id);
            self.items[index]   = rec;
            self.map[id]        = rec;

            self.trigger('replace', id, old, rec);
            return rec;
        },

        remove: function(rec) {
            return this.removeAt(this.indexOf(rec));
        },

        removeId: function(id) {
            return this.removeAt(this.indexOfId(id));
        },

        contains: function(rec) {
            return this.indexOf(rec) != -1;
        },

        containsId: function(id) {
            return typeof this.map[id] != 'undefined';
        },

        clear: function() {

            var self    = this,
                recs    = self.getRange();

            self.clearFilter(true);
            self._reset();
            self.trigger('clear', recs);
        },

        reset: function() {
            this._reset();
        },

        /**
         * @private
         */
        _reset: function(keepRecords) {
            var self    = this,
            i, len, rec;

            if (!keepRecords) {
                for (i = 0, len = self.items.length; i < len; i++) {
                    rec = self.items[i];
                    if (rec instanceof MetaphorJs.data.Record) {
                        self.bindRecord("un", rec);
                        rec.detachStore(self);
                    }
                }
            }

            self.start          = 0;
            self.length         = 0;
            self.totalLength    = 0;
            self.items          = [];
            self.keys           = [];
            self.map            = {};
            self.loaded         = self.local;
        },






        filter: function(fn, fnScope, params) {

            var self    = this;

            if (self.filtered) {
                self.clearFilter(true);
            }

            self.filtered       = true;
            self.filterFn       = fn;
            self.filterScope    = fnScope;
            self.filterParams   = params;

            self.trigger("beforefilter", self);
            self.suspendAllEvents();

            self.filterBackup   = {
                length:         self.length,
                items:          self.items,
                keys:           self.keys,
                map:            self.map
            };

            self._reset(true);

            var k   = self.filterBackup.keys,
                it  = self.filterBackup.items;

            for(var i = 0, len = it.length; i < len; i++){
                if(self._filterRecord(it[i], k[i])){
                    self.items.push(it[i]);
                    self.keys.push(k[i]);
                    self.length++;
                    self.map[k[i]] = it[i];
                }
            }

            self.resumeAllEvents();
            self.trigger("filter", self);
        },

        _filterRecord: function(rec, id) {
            var self    = this;
            return self.filtered &&
                self.filterFn.call(self.filterScope, rec, id, self.filterParams);
        },

        clearFilter: function(silent) {

            var self    = this;

            if (!self.filtered) {
                return;
            }

            if (!silent) {
                self.trigger("beforeclearfilter", self);
            }

            self.suspendAllEvents();

            self.filtered       = false;
            self._reset(true);

            self.length         = self.filterBackup.length;
            self.items          = self.filterBackup.items;
            self.keys           = self.filterBackup.keys;
            self.map            = self.filterBackup.map;
            self.filterBackup   = null;

            self.resumeAllEvents();

            if (!silent) {
                self.trigger("clearfilter", self);
            }
        },






        getAt: function(index) {
            return this.items[index] || null;
        },

        getById: function(id) {
            return this.map[id] || null;
        },

        indexOf: function(rec) {
            return this.items.indexOf(rec);
        },

        indexOfId: function(id) {
            return this.keys.indexOf(id);
        },

        each: function(fn, fnScope) {
            var items = [].concat(this.items);
            fnScope = fnScope || window;
            for(var i = 0, len = items.length; i < len; i++){
                if(fn.call(fnScope, items[i], i, len) === false){
                    break;
                }
            }
        },

        eachId: function(fn, fnScope) {
            var self    = this;
            fnScope = fnScope || window;
            for(var i = 0, len = self.keys.length; i < len; i++){
                fn.call(fnScope, self.keys[i], self.items[i], i, len);
            }
        },

        collect: function(f) {

            var coll    = [],
                self    = this,
                rt      = !self.model.isPlain();

            self.each(function(rec){

                var val;

                if (rt) {
                    val = rec.get(f);
                }
                else {
                    val = rec[f];
                }

                if (val) {
                    coll.push(val);
                }
            });

            return coll;
        },

        first : function(){
            return this.items[0];
        },

        last : function(){
            return this.items[this.length-1];
        },

        getRange : function(start, end){
            var self    = this;
            var items   = self.items;
            if(items.length < 1){
                return [];
            }
            start = start || 0;
            end = Math.min(typeof end == 'undefined' || end === null ? self.length-1 : end, self.length-1);
            var i, r = [];
            if(start <= end){
                for(i = start; i <= end; i++) {
                    r[r.length] = items[i];
                }
            }else{
                for(i = start; i >= end; i--) {
                    r[r.length] = items[i];
                }
            }
            return r;
        },

        findBy: function(fn, fnScope, start) {
            var inx = this.findIndexBy(fn, fnScope, start);
            return inx == -1 ? null : this.getAt(inx);
        },

        findIndexBy : function(fn, fnScope, start) {

            fnScope = fnScope || this;

            var k   = this.keys,
                it  = this.items;

            for(var i = (start||0), len = it.length; i < len; i++){
                if(fn.call(fnScope, it[i], k[i])){
                    return i;
                }
            }

            return -1;
        },

        find: function(property, value, exact) {

            var self    = this,
                rt      = !self.model.isPlain(),
                v;

            return self.findIndexBy(function(rec) {

                if (rt) {
                    v   = rec.get(property);
                }
                else {
                    v   = rec[property];
                }

                if (exact) {
                    return v === value;
                }
                else {
                    return v == value;
                }

            }, self);
        },

        findExact: function(property, value) {
            return this.find(property, value, true);
        },

        findBySet: function(props) {

            var found   = null,
                match,
                i;

            this.each(function(rec){

                match   = true;

                for (i in props) {
                    if (props[i] != rec[i]) {
                        match   = false;
                        break;
                    }
                }

                if (match) {
                    found   = rec;
                    return false;
                }
            });

            return found;
        },





        destroy: function() {

            var self    = this;

            delete allStores[self.id];

            self.trigger("destroy", self);
            self.removeAllListeners("clear");
            self.clear();

            self.supr();
        }



    },

    {
        createFromSelect: function(selectObj) {
            var d = [], opts = selectObj.options;
            for(var i = 0, len = opts.length;i < len; i++){
                var o = opts[i],
                    value = (o.hasAttribute ? o.hasAttribute('value') : o.getAttributeNode('value').specified) ?
                                o.value : o.text;
                d.push([value, o.text]);
            }
            var s   = MetaphorJs.create("MetaphorJs.data.Store", {server: {load: {id: 0}}});
            s.loadArray(d);
            return s;
        },


        lookupStore: function(id) {
            return allStores[id] || null;
        }
    }
);




}());