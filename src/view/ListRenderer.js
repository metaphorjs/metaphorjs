var createWatchable = require("../../../metaphorjs-watchable/src/func/createWatchable.js"),
    toArray = require("../func/array/toArray.js"),
    error = require("../func/error.js"),
    animate = require("../../../metaphorjs-animate/src/metaphorjs.animate.js"),
    stopAnimation = require("../../../metaphorjs-animate/src/func/stopAnimation.js"),
    Renderer = require("../view/Renderer.js"),
    isNull = require("../func/isNull.js"),
    isNumber = require("../func/isNumber.js"),
    isPrimitive = require("../func/isPrimitive.js"),
    bind = require("../func/bind.js"),
    undf = require("../var/undf.js"),
    ns = require("../../../metaphorjs-namespace/src/var/ns.js"),
    isFunction = require("../func/isFunction.js"),
    async = require("../func/async.js"),
    attr = require("../func/dom/attr.js"),
    data = require("../func/dom/data.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js"),
    raf = require("../../../metaphorjs-animate/src/func/raf.js"),
    getScrollParent = require("../func/dom/getScrollParent.js"),
    getScrollTop = require("../func/dom/getScrollTop.js"),
    getScrollLeft = require("../func/dom/getScrollLeft.js"),
    addListener = require("../func/event/addListener.js"),
    removeListener = require("../func/event/removeListener.js"),
    addClass = require("../func/dom/addClass.js");


var ListRenderer = function(scope, node, expr) {

    attr(node, "mjs-each", null);
    attr(node, "mjs-include", null);

    var self    = this;

    self.parseExpr(expr);

    self.tpl        = node;
    self.renderers  = [];
    self.prevEl     = node.previousSibling;
    self.nextEl     = node.nextSibling;
    self.parentEl   = node.parentNode;
    self.node       = node;
    self.scope      = scope;
    self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);

    var cfg         = data(node, "config") || {};
    self.animateMove= !cfg.buffered && cfg.animateMove && animate.cssAnimations;
    self.animate    = !cfg.buffered && attr(node, "mjs-animate") !== null;


    self.trackBy    = attr(node, "mjs-track-by");
    if (self.trackBy) {
        if (self.trackBy != '$') {
            self.trackByWatcher = createWatchable(scope, self.trackBy, self.onChangeTrackBy, self, null, ns);
        }
    }
    else if (!self.watcher.hasInputPipes()) {
        self.trackBy    = '$$'+self.watcher.id;
    }
    attr(node, "mjs-track-by", null);


    self.griDelegate = bind(self.scopeGetRawIndex, self);
    self.parentEl.removeChild(node);

    if (cfg.buffered) {
        self.initBuffering(cfg);
    }

    self.render(toArray(self.watcher.getValue()));

};

