(function(){

    var Observable = MetaphorJs.lib.Observable;

    /**
     * @namespace MetaphorJs
     * @class MetaphorJs.cmp.Base
     */
    MetaphorJs.d("MetaphorJs.cmp.Base", {

        /**
         * @var bool
         * @access protected
         */
        destroyed:      false,

        /**
         * @var MetaphorJs.lib.Observable
         * @access private
         */
        _observable:    null,

        /**
         * @param {object} cfg
         */
        initialize: function(cfg) {

            var self    = this;
            cfg         = cfg || {};

            self._observable    = new Observable;
            MetaphorJs.apply(self, self._observable.getApi());

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

            MetaphorJs.apply(this, cfg);
        },

        /**
         * @method
         */
        destroy:    function() {

            var self    = this;

            if (self.destroyed) {
                return;
            }

            if (self.trigger('beforedestroy', self) === false) {
                return false;
            }

            self.onDestroy();
            self.destroyed  = true;

            self.trigger('destroy', self);

            self._observable.destroy();
            delete this._observable;

        },

        /**
         * @method
         * @access protected
         */
        onDestroy:      MetaphorJs.emptyFn
    });



}());
