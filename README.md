#MetaphorJs

v.0.1 beta

An app framework similar to AngularJs. It doesn't have so many features but the point is
that it should be slimmer and faster than Angular (at least 3x times faster and less
than 100kb minified.)

MetaphorJs and all of its modules do not depend on jQuery or any other dom helper.

// Some of the code in the library and its modules is taken from Angular and jQuery.

###Modules that can be used separately (in browser or/and as node modules)

####Stable

[MetaphorJs.lib.Namespace](https://github.com/kuindji/metaphorjs-namespace)
The namespace system similar to one from ExtJs.

[MetaphorJs.lib.Class](https://github.com/kuindji/metaphorjs-class)
The class system is based on klass, although i’ve rewritten in quite heavily.

[MetaphorJs.lib.Observable](https://github.com/kuindji/metaphorjs-observable)
Event system.

[MetaphorJs.lib.Promise](https://github.com/kuindji/metaphorjs-promise)
Promise/A+ compliant library / ES6 Promise polyfill.

####Beta

[MetaphorJs.lib.Watchable](https://github.com/kuindji/metaphorjs-watchable)
This one watches for changes in objects and scopes.

[MetaphorJs.ajax](https://github.com/kuindji/metaphorjs-ajax)
AJAX implementation similar to jQuery's.

[MetaphorJs.lib.Dialog](https://github.com/kuindji/metaphorjs-dialog)
Tooltip/Dialog library. (Reworked version of [jquery-dialog](https://github.com/kuindji/jquery-dialog) -- without
jquery dependency.

[MetaphorJs.lib.Validator](https://github.com/kuindji/metaphorjs-validator)
Form validation.

[history.pushState](https://github.com/kuindji/metaphorjs-history)
Stateless pushState wrapper/polyfill.

[MetaphorJs.data.Model](https://github.com/kuindji/metaphorjs-model)
Model/Record/Store classes.

###Demo

A few Angular-like demos:

[Basics](http://kuindji.com/js/metaphorjs/demo/basics.html), [Todo](http://kuindji.com/js/metaphorjs/demo/todo.html)