ListRenderer.prototype = {

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

    buffered: false,
    itemSize: null,
    itemsOffsite: 1,
    bufferState: null,
    scrollOffset: 0,
    horizontal: false,
    eventTmt: null,
    scrollBusy: false,
    onResizeDelegate: null,
    onScrollDelegate: null,

    onScopeDestroy: function() {

        var self        = this,
            renderers   = self.renderers,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            renderers[i].renderer.destroy();
        }

        delete self.renderers;
        delete self.tpl;
        delete self.prevEl;
        delete self.nextEl;
        delete self.parentEl;

        self.supr();
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
                return function(item) {
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

    render: function(list) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            parent      = self.parentEl,
            next        = self.nextEl,
            buffered    = self.buffered,
            fragment    = document.createDocumentFragment(),
            el,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {
            el = tpl.cloneNode(true);
            renderers.push(self.createItem(el, list, i));
            renderers[i].attached = !buffered;
            if (!buffered) {
                fragment.appendChild(el);
            }
        }

        if (!buffered) {
            self.doUpdate();
            parent.insertBefore(fragment, next);
        }
        else {
            self.getScrollOffset();
            self.updateScrollBuffer();
        }
    },

    getListItem: function(list, index) {
        return list[index];
    },

    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemName,
            itemScope   = self.scope.$new();

        itemScope[iname]    = self.getListItem(list, index);

        return {
            index: index,
            action: "enter",
            el: el,
            scope: itemScope,
            attached: false,
            rendered: false
        };
    },

    onChange: function(changes) {

        var self        = this,
            renderers   = self.renderers,
            prs         = changes.prescription || [],
            tpl         = self.tpl,
            index       = 0,
            list        = toArray(self.watcher.getValue()),
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
            translates;

        prs = self.watcher.getMovePrescription(prs, self.getTrackByFunction());

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
                    animPromises.push(animate(r.el, "leave", null, true, ns)
                        .done(function(el){
                            el.style.visibility = "hidden";
                        }));
                }
            }

            for (i = 0, len = newrs.length; i < len; i++) {
                r = newrs[i];
                stopAnimation(r.el);

                r.action == "enter" ?
                    animPromises.push(animate(r.el, "enter", startCallback, true, ns)) :
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
                });
            });

            Promise.all(animPromises).always(function(){
                raf(function(){
                    self.doUpdate(updateStart || 0);
                    self.removeOldElements(renderers);
                    if (doesMove) {
                        self.doUpdate(updateStart, null, "move");
                        for (i = 0, len = newrs.length; i < len; i++) {
                            r = newrs[i];
                            r.el.style[animate.prefixes.transform] = null;
                            r.el.style[animate.prefixes.transform] = "";
                        }
                    }


                });
            });
        }
        else {
            self.applyDomPositions();
            if (self.buffered) {
                !self.bufferState && self.getBufferState();
                self.doUpdate(self.bufferState.first, self.bufferState.last);
            }
            else {
                self.doUpdate(updateStart || 0);
            }
            self.removeOldElements(renderers);
        }
    },


    removeOldElements: function(rs) {
        var i, len, r,
            parent = this.parentEl;

        for (i = 0, len = rs.length; i < len; i++) {
            r = rs[i];
            if (r && r.attached) {
                parent.removeChild(r.el);
            }
        }
    },


    applyDomPositions: function(oldrs) {

        var self        = this,
            rs          = self.renderers,
            parent      = self.parentEl,
            prevEl      = self.prevEl,
            buffered    = self.buffered,
            bs          = buffered ? self.getBufferState(true) : null,
            fc          = prevEl ? prevEl.nextSibling : parent.firstChild,
            next,
            i, l, el, r;

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;

            if (!buffered || i >= bs.first && i <= bs.last) {

                if (oldrs && oldrs[i]) {
                    next = oldrs[i].el.nextSibling;
                }
                else {
                    next = i > 0 ? (rs[i-1].el.nextSibling || fc) : fc;
                }

                if (next && el.nextSibling !== next) {
                    parent.insertBefore(el, next);
                }
                else if (!next) {
                    parent.appendChild(el);
                }
                r.attached = true;
            }
            else {
                if (buffered && i < bs.first || i > bs.last) {
                    if (r.attached) {
                        parent.removeChild(el);
                        r.attached = false;
                    }
                }
            }
        }

        if (buffered) {
            self.updateScrollGhosts(bs);
        }
    },


    /*
     * <!-- move animation
     */

    getNodePositions: function(tmp, rs, oldrs) {

        var nodes = [],
            i, l, el, r,
            tmpNode,
            positions = {};

        while(tmp.firstChild) {
            tmp.removeChild(tmp.firstChild);
        }
        for (i = 0, l = rs.length; i < l; i++) {
            if (oldrs && oldrs[i]) {
                tmpNode = oldrs[i].el.cloneNode(true);
                tmp.appendChild(tmpNode);
            }
            tmpNode = rs[i].el.cloneNode(true);
            tmp.appendChild(tmpNode);
            nodes.push(tmpNode);
        }
        for (i = 0, l = nodes.length; i < l; i++) {
            el = nodes[i];
            r = rs[i].renderer;
            if (r) {
                positions[r.id] = {left: el.offsetLeft, top: el.offsetTop};
            }
        }


        return positions;
    },

    calculateTranslates: function(newRenderers, origRenderers, withDeletes) {

        var self        = this,
            parent      = self.parentEl,
            pp          = parent.parentNode,
            tmp         = parent.cloneNode(true),
            ofsW        = parent.offsetWidth,
            translates  = [],
            fl          = 0,
            ft          = 0,
            oldPositions,
            insertPositions,
            newPositions,
            r, i, len, id,
            style,
            el;

        style = tmp.style;
        style.position = "absolute";
        style.left = "-10000px";
        style.visibility = "hidden";
        style.width = ofsW + 'px';

        pp.insertBefore(tmp, parent);
        // correct width to compensate for padding and stuff
        style.width = ofsW - (tmp.offsetWidth - ofsW) + "px";

        // positions before change
        oldPositions = self.getNodePositions(tmp, origRenderers);
        // positions when items reordered but deleted items are still in place
        insertPositions = self.getNodePositions(tmp, newRenderers, withDeletes);
        // positions after old items removed from dom
        newPositions = self.getNodePositions(tmp, newRenderers);

        pp.removeChild(tmp);
        tmp = null;

        for (i = 0, len = newRenderers.length; i < len; i++) {
            el = newRenderers[i].el;
            r = newRenderers[i].renderer;
            id = r.id;

            if (i == 0) {
                fl = el.offsetLeft;
                ft = el.offsetTop;
            }

            translates.push([
                // to
                {
                    left: (newPositions[id].left - fl) - (insertPositions[id].left - fl),
                    top: (newPositions[id].top - ft) - (insertPositions[id].top - ft)
                },
                // from
                oldPositions[id] ? //insertPositions[id] &&
                {
                    left: (oldPositions[id].left - fl) - (insertPositions[id].left - fl),
                    top: (oldPositions[id].top - ft) - (insertPositions[id].top - ft)
                } : null
            ]);
        }

        return translates;
    },

    moveAnimation: function(el, to, from, startCallback, applyFrom) {

        var style = el.style;

        applyFrom.done(function(){
            if (from) {
                style[animate.prefixes.transform] = "translateX("+from.left+"px) translateY("+from.top+"px)";
            }
        });

        return animate(
            el,
            "move",
            startCallback,
            true,
            ns,
            function(el, position, stage){
                if (position == 0 && stage != "start" && to) {
                    style[animate.prefixes.transform] = "translateX("+to.left+"px) translateY("+to.top+"px)";
                }
        });
    },

    /*
     * move animation -->
     */


    /*
     * <!-- buffered list
     */

    initBuffering: function(cfg) {

        var self = this,
            parent = self.parentEl,
            prev = self.prevEl,
            ofsTop,
            ofsBot,
            i,
            style = {
                fontSize: 0,
                lineHeight: 0,
                padding: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingBottom: 0,
                paddingRight: 0,
                margin: 0,
                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0
            };

        self.buffered       = true;
        self.itemSize       = cfg.itemSize;
        self.ofsTopEl       = ofsTop = document.createElement(cfg.stubTag || "div");
        self.ofsBotEl       = ofsBot = document.createElement(cfg.stubTag || "div");
        self.scrollEl       = getScrollParent(self.parentEl);
        self.itemsOffsite   = cfg.itemsOffsite || 5;
        self.horizontal     = cfg.horizontal || false;

        addClass(ofsTop, "mjs-buffer-top");
        addClass(ofsBot, "mjs-buffer-bottom");
        for (i in style) {
            ofsTop.style[i] = style[i];
            ofsBot.style[i] = style[i];
        }

        parent.insertBefore(ofsTop, prev ? prev.nextSibling : parent.firstChild);
        parent.insertBefore(ofsBot, self.nextEl);

        self.prevEl     = ofsTop;
        self.nextEl     = ofsBot;

        self.onResizeDelegate = bind(self.onResize, self);
        self.onScrollDelegate = bind(self.onScroll, self);

        addListener(self.scrollEl, "scroll", self.onScrollDelegate);
        addListener(window, "resize", self.onResizeDelegate);
    },


    getScrollOffset: function() {

        var self    = this,
            top     = self.scrollEl,
            parent  = self.ofsTopEl,
            hor     = self.horizontal,
            prop    = hor ? "offsetLeft" : "offsetTop",
            offset  = 0;

        while (parent && parent !== top) {
            offset += parent[prop] || 0;
            parent = parent.parentNode;
        }

        return self.scrollOffset = offset;
    },

    getBufferState: function(updateScrollOffset) {

        var self        = this,
            scrollEl    = self.scrollEl,
            hor         = self.horizontal,
            html        = document.documentElement,
            size        = scrollEl === window ?
                            (window[hor ? "innerWidth" : "innerHeight"] ||
                                html[hor ? "clientWidth" : "clientHeight"]):
                            scrollEl[hor ? "offsetWidth" : "offsetHeight"],
            scroll      = hor ? getScrollLeft(scrollEl) : getScrollTop(scrollEl),
            isize       = self.itemSize,
            off         = self.itemsOffsite,
            offset      = updateScrollOffset ? self.getScrollOffset() : self.scrollOffset,
            cnt         = self.renderers.length,
            first,
            last;

        scroll  = Math.max(0, scroll - offset);
        first   = parseInt(scroll / isize, 10);

        if (first < 0) {
            first = 0;
        }

        last    = first + parseInt(size / isize, 10);
        first   = first > off ? first - off : 0;
        last   += off;

        if (last > cnt - 1) {
            last = cnt - 1;
        }

        if (first > last) {
            return self.bufferState;
        }

        return self.bufferState = {
            first: first,
            last: last,
            ot: first * isize,
            ob: (cnt - last - 1) * isize
        };
    },

    updateScrollGhosts: function(bs) {
        var self        = this,
            hor         = self.horizontal;

        self.ofsTopEl.style[hor ? "width" : "height"] = bs.ot + "px";
        self.ofsBotEl.style[hor ? "width" : "height"] = bs.ob + "px";
    },

    onResize: function() {
        this.runBufferedEvent();
    },

    onScroll: function() {
        this.runBufferedEvent();
    },

    runBufferedEvent: function() {
        var self = this;

        if (self.scrollBusy) {
            if (self.eventTmt) {
                clearTimeout(self.eventTmt);
                self.eventTmt = null;
            }
            self.eventTmt = setTimeout(function(){
                self.eventTmt = null;
                self.runBufferedEvent();
            }, 10);
        }
        else {
            self.updateScrollBuffer();
        }
    },

    updateScrollBuffer: function() {

        this.scrollBusy = true;

        var self        = this,
            prev        = self.bufferState,
            parent      = self.parentEl,
            rs          = self.renderers,
            bot         = self.ofsBotEl,
            bs          = self.getBufferState(false),
            fragment,
            i, x;

        if (!bs) {
            self.scrollBusy = false;
            return;
        }

        raf(function(){

            if (!prev || bs.last < prev.first || bs.first > prev.last){
                //remove old and append new
                if (prev) {
                    for (i = prev.first, x = prev.last; i <= x; i++) {
                        parent.removeChild(rs[i].el);
                        rs[i].attached = false;
                    }
                }
                fragment = document.createDocumentFragment();
                for (i = bs.first, x = bs.last; i <= x; i++) {
                    if (!rs[i].rendered) {
                        self.renderItem(i);
                    }
                    fragment.appendChild(rs[i].el);
                    rs[i].attached = true;
                }

                parent.insertBefore(fragment, bot);
            }
            else {

                if (prev.first < bs.first) {
                    for (i = prev.first, x = bs.first; i < x; i++) {
                        parent.removeChild(rs[i].el);
                        rs[i].attached = false;
                    }
                }
                else if (prev.first > bs.first) {
                    fragment = document.createDocumentFragment();
                    for (i = bs.first, x = prev.first; i < x; i++) {
                        if (!rs[i].rendered) {
                            self.renderItem(i);
                        }
                        fragment.appendChild(rs[i].el);
                        rs[i].attached = true;
                    }
                    parent.insertBefore(fragment, rs[prev.first].el);
                }

                if (prev.last < bs.last) {
                    fragment = document.createDocumentFragment();
                    for (i = prev.last + 1, x = bs.last; i <= x; i++) {
                        if (!rs[i].rendered) {
                            self.renderItem(i);
                        }
                        fragment.appendChild(rs[i].el);
                        rs[i].attached = true;
                    }
                    parent.insertBefore(fragment, bot);
                }
                else if (prev.last > bs.last) {
                    for (i = bs.last + 1, x = prev.last; i <= x; i++) {
                        parent.removeChild(rs[i].el);
                        rs[i].attached = false;
                    }
                }
            }

            self.updateScrollGhosts(bs);

            self.scrollBusy = false;

            async(function(){
                // pre-render next
                if (!prev || prev.first < bs.first) {
                    self.doUpdate(bs.last, bs.last + (bs.last - bs.first), null, true);
                }
            });
        });

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

        var self = this;

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribeAndDestroy();
            delete self.trackByWatcher;
        }

        if (self.buffered) {
            removeListener(self.scrollEl, "scroll", self.onScrollDelegate);
            removeListener(window, "resize", self.onResizeDelegate);
        }

        self.supr();
    }

};

ListRenderer.$stopRenderer = true;

module.exports = ListRenderer;