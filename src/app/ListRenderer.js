
require("../func/dom/commentWrap.js");
require("../func/dom/getAttr.js");
require("../func/dom/toFragment.js");
require("./Renderer.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("../lib/MutationObserver.js");
require("../lib/Config.js");
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-animate/src/animate/isCssSupported.js");
require("../func/app/prebuilt.js");

var cls = require("metaphorjs-class/src/cls.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    isNull = require("metaphorjs-shared/src/func/isNull.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    isNumber = require("metaphorjs-shared/src/func/isNumber.js"),
    isPrimitive = require("metaphorjs-shared/src/func/isPrimitive.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    isFunction = require("metaphorjs-shared/src/func/isFunction.js"),
    levenshteinDiff = require("metaphorjs-shared/src/func/levenshteinDiff.js"),
    levenshteinMove = require("metaphorjs-shared/src/func/levenshteinMove.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.ListRenderer = cls({

    id: null,
    config: null,
    scope: null,
    listSourceExpr: null,
    itemScopeName: null,

    _tagMode: false,
    _animateMove: false,
    _animate: false,
    _buffered: false,
    _trackBy: null,
    _parentRenderer: null,
    _template: null,
    _items: null,
    _prevEl: null,
    _nextEl: null,
    _renderQueue: null,
    _attachQueue: null,
    _mo: null,
    _trackByFn: null,
    _filterFn: null,
    _localTrack: false,
    _griDelegate: null,

    $constructor: function(scope, node, config, parentRenderer, attrSet) {

        var self = this;

        self.config         = config;
        self.scope          = scope;
        self.initConfig();

        self._tagMode       = node.nodeName.toLowerCase() === "mjs-each";
        self._animateMove   = !self._tagMode && 
                                !config.hasValue("buffered") &&
                                config.get("animateMove") && 
                                MetaphorJs.animate.isCssSupported();

        self._animate       = !self._tagMode && 
                                !config.hasValue("buffered") && 
                                config.get("animate");

        if (self._animate) {
            self.$plugins.push(config.get("animatePlugin"));
        }

        if (config.hasValue("observable")) {
            self.$plugins.push("MetaphorJs.plugin.Observable");
        }

        if (config.hasValue("buffered") && !self._tagMode) {
            self._buffered = true;
            var buff = config.get("buffered");
            buff === true && (buff = config.getProperty("buffered").defaultValue);
            self.$plugins.push(buff);
        }

        if (config.has('plugin')) {
            self.$plugins.push(config.get("plugin"));
        }

        if (config.has("filter")) {
            self._filterFn = config.get("filter");
            if (typeof self._filterFn !== "function") {
                throw new Error("{each.$filter} must be a function");
            }
        }

        self._trackBy = config.get("trackBy");
    },

    $init: function(scope, node, config, parentRenderer, attrSet) {

        var self = this,
            expr = self._tagMode ? 
                        MetaphorJs.dom.getAttr(node, "value") : 
                        config.getExpression("value");

        self._parseExpr(expr);

        self._template  = self._tagMode ? 
                            MetaphorJs.dom.toFragment(node.childNodes) : 
                            node;
        self._items     = [];
        self.id         = config.has('id') ? config.get('id') : nextUid();

        if (!self._trackBy && self._trackBy !== false) {
            self._localTrack = true;
        }

        var cmts = MetaphorJs.dom.commentWrap(node,  "list-" + self.id);
        self._prevEl    = cmts[0];
        self._nextEl    = cmts[1];

        self._parentRenderer    = parentRenderer;
        self._renderQueue       = new MetaphorJs.lib.Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: MetaphorJs.lib.Queue.ONCE
        });
        self._attachQueue       = new MetaphorJs.lib.Queue({
            async: "raf", auto: true, thenable: true,
            stack: false, context: self, mode: MetaphorJs.lib.Queue.ONCE
        });

        node.parentNode.removeChild(node);

        self.initDataSource();
        self.scope.$app.registerCmp(self, "id");

        self._renderQueue.add(self.render, self, [self.getList()]);
    },

    getList: function() {
        var list = toArray(this._mo.getValue()),
            i, l, filter = this._filterFn;

        if (filter) {
            var all = list;
            list = [];
            for (i = 0, l = all.length; i < l; i++) {
                if (filter(all[i])) {
                    list.push(all[i]);
                }
            }
        }
        return list;
    },

    initConfig: function() {
        var config = this.config,
            ms = MetaphorJs.lib.Config.MODE_STATIC;
        config.setType("animate", "bool", ms, false);
        config.setType("animateMove", "bool", ms, false);
        config.setDefaultMode("trackBy", ms);
        config.setDefaultMode("id", ms);
        config.setDefaultMode("plugin", ms);
        config.setType("observable", "bool", ms, false);
        config.setDefaultValue("buffered", "MetaphorJs.plugin.ListBuffered");
        config.setType("animatePlugin", null, ms, "MetaphorJs.plugin.ListAnimated");
    },

    initDataSource: function() {

        var self        = this;
        self._mo        = MetaphorJs.lib.MutationObserver.get(
                            self.scope, self.listSourceExpr, 
                            self.onChange, self,
                            {
                                localFilter: bind(self.localTracklistFilter, self)
                            }
                        );
        if (self._localTrack && !self._trackBy) {
            self._trackBy = "$$" + self._mo.id;
        }
        self._griDelegate = bind(self.scopeGetRawIndex, self);
    },

    trigger: emptyFn,

    /*
     * <!-- render and re-render
     */

    render: function(list) {

        var self        = this,
            items       = self._items,
            tpl         = self._template,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {
            items.push(self.createItem(tpl.cloneNode(true), list, i));
        }

        self.renderOrUpdate();
        self._attachQueue.add(self.attachAllItems, self);
    },

    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemScopeName,
            itemScope   = self.scope.$new(),
            tm          = self._tagMode;

        itemScope.$on("changed", self.scope.$check, self.scope);

        itemScope[iname]    = self.getListItem(list, index);
        el = tm ? toArray(el.childNodes) : el;

        return {
            index: index,
            action: "enter",
            el: el,
            placeholder: window.document.createComment("*list*" + index + "*"),
            scope: itemScope,
            attached: false,
            rendered: false,
            hidden: false
        };
    },

    attachAllItems: function() {

        var self        = this,
            fragment    = window.document.createDocumentFragment(),
            items       = self._items,
            tm          = self._tagMode,
            i, len;

        for (i = 0, len = items.length; i < len; i++) {

            if (!items[i].hidden) {
                if (tm) {
                    fragment.appendChild(MetaphorJs.dom.toFragment(items[i].el));
                }
                else {
                    fragment.appendChild(items[i].el);
                }
                items[i].attached = true;
                fragment.appendChild(items[i].placeholder);
            }
        }

        self._nextEl.parentNode && 
            self._nextEl.parentNode.insertBefore(fragment, self._nextEl);
        self.trigger("attached", self);
    },

    renderOrUpdate: function(start, end, action, renderOnly) {

        var self        = this,
            items       = self._items,
            index       = start || 0,
            cnt         = items.length,
            x           = end || cnt - 1,
            list        = self.getList(),
            trackByFn   = self.getTrackByFunction();

        if (x > cnt - 1) {
            x = cnt - 1;
        }

        for (; index <= x; index++) {

            if (action && items[index].action !== action) {
                continue;
            }

            self.renderItem(index, items, list, trackByFn, renderOnly);
        }
    },

    renderItem: function(index, items, list, trackByFn, renderOnly) {

        var self = this;

        list = list || self.getList();
        items = items || self._items;
        trackByFn = trackByFn || self.getTrackByFunction();

        var item        = items[index],
            scope       = item.scope,
            last        = items.length - 1,
            even        = !(index % 2);

        if (renderOnly && item.rendered) {
            return;
        }

        scope.$index    = index;
        scope.$first    = index === 0;
        scope.$last     = index === last;
        scope.$even     = even;
        scope.$odd      = !even;
        scope.$trackId  = trackByFn(list[index]);
        scope.$getRawIndex = self.griDelegate;

        if (!item.renderer) {
            item.renderer  = new MetaphorJs.app.Renderer;
            scope.$on("destroy", item.renderer.$destroy, item.renderer);
            item.renderer.process(item.el, scope);
            item.rendered = true;
        }
        else {
            scope.$check();
        }
    },


    

    /*
     * render and re-render -->
     */

    /*
     * <!-- reflect changes
     */

    onChange: function(current, prev) {
        var self = this;
        self._renderQueue.prepend(self.applyChanges, self, [prev], 
                                    MetaphorJs.lib.Queue.REPLACE);
    },

    applyChanges: function(prevList) {

        

        var self        = this,
            items       = self._items,
            tpl         = self._template,
            index       = 0,
            list        = self.getList(),
            updateStart = null,
            animateMove = self._animateMove,
            newItems    = [],
            iname       = self.itemScopeName,
            origItems   = items.slice(),
            doesMove    = false,
            prevItem,
            prevItemInx,
            i, len,
            item,
            action;

        // if we don't track items, we just re-render the whole list
        if (!self._trackBy) {
            items = self._items.slice();
            updateStart = 0;
            doesMove = false;
            for (i = 0, len = list.length; i < len; i++) {
                item = self.createItem(tpl.cloneNode(true), list, i);
                newItems.push(item);
            }
        }
        // if items are tracked
        else {
            // we generate a move prescription
            // by finding an array difference.
            // But we don't compare original arrays, 
            // we only compare list of ids - 
            // since we only care about position change.
            var prevTrackList = self.getTrackList(prevList),
                trackList = self.getTrackList(list),
                prs = levenshteinDiff(prevTrackList, trackList),
                movePrs = levenshteinMove(
                    prevTrackList, trackList, 
                    prs.prescription, 
                    function(item) { return item }
                );

            // move prescription is a list of instructions
            // of the same length as new list of items.
            // it either contains number - index of 
            // item in the old list, or something else
            // which basically means - create a new item
            for (i = 0, len = movePrs.length; i < len; i++) {

                action = movePrs[i];

                // int entry is a position of old item
                // in the new order of things.
                if (isNumber(action)) {
                    prevItemInx = action;
                    prevItem    = items[prevItemInx];

                    if (prevItemInx !== index && isNull(updateStart)) {
                        updateStart = i;
                    }

                    prevItem.action = "move";
                    prevItem.scope[iname] = self.getListItem(list, i);
                    doesMove = animateMove;

                    newItems.push(prevItem);
                    items[prevItemInx] = null;
                    index++;
                }
                else {
                    if (isNull(updateStart)) {
                        updateStart = i;
                    }
                    item = self.createItem(tpl.cloneNode(true), list, i);
                    newItems.push(item);
                    // add new elements to old renderers
                    // so that we could correctly determine positions
                }
            }
        }

        self._items  = newItems;

        self.reflectChanges({
            oldItems:       items,
            updateStart:    updateStart,
            newItems:       newItems,
            origItems:      origItems,
            doesMove:       doesMove
        });
    },


    reflectChanges: function(vars) {
        var self = this;
        self.renderOrUpdate();
        self.applyDomPositions(vars.oldItems);
        self.removeOldElements(vars.oldItems);
        self.trigger("change", self);
    },



    removeOldElements: function(items) {
        var i, len, item,
            j, jl,
            self = this,
            tm = self._tagMode;

        for (i = 0, len = items.length; i < len; i++) {
            item = items[i];
            if (item && item.attached) {
                item.attached = false;
                if (!tm) {
                    item.el.parentNode && item.el.parentNode.removeChild(item.el);
                }
                else {
                    for (j = 0, jl = item.el.length; j < jl; j++) {
                        if (item.el[j].parentNode) {
                            item.el[j].parentNode.removeChild(item.el[j]);
                        }
                    }
                }
                item.placeholder.parentNode && 
                    item.placeholder.parentNode.removeChild(item.placeholder);
            }
            if (item && item.scope) {
                item.scope.$destroy();
                item.rendered = false;
            }
        }
    },


    applyDomPositions: function() {

        var self        = this,
            items       = self._items,
            tm          = self._tagMode,
            nc          = self._nextEl,
            next, parent,
            i, j, l, el, item, first;

        for (i = 0, l = items.length; i < l; i++) {
            item = items[i];
            el = item.el;
            next = null;

            if (item.hidden) {
                if (tm) {
                    MetaphorJs.dom.toFragment(el);
                }
                else if (el.parentNode) { 
                    el.parentNode.removeChild(el);
                }
                item.placeholder.parentNode && 
                    item.placeholder.parentNode.removeChild(item.placeholder);
                item.attached = false;
                continue;
            }

            for (j = Math.max(i - 1, 0); j >= 0; j--) {
                if (items[j].attached) {
                    next = items[j].placeholder.nextSibling;
                    break;
                }
            }

            if (!next) {
                next = nc;
            }

            first = tm ? el[0] : el;
            parent = next.parentNode;

            if (first !== next) {
                if (next && item.placeholder.nextSibling !== next) {
                    parent.insertBefore(tm ? MetaphorJs.dom.toFragment(el) : el, next);
                    parent.insertBefore(item.placeholder, next);
                }
                else if (!next) {
                    parent.appendChild(tm ? MetaphorJs.dom.toFragment(el) : el);
                    parent.appendChild(item.placeholder);
                }
            }

            item.attached = true;
        }
    },

    /*
     * reflect changes -->
     */


    /*
     * <!-- configurable item functions
     */


    getListItem: function(list, index) {
        return list[index];
    },

    getTrackByFunction: function() {

        var self = this,
            trackBy;

        if (!self._trackByFn) {

            trackBy = self._trackBy;

            if (!trackBy || trackBy === '$') {
                self._trackByFn = function(item) {
                    return isPrimitive(item) ? item : undf;
                };
            }
            else if (isFunction(trackBy)) {
                self._trackByFn = trackBy;
            }
            else {
                self._trackByFn = function(item) {
                    if (item && !isPrimitive(item)) {
                        if (self._localTrack && !item[trackBy]) {
                            item[trackBy] = nextUid();
                        }
                        return item[trackBy];
                    }
                    else return undf;
                    //return item && !isPrimitive(item) ? item[trackBy] : undf;
                };
            }
        }

        return self._trackByFn;
    },

    localTracklistFilter: function(rawList, mo) {
        if (!rawList) {
            return [];
        }
        if (!isArray(rawList)) {
            rawList = [rawList];
        }
        var self = this;
        if (self._trackBy !== false && self._localTrack) {
            if (!self._trackBy) {
                self._trackBy = "$$" + mo.id;
            }

            self.getTrackList(rawList);
        }
        return rawList;
    },

    getTrackList: function(list) {
        var trackByFn = this.getTrackByFunction(),
            trackList = [],
            i, l;
        for (i = -1, l = list.length; ++i < l; 
            trackList.push(trackByFn(list[i]))){}
        return trackList;
    },


    scopeGetRawIndex: function(id) {

        if (id === undf) {
            return -1;
        }

        var self        = this,
            list        = self.getList(),
            trackByFn   = self.getTrackByFunction(),
            i, l;

        for (i = 0, l = list.length; i < l; i++) {
            if (trackByFn(list[i]) === id) {
                return i;
            }
        }

        return -1;
    },

    /*
     * configurable item functions -->
     */



    _parseExpr: function(expr) {

        var parts, pb;

        if (MetaphorJs.app.prebuilt.isKey(expr)){
            pb = MetaphorJs.app.prebuilt.get("config", expr);
            parts = {
                model: pb,
                name: pb.inflate.itemName
            };
            this.listSourceExpr = pb;
        }
        else {
            parts = MetaphorJs.app.Directive.getDirective("attr", "each")
                             .splitExpression(expr);
            this.listSourceExpr = parts.model;
        }

        this.itemScopeName = parts.name;
    },


    onDestroy: function() {

        var self        = this,
            items       = self._items,
            i, len;

        for (i = 0, len = items.length; i < len; i++) {
            if (items[i].renderer && !items[i].renderer.$destroyed) {
                items[i].renderer.$destroy();
            }
        }

        self._renderQueue.$destroy();
        self._attachQueue.$destroy();

        if (self._mo) {
            self._mo.unsubscribe(self.onChange, self);
            self._mo.$destroy(true);
        }
    }

});
