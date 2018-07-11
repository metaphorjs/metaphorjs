
var toCamelCase = require("../toCamelCase.js"),
    removeAttr = require("./removeAttr.js"),
    isArray = require("../isArray.js");

module.exports = (function() {


    // regular expression seems to be a few milliseconds faster
    // than plain parsing
    var reg = /^([\[({#$])([^)\]}"']+)[\])}]?$/;

    var removeDirective = function removeDirective(node, directive) {
        if (this.directive[directive] && 
            this.directive[directive].original) {
            removeAttr(node, this.directive[directive].original);
        }
        var i, l, sn = this.subnames[directive];
        if (sn) {
            for (i = 0, l = sn.length; i < l; i++) {
                removeAttr(node, sn[i]);
            }
            delete this.subnames[directive];
        }
    };

    /*var parseAttrName = function(name) {
        if (name.substr(0,4) === 'mjs-') {
            return [name.substr(4), '{'];
        }
        var first = name.substr(0, 1);
        if (first === '{' || first === '(' || 
            first === '[') {
                return [name.substring(1,name.length-1), first];
        }
        else if (first === '#') {
            return [name.substr(1), first];
        }
        return [null, null];
    };*/

    return function getAttrSet(node, lookupDirective) {

        var set = {
                directive: {},
                attribute: {},
                config: {},
                rest: {},
                reference: null,
                subnames: {},
                removeDirective: removeDirective
            },
            i, l, tagName,
            name, value,
            match, parts,
            coll, mode,
            subname,
            attrs = isArray(node) ? node : node.attributes;

        for (i = 0, l = attrs.length; i < l; i++) {

            name = attrs[i].name;
            value = attrs[i].value;
            mode = null;
            
            /*match = parseAttrName(name);

            if (match[0]) {
                name = match[0];
                mode = match[1];

                if (mode === '#') {
                    set.reference = name;
                    continue;
                }
            }
            else {
                set['rest'][name] = value;
                continue;
            }*/
            
            match = name.match(reg);

            if (match) {
                name = match[2];
                mode = match[1];

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

                set['config'][toCamelCase(name)] = value;

                if (!set['subnames'][tagName]) {
                    set['subnames'][tagName] = [];
                }

                set['subnames'][tagName].push(attrs[i].name);
            }
            else if (mode === '(' || mode === '{') { // lookupDirective(name)

                coll = set['directive'];
                subname = parts.length ? parts[0] : null;

                if (!coll[name]) {
                    coll[name] = {
                        name: name,
                        original: null,
                        config: {},
                        value: null,
                        values: null
                    };
                }

                if (!subname) {
                    coll[name].original = attrs[i].name;
                }

                if (subname && !set['subnames'][name]) {
                    set['subnames'][name] = [];
                }

                if (subname && subname.substr(0,1) === '$') {
                    if (value === "") {
                        value = true;
                    }
                    coll[name].config[toCamelCase(subname.substr(1))] = value;
                    set['subnames'][name].push(attrs[i].name);
                }
                else {
                    if (subname) {
                        if (!coll[name].values) {
                            coll[name].values = {};
                        }
                        // directive value keys are not camelcased
                        // do this inside directive if needed
                        // ('class' directive needs originals)
                        coll[name].values[parts.join(".")] = value;
                        set['subnames'][name].push(attrs[i].name);
                    }
                    else {
                        coll[name].value = value;
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