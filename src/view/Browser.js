
(function(){

    /**
     * IE 11 changed the format of the UserAgent string.
     * See http://msdn.microsoft.com/en-us/library/ms537503.aspx
     */
    var ua      = navigator.userAgent.toLowerCase(),
        msie    = parseInt((/msie (\d+)/.exec(ua) || [])[1], 10),
        android = parseInt((/android (\d+)/.exec(ua) || [])[1], 10),
        eventSupport    = {};

    if (isNaN(msie)) {
        msie    = parseInt((/trident\/.*; rv:(\d+)/.exec(ua) || [])[1], 10);
    }


    MetaphorJs.browser  = {

        android: android,

        hasEvent: function(event) {
            // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
            // it. In particular the event is not fired when backspace or delete key are pressed or
            // when cut operation is performed.
            if (event == 'input' && msie == 9) return false;

            if (eventSupport[event] === undefined) {
                var divElm = document.createElement('div');
                eventSupport[event] = 'on' + event in divElm;
            }

            return eventSupport[event];
        }
    };

}());