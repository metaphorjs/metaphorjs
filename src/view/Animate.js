

(function(){

    var types   = {
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
        detectCssPrefixes   = function() {

            var el = document.createElement("div"),
                animation = false,
                pfx,
                i, len;

            if (el.style.animationName !== undefined) {
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
        g               = MetaphorJs.g,

        Promise         = MetaphorJs.lib.Promise,

        dataFn          = MetaphorJs.data,

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

            var style       = window.getComputedStyle ? window.getComputedStyle(el) : el.style,
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
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false);
            }
            else {
                dataFn(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback, deferred, first) {

            var stopped   = function() {
                var so = !dataFn(el, dataParam);
                if (so) {
                    deferred.resolve(el);
                }
                return so;
            };

            var finishStage = function() {

                if (stopped()) {
                    return;
                }

                removeClass(el, stages[position]);
                removeClass(el, stages[position] + "-active");

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
            };

            var start = function(){

                if (stopped()) {
                    return;
                }

                addClass(el, stages[position]);

                startCallback && startCallback(el);
                startCallback = null;

                animFrame(function() {

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
                });
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

        if (queue) {
            current = queue[0];

            if (current.stages) {
                position = current.position;
                stages = current.stages;
                removeClass(el, stages[position]);
                removeClass(el, stages[position] + "-active");
            }
        }

        dataFn(el, dataParam, null);
    };

    MetaphorJs.animate = function animate(el, stages, startCallback) {

        var animate     = el.getAttribute('mjs-animate'),
            js          = el.getAttribute('mjs-animate-js'),
            deferred    = new Promise,
            queue       = dataFn(el, dataParam) || [],
            jsName,
            jsFn;

        if (stages && typeof stages == "string") {
            stages  = types[stages];
        }

        if (typeof animate == "string" && animate && animate.substr(0,1) == '[') {
            stages  = (new Function('', 'return ' + animate))();
            animate = null;
        }

        queue.push({
            el: el,
            stages: stages,
            start: startCallback,
            deferred: deferred,
            position: 0
        });
        dataFn(el, dataParam, queue);

        if (animate != undefined && cssAnimations && stages) {
            if (queue.length == 1) {
                animationStage(el, stages, 0, startCallback, deferred, true);
            }
        }
        else if ((jsName = js || animate) && (jsFn = g("animate." + jsName, true))) {
            jsFn(el, startCallback, deferred);
        }
        else  {
            startCallback && startCallback(el);
            deferred.resolve(el);
        }

        return deferred.promise();
    };


}());