
require("../func/dom/commentWrap.js");
require("../func/dom/getAttr.js");
require("../func/dom/toFragment.js");
require("./Renderer.js");
require("metaphorjs-shared/src/lib/Queue.js");
require("../lib/MutationObserver.js");
require("../lib/Config.js");
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-animate/src/animate/isCssSupported.js");

var cls = require("metaphorjs-class/src/cls.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    isNull = require("metaphorjs-shared/src/func/isNull.js"),
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

    $constructor: function(scope, node, config, parentRenderer, attrSet) {

        config.setDefaultMode("trackBy", MetaphorJs.lib.Config.MODE_STATIC);

        var self    = this, 
            cfg     = config.getAll();
            
        self.cfg            = config;
        self.scope          = scope;

        self.tagMode        = node.nodeName.toLowerCase() === "mjs-each";
        self.animateMove    = !self.tagMode && 
                                !cfg['buffered'] &&
                                cfg["animateMove"] && 
                                MetaphorJs.animate.isCssSupported();
        self.animate        = !self.tagMode && 
                                !cfg['buffered'] && 
                                cfg["animate"];
        self.id             = cfg['id'] || nextUid();

        if (self.animate) {
            self.$plugins.push(cfg['animatePlugin'] || "MetaphorJs.plugin.ListAnimated");
        }

        if (cfg['observable']) {
            self.$plugins.push(cfg['observable'] || "MetaphorJs.plugin.Observable");
        }

        if (cfg['buffered'] && !self.tagMode) {
            self.buffered = true;
            self.$plugins.push(cfg['buffered'] || "MetaphorJs.plugin.ListBuffered");
        }

        if (cfg['plugin']) {
            self.$plugins.push(cfg['plugin']);
        }

        if (config.get('trackBy') === false) {
            self.trackBy = false;
        }
    },

    $init: function(scope, node, config, parentRenderer, attrSet) {

        var self = this,
            expr;

        if (self.tagMode) {
            expr = MetaphorJs.dom.getAttr(node, "value");
        }
        else {
            expr = config.getExpression("value");
        }

        self.parseExpr(expr);

        self.tpl        = self.tagMode ? MetaphorJs.dom.toFragment(node.childNodes) : node;
        self.renderers  = [];

        var cmts = MetaphorJs.dom.commentWrap(node,  "list -" + self.id);

        self.prevEl     = cmts[0];
        self.nextEl     = cmts[1];
        self.parentEl   = node.parentNode;
        self.node       = null; //node;

        self.queue      = new MetaphorJs.lib.Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: MetaphorJs.lib.Queue.ONCE
        });

        self.parentEl.removeChild(node);

        self.afterInit(scope, node, config, parentRenderer, attrSet);

        self.queue.add(self.render, self, [toArray(self.watcher.getValue())]);
    },

    afterInit: function(scope, node) {

        var self        = this,
            cfg         = self.cfg;

        self.watcher    = MetaphorJs.lib.MutationObserver.get(scope, self.model, self.onChange, self);
        self.trackBy    = cfg.get("trackBy"); // lowercase from attributes

        if (self.trackBy !== false && typeof self.trackBy !== "function") {
            if (cfg.getProperty("trackBy").mode !== MetaphorJs.lib.Config.MODE_STATIC) {
                cfg.on("trackBy", self.onChangeTrackBy, self);
            }
            else if (!self.trackBy && !self.watcher.hasInputPipes()) {
                self.trackBy = '$$'+self.watcher.id;
            }
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
                    fragment.appendChild(MetaphorJs.dom.toFragment(renderers[i].el));
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
            list        = self.watcher.getValue(),
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

        list = list || self.watcher.getValue();
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
            item.renderer  = new MetaphorJs.app.Renderer(scope);
            item.renderer.process(item.el);
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
        self.queue.prepend(self.applyChanges, self, [prev], 
                            MetaphorJs.lib.Queue.REPLACE);
    },

    applyChanges: function(prevList) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            index       = 0,
            list        = toArray(self.watcher.getValue()),
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
            action;

        if (self.trackBy === false) {
            renderers = self.renderers.slice();
            updateStart = 0;
            doesMove = false;
            for (i = 0, len = list.length; i < len; i++) {
                r = self.createItem(tpl.cloneNode(true), list, i);
                newrs.push(r);
            }
        }
        else {

            var prs = levenshteinDiff(prevList, list);
            prs = levenshteinMove(prevList, list, prs.prescription, self.getTrackByFunction());

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
                if (!self.tagMode && r.el.parentNode) {
                    r.el.parentNode.removeChild(r.el);
                }
                else {
                    for (j = 0, jl = r.el.length; j < jl; j++) {
                        if (r.el[j].parentNode) {
                            r.el[j].parentNode.removeChild(r.el[j]);
                        }
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

        /*if (nc && nc.parentNode !== parent) {
            nc = null;
        }
        //if (!nc && prevEl && prevEl.parentNode === parent) {
        //    nc = prevEl.nextSibling;
        //}*/

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;
            next = null;

            if (r.hidden) {
                if (el.parentNode) {
                    if (tm) {
                        el.parentNode.removeChild(MetaphorJs.dom.toFragment(el));
                    }
                    else {
                        el.parentNode.removeChild(el);
                    }
                    r.attached = false;
                }
                continue;
            }

            for (j = Math.max(i - 1, 0); j >= 0; j--) {
                if (rs[j].attached) {
                    next = rs[j].lastEl.nextSibling;
                    break;
                }
            }

            if (!next) {
                next = nc;
            }

            if (r.firstEl !== next) {
                if (next && r.lastEl.nextSibling !== next) {
                    parent.insertBefore(tm ? MetaphorJs.dom.toFragment(el) : el, next);
                }
                else if (!next) {
                    parent.appendChild(tm ? MetaphorJs.dom.toFragment(el) : el);
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
                    if (item && !isPrimitive(item)) {
                        if (!item[trackBy]) {
                            item[trackBy] = nextUid();
                        }
                        return item[trackBy];
                    }
                    else return undf;
                    //return item && !isPrimitive(item) ? item[trackBy] : undf;
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
            list        = self.watcher.getValue(),
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


    onDestroy: function() {

        var self        = this,
            renderers   = self.renderers,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            if (renderers[i].renderer && !renderers[i].renderer.destroyed) {
                renderers[i].renderer.$destroy();
            }
        }

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribe(self.onChangeTrackBy, self);
            self.trackByWatcher.$destroy(true);
        }

        self.queue.$destroy();

        if (self.watcher) {
            self.watcher.unsubscribe(self.onChange, self);
            self.watcher.$destroy(true);
        }
    }

}, {
    $stopRenderer: true,
    $registerBy: "id"
});
