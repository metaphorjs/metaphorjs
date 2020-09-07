
require("../../lib/Config.js");
require("./Base.js");
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.view.Component = MetaphorJs.app.view.Base.$extend({

    initConfig: function() {
        this.config.setDefaultMode("value", MetaphorJs.lib.Config.MODE_DYNAMIC);
        this.$super();
    },

    initView: function() {
        var self = this;
        self.config.on("value", self.onCmpChange, self);
        self.onCmpChange();
    },

    onCmpChange: function() {
        var self    = this,
            cmp     = self.config.get("value") || 
                        self.config.get("defaultCmp");

        if (!cmp) {
            self.currentComponent && self.clearComponent();
        }
        else {
            self.setComponent(cmp);
        }
    }
});