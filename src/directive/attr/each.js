


var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    createWatchable = require("../../../../metaphorjs-watchable/src/func/createWatchable.js"),
    toArray = require("../../func/array/toArray.js"),
    error = require("../../func/error.js"),
    isAttached = require("../../func/dom/isAttached.js"),
    animate = require("../../../../metaphorjs-animate/src/metaphorjs.animate.js"),
    stopAnimation = require("../../../../metaphorjs-animate/src/func/stopAnimation.js"),
    Renderer = require("../../view/Renderer.js"),
    isNull = require("../../func/isNull.js"),
    isNumber = require("../../func/isNumber.js"),
    isPrimitive = require("../../func/isPrimitive.js"),
    bind = require("../../func/bind.js"),
    undf = require("../../var/undf.js"),
    ns = require("../../../../metaphorjs-namespace/src/var/ns.js"),
    isFunction = require("../../func/isFunction.js"),
    isIE = require("../../func/browser/isIE.js"),
    AttributeHandler = require("../../view/AttributeHandler.js"),
    async = require("../../func/async.js"),
    Promise = require("../../../../metaphorjs-promise/src/metaphorjs.promise.js");

require("../../func/array/aIndexOf.js");




registerAttributeHandler("mjs-each", 100, defineClass(null, AttributeHandler, {

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

    trackByFn: null,
    griDelegate: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.parseExpr(expr);

        node.removeAttribute("mjs-each");
        node.removeAttribute("mjs-include");

        self.tpl        = node;
        self.renderers  = [];
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;
        self.parentEl   = node.parentNode;

        self.node       = node;
        self.scope      = scope;
        self.animateMove    = node.getAttribute("mjs-animate-move") !== null && animate.cssAnimations;
        node.removeAttribute("mjs-animate-move");

        try {
            self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);
        }
        catch (thrownError) {
            error(thrownError);
        }

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


    },

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
            newrs       = [],
            promises    = [],
            iname       = self.itemName,
            oldrs       = renderers.slice(),
            origrs      = renderers.slice(),
            prevr,
            prevrInx,
            i, len,
            r,
            action,
            translates,
            doesMove    = false;


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
                    oldrs.splice(i, 0, r);
                    // add new elements to old renderers
                    // so that we could correctly determine positions
                }
            }

        self.renderers  = newrs;
        self.doUpdate(updateStart || 0);


        if (doesMove) {
            translates = self.calculateTranslates(newrs, origrs, oldrs);
        }


        // destroy old renderers and remove old elements
        for (i = 0, len = renderers.length; i < len; i++) {
            r = renderers[i];
            if (r) {
                r.scope.$destroy();

                stopAnimation(r.el);
                promises.push(animate(r.el, "leave", null, true, ns)
                    .done(function(el){
                        isAttached(el) && el.parentNode.removeChild(el);
                    }));
            }
        }
        renderers = null;
        r = null;

        for (i = newrs.length - 1; i >= 0; i--) {
            r = newrs[i];
            action = r.action;

            if (action == "none") {
                newrs[i].ready = self.moveEl(r.el, i);
            }
            else if (action == "move") {
                // move elements
                if (doesMove) {

                    stopAnimation(r.el);
                    promises.push(self.moveAnimation(r.el, translates[i][0], translates[i][1])
                        .done(function(inx){
                            return function(el) {
                                newrs[inx].ready = self.moveEl(el, inx);
                            }
                        }(i)));
                }
                else {
                    newrs[i].ready = self.moveEl(r.el, i);
                }
            }
            else if (action == "enter") {
                // introduce new elements
                stopAnimation(r.el);
                promises.push(animate(r.el, "enter", function(inx) {
                    return function(el){
                        newrs[inx].ready = self.moveEl(el, inx, true);
                    }
                }(i), true, ns));
            }
            else {
                newrs[i].ready = true;
            }
        }

        Promise.all(promises).always(self.finishAnimations, self);
    },

    ieFixEl: function(el) {
        el.style.zoom = 1;
        el.style.zoom = "";
    },

    finishAnimations: function() {

        var self    = this,
            orphans = [],
            rns     = self.renderers,
            inf     = 0,
            fixIE   = isIE() && animate.cssAnimations,
            i, l, o,
            max;

        for (i = 0, l = rns.length; i < l; i++) {
            if (!rns[i].ready) {
                orphans.push([rns[i].el, i]);
            }
            else {
                // in IE 11 (10 too?) elements disappear
                // after some animations
                // what is the most disturbing that
                // it is those elements that were not animated %)
                if (fixIE) {
                    async(self.ieFixEl, self, [rns[i].el]);
                }
            }
        }

        max = l * 5;

        while (orphans.length) {
            if (inf > max) {
                error("Orphans got into infinite loop");
                break;
            }
            o = orphans.shift();
            if (!self.moveEl(o[0], o[1])) {
                orphans.push(o);
            }
            else {
                // ugly ugly ugly ugly
                if (fixIE) {
                    async(self.ieFixEl, self, [o[0]]);
                }
            }
            inf++;
        }
    },

    moveEl: function(el, inx, force) {
        var self = this,
            cnt = self.renderers.length,
            parent = self.parentEl,
            before = self.getInsertBeforeEl(inx, cnt - 1),
            ready = true;

        if (before === false && force) {
            before = self.getInsertBeforeEl(inx, cnt - 1, true);
            ready = false;
        }

        if (before !== false && (!before || isAttached(before))) {
            if (!el.nextSibling || el.nextSibling !== before) {
                parent.insertBefore(el, before);
            }
            // remove translateXY transform at the same time as
            // dom position changed
            if (self.animateMove) {
                el.style[animate.prefixes.transform] = null;
                el.style[animate.prefixes.transform] = "";
            }
            return self.renderers[inx].ready = ready;
        }
        return false;
    },

    getInsertBeforeEl: function(inx, lastInx, allowNotReady) {

        var self = this;

        if (inx == 0) {
            var prevEl = self.prevEl;
            return prevEl ? prevEl.nextSibling : self.parentEl.firstChild;
        }
        else if (inx == lastInx) {
            return self.nextEl;
        }
        else {
            var r = self.renderers[inx+1];
            return r.ready || allowNotReady ? r.el : false;
        }
    },

    getNodePositions: function(tmp, rs) {

        var nodes = [],
            i, l, el, r,
            tmpNode,
            positions = {};

        while(tmp.firstChild) {
            tmp.removeChild(tmp.firstChild);
        }
        for (i = 0, l = rs.length; i < l; i++) {
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

    // ugly ugly ugly ugly ugly
    calculateTranslates: function(newRenderers, oldRenderers, withInserts) {

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
            tmpW,
            style,
            el;

        style = tmp.style;
        style.position = "absolute";
        style.left = "-10000px";
        style.visibility = "hidden";
        style.width = ofsW + 'px';

        pp.insertBefore(tmp, parent);
        tmpW = tmp.offsetWidth;
        style.width = ofsW - (tmpW - ofsW) + "px";

        oldPositions = self.getNodePositions(tmp, oldRenderers);
        insertPositions = self.getNodePositions(tmp, withInserts);
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
                {
                    left: (newPositions[id].left - fl) - (insertPositions[id].left - fl),
                    top: (newPositions[id].top - ft) - (insertPositions[id].top - ft)
                },
                insertPositions[id] && oldPositions[id] ?
                {
                    left: (oldPositions[id].left - fl) - (insertPositions[id].left - fl),
                    top: (oldPositions[id].top - ft) - (insertPositions[id].top - ft)
                } : null
            ]);
        }

        return translates;
    },

    moveAnimation: function(el, to, from) {

        var attr = el.getAttribute("mjs-animate");

        if (attr == undf) {
            return Promise.resolve(el);
        }

        if (animate.cssAnimations) {
            var style = el.style;

            return animate(el, "move", null, false, ns, function(el, position, stage){
                if (position == 0 && stage == "start" && from) {
                    style[animate.prefixes.transform] = "translateX("+from.left+"px) translateY("+from.top+"px)";
                }
                if (position == 0 && stage != "start") {
                    style[animate.prefixes.transform] = "translateX("+to.left+"px) translateY("+to.top+"px)";
                }
            });
        }
        else {
            return Promise.resolve(el);
        }
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

}, {
    $stopRenderer: true
}));
