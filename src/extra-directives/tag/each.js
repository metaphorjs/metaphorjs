
var Directive = require("../../class/Directive.js"),
    ListRenderer = require("../../class/ListRenderer.js");

Directive.registerTag("each", ListRenderer);
