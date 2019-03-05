require("../../directive/attr/style.js");

var Directive = require("../../app/Directive.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/*
value is always an object in the end
DO NOT MIX style="{}" with style.prop="expression".
 */


Directive.registerAttribute("stylesheet", 1000, 
    MetaphorJs.app.Directive.attr.Style.$extend({

    $class: "MetaphorJs.app.Directive.attr.Stylesheet",
    id: "stylesheet",

    initDirective: function() {
        this.styleId = "stylesheet_" + nextUid();
        this.stylesheet = window.document.createElement("style");
        this.stylesheet.type = "text/css";
        this.stylesheet.id = "for_" + this.styleId;
        this.head = window.document.head || 
                        window.document.getElementsByTagName('head')[0] ||
                        window.document.body;

        this.head.appendChild(this.stylesheet);
        this.$super(arguments);
    },

    getSelector: function() {
        var node = this.node;
        if (!node.id) {
            node.setAttribute("id", this.styleId);
        }
        return '#' + node.id;
    },

    escapeProperty: function(val, k) {
        val = "" + val;
        if (k === "content") {
            return '"' + val + '"';
        }
        return val;
    },

    getCssText: function() {
        var props = this.getCurrentValue(),
            selector = this.getSelector(),
            state, prop, k,
            lines = [],
            css = {
                "": [selector + " {"]
            }

        if (props) {
            for (k in props) {
                prop = k.split(":", 2);
                state = prop[1] || "";
                prop = prop[0];
                if (!css[state]) {
                    css[state] = [selector + ":" + state + " {"];
                }
                css[state].push(prop + ": " + this.escapeProperty(props[k], prop) + ";");
            }
        }

        for (state in css) {
            css[state].push("}");
            lines.push(css[state].join("\n"));
        }

        return lines.join("\n");
    },

    onScopeChange: function() {
        var style = this.stylesheet,
            content = this.getCssText();

        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = content;
        } 
        else {
            while (style.firstChild) {
                style.removeChild(style.firstChild);
            }
            style.appendChild(window.document.createTextNode(content));
        }
    },

    onDestroy: function() {

        if (this.head) {
            this.head.removeChild(this.stylesheet);
        }

        this.$super();
    }
}));
