

// from jQuery

(function(){

    var returnFalse = function() {
            return false;
        },

        returnTrue = function() {
            return true;
        },

        NormalizedEvent = function(src) {

            if (src instanceof NormalizedEvent) {
                return src;
            }

            // Allow instantiation without the 'new' keyword
            if (!(this instanceof NormalizedEvent)) {
                return new NormalizedEvent(src);
            }


            var self    = this;

            for (var i in src) {
                if (!self[i]) {
                    try {
                        self[i] = src[i];
                    }
                    catch (e){}
                }
            }


            // Event object
            self.originalEvent = src;
            self.type = src.type;

            if (!self.target && src.srcElement) {
                self.target = src.srcElement;
            }


            var eventDoc, doc, body,
                button = src.button;

            // Calculate pageX/Y if missing and clientX/Y available
            if (typeof self.pageX == "undefined" && src.clientX != null ) {
                eventDoc = self.target ? self.target.ownerDocument || document : document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                self.pageX = src.clientX +
                              ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                              ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                self.pageY = src.clientY +
                              ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
                              ( doc && doc.clientTop  || body && body.clientTop  || 0 );
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if ( !self.which && button !== undefined ) {
                self.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
            }

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            self.isDefaultPrevented = src.defaultPrevented ||
                                      src.defaultPrevented === undefined &&
                                          // Support: Android<4.0
                                      src.returnValue === false ?
                                      returnTrue :
                                      returnFalse;


            // Create a timestamp if incoming event doesn't have one
            self.timeStamp = src && src.timeStamp || (new Date).getTime();
        };

    // Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    NormalizedEvent.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,

        preventDefault: function() {
            var e = this.originalEvent;

            this.isDefaultPrevented = returnTrue;

            if ( e && e.preventDefault ) {
                e.preventDefault();
            }
        },
        stopPropagation: function() {
            var e = this.originalEvent;

            this.isPropagationStopped = returnTrue;

            if ( e && e.stopPropagation ) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            this.isImmediatePropagationStopped = returnTrue;

            if ( e && e.stopImmediatePropagation ) {
                e.stopImmediatePropagation();
            }

            this.stopPropagation();
        }
    };

    window.MetaphorJs || (window.MetaphorJs = {});

    MetaphorJs.normalizeEvent = function(originalEvent) {
        return new NormalizedEvent(originalEvent);
    };


}());
