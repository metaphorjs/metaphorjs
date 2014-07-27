

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
        animationStage  = function animationStage(el, stages, position, startCallback, endCallback) {

            var finishStage = function() {
                removeClass(el, stages[position]);
                removeClass(el, stages[position] + "-active");

                position++;

                if (position == stages.length) {
                    endCallback && endCallback();
                }
                else {
                    animationStage(el, stages, position, endCallback);
                }
            };

            animFrame(function(){
                addClass(el, stages[position]);

                startCallback && startCallback();

                animFrame(function(){
                    addClass(el, stages[position] + "-active");
                    var duration = getAnimationDuration(el);
                    if (duration) {
                        callTimeout(finishStage, (new Date).getTime(), duration);
                    }
                    else {
                        finishStage();
                    }
                });
            });
        },
        addClass    = MetaphorJs.addClass,
        removeClass = MetaphorJs.removeClass;


    MetaphorJs.animate = function animate(el, stages, startCallback, endCallback) {

        var animate = el.getAttribute('mjs-animate'),
            js      = el.getAttribute('mjs-animate-js'),
            jsName,
            jsFn;

        if (stages && typeof stages == "string") {
            stages  = types[stages];
        }

        if (typeof animate == "string" && animate && animate.substr(0,1) == '[') {
            stages  = (new Function('', 'return ' + animate))();
            animate = null;
        }

        if (animate != undefined && cssAnimations && stages) {
            animationStage(el, stages, 0, startCallback, endCallback);
        }
        else if ((jsName = js || animate) && (jsFn = g("animate." + jsName, true))) {
            jsFn(el, startCallback, endCallback)
        }
        else  {
            startCallback && startCallback();
            endCallback && endCallback();
        }
    };


}());