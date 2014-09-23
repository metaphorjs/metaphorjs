
var ObservableMixin = require("../mixin/ObservableMixin.js"),
    defineClass = require("../../../metaphorjs-class/src/func/defineClass.js"),
    nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js");

module.exports = nsAdd("plugin.Observable", defineClass({

    $mixins: [ObservableMixin],

    $init: function(cmp) {

        cmp.$implement({
            $$observable: this.$$observable,
            on: this.on,
            once: this.once,
            un: this.un,
            trigger: this.trigger
        });

    }

}));