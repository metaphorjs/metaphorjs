require("metaphorjs-promise/src/lib/Promise.js");
require("metaphorjs-animate/src/animate/animate.js");
require("metaphorjs-animate/src/animate/stop.js");
require("metaphorjs-animate/src/animate/getPrefixes.js");

var cls = require("metaphorjs-class/src/cls.js"),
    raf = require("metaphorjs-animate/src/func/raf.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = (function(){


    var methods = {
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

                if (i === 0) {
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
                    var prefixes = MetaphorJs.animate.getPrefixes();
                    style[prefixes.transform] = "translateX("+from.left+"px) translateY("+from.top+"px)";
                }
            });

            return MetaphorJs.animate.animate(
                el,
                "move",
                startCallback,
                function(el, position, stage){
                    if (position === 0 && stage !== "start" && to) {
                        var prefixes = MetaphorJs.animate.getPrefixes();
                        style[prefixes.transform] = "translateX("+to.left+"px) translateY("+to.top+"px)";
                    }
                });
        },

        reflectChanges: function(vars) {

            var self            = this,
                oldRenderers    = vars.oldRenderers,
                newRenderers    = vars.newRenderers,
                translates,
                i, len, r;

            self.doUpdate(vars.updateStart, null, "enter");

            if (vars.doesMove) {
                translates = self.calculateTranslates(vars.newRenderers, vars.origRenderers, vars.oldRenderers);
            }

            var animPromises    = [],
                startAnimation  = new MetaphorJs.lib.Promise,
                applyFrom       = new MetaphorJs.lib.Promise,
                donePromise     = new MetaphorJs.lib.Promise,
                animReady       = MetaphorJs.lib.Promise.counter(newRenderers.length),
                startCallback   = function(){
                    animReady.countdown();
                    return startAnimation;
                };

            // destroy old renderers and remove old elements
            for (i = 0, len = oldRenderers.length; i < len; i++) {
                r = oldRenderers[i];
                if (r) {
                    r.scope.$destroy();

                    MetaphorJs.animate.stop(r.el);
                    animPromises.push(MetaphorJs.animate.animate(r.el, "leave")
                        .done(function(el){
                            el.style.visibility = "hidden";
                        }));
                }
            }

            for (i = 0, len = newRenderers.length; i < len; i++) {
                r = newRenderers[i];
                MetaphorJs.animate.stop(r.el);

                r.action === "enter" ?
                animPromises.push(MetaphorJs.animate.animate(r.el, "enter", startCallback)) :
                animPromises.push(
                    self.moveAnimation(
                        r.el,
                        vars.doesMove ? translates[i][0] : null,
                        vars.doesMove ? translates[i][1] : null,
                        startCallback,
                        applyFrom
                    )
                );
            }

            animReady.done(function(){
                raf(function(){
                    applyFrom.resolve();
                    self.applyDomPositions(oldRenderers);
                    if (!vars.doesMove) {
                        self.doUpdate(vars.updateStart, null, "move");
                    }
                    raf(function(){
                        startAnimation.resolve();
                    });
                    self.trigger("change", self);
                });
            });

            MetaphorJs.lib.Promise.all(animPromises).always(function(){
                raf(function(){
                    var prefixes = MetaphorJs.animate.getPrefixes();
                    self.doUpdate(vars.updateStart || 0);
                    self.removeOldElements(oldRenderers);
                    if (vars.doesMove) {
                        self.doUpdate(vars.updateStart, null, "move");
                        for (i = 0, len = newRenderers.length; i < len; i++) {
                            r = newRenderers[i];
                            r.el.style[prefixes.transform] = null;
                            r.el.style[prefixes.transform] = "";
                        }
                    }
                    donePromise.resolve();
                });
            });

            return donePromise;

        }
    };



    return cls({

        $class: "MetaphorJs.plugin.ListAnimated",

        $init: function(list) {

            list.$implement(methods);
        }

    });


}());