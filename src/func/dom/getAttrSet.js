
require("./__init.js");
require("./removeAttr.js");
require("../../lib/Config.js");

var toCamelCase = require("metaphorjs-shared/src/func/toCamelCase.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get node attributes classified by directive
 * @function MetaphorJs.dom.getAttrSet
 * @param {DomNode} node
 * @returns {object}
 */
module.exports = MetaphorJs.dom.getAttrSet = (function() {

    // regular expression seems to be a few milliseconds faster
    // than plain parsing
    var reg = /^([\[({#$])([^)\]}"':\*]+)[\])}]?([:\*]?)$/;

    var removeDirective = function removeDirective(node, directive) {
        if (this.directive[directive] && 
            this.directive[directive].original) {
            MetaphorJs.dom.removeAttr(node, this.directive[directive].original);
        }
        var i, l, sn = this.names[directive];
        if (sn) {
            for (i = 0, l = sn.length; i < l; i++) {
                MetaphorJs.dom.removeAttr(node, sn[i]);
            }
            delete this.names[directive];
        }
    };

    var execModes = {
        '': MetaphorJs.lib.Config.MODE_DYNAMIC,
        ':': MetaphorJs.lib.Config.MODE_STATIC,
        '*': MetaphorJs.lib.Config.MODE_SINGLE
    };

    return function dom_getAttrSet(node, tagMode) {

        var set = {
                directive: {},
                attribute: {},
                config: {},
                rest: {},
                reference: null,
                names: {},
                removeDirective: removeDirective
            },
            i, l, tagName,
            name, value,
            match, parts,
            coll, mode,
            subname,
            prop, execMode,
            attrs = isArray(node) ? node : node.attributes;

        for (i = 0, l = attrs.length; i < l; i++) {

            name = attrs[i].name;
            value = attrs[i].value;
            mode = null;
            execMode = null;
            match = name.match(reg);

            if (match) {
                name = match[2];
                mode = match[1];
                execMode = execModes[match[3]];

                if (mode === '#') {
                    set.reference = name;
                    continue;
                }
            }
            else {
                if (name.substr(0, 4) === "mjs-") {
                    name = name.substr(4);
                    mode = '{';
                }
                else {
                    set['rest'][name] = value;
                    continue;
                }
            }

            parts = name.split(".");
            name = parts.shift();


            if (mode === '$') {
                if (value === "") {
                    value = true;
                }

                tagName = node.tagName.toLowerCase();

                set['config'][toCamelCase(name)] = {
                    expression: value,
                    mode: execMode
                };

                if (!set['names'][tagName]) {
                    set['names'][tagName] = [];
                }

                set['names'][tagName].push(attrs[i].name);
            }
            else if (mode === '(' || mode === '{') { 

                coll = set['directive'];
                subname = parts.length ? parts[0] : null;

                if (!coll[name]) {
                    coll[name] = {
                        name: name,
                        original: null,
                        config: {}
                    };
                }

                if (!subname) {
                    coll[name].original = attrs[i].name;
                }

                if (subname && !set['names'][name]) {
                    set['names'][name] = [];
                }

                if (subname && subname[0] === '$') {
                    if (value === "") {
                        value = true;
                    }
                    prop = toCamelCase(subname.substr(1));
                    coll[name].config[prop] = {
                        mode: execMode,
                        expression: value
                    };
                    set['names'][name].push(attrs[i].name);
                }
                else {
                    if (subname) {
                        prop = "value." + parts.join(".");
                        // directive value keys are not camelcased
                        // do this inside directive if needed
                        // ('class' directive needs originals)
                        coll[name].config[prop] = {
                            mode: execMode,
                            expression: value
                        };
                        set['names'][name].push(attrs[i].name);
                    }
                    else {
                        coll[name].config['value'] = {
                            mode: execMode,
                            expression: value
                        };
                    }
                }
            }
            else if (mode === '[') {
                set['attribute'][name] = {
                    value: value,
                    original: attrs[i].name
                };
            }
        }

        return set;
    }

}());