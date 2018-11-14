
require("../class/StoreRenderer.js");
require("../class/Store.js");
require("metaphorjs/src/directive/attr/each.js");

var Directive = require("metaphorjs/src/class/Directive.js");

Directive.getDirective("attr", "each")
    .registerType(MetaphorJs.model.Store, MetaphorJs.app.StoreRenderer);

