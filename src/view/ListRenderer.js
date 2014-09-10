var createWatchable = require("../../../metaphorjs-watchable/src/func/createWatchable.js"),
    toArray = require("../func/array/toArray.js"),
    error = require("../func/error.js"),
    isAttached = require("../func/dom/isAttached.js"),
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
    isIE = require("../func/browser/isIE.js"),
    async = require("../func/async.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js"),
    animFrame = require("../../../metaphorjs-animate/src/func/animFrame.js");

require("../func/array/aIndexOf.js");




var ListRenderer = function(scope, node, expr) {

    node.removeAttribute("mjs-each");
    node.removeAttribute("mjs-include");

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

    self.animateMove= node.getAttribute("mjs-animate-move") !== null && animate.cssAnimations;
    self.animate    = node.getAttribute("mjs-animate") !== null;
    node.removeAttribute("mjs-animate-move");

    self.trackBy    = node.getAttribute("mjs-track-by");
    if (self.trackBy) {
        if (self.trackBy != '$') {
            self.trackByWatcher = createWatchable(scope, self.trackBy, self.onChangeTrackBy, self, null, ns);
        }
    }
    else if (!self.watcher.hasInputPipes()) {
        self.trackBy    = '$$'+self.watcher.id;
    }
    node.removeAttribute("mjs-track-by");


    self.griDelegate = bind(self.scopeGetRawIndex, self);
    self.parentEl.removeChild(node);
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

    doUpdate: function(start) {

        var self        = this,
            renderers   = self.renderers,
            index       = start,
            len         = renderers.length,
            last        = len - 1,
            even        = !(index % 2),
            list        = self.watcher.getLastResult(),
            trackByFn   = self.getTrackByFunction(),
            griDelegate = self.griDelegate,
            r,
            scope;


        for (; index < len; index++) {

            r       = renderers[index];
            scope   = r.scope;

            scope.$index    = index;
            scope.$first    = index === 0;
            scope.$last     = index === last;
            scope.$even     = even;
            scope.$odd      = !even;
            scope.$trackId  = trackByFn(list[index]);
            scope.$getRawIndex = griDelegate;

            even = !even;

            if (!r.renderer) {
                r.renderer  = new Renderer(r.el, r.scope);
                r.renderer.process();
            }
            else {
                scope.$check();
            }
        }

    },

    render: function(list) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            parent      = self.parentEl,
            next        = self.nextEl,
            fragment    = document.createDocumentFragment(),
            el,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {

            el = tpl.cloneNode(true);
            fragment.appendChild(el);
            renderers.push(self.createItem(el, list, i));
        }

        parent.insertBefore(fragment, next);

        self.doUpdate(0);
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
            ready: false,
            action: "enter",
            el: el,
            scope: itemScope
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
                prevr.ready = false;
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
        self.doUpdate(updateStart || 0);

        if (animateAll) {

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
                animFrame(function(){
                    applyFrom.resolve();
                    self.applyDomPositions(renderers);

                    animFrame(function(){
                        startAnimation.resolve();
                    });
                });
            });

            Promise.all(animPromises).always(function(){
                animFrame(function(){
                    self.removeOldElements(renderers);
                    if (animate.cssAnimations) {
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
            self.removeOldElements(renderers);
        }
    },

    ieFixEl: function(el) {
        el.style.zoom = 1;
        el.style.zoom = "";
    },

    removeOldElements: function(rs) {
        var i, len, r;

        for (i = 0, len = rs.length; i < len; i++) {
            r = rs[i];
            if (r) {
                isAttached(r.el) && r.el.parentNode.removeChild(r.el);
            }
        }
    },


    applyDomPositions: function(oldrs) {

        var self    = this,
            rs      = self.renderers,
            parent  = self.parentEl,
            prevEl  = self.prevEl,
            next,
            i, l, el;

        for (i = 0, l = rs.length; i < l; i++) {
            el = rs[i].el;

            if (oldrs && oldrs[i]) {
                next = oldrs[i].el.nextSibling;
            }
            else {
                next = i > 0 ?
                       rs[i-1].el.nextSibling :
                       (prevEl ? prevEl.nextSibling : parent.firstChild);
            }
            if (next && el.nextSibling !== next) {
                parent.insertBefore(el, next);
            }
            else if (!next) {
                parent.appendChild(el);
            }


        }

    },

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

        self.supr();
    }

};

ListRenderer.$stopRenderer = true;

module.exports = ListRenderer;