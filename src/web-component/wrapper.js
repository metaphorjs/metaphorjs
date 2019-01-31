
require("../app/Renderer.js");
require("../lib/Scope.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    async = require("metaphorjs-shared/src/func/async.js"),
    getAttrSet = require("../func/dom/getAttrSet.js");

module.exports = MetaphorJs.dom.webComponentWrapper = function(tagName, cls, parentCls, props) {

    parentCls = parentCls || HTMLElement;

    var webCls = class extends parentCls {

        constructor() {

            super();

            var scope = new MetaphorJs.lib.Scope,
                attrSet = getAttrSet(this),
                config = new MetaphorJs.lib.Config(
                    attrSet.config,
                    {
                        scope: scope
                    }
                );

            this.cmp = new cls({
                scope: scope,
                config: config,
                node: this,
                isWebComponent: true,
                keepCustomNode: true,
                autoRender: true,
                directives: this._simplifyDirectives(attrSet.directive)
            });

            var self = this;
            document.addEventListener("DOMContentLoaded", function(){
                self.cmp._prepareDeclaredItems(toArray(self.childNodes));
            });
        }

        _simplifyDirectives(ds) {
            var directives = {},
                name;

            for (name in ds) {
                directives[name] = ds.config;
            }

            return directives;
        }

        connectedCallback() {
            this.cmp.trigger("webc-connected");
        }

        disconnectedCallback() {
            this.cmp.trigger("webc-disconnected");
        }

        adoptedCallback() {
            this.cmp.trigger("webc-adopted");
        }

        attributeChangedCallback() {
            this.cmp.trigger("webc-attribute-changed");
        }

    }

    webCls.MetaphorJsComponent = cls;
    cls.WebComponent = webCls;
    window.customElements.define(tagName, webCls, props);

    return webCls;
};  