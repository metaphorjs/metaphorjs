var createWatchable = require("../../../metaphorjs-watchable/src/func/createWatchable.js"),
    toArray = require("../func/array/toArray.js"),
    error = require("../func/error.js"),
    nextUid = require("../func/nextUid.js"),
    animate = require("../../../metaphorjs-animate/src/metaphorjs.animate.js"),
    stopAnimation = require("../../../metaphorjs-animate/src/func/stopAnimation.js"),
    Renderer = require("../view/Renderer.js"),
    Queue = require("../lib/Queue.js"),
    isNull = require("../func/isNull.js"),
    isNumber = require("../func/isNumber.js"),
    isPrimitive = require("../func/isPrimitive.js"),
    bind = require("../func/bind.js"),
    undf = require("../var/undf.js"),
    ns = require("../../../metaphorjs-namespace/src/var/ns.js"),
    isFunction = require("../func/isFunction.js"),
    async = require("../func/async.js"),
    getAttr = require("../func/dom/getAttr.js"),
    removeAttr = require("../func/dom/removeAttr.js"),
    data = require("../func/dom/data.js"),
    extend = require("../func/extend.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js"),
    raf = require("../../../metaphorjs-animate/src/func/raf.js"),
    getScrollParent = require("../func/dom/getScrollParent.js"),
    getScrollTop = require("../func/dom/getScrollTop.js"),
    getScrollLeft = require("../func/dom/getScrollLeft.js"),
    addListener = require("../func/event/addListener.js"),
    removeListener = require("../func/event/removeListener.js"),
    addClass = require("../func/dom/addClass.js"),
    getPosition = require("../func/dom/getPosition.js"),
    getNodeConfig = require("../func/dom/getNodeConfig.js"),
    defineClass = require("../../../metaphorjs-class/src/func/defineClass.js");

