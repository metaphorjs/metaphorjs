
MetaphorJs.define("MetaphorJs.data.Record", "MetaphorJs.cmp.Observable", {

    data:       {},
    fields:     {},
    idProperty: null,
    id:         null,

    initialize: function(data, fields, cfg) {

        var self    = this;

        self.supr(cfg);

        self.fields = fields || {};
        self.data   = self.processRawData(data);

        if (self.idProperty) {
            self.id     = self.data[self.idProperty];
        }
    },

    processRawData: function(data) {

        var self        = this,
            processed   = {},
            name;

        for (name in data) {
            processed[name] = self.restoreField(name, data[name]);
        }

        return processed;
    },

    restoreField: function(name, value) {

        var self    = this,
            f       = self.fields[name];

        if (f) {
            var type = typeof f == "string" ? f : f.type;

            switch (type) {
                case "int": {
                    value   = parseInt(value);
                    break;
                }
                case "bool":
                case "boolean": {
                    if (typeof value == "string") {
                        value   = value.toLowerCase();
                        if (value === "off" || value === "no" || value === "0") {
                            value = false;
                        }
                        else {
                            value = true;
                        }
                    }
                    else {
                        value = value ? true : false;
                    }
                    break;
                }
                case "double":
                case "float": {
                    value   = parseFloat(value);
                    break;
                }
            }

            if (f.process) {
                value   = f.process.call(self, value, name);
            }
        }

        return self.onRestoreField(name, value);
    },

    onRestoreField: function(name, value) {
        return value;
    },

    getId: function() {
        return this.id;
    },

    getData: function() {
        return $.extend({}, this.data);
    },

    get: function(key) {
        return this.data[key];
    },

    set: function(key, value) {

        var self    = this,
            prev    = self.data[key];

        self.data[key]  = self.restoreField(key, value);

        self.trigger("change", key, value, prev, self);
    },

    destroy: function() {

        var self    = this;

        self.trigger("destroy", self);

        self.data   = {};
        self.fields = null;

        self.supr();
    }

});