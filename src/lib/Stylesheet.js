
const extend = require("metaphorjs-shared/src/func/extend.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.lib.Stylesheet = function() {

    var Stylesheet = function(cfg) {

        var self = this;

        extend(self, cfg);

        !self.id && (self.id = nextUid());
        self.appended = false;

        if (self.content) {
            var content = self.content;
            self.content = null;
            self.setContent(content);
        }
    };

    extend(Stylesheet.prototype, {

        _initStylesheet: function() {
            var self = this;
            self.stylesheet = window.document.createElement("style");
            self.stylesheet.type = "text/css";
            self.stylesheet.id = "for_" + self.id;
            self.head = window.document.head || 
                            window.document.getElementsByTagName('head')[0] ||
                            window.document.body;        
        },

        setContent: function(cssContent) {
            var self = this;
            if (cssContent != self.content) {
                self.content = cssContent;
                if (!self.stylesheet) {
                    self._initStylesheet();
                }

                var style = self.stylesheet;

                if (style.styleSheet) {
                    // This is required for IE8 and below.
                    style.styleSheet.cssText = self.content;
                } 
                else {
                    while (style.firstChild) {
                        style.removeChild(style.firstChild);
                    }
                    style.appendChild(window.document.createTextNode(self.content));
                }

                if (!self.appended) {
                    self.append();
                }
            } 
        },

        append: function() {
            var self = this;
            if (!self.stylesheet) {
                self._initStylesheet();
            }
            if (!self.appended) {
                self.head.appendChild(self.stylesheet);
                self.appended = true;
            }
        },
        
        remove: function() {
            var self = this;
            if (self.appended) {
                self.head.removeChild(self.stylesheet);
                self.appended = false;
            }
        },

        $destroy: function() {
            if (this.appended) {
                this.remove();
            }
        }

    });

    return Stylesheet;

}();