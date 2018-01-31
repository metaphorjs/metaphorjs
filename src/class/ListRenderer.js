var createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    animate = require("metaphorjs-animate/src/func/animate.js"),

    defineClass = require("metaphorjs-class/src/func/defineClass.js"),

    filterLookup = require("../func/filterLookup.js"),
    toArray = require("../func/array/toArray.js"),
    nextUid = require("../func/nextUid.js"),
    emptyFn = require("../func/emptyFn.js"),
    Renderer = require("./Renderer.js"),
    Queue = require("../lib/Queue.js"),
    isNull = require("../func/isNull.js"),
    isNumber = require("../func/isNumber.js"),
    isPrimitive = require("../func/isPrimitive.js"),
    bind = require("../func/bind.js"),
    undf = require("../var/undf.js"),
    isFunction = require("../func/isFunction.js"),
    getAttr = require("../func/dom/getAttr.js");



module.exports = defineClass({

    $class: "ListRenderer",

    id: null,

    cfg: null,
    model: null,
    itemName: null,
    tpl: null,
    renderers: null,
    parentEl: null,
    prevEl: null,
    nextEl: null,
    trackBy: null,
    trackByWatcher: null,
    animateMove: false,
    animate: false,
    trackByFn: null,
    griDelegate: null,
    tagMode: false,

    queue: null,

    buffered: false,
    bufferPlugin: null,

    $constructor: function(scope, node, expr, parentRenderer, attrMap) {

        var self    = this,
            cfg     = attrMap['modifier']['each'] ?
                        attrMap['modifier']['each'].value : {};

        self.cfg            = cfg;
        self.scope          = scope;

        self.tagMode        = node.nodeName.toLowerCase() === "mjs-each";
        self.animateMove    = !self.tagMode && !cfg['buffered'] &&
                                cfg["animateMove"] && animate.cssAnimationSupported();
        self.animate        = !self.tagMode && !cfg['buffered'] && cfg["animate"];
        self.id             = cfg['id'] || nextUid();

        if (self.animate) {
            self.$plugins.push(cfg['animatePlugin'] || "plugin.ListAnimated");
        }

        if (cfg['observable']) {
            self.$plugins.push(cfg['observable'] || "plugin.Observable");
        }

        if (self.tagMode) {
            cfg['buffered'] = false;
        }

        if (cfg['buffered']) {
            self.buffered = true;
            self.$plugins.push(cfg['buffered'] || "plugin.ListBuffered");
        }

        if (cfg['plugin']) {
            self.$plugins.push(cfg['plugin']);
        }
    },

    $init: function(scope, node, expr, parentRenderer, attrMap) {

        var self = this;

        //removeAttr(node, "include");

        if (self.tagMode) {
            expr = getAttr(node, "value");
        }

        self.parseExpr(expr);

        self.tpl        = self.tagMode ? toFragment(node.childNodes) : node;
        self.renderers  = [];
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;
        self.parentEl   = node.parentNode;
        self.node       = null; //node;

        self.queue      = new Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: Queue.ONCE
        });

        self.parentEl.removeChild(node);

        self.afterInit(scope, node, expr, parentRenderer, attrMap);

        self.queue.add(self.render, self, [toArray(self.watcher.getLastResult())]);
    },

    afterInit: function(scope, node) {

        var self        = this,
            cfg         = self.cfg;

        self.watcher    = createWatchable(scope, self.model, self.onChange, self, {filterLookup: filterLookup});
        self.trackBy    = cfg.trackBy;
        if (self.trackBy && self.trackBy !== '$') {
            self.trackByWatcher = createWatchable(scope, self.trackBy, self.onChangeTrackBy, self, {filterLookup: filterLookup});
        }
        else if (self.trackBy !== '$' && !self.watcher.hasInputPipes()) {
            self.trackBy    = '$$'+self.watcher.id;
        }

        self.griDelegate = bind(self.scopeGetRawIndex, self);
    },

    trigger: emptyFn,

    /*
     * <!-- render and re-render
     */

    render: function(list) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {
            renderers.push(self.createItem(tpl.cloneNode(true), list, i));
        }

        self.doRender();
    },

    doRender: function() {

        var self        = this,
            fragment    = window.document.createDocumentFragment(),
            renderers   = self.renderers,
            tm          = self.tagMode,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {

            if (!renderers[i].hidden) {
                if (tm) {
                    fragment.appendChild(toFragment(renderers[i].el));
                }
                else {
                    fragment.appendChild(renderers[i].el);
                }
                renderers[i].attached = true;
            }
        }

        self.parentEl.insertBefore(fragment, self.nextEl);
        self.doUpdate();

        self.trigger("render", self);
    },

    doUpdate: function(start, end, action, renderOnly) {

        var self        = this,
            renderers   = self.renderers,
            index       = start || 0,
            cnt         = renderers.length,
            x           = end || cnt - 1,
            list        = self.watcher.getLastResult(),
            trackByFn   = self.getTrackByFunction();

        if (x > cnt - 1) {
            x = cnt - 1;
        }

        for (; index <= x; index++) {

            if (action && renderers[index].action !== action) {
                continue;
            }

            self.renderItem(index, renderers, list, trackByFn, renderOnly);
        }
    },

    renderItem: function(index, rs, list, trackByFn, renderOnly) {

        var self = this;

        list = list || self.watcher.getLastResult();
        rs = rs || self.renderers;
        trackByFn = trackByFn || self.getTrackByFunction();

        var item        = rs[index],
            scope       = item.scope,
            last        = rs.length - 1,
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
            item.renderer  = new Renderer(item.el, scope);
            item.renderer.process();
            item.rendered = true;
        }
        else {
            scope.$check();
        }
    },


    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemName,
            itemScope   = self.scope.$new(),
            tm          = self.tagMode;

        itemScope.$on("changed", self.scope.$check, self.scope);

        itemScope[iname]    = self.getListItem(list, index);
        el = tm ? toArray(el.childNodes) : el;

        return {
            index: index,
            action: "enter",
            el: el,
            firstEl: tm ? el[0] : el,
            lastEl: tm ? el[el.length - 1] : el,
            scope: itemScope,
            attached: false,
            rendered: false,
            hidden: false
        };
    },

    /*
     * render and re-render -->
     */

    /*
     * <!-- reflect changes
     */

    onChange: function(current, prev) {
        var self = this;
        self.queue.prepend(self.applyChanges, self, [prev], Queue.REPLACE);
    },

    applyChanges: function(prevList) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            index       = 0,
            list        = toArray(self.watcher.getLastResult()),
            updateStart = null,
            animateMove = self.animateMove,
            newrs       = [],
            iname       = self.itemName,
            origrs      = renderers.slice(),
            doesMove    = false,
            prevr,
            prevrInx,
            i, len,
            r,
            action,
            prs         = self.watcher.getMovePrescription(prevList, self.getTrackByFunction(), list);

        // redefine renderers
        for (i = 0, len = prs.length; i < len; i++) {

            action = prs[i];

            if (isNumber(action)) {
                prevrInx    = action;
                prevr       = renderers[prevrInx];

                if (prevrInx !== index && isNull(updateStart)) {
                    updateStart = i;
                }

                prevr.action = "move";
                prevr.scope[iname] = self.getListItem(list, i);
                doesMove = animateMove;

                newrs.push(prevr);
                renderers[prevrInx] = null;
                index++;
            }
            else {
                if (isNull(updateStart)) {
                    updateStart = i;
                }
                r = self.createItem(tpl.cloneNode(true), list, i);
                newrs.push(r);
                // add new elements to old renderers
                // so that we could correctly determine positions
            }
        }

        self.renderers  = newrs;

        self.reflectChanges({
            oldRenderers:   renderers,
            updateStart:    updateStart,
            newRenderers:   newrs,
            origRenderers:  origrs,
            doesMove:       doesMove
        });
    },


    reflectChanges: function(vars) {
        var self = this;
        self.applyDomPositions(vars.oldRenderers);
        self.doUpdate(vars.updateStart || 0);
        self.removeOldElements(vars.oldRenderers);
        self.trigger("change", self);
    },



    removeOldElements: function(rs) {
        var i, len, r,
            j, jl,
            self    = this,
            parent  = self.parentEl;

        for (i = 0, len = rs.length; i < len; i++) {
            r = rs[i];
            if (r && r.attached) {
                r.attached = false;
                if (!self.tagMode) {
                    parent.removeChild(r.el);
                }
                else {
                    for (j = 0, jl = r.el.length; j < jl; j++) {
                        parent.removeChild(r.el[j]);
                    }
                }
            }
            if (r && r.scope) {
                r.scope.$destroy();
            }
        }
    },


    applyDomPositions: function(oldrs) {

        var self        = this,
            rs          = self.renderers,
            parent      = self.parentEl,
            prevEl      = self.prevEl,
            tm          = self.tagMode,
            nc          = self.nextEl,
            next,
            i, l, el, r,
            j;

        if (nc && nc.parentNode !== parent) {
            nc = null;
        }
        if (!nc && prevEl && prevEl.parentNode === parent) {
            nc = prevEl.nextSibling;
        }

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;

            if (r.hidden) {
                if (el.parentNode) {
                    if (tm) {
                        el.parentNode.removeChild(toFragment(el));
                    }
                    else {
                        el.parentNode.removeChild(el);
                    }
                    r.attached = false;
                }
                continue;
            }

            // positions of some elements have changed
            if (oldrs) {
                // oldrs looks like [obj, obj, null, obj] where nulls are instead
                // of items that were moved somewhere else
                if (oldrs && oldrs[i]) {
                    // so if item is found in oldrs[i] it means it hasn't moved
                    next = oldrs[i].lastEl.nextSibling;
                }
                // if oldrs is shorter than rs, then we put all following items
                // at the end
                else if (oldrs && oldrs.length && oldrs.length <= i) {
                    next = self.nextEl && self.nextEl.parentNode === parent ?
                           self.nextEl : null;
                }
                // if oldrs[i] === null or it is empty
                // we put the first item before nextEl and all all following
                // items after first one
                else {
                    next = i > 0 ? (rs[i - 1].lastEl.nextSibling || nc) : nc;
                }
            }
            // items were hidden/shown but positions haven't changed
            else {
                for (j = Math.max(i - 1, 0); j < l; j++) {
                    if (j === i) {
                        continue;
                    }
                    if (rs[j].attached && rs[j].lastEl.parentNode === parent) {
                        next = j < i ? rs[j].lastEl.nextSibling : rs[j].firstEl;
                        if (next.parentNode === parent) {
                            break;
                        }
                    }
                }
                if (!next) {
                    next = nc;
                }
            }

            if (next && next.parentNode !== parent) {
                next = null;
            }

            if (r.firstEl !== next) {
                if (next && r.lastEl.nextSibling !== next) {
                    parent.insertBefore(tm ? toFragment(el) : el, next);
                }
                else if (!next) {
                    parent.appendChild(tm ? toFragment(el) : el);
                }
            }

            r.attached = true;
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

    onChangeTrackBy: function(val) {
        this.trackByFn = null;
        this.trackBy = val;
    },

    getTrackByFunction: function() {

        var self = this,
            trackBy;

        if (!self.trackByFn) {

            trackBy = self.trackBy;

            if (!trackBy || trackBy === '$') {
                self.trackByFn = function(item) {
                    return isPrimitive(item) ? item : undf;
                };
            }
            else if (isFunction(trackBy)) {
                self.trackByFn = trackBy;
            }
            else {
                self.trackByFn = function(item){
                    return item && !isPrimitive(item) ? item[trackBy] : undf;
                };
            }
        }

        return self.trackByFn;
    },


    scopeGetRawIndex: function(id) {

        if (id === undf) {
            return -1;
        }

        var self        = this,
            list        = self.watcher.getUnfilteredValue(),
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



    parseExpr: function(expr) {

        var tmp = expr.split(" "),
            i, len,
            model, name,
            row;

        for (i = 0, len = tmp.length; i < len; i++) {

            row = tmp[i];

            if (row === "" || row === "in") {
                continue;
            }

            if (!name) {
                name = row;
            }
            else {
                model = tmp.slice(i).join(" ");
                break;
            }
        }

        this.model = model;
        this.itemName = name || "item";
    },


    destroy: function() {

        var self        = this,
            renderers   = self.renderers,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            if (renderers[i].renderer && !renderers[i].renderer.$destroyed) {
                renderers[i].renderer.$destroy();
            }
        }

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribeAndDestroy();
        }

        self.queue.destroy();

        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onChange, self);
        }
    }

}, {
    $stopRenderer: true,
    $registerBy: "id"
});
