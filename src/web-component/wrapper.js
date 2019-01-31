
require("../app/Renderer.js");
require("../lib/Scope.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    getAttrSet = require("../func/dom/getAttrSet.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js");

module.exports = MetaphorJs.dom.webComponentWrapper = function(tagName, cls, parentCls, props) {

    parentCls = parentCls || HTMLElement;

    var webCls = class extends parentCls {

        constructor() {
            super();

            this._domeReadyDelegate = this._onDocumentReady.bind(this);
        }

        static get observedAttributes() { 
            return cls.observedAttributes || []; 
        }

        _initComponent() {

            if (!this.cmp) {

                var scope = MetaphorJs.lib.Scope.$produce(this.getAttribute("scope")),
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

                window.document.addEventListener(
                    "DOMContentLoaded",
                    this._domeReadyDelegate
                );
            }
        }

        _simplifyDirectives(ds) {
            var directives = {},
                name;

            for (name in ds) {
                directives[name] = ds.config;
            }

            return directives;
        }

        _callCmpEvent(event, args) {
            if (this.cmp) {
                args.unshift(event);
                this.cmp.trigger.apply(this.cmp, args);
            }
        }

        _onDocumentReady() {
            if (this.cmp && this.cmp._prepareDeclaredItems) {
                // run this once again
                this.cmp._prepareDeclaredItems(this.childNodes);
            }
        }

        connectedCallback() {
            this._initComponent();
            this._callCmpEvent("webc-connected", toArray(arguments));
        }

        disconnectedCallback() {
            this._callCmpEvent("webc-disconnected", toArray(arguments));
        }

        adoptedCallback() {
            this._callCmpEvent("webc-adopted", toArray(arguments));
        }

        attributeChangedCallback() {
            this._callCmpEvent("webc-attribute-changed", toArray(arguments));
        }
    }

    webCls.MetaphorJsComponent = cls;
    cls.WebComponent = webCls;
    window.customElements.define(tagName, webCls, props);

    return webCls;
};  