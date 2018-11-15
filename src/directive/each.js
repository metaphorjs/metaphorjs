
require("../app/StoreRenderer.js");
require("metaphorjs-model/src/model/Store.js");
require("./attr/each.js");

var Directive = require("metaphorjs/src/app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

Directive.getDirective("attr", "each")
    .registerType(MetaphorJs.model.Store, MetaphorJs.app.StoreRenderer);

