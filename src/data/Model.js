
(function(){

"use strict";
var instances   = {};
var cache       = {};

MetaphorJs.define("MetaphorJs.data.Model", {

    /*
    for every type of request load/save/delete
    you can provide options loadId, loadData, loadExtra
    if not provided, id/data will be used
    "extra" is always used

    also, every type of request can be either null (none),
    url or ajaxCfg object
     */

    type:           null,
    fields:         null,
    record:         null,
    store:          null,
    plain:          false,

    initialize: function(cfg) {

        var self        = this,
            defaults    = {
                record: {
                    load:       null,
                    save:       null,
                    delete:     null,
                    id:         null,
                    data:       null,
                    success:    null,
                    extra:      {}
                },

                store: {
                    load:       null,
                    save:       null,
                    delete:     null,
                    id:         null,
                    data:       null,
                    total:      null,
                    start:      null,
                    limit:      null,
                    success:    null,
                    extra:      {}
                }
            };


        self.fields     = {};

        MetaphorJs.apply(self, cfg);

        self.record     = self.record || {};
        self.store      = self.store || {};
        self.plain      = self.type ? false : true;

        MetaphorJs.apply(self.record, defaults.record, false);
        MetaphorJs.apply(self.store, defaults.store, false);
    },

    isPlain: function() {
        return this.plain;
    },

    getRecordProp: function(type, prop) {
        return this.getProp("record", type, prop);
    },

    getStoreProp: function(type, prop) {
        return this.getProp("store", type, prop);
    },

    getProp: function(what, type, prop) {
        var profile = this[what];
        return (profile[type] && profile[type][prop]) || profile[prop] || this[prop] || null;
    },

    _createAjaxCfg: function(what, type, id, data) {

        var self        = this,
            profile     = self[what],
            cfg         = typeof profile[type] == "string" ?
                            {url: profile[type]} : profile[type],
            idProp      = self.getProp(what, type, "id"),
            dataProp    = self.getProp(what, type, "data");

        if (!cfg) {
            throw new Error(what + "." + type + " not defined");
        }

        cfg.data        = $.extend(
            true, {},
            cfg.data,
            self.extra,
            profile.extra,
            profile[type].extra
        );

        if (!cfg.type) {
            cfg.type    = type == "load" ? "GET" : "POST";
        }

        if (id) {
            cfg.data[idProp]    = id;
        }
        if (data) {
            if (dataProp) {
                cfg.data[dataProp]  = data;
            }
            else {
                cfg.data    = data;
            }
        }

        return cfg;
    },

    _processRecordResponse: function(type, response, df) {
        var self        = this,
            idProp      = self.getRecordProp(type, "id"),
            dataProp    = self.getRecordProp(type, "data"),
            data        = dataProp ? response[dataProp] : response,
            id          = (data && data[idProp]) || response[idProp];

        if (!self._getSuccess("record", type, response)) {
            df.reject(response);
        }
        else {
            df.resolve(id, data);
        }
    },

    _processStoreResponse: function(type, response, df) {
        var self        = this,
            dataProp    = self.getStoreProp(type, "data"),
            totalProp   = self.getStoreProp(type, "total"),
            data        = dataProp ? response[dataProp] : response,
            total       = totalProp ? response[totalProp] : null;

        if (!self._getSuccess("store", type, response)) {
            df.reject(response);
        }
        else {
            df.resolve(data, total);
        }
    },

    _getSuccess: function(what, type, response) {
        var self    = this,
            sucProp = self.getProp(what, type, "success");

        return sucProp ? response[sucProp] : true;
    },


    loadRecord: function(id) {

        var self    = this,
            p       = $.ajax(self._createAjaxCfg("record", "load", id)),
            df      = new jQuery.Deferred;

        p.then(
            function(response){
                self._processRecordResponse("load", response, df);
            },
            df.reject
        );

        return df.promise();
    },

    saveRecord: function(rec) {

        var self    = this,
            p       = $.ajax(self._createAjaxCfg(
                        "record", "save",
                        rec.getId(),
                        rec.storeData(rec.getData())
                    )),
            df      = new jQuery.Deferred;


        p.then(
            function(response) {
                self._processRecordResponse("save", response, df);
            },
            df.reject
        );

        return df.promise();
    },

    deleteRecord: function(rec) {
        var self    = this,
            p       = $.ajax(this._createAjaxCfg("record", "delete", rec.getId())),
            df      = new jQuery.Deferred;

        p.then(
            function(response){
                df[self._getSuccess("record", "delete", response) ? "resolve" : "reject"]();
            },
            df.reject
        );

        return df.promise();
    },





    loadStore: function(store, params, cb) {

        var self    = this,
            acfg    = self._createAjaxCfg("store", "load"),
            df      = new jQuery.Deferred,
            p;

        acfg.data   = $.extend(true, acfg.data, params);
        p           = $.ajax(acfg);

        p.then(
            function(response) {
                self._processStoreResponse("load", response, df);
            },
            df.reject
        );

        return df.promise();
    },

    saveStore: function(store, recordData) {

        var self    = this,
            p       = $.ajax(self._createAjaxCfg("store", "save", null, recordData)),
            df      = new jQuery.Deferred;

        p.then(
            function(response) {
                self._processStoreResponse("save", response, df);
            },
            df.reject
        );

        return df.promise();
    },

    deleteRecords: function(store, ids) {

        var self    = this,
            p       = $.ajax(self._createAjaxCfg("store", "delete", ids)),
            df      = new jQuery.Deferred;

        p.then(
            function(response) {
                df[self._getSuccess("store", "delete", response) ? "resolve" : "reject"]();
            },
            df.reject
        );

        return df.promise();
    },








    getFields: function() {
        return this.fields;
    },

    restoreField: function(rec, name, value) {

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
                        if (value === "off" || value === "no" || value === "0" ||
                            value == "false" || value == "null") {
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
                case "date": {
                    if (f.parseFn) {
                        value   = f.parseFn(value, f.format);
                    }
                    else if (Date.parse) {
                        value   = Date.parse(value, f.format);
                    }
                    else {
                        if (f.format == "timestamp") {
                            value   = parseInt(value) * 1000;
                        }
                        value   = new Date(value);
                    }
                    break;
                }
            }

            if (f.restore) {
                value   = f.restore.call(rec, value, name);
            }
        }

        return self.onRestoreField(rec, name, value);
    },

    onRestoreField: function(rec, name, value) {
        return value;
    },

    storeField: function(rec, name, value) {

        var self    = this,
            f       = self.fields[name];

        if (f) {
            var type = typeof f == "string" ? f : f.type;

            switch (type) {
                case "bool":
                case "boolean": {
                    value   = value ? "1" : "0";
                    break;
                }
                case "date": {
                    if (f.formatFn) {
                        value   = f.formatFn(value, f.format);
                    }
                    else if (Date.format) {
                        value   = Date.format(value, f.format);
                    }
                    else {
                        if (f.format == "timestamp") {
                            value   = value.getTime() / 1000;
                        }
                        else {
                            value   = value.format ? value.format(f.format) : value.toString();
                        }
                    }
                    break;
                }
                default: {
                    value   = value.toString();
                }
            }

            if (f.store) {
                value   = f.store.call(rec, value, name);
            }
        }

        return self.onStoreField(rec, name, value);

    },

    onStoreField: function(rec, name, value) {
        return value;
    }


}, {

    /**
     * @returns MetaphorJs.data.Model
     */
    create: function(model, cfg) {

        if (model == "MetaphorJs.data.Model") {
            return MetaphorJs.create(model, cfg);
        }
        else {
            if (cfg) {
                return MetaphorJs.create(model, cfg);
            }
            else {
                if (instances[model]) {
                    return instances[model];
                }
                else {
                    return instances[model] = MetaphorJs.create(model);
                }
            }
        }
    },

    addToCache: function(rec) {

        var cls     = rec.getClass(),
            id      = rec.getId();

        if (cls != "MetaphorJs.data.Record") {
            if (!cache[cls]) {
                cache[cls] = {};
            }
            cache[cls][id] = rec;
        }
    },

    getFromCache: function(type, id) {

        if (cache[type] && cache[type][id]) {
            return cache[type][id];
        }
        else {
            return null;
        }
    },

    removeFromCache: function(type, id) {
        if (cache[type] && cache[type][id]) {
            delete cache[type][id];
        }
    }

});



}());