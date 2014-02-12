
MetaphorJs.define("MetaphorJs.cmp.Observable", "MetaphorJs.cmp.Base", {

    _observable:    null,
    listeners:      null,

    initialize:     function(cfg) {

        var self    = this;

        self._observable    = new MetaphorJs.lib.Observable;
        MetaphorJs.apply(self, self._observable.getApi());

        cfg     = cfg || {};

        if (cfg.callback) {

            var cb      = cfg.callback,
                scope   = cb.scope || self;
            delete cb.scope;

            for (var k in cb) {
                if (cb.hasOwnProperty(k)) {
                    self.on(k, cb[k], scope);
                }
            }

            delete cfg.callback;
        }

        self.supr(cfg);
    },

    destroy: function() {

        this._observable.destroy();
        delete this._observable;
        this.supr();
    }

});
