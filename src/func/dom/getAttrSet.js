
require("./__init.js");
require("./removeAttr.js");
require("../../lib/Config.js");

var toCamelCase = require("metaphorjs-shared/src/func/toCamelCase.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get node attributes classified by directive
 * @function MetaphorJs.dom.getAttrSet
 * @param {HTMLElement} node
 * @returns {object}
 */
module.exports = MetaphorJs.dom.getAttrSet = (function() {

    // regular expression seems to be a few milliseconds faster
    // than plain parsing
    var reg = /^([\[({#$@!])([^)\]}"':\*!]+)[\])}]?([:\*!]?)$/;

    var removeDirective = function removeDirective(node, directive) {
        var ds = this.__directives,
            i, l, d, j, jl, ns;

        if (!this.inflated && ds[directive]) {

            for (i = 0, l = ds[directive].length; i < l; i++) {
                d = ds[directive][i];
                if (d.original) {
                    MetaphorJs.dom.removeAttr(node, d.original);
                }
                if (ns = d.names) {
                    for (j = 0, jl = ns.length; j < jl; j++) {
                        MetaphorJs.dom.removeAttr(node, ns[j]);
                    }
                }
            }
        }
        //delete ds[directive];
    };

    var removeAttributes = function(node, what, param) {
        var names, i, l;
        if (what === "all") {
            removeAttributes(node, "directives");
            removeAttributes(node, "attributes");
            removeAttributes(node, "config");
        }
        else if (what === "directives") {
            for (i in this.__directives) {
                removeDirective.call(this, node, i);    
            }
            return;
        }
        else if (what === "directive") {
            removeDirective.call(this, node, param);
            return;
        }
        else if (what === "attributes") {
            names = this.__attributes;
        }
        else if (what === "attribute" && this.__attributes[param]) {
            names = [this.__attributes[param]];
        }
        else if (what === "config") {
            names = this.__config;
        }
        else if (what === "reference") {
            names = ["#" + param];
        }
        else if (what === "references") {
            names = [];
            for (i = 0, l = this.references.length; i < l; i++) {
                names.push("#" + this.references[i]);
            }
        }
        else if (what === "at") {
            names = ["@" + this.at];
        }

        if (names) {
            if (isArray(names)) {
                for (i = 0, l = names.length; i < l; i++) {
                    MetaphorJs.dom.removeAttr(node, names[i]);
                }
            }
            else {
                for (i in names) {
                    MetaphorJs.dom.removeAttr(node, names[i]);
                }
            }
        }
    };

    var execModes = {
        '*': MetaphorJs.lib.Config.MODE_DYNAMIC,
        ':': MetaphorJs.lib.Config.MODE_STATIC,
        '!': MetaphorJs.lib.Config.MODE_SINGLE,
        '': null
    };

    var dtypes = {
        '{': "dir",
        '(': "event",
        '[': "attr",
        '$': "cfg",
        '!': "renderer"
    };

    var getEmpty = function() {
        return {
            directives: {},
            attributes: {},
            config: {},
            rest: {},
            references: [],
            renderer: {},
            at: null,

            __plain: true,
            __directives: {},
            __attributes: {},
            __config: [],
            __remove: removeAttributes
        };
    };

    var inflate = function(set) {
        extend(set, getEmpty(), false, false);
        set.inflated = true;
        return set;
    };

    var ccName = function(name) {
        return name.indexOf('--') !== -1 ? name : toCamelCase(name);
    };

    return function dom_getAttrSet(node) {

        var set = getEmpty(),
            i, l, 
            name, value,
            indexName,
            match, parts,
            ds = set.directives, 
            __ds = set.__directives, 
            plain = true,
            mode,
            subname,
            prop, execMode,
            attrs = isArray(node) ? node : node.attributes;

        /**
         * mjs="<id>" - attribute always present, even after cloning 
         * data-mjscfg - copy of original config, id always present
         * node._mjscfg - equals data-mjscfg. After cloning, this property
         *  disappears and we must make a new copy of config
         *  from data-mjscfg version
         */

        if (node.nodeType && node.hasAttribute && node.hasAttribute("mjs")) {
            set = MetaphorJs.prebuilt.configs[node.getAttribute("mjs")];
            //MetaphorJs.dom.removeAttr(node, "mjs");
            return inflate(set);
        }

        for (i = 0, l = attrs.length; i < l; i++) {

            indexName = null;
            name = attrs[i].name;
            value = attrs[i].value;
            mode = null;
            execMode = null;
            match = name.match(reg);

            if (match) {
                plain = false;
                name = match[2];
                mode = match[1];
                execMode = execModes[match[3]];

                if (mode === '#') {
                    set.references.push(name);
                    continue;
                }
                if (mode === '@') {
                    set.at = name;
                    continue;
                }
                if (mode === "!") {
                    set.renderer[ccName(name)] = true;
                    continue;
                }
            }
            else {
                if (name.substr(0, 4) === "mjs-") {
                    name = name.substr(4);
                    mode = '{';
                    plain = false;
                }
                else {
                    set['rest'][name] = value;
                    continue;
                }
            }


            if (mode === '$') {
                if (value === "") {
                    value = true;
                }

                set['config'][ccName(name)] = {
                    expression: value,
                    mode: execMode
                };
                set.__config.push(attrs[i].name);
            }
            else if (mode === '(' || mode === '{') { 

                parts = name.split(".");
                name = parts.shift();
                subname = parts.length ? parts.join(".") : null;
                value === "" && (value = true);

                if (!ds[name]) {
                    ds[name] = {};
                    __ds[name] = {
                        type: dtypes[mode],
                        original: null,
                        names: []
                    };
                }

                if (!subname) {
                    __ds[name].original = attrs[i].name;
                }

                if (subname && subname[0] === '$') {
                    
                    prop = ccName(subname.substr(1));
                    ds[name][prop] = {
                        mode: execMode,
                        expression: value,
                        attr: attrs[i].name
                    };
                    __ds[name].names.push(attrs[i].name);
                }
                else {
                    if (subname) {
                        prop = "value." + parts.join(".");
                        // directive value keys are not camelcased
                        // do this inside directive if needed
                        // ('class' directive needs originals)
                        ds[name][prop] = {
                            mode: execMode,
                            expression: value,
                            attr: attrs[i].name
                        };
                        __ds[name].names.push(attrs[i].name);
                    }
                    else {
                        ds[name]['value'] = {
                            mode: execMode,
                            expression: value,
                            attr: attrs[i].name
                        };
                    }
                }
            }
            else if (mode === '[') {
                set.attributes[name] = value;
                set.__attributes[name] = attrs[i].name;
            }
        }

        for (name in ds) {
            if (name.indexOf('|') !== -1) {
                parts = name.split('|');
                indexName = parts[1];
            
                if (name !== indexName && indexName) {

                    if (ds[indexName]) {
                        if (!isArray(ds[indexName])) {
                            ds[indexName] = [ds[indexName]]
                            __ds[indexName] = [__ds[indexName]]
                        }
                    }
                    else {
                        ds[indexName] = [];
                        __ds[indexName] = [];
                    }

                    if (isArray(ds[indexName])) {
                        ds[indexName].push(ds[name])
                        __ds[indexName].push(__ds[name])
                        delete ds[name];
                        delete __ds[name];
                    }
                }
            }

            if (ds[name] && !isArray(ds[name])) {
                ds[name] = [ds[name]]
                __ds[name] = [__ds[name]]
            }
        }

        set.directives = ds;
        set.__directives = __ds;
        set.__plain = plain;
        

        return set;
    }

}());