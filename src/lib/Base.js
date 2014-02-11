(function(){

    "use strict"

    MetaphorJs.define("MetaphorJs.Base", {

        initialize: function(cfg) {
            cfg     = cfg || {};
            MetaphorJs.apply(this, cfg);
        },

        destroy: MetaphorJs.emptyFn

    });

}());