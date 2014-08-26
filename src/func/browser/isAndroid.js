//#require ../../vars/uaString.js

var isAndroid = function(){

    var android = parseInt((/android (\d+)/.exec(uaString) || [])[1], 10) || false;

    return function() {
        return android;
    };

}();