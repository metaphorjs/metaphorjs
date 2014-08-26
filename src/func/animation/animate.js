//#require getAnimationPrefixes.js
//#require getAnimationDuration.js
//#require ../array/isArray.js
//#require ../isThenable.js
//#require ../extend.js
//#require ../dom/data.js
//#require ../nsGet.js
//#require ../../vars/Promise.js

var animate = MetaphorJs.animate = function(){

    var types           = {
            "show":     ["mjs-show"],
            "hide":     ["mjs-hide"],
            "enter":    ["mjs-enter"],
            "leave":    ["mjs-leave"],
            "move":     ["mjs-move"]
        },

        animId          = 0,

        cssAnimations   = !!getAnimationPrefixes(),

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



        nextInQueue     = function(el) {
            var queue = data(el, dataParam),
                next;
            if (queue.length) {
                next = queue[0];
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false, next.id);
            }
            else {
                data(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback, deferred, first, id) {

            var stopped   = function() {
                var q = data(el, dataParam);
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
                    data(el, dataParam).shift();
                    nextInQueue(el);
                }
                else {
                    data(el, dataParam)[0].position = position;
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
        };


    var animate = function animate(el, animation, startCallback, checkIfEnabled) {

        var deferred    = new Promise,
            queue       = data(el, dataParam) || [],
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
                    animation   = nsGet && nsGet("animate." + animation, true);
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
                data(el, dataParam, queue);

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
                        extend(el.style, before, true, false);
                    }
                    startCallback && startCallback(el);
                    data(el, dataParam, jsFn.call(context, el, function(){
                        deferred.resolve(el);
                    }));
                    return deferred;
                }
                else if (window.jQuery) {

                    var j = $(el);
                    before && j.css(before);
                    data(el, dataParam, "stop");

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

    animate.addAnimationType     = function(name, stages) {
        types[name] = stages;
    };

    return animate;
}();