module.exports = defineClass(

    function(scope, node, expr) {

        var self    = this;
        self.commonInit(scope, node, expr);
        self.init(scope, node, expr);

        self.queue.add(self.render, self, [toArray(self.watcher.getLastResult())]);
    },
    {

        id: null,

        observable: null,
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

        queue: null,

        buffered: false,
        itemSize: null,
        itemsOffsite: 1,
        bufferState: null,
        scrollOffset: 0,
        horizontal: false,
        bufferEventDelegate: null,
        topStub: null,
        botStub: null,

        commonInit: function(scope, node, expr) {

            var self = this;

            removeAttr(node, "mjs-include");

            self.parseExpr(expr);

            self.tpl        = node;
            self.renderers  = [];
            self.prevEl     = node.previousSibling;
            self.nextEl     = node.nextSibling;
            self.parentEl   = node.parentNode;
            self.node       = node;
            self.scope      = scope;

            self.queue      = new Queue({
                async: false, auto: true, thenable: true,
                stack: false, context: self, mode: Queue.ONCE
            });

            var cfg         = getNodeConfig(node, scope);

            self.animateMove= !cfg.buffered && cfg.animateMove && animate.cssAnimations;
            self.animate    = !cfg.buffered && (getAttr(node, "mjs-animate") !== null || cfg.animate);
            removeAttr(node, "mjs-animate");

            self.id         = cfg.id || nextUid();

            if (cfg.observable) {
                self.observable = new Observable;
                extend(self, self.observable.getApi(), true, false);
            }

            self.parentEl.removeChild(node);

            if (cfg.buffered) {
                self.initBuffering(cfg);
            }
        },

        init: function(scope, node) {

            var self        = this,
                cfg         = data(node, "config") || {};

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

        triggerIf: function() {
            if (this.observable) {
                this.trigger.apply(null, arguments);
            }
        },

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
                fragment    = document.createDocumentFragment(),
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
                self.doUpdate();
                parent.insertBefore(fragment, next);
            }
            else {
                self.getScrollOffset();
                self.updateScrollBuffer();
            }

            self.triggerIf("render", self);
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
                        self.triggerIf("change", self);
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
                        donePromise.resolve();
                    });
                });

                return donePromise;
            }
            else {
                if (!self.buffered) {
                    self.applyDomPositions();
                    self.doUpdate(updateStart || 0);
                    self.removeOldElements(renderers);
                }
                else {
                    self.getScrollOffset();
                    self.removeOldElements(renderers);
                    self.queue.append(self.updateScrollBuffer, self, [true]);
                }
                self.triggerIf("change", self);
            }
        },


        removeOldElements: function(rs) {
            var i, len, r,
                parent = this.parentEl;

            for (i = 0, len = rs.length; i < len; i++) {
                r = rs[i];
                if (r && r.attached) {
                    r.attached = false;
                    parent.removeChild(r.el);
                }
            }
        },


        applyDomPositions: function(oldrs) {

            var self        = this,
                rs          = self.renderers,
                parent      = self.parentEl,
                prevEl      = self.prevEl,
                fc          = prevEl ? prevEl.nextSibling : parent.firstChild,
                next,
                i, l, el, r;

            for (i = 0, l = rs.length; i < l; i++) {
                r = rs[i];
                el = r.el;

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
                false,
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

        initScrollParent: function(cfg) {
            var self = this;
            self.scrollEl = getScrollParent(self.parentEl);
        },

        initScrollStubs: function(cfg) {

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

            self.topStub       = ofsTop = document.createElement(cfg.stub || "div");
            self.botStub       = ofsBot = document.createElement(cfg.stub || "div");

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
        },

        initBuffering: function(cfg) {

            var self = this;

            self.buffered       = true;
            self.itemSize       = cfg.itemSize;
            self.itemsOffsite   = cfg.itemsOffsite || 5;
            self.horizontal     = cfg.horizontal || false;

            self.initScrollParent(cfg);
            self.initScrollStubs(cfg);

            self.bufferEventDelegate = bind(self.bufferUpdateEvent, self);

            addListener(self.scrollEl, "scroll", self.bufferEventDelegate);
            addListener(window, "resize", self.bufferEventDelegate);
        },


        getScrollOffset: function() {

            var self        = this,
                position    = getPosition(self.topStub, self.scrollEl),
                ofs         = self.horizontal ? position.left : position.top;

            return self.scrollOffset = ofs;
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
                viewFirst,
                viewLast,
                first,
                last;


            scroll  = Math.max(0, scroll + offset);
            first   = Math.ceil(scroll / isize);

            if (first < 0) {
                first = 0;
            }

            viewFirst = first;

            last    = viewLast = first + Math.ceil(size / isize);
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
                viewFirst: viewFirst,
                viewLast: viewLast,
                ot: first * isize,
                ob: (cnt - last - 1) * isize
            };
        },

        updateStubs: function(bs) {
            var self        = this,
                hor         = self.horizontal;

            self.topStub.style[hor ? "width" : "height"] = bs.ot + "px";
            self.botStub.style[hor ? "width" : "height"] = bs.ob + "px";
        },

        bufferUpdateEvent: function() {
            var self = this;
            self.queue.add(self.updateScrollBuffer, self);
        },


        updateScrollBuffer: function(reset) {

            var self        = this,
                prev        = self.bufferState,
                parent      = self.parentEl,
                rs          = self.renderers,
                bot         = self.botStub,
                bs          = self.getBufferState(false),
                promise     = new Promise,
                fragment,
                i, x, r;

            if (!bs) {
                return null;
            }

            if (!prev || bs.first != prev.first || bs.last != prev.last) {
                self.triggerIf("bufferchange", self, bs, prev);
            }

            raf(function(){

                if (reset || !prev || bs.last < prev.first || bs.first > prev.last){

                    //remove old and append new
                    if (prev) {
                        for (i = prev.first, x = prev.last; i <= x; i++) {
                            r = rs[i];
                            if (r && r.attached) {
                                parent.removeChild(r.el);
                                r.attached = false;
                            }
                        }
                    }
                    fragment = document.createDocumentFragment();
                    for (i = bs.first, x = bs.last; i <= x; i++) {
                        r = rs[i];
                        if (r) {
                            if (!r.rendered) {
                                self.renderItem(i);
                            }
                            fragment.appendChild(r.el);
                            r.attached = true;
                        }
                    }

                    parent.insertBefore(fragment, bot);

                }
                else {

                    if (prev.first < bs.first) {
                        for (i = prev.first, x = bs.first; i < x; i++) {
                            r = rs[i];
                            if (r && r.attached) {
                                parent.removeChild(r.el);
                                r.attached = false;
                            }
                        }
                    }
                    else if (prev.first > bs.first) {
                        fragment = document.createDocumentFragment();
                        for (i = bs.first, x = prev.first; i < x; i++) {
                            r = rs[i];
                            if (r) {
                                if (!r.rendered) {
                                    self.renderItem(i);
                                }
                                fragment.appendChild(r.el);
                                r.attached = true;
                            }
                        }
                        parent.insertBefore(fragment, rs[prev.first].el);
                    }

                    if (prev.last < bs.last) {
                        fragment = document.createDocumentFragment();
                        for (i = prev.last + 1, x = bs.last; i <= x; i++) {
                            r = rs[i];
                            if (r) {
                                if (!r.rendered) {
                                    self.renderItem(i);
                                }
                                fragment.appendChild(r.el);
                                r.attached = true;
                            }
                        }
                        parent.insertBefore(fragment, bot);
                    }
                    else if (prev.last > bs.last) {
                        for (i = bs.last + 1, x = prev.last; i <= x; i++) {
                            r = rs[i];
                            if (r && r.attached) {
                                parent.removeChild(r.el);
                                r.attached = false;
                            }
                        }
                    }
                }

                //var start = (new Date).getTime();

                self.updateStubs(bs);

                self.triggerIf("bufferupdate", self);



                /*async(function(){
                 // pre-render next
                 if (!prev || prev.first < bs.first) {
                 //self.doUpdate(bs.last, bs.last + (bs.last - bs.first), null, true);
                 }

                 self.onBufferStateChange(bs, prev);

                 });*/
                self.onBufferStateChange(bs, prev);

                promise.resolve();
            });

            return promise;
        },

        // not finished: todo unbuffered and animation
        scrollTo: function(index) {
            var self    = this,
                isize   = self.itemSize,
                sp      = self.scrollEl || getScrollParent(self.parentEl),
                hor     = self.horizontal,
                prop    = hor ? "scrollLeft" : "scrollTop",
                promise = new Promise,
                pos;

            if (self.buffered) {
                self.queue.append(function(){

                    raf(function(){
                        pos     = isize * index;
                        if (sp === window) {
                            window.scrollTo(
                                hor ? pos : getScrollLeft(),
                                !hor ? pos : getScrollTop()
                            );
                        }
                        else {
                            sp[prop] = pos;
                        }
                        promise.resolve();
                    });
                    return promise;
                });
            }

            return promise;
        },

        onBufferStateChange: function(bs, prev) {},

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
                parent      = self.parentEl,
                i, len;

            for (i = 0, len = renderers.length; i < len; i++) {
                renderers[i].renderer.destroy();
            }

            if (self.trackByWatcher) {
                self.trackByWatcher.unsubscribeAndDestroy();
            }

            if (self.buffered) {
                parent.removeChild(self.topStub);
                parent.removeChild(self.botStub);
                removeListener(self.scrollEl, "scroll", self.bufferEventDelegate);
                removeListener(window, "resize", self.bufferEventDelegate);
            }


            self.queue.destroy();
            self.watcher.unsubscribeAndDestroy(self.onChange, self);


            if (self.observable) {
                self.trigger("destroy", self);
                self.observable.destroy();
            }

            for (i in self) {
                if (self.hasOwnProperty(i)) {
                    self[i] = null;
                }
            }
        }

    }, {
        $stopRenderer: true,
        $registerBy: "id"
});
