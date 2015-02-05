var createWatchable = require("metaphorjs-watchable/src/func/createWatchable.js"),
    animate = require("metaphorjs-animate/src/func/animate.js"),
    stopAnimation = require("metaphorjs-animate/src/func/stopAnimation.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),
    defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    getAnimationPrefixes = require("metaphorjs-animate/src/func/getAnimationPrefixes.js"),

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
    async = require("../func/async.js"),
    getAttr = require("../func/dom/getAttr.js"),
    removeAttr = require("../func/dom/removeAttr.js"),
    getNodeConfig = require("../func/dom/getNodeConfig.js");



module.exports = defineClass({

    $class: "ListRenderer",

    id: null,

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

    $constructor: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.tagMode        = node.nodeName.toLowerCase() == "mjs-each";
        self.animateMove    = !self.tagMode && !cfg.buffered &&
                                cfg.animateMove && animate.cssAnimationSupported();
        self.animate        = !self.tagMode && !cfg.buffered &&
                                (getAttr(node, "mjs-animate") !== null || cfg.animate);
        self.id             = cfg.id || nextUid();

        removeAttr(node, "mjs-animate");

        if (self.animate && self.animateMove) {
            self.$plugins.push(typeof cfg.animateMove == "string" ? cfg.animateMove : "plugin.ListAnimatedMove");
        }
        if (cfg.observable) {
            self.$plugins.push(typeof cfg.observable == "string" ? cfg.observable : "plugin.Observable");
        }

        if (self.tagMode) {
            cfg.buffered = false;
        }

        if (cfg.buffered) {
            self.buffered = true;
            self.$plugins.push(typeof cfg.buffered == "string" ? cfg.buffered : "plugin.ListBuffered");
        }
    },

    $init: function(scope, node, expr) {

        var self = this;

        //removeAttr(node, "mjs-include");

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
        self.scope      = scope;

        self.queue      = new Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: Queue.ONCE
        });

        self.parentEl.removeChild(node);

        self.afterInit(scope, node);

        self.queue.add(self.render, self, [toArray(self.watcher.getLastResult())]);
    },

    afterInit: function(scope, node) {

        var self        = this,
            cfg         = getNodeConfig(node, scope);

        self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);
        self.trackBy    = cfg.trackBy;
        if (self.trackBy && self.trackBy != '$') {
            self.trackByWatcher = createWatchable(scope, self.trackBy, self.onChangeTrackBy, self, null, ns);
        }
        else if (self.trackBy != '$' && !self.watcher.hasInputPipes()) {
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
            parent      = self.parentEl,
            next        = self.nextEl,
            buffered    = self.buffered,
            fragment    = window.document.createDocumentFragment(),
            el,
            i, len;


        for (i = 0, len = list.length; i < len; i++) {
            el = tpl.cloneNode(true);
            renderers.push(self.createItem(el, list, i));
            if (!buffered) {
                fragment.appendChild(el);
                renderers[i].attached = true;
            }
        }

        if (!buffered) {
            parent.insertBefore(fragment, next);
            self.doUpdate();

        }
        else {
            self.bufferPlugin.getScrollOffset();
            self.bufferPlugin.updateScrollBuffer();
        }

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

            if (action && renderers[index].action != action) {
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
            rendered: false
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
            animateAll  = self.animate,
            newrs       = [],
            iname       = self.itemName,
            origrs      = renderers.slice(),
            doesMove    = false,
            prevr,
            prevrInx,
            i, len,
            r,
            action,
            translates,
            prs         = self.watcher.getMovePrescription(prevList, self.getTrackByFunction(), list);


        // redefine renderers
        for (i = 0, len = prs.length; i < len; i++) {

            action = prs[i];

            if (isNumber(action)) {
                prevrInx    = action;
                prevr       = renderers[prevrInx];

                if (prevrInx != index && isNull(updateStart)) {
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


        if (animateAll) {

            self.doUpdate(updateStart, null, "enter");

            if (doesMove) {
                translates = self.calculateTranslates(newrs, origrs, renderers);
            }

            var animPromises    = [],
                startAnimation  = new Promise,
                applyFrom       = new Promise,
                donePromise     = new Promise,
                animReady       = Promise.counter(newrs.length),
                startCallback   = function(){
                    animReady.countdown();
                    return startAnimation;
                };

            // destroy old renderers and remove old elements
            for (i = 0, len = renderers.length; i < len; i++) {
                r = renderers[i];
                if (r) {
                    r.scope.$destroy();

                    stopAnimation(r.el);
                    animPromises.push(animate(r.el, "leave", null, false, ns)
                        .done(function(el){
                            el.style.visibility = "hidden";
                        }));
                }
            }

            for (i = 0, len = newrs.length; i < len; i++) {
                r = newrs[i];
                stopAnimation(r.el);

                r.action == "enter" ?
                animPromises.push(animate(r.el, "enter", startCallback, false, ns)) :
                animPromises.push(
                    self.moveAnimation(
                        r.el,
                        doesMove ? translates[i][0] : null,
                        doesMove ? translates[i][1] : null,
                        startCallback,
                        applyFrom
                    )
                );
            }

            animReady.done(function(){
                raf(function(){
                    applyFrom.resolve();
                    self.applyDomPositions(renderers);
                    if (!doesMove) {
                        self.doUpdate(updateStart, null, "move");
                    }
                    raf(function(){
                        startAnimation.resolve();
                    });
                    self.trigger("change", self);
                });
            });

            Promise.all(animPromises).always(function(){
                raf(function(){
                    var prefixes = getAnimationPrefixes();
                    self.doUpdate(updateStart || 0);
                    self.removeOldElements(renderers);
                    if (doesMove) {
                        self.doUpdate(updateStart, null, "move");
                        for (i = 0, len = newrs.length; i < len; i++) {
                            r = newrs[i];
                            r.el.style[prefixes.transform] = null;
                            r.el.style[prefixes.transform] = "";
                        }
                    }
                    donePromise.resolve();
                });
            });

            return donePromise;
        }
        else {
            if (!self.buffered || !self.bufferPlugin.enabled) {
                self.applyDomPositions();
                self.doUpdate(updateStart || 0);
                self.removeOldElements(renderers);
            }
            else {
                self.bufferPlugin.getScrollOffset();
                self.removeOldElements(renderers);
                self.queue.append(self.bufferPlugin.updateScrollBuffer, self.bufferPlugin, [true]);
            }
            self.trigger("change", self);
        }
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
            fc          = prevEl ? prevEl.nextSibling : parent.firstChild,
            next,
            i, l, el, r;

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;

            if (oldrs && oldrs[i]) {
                next = oldrs[i].lastEl.nextSibling;
            }
            else {
                next = i > 0 ? (rs[i-1].lastEl.nextSibling || fc) : fc;
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

            if (!trackBy || trackBy == '$') {
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


    /*
     * <!-- move animation - plugin.ListAnimatedMove
     */

    getNodePositions: function(tmp, rs, oldrs) {
        return {};
    },

    calculateTranslates: function(newRenderers, origRenderers, withDeletes) {
        return [];
    },

    moveAnimation: function(el, to, from, startCallback, applyFrom) {
        return animate(el, "move", startCallback, false, ns);
    },

    /*
     * move animation -->
     */


    /*
     * <!-- buffered list
     */


    scrollTo: function() {
        // not implemented
    },


    /*
     * buffered list -->
     */


    parseExpr: function(expr) {

        var tmp = expr.split(" "),
            i, len,
            model, name,
            row;

        for (i = 0, len = tmp.length; i < len; i++) {

            row = tmp[i];

            if (row == "" || row == "in") {
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
        self.watcher.unsubscribeAndDestroy(self.onChange, self);
    }

}, {
    $stopRenderer: true,
    $registerBy: "id"
});
