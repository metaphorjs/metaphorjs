#MetaphorJs

v.0.1 beta

An app framework similar to AngularJs. It doesn't have so many features but the point is
that it should be slimmer and faster than Angular (at least 3x times faster and less
than 100kb minified.)
There is no dependency injector and code parser: adding one dot before variable names in templates {{.var}}
removes the need in parser.

###Modules that can be used separately

[MetaphorJs.lib.Namespace](https://github.com/kuindji/metaphorjs-namespace)
The namespace system similar to one from ExtJs.

[MetaphorJs.lib.Class](https://github.com/kuindji/metaphorjs-class)
The class system is based on klass, although i’ve rewritten in quite heavily.

[MetaphorJs.ajax](https://github.com/kuindji/metaphorjs-ajax)
AJAX implementation similar to jQuery's.

[MetaphorJs.lib.Observable](https://github.com/kuindji/metaphorjs-observable)
Event system.

[MetaphorJs.lib.Promise](https://github.com/kuindji/metaphorjs-promise)
Promise/A+ compliant library / ES6 Promise polyfill.

[MetaphorJs.lib.Watchable](https://github.com/kuindji/metaphorjs-watchable)
This one watches for changes in objects and scopes.
