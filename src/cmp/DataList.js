/**
 * @namespace MetaphorJs
 * @class MetaphorJs.cmp.DataList
 * @extends MetaphorJs.cmp.Component
 */
MetaphorJs.define("MetaphorJs.cmp.DataList", "MetaphorJs.cmp.Component", {

    /**
     * @var MetaphorJs.data.Store
     * @access protected
     */
    store:              null,

    /**
     * @var bool
     * @access protected
     */
    destroyStore:       true,

    /**
     * @var jQuery
     * @access protected
     */
    elList:             null,

    /**
     * @var string
     * @access protected
     */
    listSelector:       null,

    /**
     * @var string
     * @access protected
     */
    itemSelector:       null,

    /**
     * @var string
     * @access protected
     */
    itemTpl:            null,

    /**
     * @var bool
     * @access protected
     */
    addClearfix:        false,

    /**
     * @var string
     * @access protected
     */
    emptyText:          "",

    /**
     * @var string
     * @access protected
     */
    emptyCls:           null,

    /**
     * @var bool
     * @access protected
     */
    continuousScroll:   false,

    /**
     * @var number
     * @access protected
     */
    continuousOffset:   50,

    /**
     * @var number
     * @access protected
     */
    continuousTmt:      null,

    /**
     * @var number
     * @access protected
     */
    continuousTime:     300,

    /**
     * @var string
     * @access protected
     */
    continuousSelector: null,

    /**
     * @var jQuery
     * @access protected
     */
    elContinuous:       null,

    /**
     * @method initialize
     * @param {object} cfg {
     *      @type MetaphorJs.data.Store store
     *      @type bool destroyStore { @default true }
     *      @type string listSelector
     *      @type string itemSelector
     *      @type string itemTpl
     *      @type bool addClearfix { @default false }
     *      @type string emptyText { @default "" }
     *      @type string emptyCls
     *      @type bool continuousScroll { @default false }
     *      @type number continuousOffset { @default 50 }
     *      @type number continuousTime { @default 300 }
     *      @type string continuousSelector
     * }
     */

    /**
     * @access protected
     */
    initComponent: function() {

        var self    = this,
            bind    = MetaphorJs.bind;

        self.checkWindowScrollDelegate  = bind(self.checkWindowScroll, self);
        self.onWindowScrollDelegate     = bind(self.onWindowScroll, self);

        self.initStore();
        self.supr();
    },


    /**
     * @access private
     * @method
     */
    initStore: function() {
        this.setStoreEvents("on");
    },

    /**
     * @access private
     * @method
     */
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

    /**
     * @access public
     * @returns MetaphorJs.data.Store
     */
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
                MetaphorJs.bind(self.onRowClick, self)
            );
        }

        if (self.continuousScroll) {
            $(window).bind("scroll", self.onWindowScrollDelegate);
        }

        if (self.continuousSelector) {
            self.elContinuous = $(self.continuousSelector, self.dom);
        }

    },

    /**
     * @access protected
     * @param {jQuery.Event} e
     */
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
     * @access protected
     * @method
     * @param {jQuery.Event} e
     * @param {MetaphorJs.data.Record} rec
     * @param {jQuery} el
     */
    onItemClick: MetaphorJs.emptyFn,

    /**
     * @access public
     * @param {jQuery.Event} e
     * @returns jQuery
     */
    getItemByEvent: function(e) {
        var trg     = $(e.target);
        if (!trg.is(this.itemSelector)) {
            trg     = trg.parents(this.itemSelector).eq(0);
        }
        return trg;
    },

    /**
     * @access public
     * @param {string|int} id Record id
     * @returns jQuery|null
     */
    getElById: function(id) {
        var self    = this,
            el      = $("[data-id="+id+"]", self.dom);
        return el.length ? el : null;
    },

    /**
     * @access public
     * @param {jQuery} el
     * @returns MetaphorJs.data.Record
     */
    getRecordByEl: function(el) {
        var id      = el.attr("data-id");
        return this.store.getById(id);
    },

    /**
     * @access public
     * @param {jQuery.Event} e
     * @returns MetaphorJs.data.Record|null
     */
    getRecordByEvent: function(e) {
        var self    = this,
            el      = self.getItemByEvent(e);

        if (el && el.length) {
            return self.getRecordByEl(el);
        }
        return null;
    },


    /**
     * @access protected
     * @method
     */
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

    /**
     * @access protected
     * @method
     */
    onBeforeStoreLoad: MetaphorJs.emptyFn,

    /**
     * @access protected
     * @method
     */
    onStoreLoad: function() {

        var self    = this;

        if (self.rendered) {
            self.renderAll();
            self.toggleEmpty();
        }
    },

    /**
     * @access protected
     * @method
     */
    onStoreFilter: function() {
        this.renderAll();
        this.toggleEmpty();
    },

    /**
     * @access protected
     * @method
     */
    onStoreClearFilter: function() {
        this.renderAll();
        this.toggleEmpty();
    },

    /**
     * @access protected
     * @method
     * @param {number} inx
     * @param {[]} recs
     */
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

    /**
     * @access protected
     * @method
     * @param {string|int} id
     * @param {MetaphorJs.data.Record} oldRec
     * @param {MetaphorJs.data.Record} newRec
     */
    onStoreReplace: function(id, oldRec, newRec) {

        var self    = this,
            el      = self.getElById(id),
            inx     = self.store.indexOf(id),
            html    = self.renderRows(inx, [newRec]);

        el.replaceWith(html);
    },

    /**
     * @access protected
     * @method
     * @param {MetaphorJs.data.Record} rec
     * @param {string|int} id
     */
    onStoreRemove: function(rec, id) {
        var self    = this,
            el      = self.getElById(id);

        if (el) {
            el.remove();
        }

        self.toggleEmpty();
    },

    /**
     * @access protected
     * @method
     */
    onStoreClear: function() {
        this.elList.html("");
        this.toggleEmpty();
    },

    /**
     * @access protected
     * @method
     */
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
     * @access protected
     * @method
     * @param {number} inx
     * @param {[]} rows
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

    /**
     * @access protected
     * @method
     * @param {number} inx
     * @param {MetaphorJs.data.Record} rec
     */
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




    /**
     * @access protected
     * @method
     */
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
     * @access protected
     * @method
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
