
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.browser.isAndroid = function(){

    var android = null;

    return function browser_isAndroid() {

        if (android === null) {
            android = parseInt((/android (\d+)/i.exec(navigator.userAgent) || [])[1], 10) || false;
        }

        return android;
    };

}();