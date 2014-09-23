
var defineClass = require("../../../metaphorjs-class/src/func/defineClass.js"),
    ns = require("../../../metaphorjs-namespace/src/var/ns.js"),
    nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    animate = require("../../../metaphorjs-animate/src/metaphorjs.animate.js");

module.exports = nsAdd("plugin.ListAnimatedMove", defineClass({

    $init: function(list) {

        list.$implement({
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
            }
        });

    }

}));