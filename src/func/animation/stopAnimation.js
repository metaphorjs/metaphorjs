//#require ../dom/data.js

var stopAnimation = MetaphorJs.stopAnimation = function(el) {

    var queue = data(el, "mjsAnimationQueue"),
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

    data(el, "mjsAnimationQueue", null);
};
