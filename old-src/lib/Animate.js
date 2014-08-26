

(function() {

    "use strict";



    var m               = window.MetaphorJs,
        g               = m.g,
        Promise         = m.lib.Promise,
        dataFn          = m.data,
        isThenable      = m.isThenable,
        isArray         = m.isArray,
        extend          = m.extend,

        types           = {
            "show": ["mjs-show"],
            "hide": ["mjs-hide"],
            "enter": ["mjs-enter"],
            "leave": ["mjs-leave"],
            "move": ["mjs-move"]
        },
        domPrefixes         = ['Moz', 'Webkit', 'ms', 'O', 'Khtml'],
        animationDelay      = "animationDelay",
        animationDuration   = "animationDuration",
        transitionDelay     = "transitionDelay",
        transitionDuration  = "transitionDuration",
        animId              = 0,

        detectCssPrefixes   = function() {

            var el = document.createElement("div"),
                animation = false,
                pfx,
                i, len;

            if (el.style['animationName'] !== undefined) {
                animation = true;
            }
            else {
                for(i = 0, len = domPrefixes.length; i < len; i++) {
                    pfx = domPrefixes[i];
                    if (el.style[ pfx + 'AnimationName' ] !== undefined) {
                        animation           = true;
                        animationDelay      = pfx + "AnimationDelay";
                        animationDuration   = pfx + "AnimationDuration";
                        transitionDelay     = pfx + "TransitionDelay";
                        transitionDuration  = pfx + "TransitionDuration";
                        break;
                    }
                }
            }

            return animation;
        },
        cssAnimations   = detectCssPrefixes(),

        animFrame       = window.requestAnimationFrame ? window.requestAnimationFrame : function(cb) {
            window.setTimeout(cb, 0);
        },

        dataParam       = "mjsAnimationQueue",

        callTimeout     = function(fn, startTime, duration) {
            var tick = function(){
                var time = (new Date).getTime();
                if (time - startTime >= duration) {
                    fn();
                }
                else {
                    animFrame(tick);
                }
            };
            animFrame(tick);
        },

        parseTime       = function(str) {
            if (!str) {
                return 0;
            }
            var time = parseFloat(str);
            if (str.indexOf("ms") == -1) {
                time *= 1000;
            }
            return time;
        },

        getMaxTimeFromPair = function(max, dur, delay) {

            var i, sum, len = dur.length;

            for (i = 0; i < len; i++) {
                sum = parseTime(dur[i]) + parseTime(delay[i]);
                max = Math.max(sum, max);
            }

            return max;
        },

        getAnimationDuration = function(el) {

            var style       = window.getComputedStyle ? window.getComputedStyle(el, null) : el.style,
                duration    = 0,
                animDur     = (style[animationDuration] || '').split(','),
                animDelay   = (style[animationDelay] || '').split(','),
                transDur    = (style[transitionDuration] || '').split(','),
                transDelay  = (style[transitionDelay] || '').split(',');

            duration    = Math.max(duration, getMaxTimeFromPair(duration, animDur, animDelay));
            duration    = Math.max(duration, getMaxTimeFromPair(duration, transDur, transDelay));

            return duration;
        },

        nextInQueue     = function(el) {
            var queue = dataFn(el, dataParam),
                next;
            if (queue.length) {
                next = queue[0];
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false, next.id);
            }
            else {
                dataFn(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback, deferred, first, id) {

            var stopped   = function() {
                var q = dataFn(el, dataParam);
                if (!q || !q.length || q[0].id != id) {
                    deferred.reject(el);
                    return true;
                }
                return false;
            };

            var finishStage = function() {

                if (stopped()) {
                    return;
                }

                var thisPosition = position;

                position++;

                if (position == stages.length) {
                    deferred.resolve(el);
                    dataFn(el, dataParam).shift();
                    nextInQueue(el);
                }
                else {
                    dataFn(el, dataParam)[0].position = position;
                    animationStage(el, stages, position, null, deferred);
                }

                removeClass(el, stages[thisPosition]);
                removeClass(el, stages[thisPosition] + "-active");
            };

            var setStage = function() {

                if (stopped()) {
                    return;
                }

                addClass(el, stages[position] + "-active");

                var duration = getAnimationDuration(el);

                if (duration) {
                    callTimeout(finishStage, (new Date).getTime(), duration);
                }
                else {
                    finishStage();
                }
            };

            var start = function(){

                if (stopped()) {
                    return;
                }

                addClass(el, stages[position]);

                var promise;

                if (startCallback) {
                    promise = startCallback(el);
                    startCallback = null;
                }

                if (isThenable(promise)) {
                    promise.done(setStage);
                }
                else {
                    animFrame(setStage);
                }
            };

            first ? animFrame(start) : start();
        },
        addClass    = MetaphorJs.addClass,
        removeClass = MetaphorJs.removeClass;


    MetaphorJs.stopAnimation = function stop(el) {

        var queue = dataFn(el, dataParam),
            current,
            position,
            stages;

        if (isArray(queue) && queue.length) {
            current = queue[0];

            if (current && current.stages) {
                position = current.position;
                stages = current.stages;
                removeClass(el, stages[position]);
                removeClass(el, stages[position] + "-active");
            }
        }
        else if (typeof queue == "function") {
            queue(el);
        }
        else if (queue == "stop") {
            $(el).stop(true, true);
        }

        dataFn(el, dataParam, null);
    };

    MetaphorJs.animate = function animate(el, animation, startCallback, checkIfEnabled) {

        var deferred    = new Promise,
            queue       = dataFn(el, dataParam) || [],
            id          = ++animId,
            attr        = el.getAttribute("mjs-animate"),
            stages,
            jsFn,
            before, after,
            options, context,
            duration;

        animation       = animation || attr;

        if (checkIfEnabled && attr === null) {
            animation   = null;
        }

        if (animation) {

            if (typeof animation == "string") {
                if (animation.substr(0,1) == '[') {
                    stages  = (new Function('', 'return ' + animation))();
                }
                else {
                    stages      = types[animation];
                    animation   = g && g("animate." + animation, true);
                }
            }
            else if (typeof animation == "function") {
                jsFn = animation;
            }
            else if (isArray(animation)) {
                if (typeof animation[0] == "string") {
                    stages = animation;
                }
                else {
                    before = animation[0];
                    after = animation[1];
                }
            }

            if (animation && animation.constructor === Object) {
                stages      = animation.stages;
                jsFn        = animation.fn;
                before      = animation.before;
                after       = animation.after;
                options     = animation.options ? extend({}, animation.options) : {};
                context     = animation.context || null;
                duration    = animation.duration || null;
                startCallback   = startCallback || options.start;
            }


            if (cssAnimations && stages) {

                queue.push({
                    el: el,
                    stages: stages,
                    start: startCallback,
                    deferred: deferred,
                    position: 0,
                    id: id
                });
                dataFn(el, dataParam, queue);

                if (queue.length == 1) {
                    animationStage(el, stages, 0, startCallback, deferred, true, id);
                }

                return deferred;
            }
            else {

                options = options || {};

                startCallback && (options.start = function(){
                    startCallback(el);
                });

                options.complete = function() {
                    deferred.resolve(el);
                };

                duration && (options.duration = duration);

                if (jsFn && typeof jsFn == "function") {
                    if (before) {
                        extend(el.style, before, true);
                    }
                    startCallback && startCallback(el);
                    dataFn(el, dataParam, jsFn.call(context, el, function(){
                        deferred.resolve(el);
                    }));
                    return deferred;
                }
                else if (window.jQuery) {

                    var j = $(el);
                    before && j.css(before);
                    dataFn(el, dataParam, "stop");

                    if (jsFn && typeof jsFn == "string") {
                        j[jsFn](options);
                        return deferred;
                    }
                    else if (after) {
                        j.animate(after, options);
                        return deferred;
                    }
                }
            }
        }

        // no animation happened

        if (startCallback) {
            var promise = startCallback(el);
            if (isThenable(promise)) {
                promise.done(function(){
                    deferred.resolve(el);
                });
            }
            else {
                deferred.resolve(el);
            }
        }
        else {
            deferred.resolve(el);
        }

        return deferred;
    };

    MetaphorJs.animate.getAnimationDuration = getAnimationDuration;
    MetaphorJs.animate.addAnimationType     = function(name, stages) {
        types[name] = stages;
    };
}());