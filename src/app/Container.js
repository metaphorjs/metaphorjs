
require("./Component.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.app.Container = MetaphorJs.app.Component.$extend({

    initComponent: function() {
        var self = this, i, l;

        self.$super.apply(self, arguments);
        self.items = self.items || [];
        self.itemsMap = {};

        var items = self.items;

        for (i = -1, l = items.length; ++i < l;){
            self.itemsMap[items[i].id] = items[i];
            items[i].$$parent = self;
        }
    },

    getSectionEl: function(name) {
        return this.$refs['node'][name] || this.node;
    },

    render: function() {

        var self = this,
            items = self.items || [],
            i, l;

        for (i = -1, l = items.length; ++i < l; 
            items[i].render()){}

        self.$super.apply(self, arguments);

        for (i = -1, l = items.length; ++i < l; 
            items[i].attach(self.getSectionEl("items"))){}
    },

    addItem: function(item) {
        var self = this;
        if (item.$$parent === self) {
            return;
        }
        item.$$parent && item.$$parent.removeItem(item);
        item.$$parent = self;
        self.items.push(item);
        self.itemsMap[item.id] = item;

        item.renderTo = self.node;
        if (self._rendered) {
            item.attach(self.node);
        }
    },

    removeItem: function(item) {
        var self = this;
        if (item.$$parent !== self) {
            return;
        }
        item.$$parent = null;
        delete self.itemsMap[item.id];
        var inx = self.items.indexOf(item);
        if (inx !== -1) {
            self.items.splice(inx, 1);
        }
        item.detach();
        item.renderTo = null;
    }

});