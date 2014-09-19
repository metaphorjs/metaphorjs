#MetaphorJs

v.0.3

An app framework similar to AngularJs (directives, scopes, dependency injection, etc)
and ExtJs (class system, event system, data model).

[Short documentation with code examples](http://kuindji.com/js/metaphorjs/docs/index.html)

Features:

* attribute and tag directives
* event system (not attached to DOM)
* promises
* recursive rendering
* i18n
* output and input filters
* namespace and class system
* form validation
* tooltips and dialogs
* animation (css/js/jquery)
* build system that integrates your project into MetaphorJs
* dependency injection
* global and encapsulated modes
* data store and active record
* ajax (with jsonp)
* cross browser pushState implementation
* > input, < scope or <-> two way data binding
* no dependencies
* cross browser
* < 50kb minified and gzipped (without modules < 30kb)


MetaphorJs and all of its modules do not depend on jQuery or any other dom helper.

// Some of the code in the library and its modules is taken from Angular and jQuery.

IE6+, Chrome, Safari, Firefox, Opera, Android (Chrome/Native), iOS Safari, Blackberry

###Modules that can be used separately (standalone/amd/node modules)

####Stable

[Namespace](https://github.com/kuindji/metaphorjs-namespace)
The namespace system similar to one from ExtJs.

[Class](https://github.com/kuindji/metaphorjs-class)
The class system is based on klass, although i’ve rewritten in quite heavily.

[Observable](https://github.com/kuindji/metaphorjs-observable)
Event system.

[Promise](https://github.com/kuindji/metaphorjs-promise)
Promise/A+ compliant library / ES6 Promise polyfill.

[Dialog](https://github.com/kuindji/metaphorjs-dialog)
Tooltip/Dialog library. (Reworked version of [jquery-dialog](https://github.com/kuindji/jquery-dialog) -- without
jquery dependency.

####Beta

[Watchable](https://github.com/kuindji/metaphorjs-watchable)
This one watches for changes in objects and scopes.

[ajax](https://github.com/kuindji/metaphorjs-ajax)
AJAX implementation similar to jQuery's.

[Validator](https://github.com/kuindji/metaphorjs-validator)
Form validation.

[history.pushState](https://github.com/kuindji/metaphorjs-history)
Stateless pushState wrapper/polyfill.

[MetaphorJs.model](https://github.com/kuindji/metaphorjs-model)
Model/Record/Store classes.

[select](https://github.com/kuindji/metaphorjs-select)
Selector engine (modified YASS)

[animate](https://github.com/kuindji/metaphorjs-animate)
Animation engine

[Input](https://github.com/kuindji/metaphorjs-input)
Input field class

####Build system

https://github.com/kuindji/metaphorjs-build

###Demo

A few Angular-like demos:

[Basics](http://kuindji.com/js/metaphorjs/demo/basics.html),
[Todo](http://kuindji.com/js/metaphorjs/demo/todo.html),
[Recursive rendering](http://kuindji.com/js/metaphorjs/demo/recursive.html),
[Animated tags](http://kuindji.com/js/metaphorjs/demo/tags.html),
[Flickr feed](http://kuindji.com/js/metaphorjs/demo/flickr.html),
[Firebase chat](http://kuindji.com/js/metaphorjs/demo/firebase.html)


[Dev test page](http://kuindji.com/js/metaphorjs/dev-test/index.html)