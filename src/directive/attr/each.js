


var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    ListRenderer = require("../../view/ListRenderer.js");


registerAttributeHandler("mjs-each", 100, ListRenderer);
