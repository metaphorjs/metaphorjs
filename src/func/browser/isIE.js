require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.browser.isIE = function(){

    var msie;

    return function browser_isIE() {

        if (msie === null) {
            var ua = navigator.userAgent;
            msie = parseInt((/msie (\d+)/i.exec(ua) || [])[1], 10);
            if (isNaN(msie)) {
                msie = parseInt((/trident\/.*; rv:(\d+)/i.exec(ua) || [])[1], 10) || false;
            }
        }

        return msie;
    };
}();