

// from jQuery

(function(){

    var returnFalse = function() {
        return false;
    };

    var returnTrue = function() {
        return true;
    };

    var NormalizedEvent = function(src) {
        // Allow instantiation without the 'new' keyword
        if (!(this instanceof NormalizedEvent)) {
            return new NormalizedEvent(src);
        }

        var self    = this;

        for (var i in src) {
            if (!src.hasOwnProperty(i) && !self[i]) {
                self[i] = src[i];
            }
        }

        // Event object
        self.originalEvent = src;
        self.type = src.type;

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

    MetaphorJs.normalizeEvent = function(originalEvent) {
        return new NormalizedEvent(originalEvent);
    };


}());
