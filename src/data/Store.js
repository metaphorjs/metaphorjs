
MetaphorJs.define("MetaphorJs.data.Store", "MetaphorJs.cmp.Observable",
    {
        autoLoad:       false,
        idProperty:     "id",
        totalProperty:  "total",
        root:           "record",
        startParam:     "start",
        limitParam:     "limit",
        pageSize:       null,
        clearOnLoad:    true,

        fields:         null,
        recordType:     null, //"MetaphorJs.data.Record",
        destroyRecords: true,

        ajaxOpt:        {
            type:       'GET'
        },
        ajaxData:       null,
        extraParams:    {},


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

        loadXHR:        null,

        filtered:       false,
        filterBackup:   null,


        initialize:     function(url, options, extraParams, initialData) {

            var self        = this;

            self.items      = [];
            self.map        = {};
            self.keys       = [];
            self.loaded     = false;

            if (options && typeof options == 'string') {
                options     = {root: options};
            }
            options         = options || {};

            if (url && $.isPlainObject(url)) {
                options     = url;
                url         = null;
            }

            if (extraParams) {
                options.extraParams = extraParams;
            }

            options.ajaxOpt     = options.ajaxOpt || {};

            if (options.url) {
                options.ajaxOpt.url = options.url;
            }
            if (url) {
                options.ajaxOpt.url = url;
            }

            self.supr(options);

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


        load: function(params, add, cb, cbScope) {

            var self    = this;

            if (self.loadXHR) {
                self.loadXHR.abort();
            }

            params      = params || {};

            if (self.trigger("beforeload", self) === false) {
                return;
            }

            self.loading    = true;

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            if (!add && self.clearOnLoad && self.length > 0) {
                self.clear();
            }

            var opt     = $.extend({}, self.ajaxOpt);
            opt.data    = $.extend({}, self.extraParams, params);
            opt.context = self;
            opt.success = self.loadAjaxData;

            if (self.pageSize !== null && !params[self.startParam] && !params[self.limitParam]) {
                opt.data[self.startParam]    = self.start;
                opt.data[self.limitParam]    = self.pageSize;
            }

            self.loadXHR = $.ajax(opt);
            self.loadXHR.always(function(){
                self.loadXHR    = null;
            });

        },

        loadAjaxData: function(data) {

            var self    = this;

            self.ajaxData   = $.extend({}, data);

            if (data[self.root]) {

                var recs    = data[self.root],
                    total   = parseInt(data[self.totalProperty]);

                if ($.isArray(recs)) {
                    self.loadData(recs);
                    self.totalLength    = total || self.length;
                }
            }
        },

        getAjaxData: function() {
            return this.ajaxData;
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

                self.loadData(recs);
                self.totalLength    = self.length;
            }
        },

        loadData: function(recs) {
            var self    = this;

            self.clearFilter(true);

            self.suspendAllEvents();

            for (var i = 0; i < recs.length; i++) {
                self.add(recs[i]);
            }

            self.resumeAllEvents();
            self.loaded     = true;
            self.loading    = false;

            self.trigger("load", self);
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
                    cb.call(cbScope || window);
                }
            }
        },

        reload: function(cb, cbScope) {

            var self    = this;

            if (self.local) {
                return;
            }

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            self.load();
        },

        addNextPage: function(cb, cbScope) {

            var self    = this;

            if (self.local || self.length >= self.totalLength) {
                return;
            }

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            self.load({
                start:      self.length,
                limit:      self.pageSize
            }, true);
        },

        loadNextPage: function(cb, cbScope) {

            var self    = this;

            if (self.local) {
                return;
            }

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            self.start += self.pageSize;
            self.load();
        },

        loadPrevPage: function(cb, cbScope) {

            var self    = this;

            if (self.local) {
                return;
            }

            if (cb) {
                self.once("load", cb, cbScope || window);
            }

            self.start -= self.pageSize;
            self.load();
        },


        setParam: function(k, v) {
            this.extraParams[k] = v;
        },

        getParam: function(k) {
            return this.extraParams[k];
        },



        getRecordId: function(rec) {
            if (this.recordType) {
                return rec.getId();
            }
            else {
                return rec[this.idProperty] || null;
            }
        },

        processDataItem: function(item) {

            var self    = this;

            if (!self.recordType) {
                return item;
            }
            else {

                if (MetaphorJs.is(item, self.recordType)) {
                    return item;
                }

                return MetaphorJs.create(self.recordType, item, self.fields, {
                    idProperty:     self.idProperty,
                    listeners: {
                        scope:      self,
                        change:     self.onRecordChange,
                        destroy:    self.onRecordDestroy
                    }
                });
            }
        },

        onRecordChange: function(k, v, prev, rec) {
            this.trigger("update", this, rec);
        },

        onRecordDestroy: function(rec) {
            this.remove(rec);
        },

        getAt: function(index) {
            return this.items[index] || null;
        },

        getById: function(id) {
            return this.map[id] || null;
        },

        add: function(id, rec, silent) {

            var self    = this;

            if (typeof id != "string" && typeof id != "number") {

                rec = arguments[0];

                if ($.isArray(rec)) {

                    if (!rec.length) {
                        return;
                    }

                    var prevLength  = self.length;

                    for (var i = 0, len = rec.length; i < len; i++) {
                        rec[i]  = self.processDataItem(rec[i]);
                        self.add(self.getRecordId(rec[i]), rec[i], true);
                    }

                    if (!silent) {
                        // fn(index, rec)
                        self.trigger('add', prevLength, rec);
                    }
                    return;
                }
                else {
                    rec = self.processDataItem(rec);
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

            if (!silent) {
                self.trigger('add', self.length - 1, [rec]);
            }
        },

        /**
         * @protected
         */
        detachRecord: function(rec) {
            rec.un("change", self.onRecordChange, self);
            rec.un("destroy", self.onRecordDestroy, self);
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

                if (self.recordType) {
                    self.detachRecord(rec);
                }

                if (self.recordType && self.destroyRecords) {
                    rec.destroy();
                    return rec = null;
                }
                else {
                    return rec;
                }
            }
            return false;
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
            self.reset();
            self.trigger('clear', recs);
        },

        reset: function() {
            this._reset();
        },

        /**
         * @private
         */
        _reset: function(noRecordType) {
            var self    = this,
                ds      = self.destroyRecords,
                i, len;

            if (!noRecordType && self.recordType) {
                for (i = 0, len = self.items.length; i < len; i++) {
                    self.detachRecord(self.items[i]);
                    if (ds) {
                        self.items[i].destroy();
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

        destroy: function() {

            var self    = this;

            self.trigger("destroy", self);
            self.removeAllListeners("clear");
            self.clear();

            self.supr();
        },


        insert: function(index, id, rec) {
            var self = this;
            if(arguments.length == 2){
                rec = arguments[1];
                id = self.getRecordId(rec);
            }
            rec = self.processDataItem(rec);
            if(self.containsId(id)){
                self.suspendAllEvents();
                self.removeId(id);
                self.resumeAllEvents();
            }
            if(index >= self.length){
                return self.add(id, rec);
            }
            self.length++;
            self.items.splice(index, 0, rec);
            if(typeof id != 'undefined' && id !== null){
                self.map[id] = rec;
            }
            self.keys.splice(index, 0, id);
            self.trigger('add', index, [rec]);
            return rec;
        },

        indexOf: function(rec) {
            return this.items.indexOf(rec);
        },

        indexOfId: function(id) {
            return this.keys.indexOf(id);
        },

        getCount: function() {
            return this.length;
        },

        getTotalCount: function() {
            return this.totalLength;
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


        replace: function(id, rec) {
            var self    = this;
            if(arguments.length == 1){
                rec = arguments[0];
                id = self.getRecordId(rec);
            }
            rec         = self.processDataItem(rec);
            var old = self.map[id];
            if(typeof id == 'undefined' || id === null || typeof old == 'undefined'){
                return self.add(id, rec);
            }

            if (self.recordType) {
                self.detachRecord(old);

                if (self.destroyRecords) {
                    old.destroy();
                    old = null;
                }
            }

            var index = self.indexOfId(id);
            self.items[index] = rec;
            self.map[id] = rec;
            self.trigger('replace', id, old, rec);
            return rec;
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
                rt      = self.recordType ? true : false,
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


        filter: function(fn, fnScope, params) {

            var self    = this;
            self.trigger("beforefilter", self);
            self.suspendAllEvents();

            if (!self.filterBackup) {
                self.filterBackup   = {
                    length:         self.length,
                    totalLength:    self.totalLength,
                    items:          self.items,
                    keys:           self.keys,
                    map:            self.map
                };
            }

            self._reset(true);

            self.filtered           = true;

            var k   = self.filterBackup.keys,
                it  = self.filterBackup.items;

            for(var i = 0, len = it.length; i < len; i++){
                if(fn.call(fnScope, it[i], k[i], params)){
                    self.items.push(it[i]);
                    self.keys.push(k[i]);
                    self.length++;
                    self.map[k[i]] = it[i];
                }
            }

            self.totalLength    = self.length;

            self.resumeAllEvents();
            self.trigger("filter", self);
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
            self.totalLength    = self.filterBackup.totalLength;
            self.items          = self.filterBackup.items;
            self.keys           = self.filterBackup.keys;
            self.map            = self.filterBackup.map;

            self.filterBackup   = null;

            self.resumeAllEvents();

            if (!silent) {
                self.trigger("clearfilter", self);
            }
        },


        collect: function(f) {

            var coll    = [],
                self    = this,
                rt      = self.recordType;

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
            var s   = MetaphorJs.create("MetaphorJs.data.Store", {idProperty: 0});
            s.loadArray(d);
            return s;
        }
    }
);
