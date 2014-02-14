
MetaphorJs.define("MetaphorJs.cmp.DataList", "MetaphorJs.cmp.Component", {

    store:              null,
    destroyStore:       true,

    elList:             null,
    listSelector:       null,
    itemSelector:       null,
    itemTpl:            null,

    addClearfix:        false,
    emptyText:          "",
    emptyCls:           null,

    continuousScroll:   false,
    continuousOffset:   50,
    continuousTmt:      null,
    continuousTime:     300,
    continuousSelector: null,
    elContinuous:       null,

    initComponent: function() {

        var self    = this;

        self.checkWindowScrollDelegate  = MetaphorJs.fn.delegate(self.checkWindowScroll, self);
        self.onWindowScrollDelegate     = MetaphorJs.fn.delegate(self.onWindowScroll, self);

        self.initStore();
        self.supr();
    },


    initStore: function() {
        this.setStoreEvents("on");
    },

    setStoreEvents: function(mode) {

        var self    = this,
            store   = self.store;

        if (store) {
            store[mode]("beforeload", self.onBeforeStoreLoad, self);
            store[mode]("load", self.onStoreLoad, self);
            store[mode]("filter", self.onStoreFilter, self);
            store[mode]("clearfilter", self.onStoreClearFilter, self);
            store[mode]("add", self.onStoreAdd, self);
            store[mode]("replace", self.onStoreReplace, self);
            store[mode]("remove", self.onStoreRemove, self);
            store[mode]("clear", self.onStoreClear, self);
        }
    },

    getStore: function() {
        return this.store;
    },

    afterRender: function() {

        var self    = this,
            id      = self.id;

        if (!self.elList) {
            if (self.listSelector === null) {
                self.elList     = self.el;
            }
            else {
                self.elList     = self.listSelector ?
                    $(self.listSelector, self.dom) :
                    $("#"+id+"-list");
            }
        }

        self.supr();

        if (self.store.isLoaded()) {
            self.onStoreLoad();
        }

        if (self.itemSelector) {
            self.elList.delegate(
                self.itemSelector,
                "click",
                MetaphorJs.fn.delegate(self.onRowClick, self)
            );
        }

        if (self.continuousScroll) {
            $(window).bind("scroll", self.onWindowScrollDelegate);
        }

        if (self.continuousSelector) {
            self.elContinuous = $(self.continuousSelector, self.dom);
        }

    },

    onRowClick: function(e) {

        var self    = this,
            el      = self.getItemByEvent(e),
            rec     = self.getRecordByEl(el);

        if (rec) {
            self.onItemClick(e, rec, el);
            self.trigger("itemclick", rec, el);
        }
    },

    /**
     * @param e
     * @param rec
     * @param el
     */
    onItemClick: MetaphorJs.emptyFn,

    getItemByEvent: function(e) {
        var trg     = $(e.target);
        if (!trg.is(this.itemSelector)) {
            trg     = trg.parents(this.itemSelector).eq(0);
        }
        return trg;
    },

    getElById: function(id) {
        var self    = this,
            el      = $("[data-id="+id+"]", self.dom);
        return el.length ? el : null;
    },

    getRecordByEl: function(el) {
        var id      = el.attr("data-id");
        return this.store.getById(id);
    },

    getRecordByEvent: function(e) {
        var self    = this,
            el      = self.getItemByEvent(e);
        if (el && el.length) {
            return self.getRecordByEl(el);
        }
    },





    toggleEmpty: function() {

        var self    = this,
            store   = self.store,
            empty   = store.getLength() == 0;

        self.el[empty ? "addClass" : "removeClass"](self.emptyCls);

        if (empty && self.emptyText) {
            self.elList.html(self.emptyText);
        }

        if (self.elContinuous) {
            self.elContinuous[store.getLength() >= store.getTotalLength() ? "hide" : "show"]();
        }
    },


    onBeforeStoreLoad: MetaphorJs.emptyFn,

    onStoreLoad: function() {

        var self    = this;

        if (self.rendered) {
            self.renderAll();
            self.toggleEmpty();
        }
    },

    onStoreFilter: function() {
        this.renderAll();
        this.toggleEmpty();
    },

    onStoreClearFilter: function() {
        this.renderAll();
        this.toggleEmpty();
    },

    onStoreAdd: function(inx, recs) {

        var self    = this,
            html    = self.renderRows(inx, recs),
            item;

        if (inx == 0) {
            self.elList.html(html);

            if (self.addClearfix) {
                self.elList.append(self.addClearfix);
            }
        }
        else {
            item = $(self.itemSelector + ':eq('+(inx-1)+')', self.elList.get(0));
            item.after(html);
        }

        self.toggleEmpty();
    },

    onStoreReplace: function(id, oldRec, newRec) {

        var self    = this,
            el      = self.getElById(id),
            inx     = self.store.indexOf(id),
            html    = self.renderRows(inx, [newRec]);

        el.replaceWith(html);
    },

    onStoreRemove: function(rec, id) {
        var self    = this,
            el      = self.getElById(id);

        if (el) {
            el.remove();
        }

        self.toggleEmpty();
    },

    onStoreClear: function() {
        this.elList.html("");
        this.toggleEmpty();
    },

    renderAll: function() {

        var self    = this,
            store   = self.store;

        if (store.getLength() > 0) {
            self.elList.html(self.renderRows(0, store.getRange()));
        }
        else {
            self.toggleEmpty();
        }
    },

    /**
     * @param inx
     * @param rows
     */
    renderRows: function(inx, rows) {

        var self    = this,
            html    = "",
            i, len;

        for (i = 0, len = rows.length; i < len; i++) {
            html    += self.renderOneRow(inx + i, rows[i]);
        }

        return html;
    },

    renderOneRow: function(inx, rec) {

        var self    = this,
            tpl     = self.itemTpl,
            data    = rec instanceof MetaphorJs.data.Record ? rec.getData() : rec,
            key;

        if (tpl) {
            for (key in data) {
                while (tpl.indexOf('{'+key+'}') != -1) {
                    tpl     = tpl.replace('{'+key+'}', data[key]);
                }
            }
        }

        return tpl;
    },





    onWindowScroll: function() {

        var self = this;

        if (!self.continuousTmt) {
            self.continuousTmt  = window.setTimeout(
                self.checkWindowScrollDelegate,
                self.continuousTime
            );
        }
    },

    /**
     * right now continuous scrolling works only
     * within window
     */
    checkWindowScroll: function() {

        var self    = this,
            store   = self.store;

        if (!store ||
            store.isLocal() ||
            store.getLength() >= store.getTotalLength()) {

            self.continuousTmt  = null;
            return;
        }

        var w       = $(window),
            wh      = w.height(),
            st      = w.scrollTop(),
            dsh     = document.documentElement.scrollHeight,
            bsh     = document.body.scrollHeight,
            sh      = Math.max(dsh, bsh),
            bottom  = sh - (wh + st);

        if (bottom <= self.continuousOffset) {
            self.store.addNextPage(function(){
                self.continuousTmt  = null;
            });
        }
        else {
            self.continuousTmt  = null;
        }
    },









    onDestroy: function() {

        var self    = this;

        if (self.store) {
            if (self.destroyStore) {
                self.store.destroy();
            }
            else {
                self.setStoreEvents("un");
            }
            self.store  = null;
        }

        $(window).unbind("scroll", self.onWindowScrollDelegate);

        self.supr();
    }

});
