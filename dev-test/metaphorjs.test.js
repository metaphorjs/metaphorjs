(function(){
/* BUNDLE START 004 */
"use strict";

var MetaphorJsPrebuilt = {"templates":{"a*b.html":"<p>a * b = {{ this.$root.a * this.$root.b }}</p>","a+b.html":"<p>a + b = {{ this.$root.a + this.$root.b }}</p>","app1.html":"<h1>MetaphorJs Feature test</h1><div class=\"cases\"><div class=\"case\"><h4>Bindings (read only)</h4><label class=\"case-label\">Inline</label><div id=\"inline-binding\" class=\"test\">{{this.inline}}</div><label class=\"case-label\">mjs-bind</label><div id=\"binding\" {bind}=\"this.text\" class=\"test\"></div><label class=\"case-label\">mjs-bind-html</label><div id=\"html-binding\" {bind-html}=\"this.html\" class=\"test\"></div><label class=\"case-label\">Plain attribute (href)</label><p class=\"test\"><a id=\"attr-binding-href\" [href]=\"http://{{this.inline}}.com\">{{this.text}}</a></p></div><div class=\"case\"><h4>Bindings (read only)</h4><label class=\"case-label\">Input field (value)</label><p class=\"test\"><input id=\"binding-input-value\" type=\"text\" [value]=\"this.a\"></p><label class=\"case-label\">Input field (mjs-bind) (locked)</label><p class=\"test\"><input id=\"binding-input-bind\" type=\"text\" {bind}=\"this.a\" {bind.$locked}></p><label class=\"case-label\">Checkbox (mjs-bind)</label><p class=\"test\"><input id=\"binding-checkbox\" type=\"checkbox\" {bind}=\"this.bool\"></p><label class=\"case-label\">Radio (mjs-bind) (locked)</label><p class=\"test\"><input id=\"radio-bind-1\" checked=\"checked\" type=\"radio\" value=\"inline1\" name=\"radio-bind\" {bind}=\"this.inline\" {bind.$locked}> <input id=\"radio-bind-2\" type=\"radio\" value=\"inline2\" name=\"radio-bind\"> <input id=\"radio-bind-3\" type=\"radio\" value=\"inline3\" name=\"radio-bind\"></p></div><div class=\"case\"><h4>Bindings (read only)</h4><label class=\"case-label\">Select (mjs-bind)</label><p class=\"test\"><select id=\"select-bind\" {bind}=\"this.a\"><option value=\"1\">1</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option></select></p><label class=\"case-label\">Textarea (mjs-bind)</label><p class=\"test\"><textarea id=\"textarea-bind-attr\" {bind}=\"this.inline\"></textarea></p><label class=\"case-label\">Textarea (inline)</label><p class=\"test\"><textarea id=\"textarea-bind-inline\">{{this.inline}}</textarea></p></div><div class=\"case\"><h4>Muplitple inline binding</h4><div id=\"multiple-inline-binding\" class=\"test\">{{this.inline}}<b>{{this.text}}</b>{{this.html}}</div></div><div class=\"case\"><h4>Filters</h4><label class=\"case-label\">Uppercase (mjs-bind)</label><div id=\"filter-uppercase-binding\" class=\"test\" {bind}=\"this.text | uppercase\"></div><label class=\"case-label\">Uppercase (inline)</label><div id=\"filter-uppercase-inline\" class=\"test\">{{this.text | uppercase}}</div><label class=\"case-label\">Lowercase (inline)</label><div id=\"filter-lowercase-inline\" class=\"test\">{{this.text | lowercase}}</div><label class=\"case-label\">Limit to (string)</label><div id=\"filter-limit-string\" class=\"test\">{{this.text | limitTo:this.a}}</div></div><div class=\"case\"><h4>Filters</h4><label class=\"case-label\">Linkify</label><p id=\"filter-linkify\" class=\"test\" {bind-html}=\"this.linkified | linkify\"></p></div><div class=\"case\"><h4>Expressions</h4><label class=\"case-label\">.a + .b</label><div id=\"expr-a-plus-b\" class=\"test\">{{this.a + this.b}}</div><label class=\"case-label\">.bool ? \"true\" : \"false\"</label><div id=\"expr-bool\" class=\"test\">{{this.bool ? \"true\": \"false\"}}</div></div><div class=\"case\"><h4>Model</h4><label class=\"case-label\">Input (number) (.a)</label><p class=\"test\"><input {model}=\"this.a\" type=\"number\" data-type=\"number\" id=\"model-input-a\"></p><label class=\"case-label\">Checkbox (.bool)</label><p class=\"test\"><input id=\"model-checkbox-bool\" type=\"checkbox\" {model}=\"this.bool\"></p><label class=\"case-label\">Radio (.inline)</label><p class=\"test\"><input id=\"model-radio-1\" checked=\"checked\" type=\"radio\" name=\"r\" value=\"inline1\" {model}=\"this.inline\">1<label><input id=\"model-radio-2\" type=\"radio\" name=\"r\" value=\"inline2\">2</label><input id=\"model-radio-3\" type=\"radio\" name=\"r\" value=\"inline3\">3</p><label class=\"case-label\">Select (.a)</label><p class=\"test\"><select id=\"model-select-a\" {model}=\"this.a\" data-type=\"number\"><option value=\"1\">1</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option></select></p></div><div class=\"case\"><h4>Model</h4><label class=\"case-label\">Textarea (.text)</label><p class=\"test\"><textarea id=\"model-textarea\" {model}=\"this.text\"></textarea></p><label class=\"case-label\">Input (string .text)</label><p class=\"test\"><input type=\"text\" id=\"model-input\" {model}=\"this.text\"></p></div><div class=\"case\"><h4>mjs-class</h4><label class=\"case-label\">Plain attribute</label><div class=\"test\"><p id=\"class-inline\" [class]=\"this.inline\">---</p></div><label class=\"case-label\">mjs-class (string)</label><div class=\"test\"><p id=\"class-string\" {class}=\"this.inline\">---</p></div><label class=\"case-label\">mjs-class ({bool: .bool, inline1: .a == 0})</label><div class=\"test\"><p id=\"class-object\" {class}=\"{bool: this.bool, inline1: this.a == 0}\">---</p></div><div class=\"test\"><p id=\"class-object\" {class.bool}=\"this.bool\" {class.inline1}=\"this.a == 0\">---</p></div></div><div class=\"case\"><h4>mjs-if, mjs-show, mjs-hide</h4><div id=\"if-bool\" {if}=\"this.bool\" class=\"test\" {if.$animate}>this should appear if .bool = true</div><div id=\"show-bool\" {show}=\"this.bool\" class=\"test\" {show.$animate}>this should show if .bool = true</div><div id=\"hide-bool\" {hide}=\"this.bool\" class=\"test\" {hide.$animate}>this should hide if .bool = true</div></div><div class=\"case\"><h4>mjs-include</h4><label class=\"case-label\">immediate</label><div {include}=\"test-template.html\" {include.$animate}><p>transcluded text</p></div><label class=\"case-label\">immediate (via tag)</label><mjs-include $name=\"test-template.html\"><p>transcluded text</p></mjs-include><label class=\"case-label\">ajax</label><div {include}=\"template.html\"><p>Transcluded text</p></div></div><div class=\"case\"><h4>mjs-validate</h4><form name=\"myForm\" {validate} {class.error}=\"this.myForm.$invalid\" {class.$animate}><div><input name=\"field1\" data-validate-required {class}=\"{error: this.myForm.field1.$invalid}\"></div><div {class}=\"{error: this.myForm.radio1.$invalid}\"><label><input type=\"radio\" name=\"radio1\" value=\"1\" data-validate-required> -- 1</label><label><input type=\"radio\" name=\"radio1\" value=\"2\"> -- 2</label><label><input type=\"radio\" name=\"radio1\" value=\"3\"> -- 3</label></div><div><input type=\"submit\" value=\"Submit\"> <input type=\"reset\" value=\"Reset\"></div></form></div><div class=\"case\" {init}=\"this.dynamicList = []\"><h4>dynamic list</h4><label><input id=\"radio-sep-1\" type=\"radio\" name=\"sep\" value=\"/\\n|,/\" {model}=\"this.sep\"> /\\n|,/</label><label><input type=\"radio\" name=\"sep\" value=\"/\\n/\"> /\\n/</label><label><input type=\"radio\" name=\"sep\" value=\",\"> ,</label><br><br><textarea {model}=\"split:this.sep >> this.dynamicList\" {model.$binding}=\"input\"></textarea><ul><li {each}=\"item in this.dynamicList\" {bind}=\"this.item\" {bind.$recursive}></li></ul></div><div class=\"case\"><h4>mjs-options</h4><label class=\"case-label\">Generated from .alist</label><p class=\"test\"><select {bind}=\"this.a\" {options}=\"this.alist\"><option>not selected</option></select></p><label class=\"case-label\">Generated from .dynamicList</label><p class=\"test\"><select {options}=\"{\n                        name: this.item,\n                        value: this.$index,\n                        group: this.$index - (this.$index % 2),\n                        disabledGroup: this.$index == 0,\n                        disabled: this.$index == 4\n                        } in this.dynamicList\"><option>default value</option></select></p></div><div class=\"case\" {cmp}=\"Test.TplComponent\" id=\"tplComponentTest\"><h2>{{ this.title }}</h2>mjs-include change template:<br><a href=\"#\" (click)=\"this.tpl = 'a+b.html'\">a + b</a>|<a href=\"#\" (click)=\"this.tpl = 'a*b.html'\">a * b</a><div {include}*=\"this.tpl\" {include.$animate} id=\"tplComponetInc\"></div></div><div class=\"case\" {cmp}=\"Test.StringTemplate\"></div><div class=\"case\" {cmp}=\"Test.ChangeTemplate\">mjs-cmp change template:<br><a href=\"#\" (click)=\"this.tpl = this.tpl1\">tpl1</a>|<a href=\"#\" (click)=\"this.tpl = this.tpl2\">tpl2</a></div><div class=\"case\"><h4>Router</h4><div {router}=\"Test.MyView\" {router.$animate}></div>pushUrl:<a href=\"/1\">/1</a>|<a href=\"/2\">/2</a>|<a href=\"/3\">/3</a>|<a href=\"http://www.kuindji.com\">outside</a><br><br></div><div class=\"case\" {ignore}>This element is ignored by renderer: {{ this.$root.a }}</div><div class=\"case\" {view}=\"this.viewCmp\" {view.$default-cmp}:=\"Test.ViewComponent1\"><p>change cmp:<a href=\"#\" (click)=\"this.$parent.viewCmp = 'Test.ViewComponent1'\">Cmp1</a>|<a href=\"#\" (click)=\"this.$parent.viewCmp = 'Test.ViewComponent2'\">Cmp2</a></p></div></div><div class=\"cases\"><div class=\"case double\" {init}=\"this.newItem = '';\n                            this.listFilter = '';\n                            this.sortBy = 'asc'\"><h4>mjs-each (attr)</h4><input {model}=\"this.newItem\" (key.enter)=\"if (this.newItem) {\n                                        this.list.push({bool: false, txt: this.newItem}); \n                                        this.newItem = '';\n                                    }\"> <input type=\"button\" {disabled}=\"!this.newItem\" (click)=\"this.list.push({bool: false, txt: this.newItem}); this.newItem = '';\" value=\"Add item\"><ul {show}=\"this.bool\" {show.$animate}><li {each}=\"item in this.list | filter:this.listFilter | sortBy:'txt':this.sortBy\" {each.$animate} {each.$animate-move}><label {class}=\"{cls3: this.item.bool}\"><input type=\"checkbox\" {model}=\"this.item.bool\"> {{ this.$index }} - {{ this.item.txt }} - {{ this.$first ? \"first\" : \"\" }} - {{ this.$last ? \"last\" : \"\" }} - {{ this.$even ? \"even\" : \"\" }} - {{ this.$odd ? \"odd\" : \"\" }}</label><a href=\"#\" (click)=\"this.$parent.list.splice(this.$getRawIndex(this.$trackId),1);\">x</a></li></ul><input {model}=\"this.listFilter\" placeholder=\"Search\"><a href=\"#\" (click)=\"this.sortBy='asc'\">asc</a><a href=\"#\" (click)=\"this.sortBy='desc'\">desc</a></div><div class=\"case double\"><h4>mjs-each (tag)</h4><mjs-each value=\"item in this.list | filter:this.listFilter | sortBy:'txt':this.sortBy\"><div><label {class}=\"{cls3: this.item.bool}\"><input type=\"checkbox\" {model}=\"this.item.bool\"> {{ this.$index }} - {{ this.item.txt }} - {{ this.$first ? \"first\" : \"\" }} - {{ this.$last ? \"last\" : \"\" }} - {{ this.$even ? \"even\" : \"\" }} - {{ this.$odd ? \"odd\" : \"\" }}</label><a href=\"#\" (click)=\"this.$parent.list.splice(this.$getRawIndex(this.$trackId),1);\">x</a></div></mjs-each></div><div class=\"case\" id=\"newComponent\">Dynamically created component on existing element will go here</div><div class=\"case\" id=\"renderToComponent\">Dynamically created component with renderTo will go here</div><div class=\"case double\" {cmp}=\"Test.MyComponent\" {cmp.$as}=\"ctrl\" {init}=\"this.selectBinding = 'scope'\"><p ##para>Component's transcluded text + {{ this.$root.a}}</p><a href=\"#\" (click)=\"this.ctrl.reverse()\">reverse</a>|<a href=\"#\" (click)=\"this.ctrl.createNew()\">create new component on existing element</a>|<a href=\"#\" (click)=\"this.ctrl.createRender()\">create new component and render to</a>|<a href=\"#\" (click)=\"this.ctrl.createDialog()\">create new dialog</a><br><br><button (click)=\"this.store.load()\">Load store</button><button (click)=\"this.store.clear()\">Clear store</button><br><br>this.selectBinding:<select {model}=\"this.selectBinding\"><option value=\"input\">Input</option><option value=\"scope\">Scope</option><option value=\"both\">Both</option></select><br><br>this.a:<select {options}=\"{\n                        name: this.item.data.name, \n                        value: this.item.data.id\n                    } in this.store\" {model}=\"this.$parent.a\" {model.$binding}*=\"this.selectBinding\"><option>Nothing selected</option></select><ul><li {each}=\"item in this.store\" {each.$animate}>{{ this.item.name }}</li></ul></div><div class=\"case double\" id=\"myComponent1\" {cmp}=\"Test.MyComponent\"><p>This is another instance with deferred value: {{ this.deferred }}</p></div><div class=\"case double\"><tagc $as:=\"ctrl\" $test:=\"Value from config\"></tagc></div></div>","app2.html":"<div class=\"case\"><h4>app's resolved value</h4><p class=\"test\">{{this.resolved}}</p></div><div class=\"case\"><h4>recursive rendering</h4><p><a href=\"#\" (click)=\"this.changeLevel2()\">Change level 2</a></p><p class=\"test\">This is level 1:<span {bind}=\"this.level1\" {bind.$recursive}></span></p></div><div class=\"case\"><h4>lang substitution</h4><label class=\"case-label\">using normal expression with filter: 'key' | l</label><p class=\"test\">{{ 'key' | l }}</p><p class=\"test\" {bind}=\"'subkey1' | l\" {bind.$recursive}></p></div><div class=\"case\"><h4>pluralization</h4><p><a href=\"#\" (click)=\"this.increaseB()\">Increase B</a></p><label class=\"case-label\">using normal expression:</label><p class=\"test\">{{this.b}} {{ 'plr' | p:this.b}}</p><p><input type=\"number\" data-type=\"number\" {model}=\"this.people\"></p><p class=\"test\" {bind}=\"'viewing' | p:this.people\" {bind.$recursive}></p></div>","cmp1-template.html":"<h2>{{this.title}}</h2><div {transclude}></div>","dirs.html":"<!--{includes: true}--><div class=\"form_select\" (click)=\"this.field.onSelfClick(this.$event)\" {class.loading}=\"this.loading\" {class.disabled}=\"this.field.disabled\" {class.search}=\"this.field.searchable\" {class.multiple}=\"this.field.multiple\" {class.black}=\"this.field.black\"><input type=\"hidden\" #el_hidden_field [name]=\"this.field.hiddenInputName\" [value]=\"this.field.$$selection | join:','\"><i #el_icon_down (click)=\"this.field.onDropdownIconClick(this.$event)\"><!-- include icons/down.html --></i><a class=\"form_select__label\" {each}=\"item in this.field.getMultiSelection()\" style=\"display: inline-block !important;\">{{ this.$parent.field.getItemName(this.item) }}<i class=\"delete icon\" (click)=\"this.$parent.field.onItemDeleteClick(this.item, this.$event)\"></i></a><input type=\"text\" #el_search class=\"search\" [disabled]=\"this.field.disabled\" {show}=\"this.field.searchable\" {show.$display}=\"inline-block\" (focus)=\"this.field.onSearchFocus(this.$event)\" (blur)=\"this.field.onSearchBlur(this.$event)\" (key.backspace)=\"this.field.onSearchBackspace(this.$event)\" {model}=\"this.searchQuery\"><span class=\"sizer\" #el_sizer {if}=\"this.field.multiple && this.field.searchable\" {bind}=\"this.searchQuery\"></span><div class=\"default text\" #el_default_text (click)=\"this.field.onValueTextClick(this.$event)\" {show}=\"!this.searchQuery && !this.field.hasSelection() &&\n                    !!this.field.emptyText\" {show.$display}=\"inline-block\" {show.$save-state}=\"this.emptyShown\" {bind}=\"this.field.emptyText\"></div><div class=\"text\" #el_text (click)=\"this.field.onValueTextClick(this.$event)\" {class.default}=\"this.focused && this.searchQuery == ''\" {show}=\"!this.searchQuery && !this.field.multiple && this.field.hasSelection()\" {show.$save-state}=\"this.selectedShown\" {show.$display}=\"inline-block\" {bind}=\"this.field.getSelectedName()\"></div><!-- replaces two previous text blocks with invisible placeholder --><div style=\"display: none\" class=\"default text\" {show}=\"!this.emptyShown && !this.selectedShown && !this.field.searchable\" {show.$display}=\"inline-block\">&nbsp;</div><select class=\"form-select_hidden-select\" #el_hidden_select (click)=\"this.field.onHiddenSelectClick(this.$event)\" (change)=\"this.field.onHiddenSelectChange(this.$event)\" {show}=\"this.field.useHiddenSelect\" {show.$display}=\"block\" {options}=\"this.field._getSelectOptions()\"></select><div class=\"form-select-menu\" #el_menu {class.black}=\"this.field.black\"><div class=\"items\" #el_menu_items><div class=\"disabled item\" #el_menu_disabled {if}=\"this.field.showNotFound && this.field.store.isEmpty()\" (click)=\"this.field.onNotFoundClick(null, this.$event)\" {bind-html}=\"this.field.notFoundText\"></div><div class=\"empty item\" #el_menu_empty style=\"color: #999;\" {if}=\"this.field.showEmptyItem && !this.field.store.isEmpty()\" (click)=\"this.field.onItemClick(null, this.$event)\" {bind-html}=\"this.field.emptyItemText\"></div><div class=\"item\" {each}=\"item in this.field.store\" (click)=\"this.$parent.field.onItemClick(this.item, this.$event)\" {bind}=\"this.$parent.field.getItemName(this.item)\"></div></div><div class=\"pagination_container\" {cmp}=\"Pagination\" {cmp.$autoscroll}=\"false\" {show}=\"this.pagination.hasPages()\" (click)=\"this.$parent.field.onPaginationClick(this.$event)\"></div></div></div>","tagc.html":"<div class=\"component\"><p>This is a tag component.</p><p>{{ this.ctrl.config.get('test') }}</p></div>","test-template.html":"<p>{{this.$root.text}}</p><div {transclude}></div>"},"templateOptions":{"dirs.html":{"includes":true}},"expressionOpts":{}}
MetaphorJsPrebuilt['funcs'] = {

};


var MetaphorJs = {
    plugin: {},
    mixin: {},
    lib: {},
    dom: {},
    regexp: {},
    browser: {},
    app: {},
    prebuilt: typeof MetaphorJsPrebuilt !== "undefined" ? MetaphorJsPrebuilt : null
};

var __init = (function(){


MetaphorJs.app.view = MetaphorJs.app.view || {};
MetaphorJs.app.component = MetaphorJs.app.component || {};
}());

var undf = undefined;



/**
 * Transform anything into array
 * @function toArray
 * @param {*} list
 * @returns {array}
 */
function toArray(list) {
    if (list && !list.length != undf && list !== ""+list) {
        for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
        return a;
    }
    else if (list) {
        return [list];
    }
    else {
        return [];
    }
};

/**
 * Convert anything to string
 * @function toString
 * @param {*} value
 * @returns {string}
 */
var toString = Object.prototype.toString;




var _varType = function(){

    var types = {
        '[object String]': 0,
        '[object Number]': 1,
        '[object Boolean]': 2,
        '[object Object]': 3,
        '[object Function]': 4,
        '[object Array]': 5,
        '[object RegExp]': 9,
        '[object Date]': 10
    };


    /*
     * 'string': 0,
     * 'number': 1,
     * 'boolean': 2,
     * 'object': 3,
     * 'function': 4,
     * 'array': 5,
     * 'null': 6,
     * 'undefined': 7,
     * 'NaN': 8,
     * 'regexp': 9,
     * 'date': 10,
     * unknown: -1
     * @param {*} value
     * @returns {number}
     */



    return function _varType(val) {

        if (!val) {
            if (val === null) {
                return 6;
            }
            if (val === undf) {
                return 7;
            }
        }

        var num = types[toString.call(val)];

        if (num === undf) {
            return -1;
        }

        if (num === 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();



/**
 * Check if given value is plain object
 * @function isPlainObject
 * @param {*} value 
 * @returns {boolean}
 */
function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           _varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;
};

/**
 * Check if given value is a boolean value
 * @function isBool
 * @param {*} value 
 * @returns {boolean}
 */
function isBool(value) {
    return value === true || value === false;
};


/**
 * Copy properties from one object to another
 * @function extend
 * @param {Object} dst
 * @param {Object} src
 * @param {Object} src2 ... srcN
 * @param {boolean} override {
 *  Override already existing keys 
 *  @default false
 * }
 * @param {boolean} deep {
 *  Do not copy objects by link, deep copy by value
 *  @default false
 * }
 * @returns {object}
 */
function extend() {

    var override    = false,
        deep        = false,
        args        = toArray(arguments),
        dst         = args.shift(),
        src,
        k,
        value;

    if (isBool(args[args.length - 1])) {
        override    = args.pop();
    }
    if (isBool(args[args.length - 1])) {
        deep        = override;
        override    = args.pop();
    }

    while (args.length) {
        
        // src can be empty
        src = args.shift();
        
        if (!src) {
            continue;
        }

        for (k in src) {

            if (src.hasOwnProperty(k) && (value = src[k]) !== undf) {

                if (deep) {
                    if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                        extend(dst[k], value, override, deep);
                    }
                    else {
                        if (override === true || dst[k] == undf) { // == checks for null and undefined
                            if (isPlainObject(value)) {
                                dst[k] = {};
                                extend(dst[k], value, override, true);
                            }
                            else {
                                dst[k] = value;
                            }
                        }
                    }
                }
                else {
                    if (override === true || dst[k] == undf) {
                        dst[k] = value;
                    }
                }
            }
        }
    }

    return dst;
};

var nextUid = (function(){

var uid = ['0', '0', '0'];

// from AngularJs
/**
 * Generates new alphanumeric id with starting 
 * length of 3 characters. IDs are consequential.
 * @function nextUid
 * @returns {string}
 */
function nextUid() {
    var index = uid.length;
    var digit;

    while(index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit == 57 /*'9'*/) {
            uid[index] = 'A';
            return uid.join('');
        }
        if (digit == 90  /*'Z'*/) {
            uid[index] = '0';
        } else {
            uid[index] = String.fromCharCode(digit + 1);
            return uid.join('');
        }
    }
    uid.unshift('0');
    return uid.join('');
};

return nextUid;
}());
/**
 * Execute <code>fn</code> asynchronously
 * @function async
 * @param {Function} fn Function to execute
 * @param {Object} context Function's context (this)
 * @param {[]} args Arguments to pass to fn
 * @param {number} timeout Execute after timeout (number of ms)
 */
function async(fn, context, args, timeout) {
    return setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};

var strUndef = "undefined";



/**
 * Log thrown error to console (in debug mode) and 
 * call all error listeners
 * @function error
 * @param {Error} e 
 */
var error = (function(){

    var listeners = [];

    var error = function error(e) {

        var i, l;

        for (i = 0, l = listeners.length; i < l; i++) {
            listeners[i][0].call(listeners[i][1], e)
        }

        /*DEBUG-START*/
        if (typeof console != strUndef && console.error) {
            console.error(e);
        }
        /*DEBUG-END*/
    };

    /**
     * Subscribe to all errors
     * @method on
     * @param {function} fn 
     * @param {object} context 
     */
    error.on = function(fn, context) {
        error.un(fn, context);
        listeners.push([fn, context]);
    };

    /**
     * Unsubscribe from all errors
     * @method un
     * @param {function} fn 
     * @param {object} context 
     */
    error.un = function(fn, context) {
        var i, l;
        for (i = 0, l = listeners.length; i < l; i++) {
            if (listeners[i][0] === fn && listeners[i][1] === context) {
                listeners.splice(i, 1);
                break;
            }
        }
    };

    return error;
}());



/**
 * Check if given value is a function
 * @function isFunction
 * @param {*} value 
 * @returns {boolean}
 */
function isFunction(value) {
    return typeof value == 'function';
};




var lib_ObservableEvent = MetaphorJs.lib.ObservableEvent = (function(){

/**
 * This class is private - you can't create an event other than via Observable.
 * See {@link class:Observable} reference.
 * @class MetaphorJs.lib.ObservableEvent
 * @private
 */
var ObservableEvent = function(name, options) {

    var self    = this;

    self.name           = name;
    self.listeners      = [];
    self.map            = {};
    self.hash           = nextUid();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0; // listener id
    self.fid            = 0; // function id (same function can be different listeners)

    if (typeof options === "object" && options !== null) {
        extend(self, options, true, false);
    }
    else {
        self.returnResult = options;
    }
};


extend(ObservableEvent.prototype, {

    name: null,
    listeners: null,
    map: null,
    hash: null,
    uni: null,
    suspended: false,
    lid: null,
    fid: null,
    returnResult: null,
    autoTrigger: null,
    lastTrigger: null,
    triggerFilter: null,
    filterContext: null,
    expectPromises: false,
    resolvePromises: false,

    /**
     * Get event name
     * @method
     * @returns {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @method
     */
    $destroy: function() {
        var self        = this,
            k;

        for (k in self) {
            self[k] = null;
        }
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See {@link class:Observable.on}
     */
    on: function(fn, context, options) {

        if (!fn) {
            return null;
        }

        context     = context || null;
        options     = options || {};

        var self    = this,
            uni     = self.uni,
            lid     = ++self.lid,
            fid     = fn[uni] || ++self.fid,
            ctxUni  = uni + "_" + fid,
            first   = options.first || false;

        if (fn[uni] && (!context || context[ctxUni]) && !options.allowDupes) {
            return null;
        }
        if (!fn[uni]) {
            fn[uni]  = fid;
        }
        if (context && !context[ctxUni]) {
            context[ctxUni] = true;
        }

        var e = {
            fn:         fn,
            context:    context,
            id:         lid,
            fid:        fid,
            async:      false,
            called:     0, // how many times the function was triggered
            limit:      0, // how many times the function is allowed to trigger
            start:      1, // from which attempt it is allowed to trigger the function
            count:      0, // how many attempts to trigger the function was made
            append:     null, // append parameters
            prepend:    null // prepend parameters
        };

        extend(e, options, true, false);

        if (e.async === true) {
            e.async = 1;
        }
        if (options.once) {
            e.limit = 1;
        }

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[lid] = e;

        if (self.autoTrigger && self.lastTrigger && !self.suspended) {
            var prevFilter = self.triggerFilter;
            self.triggerFilter = function(l){
                if (l.id === lid) {
                    return prevFilter ? prevFilter(l) !== false : true;
                }
                return false;
            };
            self.trigger.apply(self, self.lastTrigger);
            self.triggerFilter = prevFilter;
        }

        return lid;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See {@link class:Observable.on}
     */
    once: function(fn, context, options) {

        options = options || {};
        options.limit = 1;

        return this.on(fn, context, options);
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Callback context
     */
    un: function(fn, context) {

        var self        = this,
            inx         = -1,
            uni         = self.uni,
            listeners   = self.listeners,
            fid, lid;

        if (fn == parseInt(fn)) {
            lid = parseInt(fn);
            if (!self.map[lid]) {
                return false;
            }
            fid = self.map[lid].fid;
        }
        else {
            fid = fn[uni];
        }

        if (!fid) {
            return false;
        }

        var ctxUni  = uni + "_" + fid;
        context     = context || null;

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].fid === fid && 
                listeners[i].context === context) {
                inx = i;
                lid = listeners[i].id;
                delete fn[uni];
                if (context) {
                    delete context[ctxUni];
                }
                break;
            }
        }

        if (inx === -1) {
            return false;
        }

        listeners.splice(inx, 1);
        delete self.map[lid];
        return true;
    },

    /**
     * @method hasListener
     * @return bool
     */

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Callback context
     * @return boolean
     */
    hasListener: function(fn, context) {

        var self    = this,
            listeners   = self.listeners,
            fid;

        if (fn) {

            if (!isFunction(fn)) {
                fid  = parseInt(fn);
            }
            else {
                fid  = fn[self.uni];
            }

            if (!fid) {
                return false;
            }

            var ctxUni  = self.uni + "_" + fid;

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].fid === fid) {
                    if (!context || context[ctxUni]) {
                        return true;
                    }
                }
            }

            return false;
        }
        else {
            return listeners.length > 0;
        }
    },


    /**
     * @method
     */
    removeAllListeners: function() {
        var self        = this,
            listeners   = self.listeners,
            uni         = self.uni,
            i, len, ctxUni;

        for (i = 0, len = listeners.length; i < len; i++) {
            ctxUni = uni +"_"+ listeners[i].fn[uni];
            delete listeners[i].fn[uni];
            if (listeners[i].context) {
                delete listeners[i].context[ctxUni];
            }
        }
        self.listeners   = [];
        self.map         = {};
    },

    /**
     * @method
     */
    suspend: function() {
        this.suspended = true;
    },

    /**
     * @method
     */
    resume: function() {
        this.suspended = false;
    },


    _prepareArgs: function(l, triggerArgs) {
        var args;

        if (l.append || l.prepend) {
            args    = triggerArgs.slice();
            if (l.prepend) {
                args    = l.prepend.concat(args);
            }
            if (l.append) {
                args    = args.concat(l.append);
            }
        }
        else {
            args = triggerArgs;
        }

        return args;
    },

    /**
     * @method
     * @return {*}
     */
    trigger: function() {

        var self            = this,
            listeners       = self.listeners,
            rr              = self.returnResult,
            filter          = self.triggerFilter,
            filterContext   = self.filterContext,
            expectPromises  = self.expectPromises,
            keepPromiseOrder= self.keepPromiseOrder,
            results         = [],
            origArgs        = toArray(arguments),
            prevPromise,
            resPromise,
            args, 
            resolver;

        if (self.suspended) {
            return null;
        }

        if (self.autoTrigger) {
            self.lastTrigger = origArgs.slice();
        }

        // in pipe mode if there is no listeners,
        // we just return piped value
        if (listeners.length === 0) {
            if (rr === "pipe") {
                return origArgs[0];
            }
            return null;
        }

        var ret     = rr === "all" || rr === "concat" ?
                        [] : 
                        (rr === "merge" ? {} : null),
            q, l,
            res;

        if (rr === "first") {
            q = [listeners[0]];
        }
        else {
            // create a snapshot of listeners list
            q = listeners.slice();
        }

        if (expectPromises && rr === "last") {
            keepPromiseOrder = true;
        }

        // now if during triggering someone unsubscribes
        // we won't skip any listener due to shifted
        // index
        while (l = q.shift()) {

            // listener may already have unsubscribed
            if (!l || !self.map[l.id]) {
                continue;
            }

            args = self._prepareArgs(l, origArgs);

            if (filter && filter.call(filterContext, l, args, self) === false) {
                continue;
            }

            if (l.filter && l.filter.apply(l.filterContext || l.context, args) === false) {
                continue;
            }

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            if (l.async && !expectPromises) {
                res = null;
                async(l.fn, l.context, args, l.async);
            }
            else {
                if (expectPromises) {
                    resolver = function(l, rr, args){
                        return function(value) {

                            if (rr === "pipe") {
                                args[0] = value;
                                args = self._prepareArgs(l, args);
                            }
                            
                            return l.fn.apply(l.context, args);
                        }
                    }(l, rr, origArgs.slice());

                    if (prevPromise) {
                        res = prevPromise.then(resolver);
                    }
                    else {
                        res = l.fn.apply(l.context, args);
                    }

                    res.catch(error);
                }
                else {
                    res = l.fn.apply(l.context, args);
                }
            }

            l.called++;

            if (l.called === l.limit) {
                self.un(l.id);
            }

            // This rule is valid in all cases sync and async.
            // It either returns first value or first promise.
            if (rr === "first") {
                return res;
            }
        
            // Promise branch
            if (expectPromises) {
            
                // we collect all results for further processing/resolving
                results.push(res);

                if ((rr === "pipe" || keepPromiseOrder) && res) {
                    prevPromise = res;
                }
            }
            else {
                if (rr !== null) {
                    if (rr === "all") {
                        ret.push(res);
                    }
                    else if (rr === "concat" && res) {
                        ret = ret.concat(res);
                    }
                    else if (rr === "merge") {
                        extend(ret, res, true, false);
                    }
                    else if (rr === "nonempty" && res) {
                        return res;
                    }
                    else if (rr === "pipe") {
                        ret = res;
                        origArgs[0] = res;
                    }
                    else if (rr === "last") {
                        ret = res;
                    }
                    else if (rr === false && res === false) {
                        return false;
                    }
                    else if (rr === true && res === true) {
                        return true;
                    }
                }
            }
        }

        if (expectPromises) {
            if (rr === "pipe") {
                return prevPromise;
            }
            resPromise = Promise.all(results);
            if (self.resolvePromises && rr !== null && rr !== "all") {
                resPromise = resPromise.then(function(values){
                    var i, l = values.length, res;
                    for(i = 0; i < l; i++) {
                        res = values[i];
                        if (rr === "concat" && res) {
                            ret = ret.concat(res);
                        }
                        else if (rr === "merge") {
                            extend(ret, res, true, false);
                        }
                        else if (rr === "nonempty" && res) {
                            return res;
                        }
                        else if (rr === "last") {
                            ret = res;
                        }
                        else if (rr === false && res === false) {
                            return false;
                        }
                        else if (rr === true && res === true) {
                            return true;
                        }
                    }
                    return ret;
                });
            }
            return resPromise;
        }
        else return ret;
    }
}, true, false);

return ObservableEvent;
}());


    


var lib_Observable = MetaphorJs.lib.Observable = (function(){

/**
 * @description A javascript event system implementing multiple patterns: 
 * observable, collector and pipe.
 * @description Observable:
 * @code src-docs/examples/observable.js
 *
 * @description Collector:
 * @code src-docs/examples/collector.js
 * 
 * @description Pipe:
 * @code src-docs/examples/pipe.js
 *
 * @class MetaphorJs.lib.Observable
 * @author Ivan Kuindzhi
 */
var Observable = function() {

    this.events = {};

};


extend(Observable.prototype, {


    /**
     * @method createEvent
     * @param {string} name {
     *      Event name
     *      @required
     * }
     * @param {object|string|bool} options {
     *  Options object or returnResult value. All options are optional.
     * 
     *  @type {string|bool} returnResult {
     *   false -- return first 'false' result and stop calling listeners after that<br>
     *   true -- return first 'true' result and stop calling listeners after that<br>
     *   "all" -- return all results as array<br>
     *   "concat" -- merge all results into one array (each result must be array)<br>
     *   "merge" -- merge all results into one object (each result much be object)<br>
     *   "pipe" -- pass return value of previous listener to the next listener.
     *             Only first trigger parameter is being replaced with return value,
     *             others stay as is.<br>
     *   "first" -- return result of the first handler (next listener will not be called)<br>
     *   "nonempty" -- return first nonempty result<br>
     *   "last" -- return result of the last handler (all listeners will be called)<br>
     *  }
     *  @type {bool} autoTrigger {
     *      once triggered, all future subscribers will be automatically called
     *      with last trigger params
     *      @code src-docs/examples/autoTrigger.js
     * }
     *  @type {function} triggerFilter {
     *      This function will be called each time event is triggered. 
     *      Return false to skip listener.
     *       @code src-docs/examples/triggerFilter.js
     *       @param {object} listener This object contains all information about the listener, including
     *           all data you provided in options while subscribing to the event.
     *       @param {[]} arguments
     *       @return {bool}
     *  }
     *  @type {object} filterContext triggerFilter's context
     *  @type {bool} expectPromises {   
     *      Expect listeners to return Promises. If <code>returnResult</code> is set,
     *      promises will be treated as return values unless <code>resolvePromises</code>
     *      is set.
     *  }
     *  @type {bool} resolvePromises {
     *      In pair with <code>expectPromises</code> and <code>returnResult</code>
     *      this option makes trigger function wait for promises to resolve.
     *      All or just one depends on returnResult mode. "pipe" mode 
     *      makes promises resolve consequentially passing resolved value
     *      to the next promise.
     *  }
     * }
     * @returns {lib_ObservableEvent}
     */
    createEvent: function(name, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new lib_ObservableEvent(name, options);
        }
        return events[name];
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name
    * @return {lib_ObservableEvent|undefined}
    */
    getEvent: function(name) {
        name = name.toLowerCase();
        return this.events[name];
    },

    /**
    * Subscribe to an event or register collector function.
    * @method
    * @access public
    * @param {string} name {
    *       Event name. Use '*' to subscribe to all events.
    *       @required
    * }
    * @param {function} fn {
    *       Callback function
    *       @required
    * }
    * @param {object} context "this" object for the callback function
    * @param {object} options {
    *       You can pass any key-value pairs in this object. All of them will be passed 
    *       to triggerFilter (if you're using one).
    *       @type {bool} first {
    *           True to prepend to the list of handlers
    *           @default false
    *       }
    *       @type {number} limit {
    *           Call handler this number of times; 0 for unlimited
    *           @default 0
    *       }
    *       @type {number} start {
    *           Start calling handler after this number of calls. Starts from 1
    *           @default 1
    *       }
    *       @type {array} append Append parameters
    *       @type {array} prepend Prepend parameters
    *       @type {bool} allowDupes allow the same handler twice
    *       @type {bool|int} async run event asynchronously. If event was
    *                      created with <code>expectPromises: true</code>, 
    *                      this option is ignored.
    * }
    */
    on: function(name, fn, context, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new lib_ObservableEvent(name);
        }
        return events[name].on(fn, context, options);
    },

    /**
    * Same as {@link class:Observable.on}, but options.limit is forcefully set to 1.
    * @method
    * @access public
    */
    once: function(name, fn, context, options) {
        options     = options || {};
        options.limit = 1;
        return this.on(name, fn, context, options);
    },

    /**
    * Unsubscribe from an event
    * @method
    * @access public
    * @param {string} name Event name
    * @param {function} fn Event handler
    * @param {object} context If you called on() with context you must 
    *                         call un() with the same context
    */
    un: function(name, fn, context) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].un(fn, context);
    },

    /**
     * Relay all events of <code>eventSource</code> through this observable.
     * @method
     * @access public
     * @code src-docs/examples/relay.js
     * @param {object} eventSource
     * @param {string} eventName
     * @param {string} triggerName
     */
    relayEvent: function(eventSource, eventName, triggerName) {
        eventSource.on(eventName, this.trigger, this, {
            prepend: eventName === "*" ? null : [triggerName || eventName]
        });
    },

    /**
     * Stop relaying events of <code>eventSource</code>
     * @method
     * @access public
     * @param {object} eventSource
     * @param {string} eventName
     */
    unrelayEvent: function(eventSource, eventName) {
        eventSource.un(eventName, this.trigger, this);
    },

    /**
     * @method hasListener
     * @access public
     * @return bool
     */

    /**
    * @method hasListener
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {function} fn Callback function { @required }
    * @param {object} context Function's "this" object
    * @return bool
    */
    hasListener: function(name, fn, context) {
        var events = this.events;

        if (name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return events[name].hasListener(fn, context);
        }
        else {
            for (name in events) {
                if (events[name].hasListener()) {
                    return true;
                }
            }
            return false;
        }
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */
    hasEvent: function(name) {
        return !!this.events[name];
    },


    /**
    * Remove all listeners from all events
    * @method removeAllListeners
    * @access public
    */

    /**
    * Remove all listeners from specific event
    * @method
    * @access public
    * @param {string} name Event name { @required }
    */
    removeAllListeners: function(name) {
        var events  = this.events;
        if (name) {
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        }
        else {
            for (name in events) {
                events[name].removeAllListeners();
            }
        }
    },

    /**
    * Trigger an event -- call all listeners. Also triggers '*' event.
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {*} ... As many other params as needed
    * @return mixed
    */
    trigger: function() {

        var name = arguments[0],
            events  = this.events,
            e,
            res = null;

        name = name.toLowerCase();

        if (events[name]) {
            e = events[name];
            res = e.trigger.apply(e, toArray(arguments).slice(1));
        }

        // trigger * event with current event name
        // as first argument
        if (e = events["*"]) {
            e.trigger.apply(e, arguments);
        }
        
        return res;
    },

    /**
    * Suspend an event. Suspended event will not call any listeners on trigger().
    * @method
    * @access public
    * @param {string} name Event name
    */
    suspendEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].suspend();
    },

    /**
    * @method
    * @access public
    */
    suspendAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].suspend();
        }
    },

    /**
    * Resume suspended event.
    * @method
    * @access public
    * @param {string} name Event name
    */
    resumeEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].resume();
    },

    /**
    * @method
    * @access public
    */
    resumeAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].resume();
        }
    },

    /**
     * @method
     * @access public
     * @param {string} name Event name
     */
    destroyEvent: function(name) {
        var events  = this.events;
        if (events[name]) {
            events[name].removeAllListeners();
            events[name].$destroy();
            delete events[name];
        }
    },


    /**
    * Destroy observable
    * @method
    * @md-not-inheritable
    * @access public
    */
    $destroy: function() {
        var self    = this,
            events  = self.events;

        for (var i in events) {
            self.destroyEvent(i);
        }

        for (i in self) {
            self[i] = null;
        }
    }
}, true, false);


var __createEvents = function(host, obs, events) {
    for (var i in events) {
        host.createEvent ?
            host.createEvent(i, events[i]) :
            obs.createEvent(i, events[i]);
    }
};

var __on = function(host, obs, event, fn, context) {
    host.on ?
        host.on(event, fn, context || host) :
        obs.on(event, fn, context || host);
};

Observable.$initHost = function(host, hostCfg, observable)  {
    var i;

    if (host.$$events) {
        __createEvents(host, observable, host.$$events);
    }

    if (hostCfg && hostCfg.callback) {
        var ls = hostCfg.callback,
            context = ls.context || ls.scope || ls.$context;

        if (ls.$events)
            __createEvents(host, observable, ls.$events);

        ls.context = null;
        ls.scope = null;

        for (i in ls) {
            if (ls[i]) {
                __on(host, observable, i, ls[i], context);
            }
        }

        hostCfg.callback = null;

        if (context) {
            host.$$callbackContext = context;
        }
    }
};


return Observable;
}());

/**
 * Check if given value is a string
 * @function isString
 * @param {*} value 
 * @returns {boolean}
 */
function isString(value) {
    return typeof value === "string" || value === ""+value;
};



/**
 * Check if given value is array (not just array-like)
 * @function isArray
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value === "object" && _varType(value) === 5;
};


function emptyFn(){};

/**
 * Intellegently splits string into parts using a separator, 
 * leaving untouched parts where separator is inside quotes.
 * @param {string} str
 * @param {string} separator
 * @param {bool} allowEmpty
 * @returns {array}
 */
var split = function(str, separator, allowEmpty) {

    var l       = str.length,
        sl      = separator.length,
        i       = 0,
        prev    = 0,
        inQDbl  = false,
        inQSng  = false,
        parts   = [],
        esc     = "\\",
        char;

    if (!sl) {
        return [str];
    }

    for (; i < l; i++) {

        char = str.charAt(i);

        if (char == esc) {
            i++;
            continue;
        }

        if (char == '"') {
            inQDbl = !inQDbl;
            continue;
        }
        if (char == "'") {
            inQSng = !inQSng;
            continue;
        }

        if (!inQDbl && !inQSng) {
            if ((sl == 1 && char == separator) ||
                (sl > 1 && str.substring(i, i + sl) == separator)) {

                if (str.substr(i - 1, sl) == separator ||
                    str.substr(i + 1, sl) == separator) {

                    if (!allowEmpty) {
                        i += (sl - 1);
                        continue;
                    }
                }

                parts.push(str.substring(prev, i).replace(esc + separator, separator));
                prev = i + sl;
                i += (sl - 1);
            }
        }
    }

    parts.push(str.substring(prev).replace(esc + separator, separator));

    return parts;
};


MetaphorJs.filter = MetaphorJs.filter || {};





var lib_Expression = MetaphorJs.lib.Expression = (function() {

    var REG_REPLACE_EXPR    = /((^|[^a-z0-9_$\]\)'"])|(this))(\.)([^0-9])/ig,
        REG_REPLACER        = "$2____.$5",
        fnBodyStart     = 'try {',
        fnBodyEnd       = ';} catch (thrownError) { '+
                            '/*DEBUG-START*/console.log("expr");console.log(thrownError);/*DEBUG-END*/'+
                            'return undefined; }',    
        cache           = {},
        descrCache      = {},
        filterSources   = [],

        prebuiltExpr    = MetaphorJs.prebuilt ?
                            MetaphorJs.prebuilt.funcs : {} || 
                            {},

        prebuiltCache   = function(key) {
            if (isPrebuiltKey(key)) {
                key = key.substring(2);
                return prebuiltExpr[key] || null;
            }
            return null;
        },

        isPrebuiltKey   = function(expr) {
            return typeof expr === "string" && expr.substring(0,2) === '--';
        },

        isAtom          = function(expr) {
            return !expr.trim().match(/[^a-zA-Z0-9_$'"\(\)\[\]\.;]/);
        },

        isProperty      = function(expr) {
            var match = expr.match(/^this\.([a-zA-Z0-9_$]+)$/);
            return match ? match[1] : false;
        },

        isStatic        = function(val) {

            if (!isString(val)) {
                return {
                    value: val
                };
            }

            var first   = val.substr(0, 1),
                last    = val.length - 1,
                num;

            if (first === '"' || first === "'") {
                if (val.indexOf(first, 1) === last) {
                    return {value: val.substring(1, last)};
                }
            }
            else if (val === 'true' || val === 'false') {
                return {value: val === 'true'};
            }
            else if ((num = parseFloat(val)) == val) {
                return {value: num};
            }

            return false;
        },

        getFilter       = function(name, filters) {
            if (filters) {
                if (isArray(filters)) {
                    filters = filters.concat(filterSources);
                }
                else if (filters.hasOwnProperty(name)) {
                    return filters[name];
                }
            }
            else {
                filters = filterSources;
            }
            var i, l = filterSources.length;
            for (i = 0; i < l; i++) {
                if (filterSources[i] && filterSources[i].hasOwnProperty(name)) {
                    return filterSources[i][name];
                }
            }

            return null;
        },


        expression      = function(expr, opt) {
            opt = opt || {};

            if (typeof opt === "string" && opt === "setter") {
                opt = {
                    setter: true
                };
            }

            var asCode = opt.asCode === true,
                isSetter = opt.setter === true,
                noReturn = opt.noReturn === true,
                statc,
                cacheKey;

            if (statc = isStatic(expr)) {

                cacheKey = expr + "_static";

                if (cache[cacheKey]) {
                    return cache[cacheKey];
                }

                if (isSetter) {
                    throw new Error("Static value cannot work as setter");
                }

                if (opt.asCode) {
                    return "".concat(
                        "function() {",
                            "return ", 
                            expr, 
                        "}"
                    );
                }

                return cache[cacheKey] = function() {
                    return statc.value;
                };
            }
            try {

                var atom = isAtom(expr);
                cacheKey = expr + "_" + (
                            isSetter ? "setter" : 
                                (noReturn ? "func" : "getter")
                            );

                if (!atom && isSetter) {
                    throw new Error("Complex expression cannot work as setter");
                }

                if (!cache[cacheKey] || asCode) {

                    var code = expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        body = 
                            !atom || !isSetter ? 
                                "".concat(
                                    fnBodyStart, 
                                    noReturn ? '' : 'return ', 
                                    code,
                                    fnBodyEnd
                                ) : 
                                "".concat(
                                    fnBodyStart, 
                                    //noReturn ? '' : 'return ', 
                                    code, ' = $$$$', 
                                    fnBodyEnd
                                );

                    /*DEBUG-START*/
                    var esc = expr.replace(/\n/g, '\\n');
                    esc = esc.replace(/\r/g, '\\r');
                    esc = esc.replace(/'/g, "\\'");
                    esc = esc.replace(/"/g, '\\"');
                    body = body.replace('"expr"', '"' +esc+ '"');
                    /*DEBUG-END*/

                    if (asCode) {
                        return "function(____, $$$$) {" + body + "}";
                    }
                    else {
                        cache[cacheKey] = new Function(
                            '____',
                            '$$$$',
                            body
                        );
                    }
                }
                return cache[cacheKey];
            }
            catch (thrownError) {
                error(new Error("Error parsing expression: " + expr + "; \n\n\n" + body));
                error(thrownError);
                return emptyFn;
            }
        },

        preparePipe     = function(pipe, filters) {

            var name    = pipe.shift(),
                fn      = isFunction(name) ? name : null,
                params  = [],
                exprs   = [],
                fchar   = fn ? null : name.substr(0,1),
                opt     = {
                    neg: false,
                    dblneg: false,
                    undeterm: false,
                    name: name
                },
                i, l;

            if (!fn) {
                if (name.substr(0, 2) === "!!") {
                    name = name.substr(2);
                    opt.dblneg = true;
                }
                else {
                    if (fchar === "!") {
                        name = name.substr(1);
                        opt.neg = true;
                    }
                    else if (fchar === "?") {
                        name = name.substr(1);
                        opt.undeterm = true;
                    }
                }

                opt.name = name;
            }
            else {
                opt.name = fn.name;
            }

            !fn && (fn = getFilter(name, filters));

            if (isFunction(fn)) {

                for (i = -1, l = pipe.length; ++i < l;
                    params.push(expressionFn(pipe[i]))) {
                        if (!isStatic(pipe[i])) {
                            exprs.push(pipe[i]);
                        }
                    }

                if (fn.$undeterministic) {
                    opt.undeterm = true;
                }

                return {
                    fn: fn, 
                    origArgs: pipe, 
                    params: params, 
                    expressions: exprs,
                    opt: opt
                };
            }

            return null;
        },

        parsePipes      = function(expr, isInput, filters) {

            var separator   = isInput ? ">>" : "|";

            if (expr.indexOf(separator) === -1) {
                return expr;
            }

            var parts   = split(expr, separator),
                ret     = isInput ? parts.pop() : parts.shift(),
                pipes   = [],
                pipe,
                i, l;

            for(i = 0, l = parts.length; i < l; i++) {
                pipe = split(parts[i].trim(), ':');
                pipe = preparePipe(pipe, filters);
                pipe && pipes.push(pipe);
            }

            return {
                expr: ret.trim(),
                pipes: pipes
            }
        },


        _initSetter         = function(struct) {
            struct.setterFn = expressionFn(struct.expr, {
                setter: true
            });
        },

        deconstructor       = function(expr, opt) {

            opt = opt || {};

            var isNormalPipe = expr.indexOf("|") !== -1,
                isInputPipe = expr.indexOf(">>") !== -1,
                res,
                struct = {
                    fn: null,
                    getterFn: null,
                    setterFn: null,
                    expr: expr,
                    pipes: [],
                    inputPipes: []
                };

            if (!isNormalPipe && !isInputPipe) {
                struct.fn = expressionFn(struct.expr, opt);
                return struct;
            }

            if (isNormalPipe) {
                res = parsePipes(struct.expr, false, opt.filters);
                struct.expr = res.expr;
                struct.pipes = res.pipes;
            }

            if (isInputPipe) {
                res = parsePipes(struct.expr, true, opt.filters);
                struct.expr = res.expr;
                struct.inputPipes = res.pipes;
                opt.setter = true;
            }

            struct.fn = expressionFn(struct.expr, opt);

            if (isInputPipe) {
                opt.setter = false;
                struct.getterFn = expressionFn(struct.expr, opt);
                struct.setterFn = struct.fn;
            }
            else {
                struct.getterFn = struct.fn;
            }

            return struct;
        },

        runThroughPipes     = function(val, pipes, dataObj) {

            var j,
                args,
                pipe,

                jlen    = pipes.length,
                z, zl;

            for (j = 0; j < jlen; j++) {
                pipe    = pipes[j];
                args    = [];
                for (z = -1, zl = pipe.params.length; ++z < zl;
                        args.push(pipe.params[z](dataObj))){}

                args.unshift(dataObj);
                args.unshift(val);

                val     = pipe.fn.apply(dataObj, args);
                
                if (pipe.opt.neg) {
                    val = !val;
                }
                else if (pipe.opt.dblneg) {
                    val = !!val;
                }
            }
        
            return val;
        },


        constructor         = function(struct, opt) {
            
            opt = opt || {};

            if (struct.pipes.length === 0 && 
                struct.inputPipes.length === 0) {
                if (opt.setterOnly) {
                    !struct.setterFn && _initSetter(struct);
                    return struct.setterFn;
                }
                return struct.fn;
            }

            return function(dataObj, inputVal) {

                var val;

                if (struct.inputPipes.length && !opt.getterOnly) {
                    val = inputVal;
                    val = runThroughPipes(val, struct.inputPipes, dataObj);
                    !struct.setterFn && _initSetter(struct);
                    struct.setterFn(dataObj, val);
                }

                if (struct.pipes && !opt.setterOnly) {
                    if (opt.getterOnly) {
                        val = struct.getterFn(dataObj);
                    }
                    else if (!struct.inputPipes.length) {
                        val = struct.fn(dataObj);
                    }
                    val = runThroughPipes(val, struct.pipes, dataObj);
                }

                return val;
            };
        },

        expressionFn,
        parserFn,
        deconstructorFn,
        constructorFn,

        parser      = function(expr, opt) {
            return constructorFn(deconstructorFn(expr, opt), opt);
        },

        reset       = function() {
            parserFn = parser;
            deconstructorFn = deconstructor;
            constructorFn = constructor;
            expressionFn = expression;
        };


    if (typeof window !== "undefined") {
        filterSources.push(window);
    }
    if (MetaphorJs.filter) {
        filterSources.push(MetaphorJs.filter)
    }

    reset();

    /**
     * @object MetaphorJs.expression
     */
    return {

        /**
         * Set your code parser
         * @property {function} setExpressionFn {
         *  @param {function} expression {
         *      @param {string} expression A single piece of code that 
         *              gets or sets data and doesn't contain pipes
         *      @param {object} options {
         *          @type {boolean} asCode return code as string
         *      }
         *      @returns {function} {
         *          @param {object} dataObj Data object to execute expression against
         *          @param {*} value Optional value which makes function a setter
         *          @returns {*} value of expression on data object
         *      }
         *  }
         * }
         */
        setExpressionFn: function(expression) {
            expressionFn = expression;
        },

        /**
         * Get expression parser
         * @property {function} getExpressionFn {
         *  @returns {function} See setExpressionFn
         * }
         */
        getExpressionFn: function() {
            return expressionFn;
        },

        /**
         * Set deconstructor function that returns set of prepared pipes
         * @property {function} setDeconstructorFn {
         *  @param {function} deconstructor {
         *      @param {string} expression
         *      @param {object} filters {
         *          Optional set of filters (pipes)
         *      }
         *      @returns {object} {
         *          @type {function} expr {
         *              @param {object} dataObj Data object to execute expression against
         *              @param {*} value Optional value which makes function a setter
         *              @returns {*} value of expression on data object
         *          }
         *          @type {array} pipes {
         *              @type {function} fn {
         *                  Filter function
         *                  @param {*} inputValue
         *                  @param {object} dataObj 
         *                  @param {...} argN pipe arguments
         *                  @returns {*} processed input value
         *              }
         *              @type {array} origArgs List of strings describing the pipe
         *              @type {array} params {
         *                  @param {object} dataObj
         *                  @returns {*} pipe argument value
         *              }
         *              @type {object} opt {
         *                  Pipe options
         *                  @type {boolean} neg Return !value
         *                  @type {boolean} dblneg Return !!value
         *                  @type {boolean} undeterm This pipe's result is undetermined
         *                  @type {string} name Filter name
         *              }
         *          }
         *          @type {array} inputPipes same as pipes
         *      }
         *  }
         * }
         */
        setDeconstructorFn: function(deconstructor) {
            deconstructorFn = deconstructor;
        },

        /**
         * @property {function} getDeconstructorFn {
         *  @returns {function} See setDeconstructorFn
         * }
         */
        getDeconstructorFn: function() {
            return deconstructorFn;
        },

        /**
         * @property {function} setConstructorFn {
         *  Takes result of <code>deconstructor</code> and 
         *  returns function with the same api as <code>expression</code>
         *  @param {function} constructor {
         *      @param {object} struct As returned from deconstructorFn
         *      @param {object} opt {
         *          @type {boolean} getterOnly
         *          @type {boolean} setterOnly
         *      }
         *      @returns {function} Same that expressionFn and parserFn returns
         *  }
         * }
         */
        setConstructorFn: function(constructor) {
            constructorFn = constructor;
        },

        /**
         * @property {function} getConstructorFn {
         *  @returns {function}
         * }
         */
        getConstructorFn: function() {
            return constructorFn;
        },

        /**
         * @property {function} setParserFn {
         *  @param {function} parser {
         *      @param {string} expression Code expression with or without pipes
         *      @returns {function} {
         *          @param {object} dataObj Data object to execute expression against
         *          @param {*} value Optional value which makes function a setter
         *          @returns {*} value of expression on data object
         *      }
         *  }
         * }
         */        
        setParserFn: function(parser) {
            parserFn = parser;
        },

        /**
         * @property {function} getParserFn {
         *  @returns {function} See setParserFn
         * }
         */
        getParserFn: function() {
            return parserFn;
        },

        /**
         * Add filters collection
         * @param {object} filters {
         *  name:function collection of filters (pipes)
         * }
         */
        addFilterSource: function(filters) {
            filterSources.push(filters);
        },

        /**
         * Reset to default parser
         * @property {function} reset
         */
        reset: reset,

        /**
         * Get executable function out of code string (no pipes)
         * @property {function} expression
         * @param {string} expr 
         * @param {object|string} opt See <code>parse</code>
         * @returns {function} {
         *  @param {object} dataObj Data object to execute expression against
         *  @param {*} value Optional value which makes function a setter
         *  @returns {*} value of expression on data object
         * }
         */
        expression: function(expr, opt) {
            return prebuiltCache(expr) || expressionFn(expr, opt);
        },

        /**
         * @property {function} deconstruct {
         *  See setDeconstructorFn
         *  @param {string} expr 
         *  @param {object|string} opt See <code>parse</code>
         *  @returns {function} 
         * }
         */
        deconstruct: function(expr, opt) {
            return deconstructorFn(expr, opt);
        },

        /**
         * Get a expression function out of deconstructed parts
         * @property {function} construct {
         *  @param {object} struct Result of <code>deconstruct(expr)</code>
         *  @param {object} opt {
         *      @type {boolean} setterOnly
         *      @type {boolean} getterOnly
         *  }
         *  @returns {function} {
         *      @param {object} dataObj Data object to execute expression against
         *      @param {*} value Optional value which makes function a setter
         *      @returns {*} value of expression on data object
         * }
         * }
         */
        construct: function(struct, opt) {
            return constructorFn(struct, opt);
        },

        /**
         * @property {function} parse {
         *  See setParserFn
         *  @param {string} expr 
         *  @param {object|string} opt {
         *      @type {object} filters
         *      @type {boolean} setter {    
         *          @default false
         *      }
         *  }
         *  @returns {function}
         * }
         */
        parse: function(expr, opt) {
            return parserFn(expr, opt);
        },

        /**
         * @property {function} func {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} noReturn {    
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        func: function(expr, opt) {
            opt = opt || {};
            opt.noReturn = true;
            opt.getterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * @property {function} setter {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} setter {    
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        setter: function(expr, opt) {
            opt = opt || {};
            opt.setter = true;
            opt.setterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * @property {function} getter {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} setter {    
         *          @default false
         *      }
         *      @type {boolean} getterOnly {
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        getter: function(expr, opt) {
            opt = opt || {};
            opt.setter = false;
            opt.getterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * Execute code on given data object
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        run: function(expr, dataObj, inputValue, opt) {
            if (isPrebuiltKey(expr)) {
                prebuiltCache(expr)(dataObj);
            }
            else {
                opt = opt || {};
                opt.noReturn = true;
                parserFn(expr, opt)(dataObj, inputValue);
            }
        },

        /**
         * Execute code on given data object
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        get: function(expr, dataObj, inputValue, opt) {
            if (isPrebuiltKey(expr)) {
                return prebuiltCache(expr)(dataObj);
            }
            else {
                opt = opt || {};
                opt.getterOnly = true;
                return parserFn(expr, opt)(dataObj, inputValue);
            }
        },

        /**
         * Execute code on given data object as a setter
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        set: function(expr, dataObj, inputValue, opt) {
            opt = opt || {};
            opt.setter = true;
            opt.setterOnly = true;
            return parserFn(expr, opt)(dataObj, inputValue);
        },

        

        /**
         * Check if given expression is a static string or number
         * @property {function} isStatic
         * @param {string} expr
         * @returns {boolean|object} {  
         *  Static value can be 0 or false, so it must be returned contained.<br>
         *  So it is either false or ret.value
         *  @type {*} value 
         * }
         */
        isStatic: isStatic,

        /**
         * Checks if given expression is simple getter (no function or operations)
         * @property {function} isAtom {
         *  @param {string} expr
         *  @returns {boolean}
         * }
         */
        isAtom: isAtom,

        /**
         * Checks if given expression is a property getter
         * @property {function} isProperty {
         *  @param {string} expr 
         *  @returns {string|boolean} property name or false
         * }
         */
        isProperty: isProperty,

        /**
         * Is this a key in prebuilt cache
         * @property {function} isPrebuiltKey {
         *  @param {string} key
         *  @returns {boolean}
         * }
         */
        isPrebuiltKey: isPrebuiltKey,

        /**
         * Does the expression has pipes
         * @property {function} expressionHasPipes {
         *  @param {string} expr
         *  @returns {boolean}
         * }
         */
        expressionHasPipes: function(expr) {
            return split(expr, '|').length > 1 || 
                    split(expr, '>>').length > 1;
        },

        /**
         * Get a small string containing expression features:
         * p: updates parent, r: updates root, i: has input pipes,
         * o: has output pipes
         * @property {function} describeExpression {
         *  @param {string} expr 
         *  @returns {string}
         * }
         */
        describeExpression: function(expr) {

            if (!expr || typeof expr !== "string") 
                return "";

            if (isPrebuiltKey(expr)) {
                expr = expr.substring(2);
                return MetaphorJs.prebuilt.expressionOpts[expr] || "";
            }
            if (descrCache[expr]) {
                return descrCache[expr];
            }

            var descr = "" +
                (expr.indexOf("$parent") !== -1 ? "p":"") +
                (expr.indexOf("$root") !== -1 ? "r":"") +
                (split(expr, '|').length > 1 ? "o":"") +
                (split(expr, '>>').length > 1 ? "i":"");

            descrCache[expr] = descr;

            return descr;
        },

        /**
         * Clear expression cache
         * @property {function} clearCache
         */
        clearCache: function() {
            cache = {};
        }
    }
}());


/**
 * Bind function to context (Function.bind wrapper)
 * @function bind
 * @param {function} fn
 * @param {*} context
 * @returns {function}
 */
function bind(fn, context){
    return fn.bind(context);
};



/**
 * Check if given value is a Date object
 * @function isDate
 * @param {*} value
 * @returns {boolean} 
 */
function isDate(value) {
    return _varType(value) === 10;
};



/**
 * Check if given value is regular expression
 * @function isRegExp
 * @param {*} value 
 * @returns {boolean}
 */
function isRegExp(value) {
    return _varType(value) === 9;
};

/**
 * Check if given object is a window object
 * @function isWindow
 * @param {*} obj 
 * @returns {boolean}
 */
function isWindow(obj) {
    if (typeof window === "undefined") {
        return false;
    }
    return obj === window ||
           (obj && obj.document && obj.location && 
            obj.alert && obj.setInterval);
};



// from Angular

/**
 * Performs various checks comparing two arguments. 
 * Compared items can be of any type including
 * objects and arrays.
 * @function equals
 * @param {*} o1 
 * @param {*} o2 
 * @returns {boolean}
 */
function equals(o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 === t2) {
        if (t1 === 'object') {
            if (isArray(o1)) {
                if (!isArray(o2)) return false;
                if ((length = o1.length) === o2.length) {
                    for(key=0; key<length; key++) {
                        if (!equals(o1[key], o2[key])) return false;
                    }
                    return true;
                }
            } else if (isDate(o1)) {
                return isDate(o2) && o1.getTime() === o2.getTime();
            } else if (isRegExp(o1) && isRegExp(o2)) {
                return o1.toString() === o2.toString();
            } else {
                if (isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                keySet = {};
                for(key in o1) {
                    if (key.charAt(0) === '$' || isFunction(o1[key])) {//&& typeof o1[key] == "object") {
                        continue;
                    }
                    //if (isFunction(o1[key])) {
                    //    continue;
                    //}
                    if (!equals(o1[key], o2[key])) {
                        return false;
                    }
                    keySet[key] = true;
                }
                for(key in o2) {
                    if (!keySet.hasOwnProperty(key) &&
                        key.charAt(0) !== '$' &&
                        o2[key] !== undf &&
                        !isFunction(o2[key])) return false;
                }
                return true;
            }
        }
    }
    return false;
};




function copy(source, dest){

    if (typeof window != strUndef && source === window) {
        throw new Error("Cannot copy window object");
    }
    else if (typeof global != strUndef && source === global) {
        throw new Error("Cannot copy global object");
    }

    if (!dest) {
        dest = source;
        if (source) {
            if (isArray(source)) {
                dest = copy(source, []);
            } else if (isDate(source)) {
                dest = new Date(source.getTime());
            } else if (isRegExp(source)) {
                dest = new RegExp(source.source);
            } else if (isPlainObject(source)) {
                dest = copy(source, {});
            }
        }
    } else {
        if (source === dest) {
            throw new Error("Objects are identical");
        }
        if (isArray(source)) {
            dest.length = 0;
            for ( var i = 0, l = source.length; i < l; i++) {
                dest.push(copy(source[i]));
            }
        } else {
            var key;
            for (key in dest) {
                delete dest[key];
            }
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    if (key.charAt(0) == '$' || isFunction(source[key])) {
                        dest[key] = source[key];
                    }
                    else {
                        dest[key] = copy(source[key]);
                    }
                }
            }
        }
    }
    return dest;
};








/**
 * @class MetaphorJs.lib.MutationObserver
 */
var lib_MutationObserver = MetaphorJs.lib.MutationObserver = (function(){

    var observable = new lib_Observable;

    var checkAll = function() {
        var k, changes = 0;

        for (k in this) {
            if (this.hasOwnProperty(k) && k !== "$checkAll") {
                if (this[k].check()){
                    changes++;
                }
            }
        }

        return changes;
    };

    /**
     * @constructor
     * @method
     * @param {object} dataObj Data object to run expression against
     * @param {string|function} expr Code expression or property name or getter function
     * @param {function} listener {
     *  @param {*} currentValue
     *  @param {*} prevValue
     * }
     * @param {object} context Listener's context
     * @param {object} opt {
     *  @type {array|object} filters {
     *      Either one filter source or array of filter sources
     *  }
     * }
     */
    var MutationObserver = function(dataObj, expr, listener, context, opt) {

        var self    = this,
            id      = nextUid(),
            type    = "expr",
            propertyName,
            statc;

        opt = opt || {};

        if (listener) {
            observable.on(id, listener, context, {
                allowDupes: true
            });
        }

        self.id = id;
        self.origExpr = expr;
        self.propertyName = null;
        self.staticValue = null;
        self.dataObj = dataObj;
        self.currentValue = null;
        self.prevValue = null;
        self.rawInput = null;
        self.setterFn = null;
        self.getterFn = null;
        self.exprStruct = null;
        self.sub = [];

        // only plain getters
        if (lib_Expression.isPrebuiltKey(expr)) {
            self.getterFn = lib_Expression.getter(expr);
        }
        else {
            if (isFunction(expr)) {
                self.getterFn = expr;
            }
            else if (statc = lib_Expression.isStatic(expr)) {
                type = "static";
                self.staticValue = statc.value;
                self.getterFn = bind(self._staticGetter, self);
            }
            else if (dataObj) {
                propertyName = expr;
                if (dataObj.hasOwnProperty(propertyName) || 
                    ((propertyName = lib_Expression.isProperty(expr)) &&
                    dataObj.hasOwnProperty(propertyName))) {
                        type = "attr";
                        self.propertyName = propertyName;
                        self.getterFn = bind(self._propertyGetter, self);
                    }
            }
        }
        
        if (!self.getterFn && type === "expr") {

            if (!opt.filters) {
                opt.filters = dataObj;
            }
            else {
                if (!isArray(opt.filters)) {
                    opt.filters = [opt.filters];
                }
                else {
                    opt.filters.push(dataObj);
                }
            }

            var struct = lib_Expression.deconstruct(expr, {
                filters: opt.filters
            });
            self.exprStruct = struct;

            self.getterFn = lib_Expression.construct(
                struct, {getterOnly: true}
            );

            if (struct.inputPipes.length || opt.setter) {
                self._initSetter();
            }
        }

        if (dataObj) {
            if (!dataObj["$$mo"]) {
                dataObj.$$mo = {
                    $checkAll: checkAll
                };
            }
            if (!dataObj.$$mo[expr]) {
                dataObj.$$mo[expr] = self;
            }
        }

        self.currentValue = self._getValue();
        self.currentValueCopy = copy(self.currentValue);
        self.type = type;
    };

    extend(MutationObserver.prototype, {

        _propertyGetter: function() {
            return this.dataObj[this.propertyName];
        },

        _propertySetter: function(dataObj, newValue) {
            this.dataObj[this.propertyName] = newValue;
        },

        _staticGetter: function() {
            return this.staticValue;
        },

        /**
         * Check for changes
         * @method
         * @returns {boolean} true for changes
         */
        check: function() {

            var self = this,
                curr = self.currentValueCopy,
                val = self._getValue();

            if (!equals(val, curr)) {
                self.prevValue = curr;
                self.currentValue = val;
                self.currentValueCopy = copy(val);
                observable.trigger(self.id, self.currentValue, self.prevValue);
                return true;
            }

            return false;
        },

        _initSetter: function() {
            var self = this, struct = self.exprStruct;

            if (self.type === "attr") {
                self.setterFn = bind(self._propertySetter, self);
            }
            else {

                if (!struct) {
                    throw new Error("Unable to make setter out of " + this.expr);
                }

                self.setterFn = lib_Expression.construct(
                    struct, {setterOnly: true}
                );
                var i, l, p, j, jl;
                for (i = 0, l = struct.inputPipes.length; i < l; i++) {
                    p = struct.inputPipes[i];
                    for (j = 0, jl = p.expressions.length; j < jl; j++) {
                        self.sub.push(
                            MetaphorJs.lib.MutationObserver.get(
                                self.dataObj, p.expressions[j],
                                self._onSubChange, self
                            )
                        );
                    }
                }  
            }
        },

        _getValue: function() {
            return this.getterFn(this.dataObj);
        },

        _onSubChange: function() {
            this.setValue(this.rawInput);
        },

        /**
         * Get current value of expression
         * @method
         * @returns {*}
         */
        getValue: function() {
            return this.currentValue;
        },

        /**
         * Get copy of current value of expression
         * @method
         * @returns {*}
         */
        getCopy: function() {
            return this.currentValueCopy;
        },

        /**
         * If the expression uses input pipes, use this method to trigger them
         * @method
         * @param {*} newValue 
         * @returns {*} resulting value
         */
        setValue: function(newValue) {  
            var self = this;
            self.rawInput = newValue;
            if (!self.setterFn) {
                self._initSetter();
            }
            self.setterFn(self.dataObj, newValue);
        },

        /**
         * Get previous value
         * @method
         * @returns {*}
         */
        getPrevValue: function() {
            return this.prevValue;
        },

        /**
         * 
         * @param {function} fn {
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt See lib_Observable.on()
         * @returns {MetaphorJs.lib.MutationObserver} self
         */
        subscribe: function(fn, context, opt) {
            opt = opt || {};
            opt.allowDupes = true;
            observable.on(this.id, fn, context, opt);
            return this;
        },

        /**
         * Unsubscribe from changes event
         * @param {function} fn 
         * @param {object} context 
         * @returns {MetaphorJs.lib.MutationObserver} self
         */
        unsubscribe: function(fn, context) {
            observable.un(this.id, fn, context);
            return this;
        },

        /**
         * Does the expression have input pipes
         * @method
         * @returns {boolean}
         */
        hasInputPipes: function() {
            return this.exprStruct && this.exprStruct.inputPipes.length > 0;
        },

        /**
         * Does the expression have output pipes
         * @method
         * @returns {boolean}
         */
        hasOutputPipes: function() {
            return this.exprStruct && this.exprStruct.pipes.length > 0;
        },

        /**
         * Destroy observer
         * @param {boolean} ifUnobserved 
         * @returns {boolean} true for destroyed
         */
        $destroy: function(ifUnobserved) {
            var self = this, i, l, s;
            if (ifUnobserved && observable.hasListener(self.id)) {
                return false;
            }
            for (i = 0, l = self.sub.length; i < l; i++) {
                s = self.sub[i];
                s.unsubscribe(self._onSubChange, self);
                s.$destroy(true);
            }
            observable.destroyEvent(self.id);
            if (self.dataObj && self.dataObj['$$mo']) {
                if (self.dataObj['$$mo'][self.origExpr] === self) {
                    delete self.dataObj['$$mo'][self.origExpr];
                }
            }
            for (var key in self) {
                if (self.hasOwnProperty(key)) {
                    self[key] = null;
                }
            }
            return true;
        }
    });


    /**
     * Check data object for changes
     * @static
     * @method
     * @param {object} dataObj
     * @param {string} expr {
     *  Optional expression 
     *  @optional
     * }
     * @returns {bool|int} Either true|false for specific expression or number of changes
     */
    MutationObserver.check = function(dataObj, expr)  {
        var mo;
        if (expr) {
            mo = MutationObserver.exists(dataObj, expr);
            if (!mo) {
                throw new Error("MutationObserver not found for expression: " + expr);
            }
            return mo.check();
        }
        if (!dataObj.$$mo) {
            return false;
        }
        return dataObj.$$mo.$checkAll();
    };

    /**
     * See the constructor parameters
     * @static
     * @method
     */
    MutationObserver.get = function(dataObj, expr, listener, context, opt) {

        expr = expr.trim();
        var mo = MutationObserver.exists(dataObj, expr);

        if (mo) {
            if (listener) {
                mo.subscribe(listener, context);
            }
            return mo;
        }

        return new MutationObserver(dataObj, expr, listener, context, opt);
    };

    /**
     * Check if mutation observer exists on the object and return it or false
     * @static
     * @method
     * @param {object} dataObj
     * @param {string} expr
     * @returns {MetaphorJs.lib.MutationObserver|boolean}
     */
    MutationObserver.exists = function(dataObj, expr) {
        expr = expr.trim();

        if (dataObj && dataObj.$$mo && dataObj.$$mo[expr]) {
            return dataObj.$$mo[expr];
        }

        return false;
    };

    /**
     * Destroy an observer
     * @static
     * @method
     * @param {object} dataObj
     * @param {string|null} expr If null, destroy all observers on this object
     * @param {boolean} ifUnobserved Destroy only if unobserved
     */
    MutationObserver.$destroy = function(dataObj, expr, ifUnobserved) {

        var key, all = true;

        if (dataObj && dataObj.$$mo) {
            for (key in dataObj.$$mo) {
                if (dataObj.$$mo.hasOwnProperty(key) && 
                    (!expr || key === expr) &&
                    key[0] !== '$') {
                    if (dataObj.$$mo[key].$destroy(ifUnobserved)) {
                        delete dataObj.$$mo[key];
                    }
                    else all = false;
                }
            }

            if (all) {
                delete dataObj.$$mo;
            }
        }
    }

    return MutationObserver;

}());






/**
 * The scope object is what templates see while rendering
 * @class MetaphorJs.lib.Scope
 */
/**
 * @method Scope
 * @constructor
 * @param {object} cfg Whatever data should be visible in template
 */
MetaphorJs.lib.Scope = function(cfg) {
    var self    = this;

    self.$$observable    = new lib_Observable;
    self.$$historyWatchers  = {};
    extend(self, cfg, true, false);

    if (self.$parent) {
        /**
         * @event check
         * @param {array} changes 
         */
        self.$parent.$on("check", self.$$onParentCheck, self);
        /**
         * @event changed
         */
        /**
         * @event destroy
         */
        self.$parent.$on("destroy", self.$$onParentDestroy, self);
        /**
         * @event freeze
         * @param {MetaphorJs.lib.Scope}
         */
        self.$parent.$on("freeze", self.$freeze, self);
        /**
         * @event unfreeze
         * @param {MetaphorJs.lib.Scope}
         */
        self.$parent.$on("unfreeze", self.$unfreeze, self);
    }
    else {
        self.$root  = self;
        self.$isRoot= true;
    }
};

extend(MetaphorJs.lib.Scope.prototype, {

    /**
     * @property {MetaphorJs.app.App}
     */
    $app: null,

    /**
     * @property {MetaphorJs.lib.Scope}
     */
    $parent: null,

    /**
     * @property {MetaphorJs.lib.Scope}
     */
    $root: null,

    /**
     * @property {boolean}
     */
    $isRoot: false,

    /**
     * @property {int}
     */
    $level: 0,

    $static: false,
    $$frozen: false,
    $$observable: null,
    $$watchers: null,
    $$historyWatchers: null,
    $$checking: false,
    $$destroyed: false,
    $$changing: false,

    $$tmt: null,

    /**
     * Create child scope
     * @method
     * @param {object} data Child scope data
     * @returns {MetaphorJs.lib.Scope}
     */
    $new: function(data) {
        var self = this;
        return new MetaphorJs.lib.Scope(extend({}, data, {
            $parent: self,
            $root: self.$root,
            $app: self.$app,
            $level: self.$level + 1,
            $static: self.$static
        }, true, false));
    },

    /**
     * Create child scope with no relation to this scope (no $parent)
     * but with $app propery set.
     * @method
     * @param {object} data Child scope data
     * @returns {MetaphorJs.lib.Scope}
     */
    $newIsolated: function(data) {
        return new MetaphorJs.lib.Scope(extend({}, data, {
            $app: this.$app,
            $level: self.$level + 1,
            $static: this.$static
        }, true, false));
    },

    /**
     * Freeze the scope. It will not perfom checks and trigger change events
     * @method
     */
    $freeze: function() {
        var self = this;
        if (!self.$$frozen) {
            self.$$frozen = true;
            self.$$observable.trigger("freeze", self);
        }
    },

    /**
     * Unfreeze scope. Resume checking for changes
     * @method
     */
    $unfreeze: function() {
        var self = this;
        if (self.$$frozen) {
            self.$$frozen = false;
            self.$$observable.trigger("unfreeze", self);
        }
    },

    /**
     * Subsrcibe to scope events
     * @method 
     * @param {string} event
     * @param {function} fn
     * @param {object} fnScope 
     */
    $on: function(event, fn, fnScope) {
        return this.$$observable.on(event, fn, fnScope);
    },

    /**
     * Unsubsrcibe from scope events
     * @method 
     * @param {string} event
     * @param {function} fn
     * @param {object} fnScope 
     */
    $un: function(event, fn, fnScope) {
        return this.$$observable.un(event, fn, fnScope);
    },

    /**
     * Create a function out of an expression and bind it to the scope
     * @method
     * @param {string} expr 
     * @param {object} opt See lib_Expression.parse
     * @returns {function}
     */
    $parseExpression: function(expr, opt) {
        var self = this,
            func = lib_Expression.parse(expr, opt);
        return function(inputVal) {
            return func(self, inputVal);
        }
    },

    /**
     * Create a watcher on js expression
     * @method
     * @param {string} expr js expression
     * @param {function} fn {
     *  @param {*} value
     * }
     * @param {object} fnScope
     * @returns {lib_MutationObserver}
     */
    $watch: function(expr, fn, fnScope) {
        return lib_MutationObserver.get(this, expr, fn, fnScope);
    },

    /**
     * Stop watching js expression
     * @method
     * @param {string} expr js expression
     * @param {function} fn 
     * @param {object} fnScope
     */
    $unwatch: function(expr, fn, fnScope) {
        var mo = lib_MutationObserver.exists(this, expr);
        if (mo) {
            mo.unsubscribe(fn, fnScope);
            mo.$destroy(true);
        }
    },

    /**
     * Watch changes in page url. Triggers regular change event
     * @method
     * @param {string} prop Scope property name
     * @param {string} param Url param name
     */
    $watchHistory: function(prop, param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            self.$$historyWatchers[param] = prop;
            MetaphorJs.lib.History.on("change-" + param, self.$$onHistoryChange, self);
        }
    },

    /**
     * Stop watching changes in page url.
     * @method
     * @param {string} param Url param name
     */
    $unwatchHistory: function(param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            delete self.$$historyWatchers[param];
            MetaphorJs.lib.History.un("change-" + param, self.$$onHistoryChange, self);
        }
    },


    /**
     * Set scope value and check for changes.
     * @method
     * @param {string} key
     * @param {*} value
     */
     /**
     * Set scope value and check for changes.
     * @method
     * @param {object} obj Key:value pairs
     */
    $set: function(key, value) {
        var self = this;
        if (typeof key === "string") {
            this[key] = value;
        }
        else {
            for (var k in key) {
                self[k] = key[k];
            }
        }
        this.$check();
    },

    $$onParentDestroy: function() {
        this.$destroy();
    },

    $$onParentCheck: function() {
        this.$check();
    },

    $$onHistoryChange: function(val, prev, name) {
        var self = this,
            prop;
        if (self.$$historyWatchers[name]) {
            prop = self.$$historyWatchers[name];
            self[prop] = val;
            self.$check();
        }
    },

    /**
     * Schedule a delayed check
     * @method
     * @param {int} timeout
     */
    $scheduleCheck: function(timeout) {
        var self = this;
        if (!self.$$tmt) {
            self.$tmt = async(self.$check, self, null, timeout);
        }
    },

    /**
     * Check for changes and trigger change events.<br>
     * If changes are found, the check will run again
     * until no changes is found.
     * @method
     */
    $check: function() {
        var self = this,
            changes;

        if (self.$$checking || self.$static || self.$$frozen) {
            return;
        }
        self.$$checking = true;

        if (self.$$tmt) {
            clearTimeout(self.$$tmt);
            self.$$tmt = null;
        }

        if (self.$$mo) {
            changes = self.$$mo.$checkAll();
        }

        self.$$checking = false;

        if (!self.$$destroyed) {
            self.$$observable.trigger("check", changes);
        }

        if (changes > 0) {
            self.$$changing = true;
            self.$check();
        }
        else {
            // finished changing after all iterations
            if (self.$$changing) {
                self.$$changing = false;
                self.$$observable.trigger("changed");
            }
        }
    },

    /**
     * Destroy scope
     * @method
     */
    $destroy: function() {

        var self    = this,
            param, i;

        if (self.$$destroyed) {
            return;
        }

        self.$$destroyed = true;
        self.$$observable.trigger("destroy");
        self.$$observable.$destroy();

        if (self.$parent && self.$parent.$un) {
            self.$parent.$un("check", self.$$onParentCheck, self);
            self.$parent.$un("destroy", self.$$onParentDestroy, self);
            self.$parent.$un("freeze", self.$freeze, self);
            self.$parent.$un("unfreeze", self.$unfreeze, self);
        }

        if (self.$$mo) {
            lib_MutationObserver.$destroy(self);
        }

        for (param in self.$$historyWatchers) {
            self.$unwatchHistory(param);
        }

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }

        self.$$destroyed = true;
    }

}, true, false);


var lib_Scope = MetaphorJs.lib.Scope;



/**
 * Checks if given value is a thenable (a Promise)
 * @function isThenable
 * @param {*} any
 * @returns {boolean|function}
 */
function isThenable(any) {

    // any.then must only be accessed once
    // this is a promise/a+ requirement

    if (!any) { //  || !any.then
        return false;
    }
    
    var t;

    //if (!any || (!isObject(any) && !isFunction(any))) {
    if (((t = typeof any) != "object" && t != "function")) {
        return false;
    }

    var then = any.then;

    return isFunction(then) ? then : false;
};




var lib_Promise = MetaphorJs.lib.Promise = function(){

    var PENDING     = 0,
        FULFILLED   = 1,
        REJECTED    = 2,
        CANCELLED   = 3,

        queue       = [],
        qRunning    = false,

        nextTick    = typeof process !== strUndef ?
                        process.nextTick :
                        function(fn) {
                            setTimeout(fn, 0);
                        },

        // synchronous queue of asynchronous functions:
        // callbacks must be called in "platform stack"
        // which means setTimeout/nextTick;
        // also, they must be called in a strict order.
        nextInQueue = function() {
            qRunning    = true;
            var next    = queue.shift();
            nextTick(function(){
                next[0].apply(next[1], next[2]);
                if (queue.length) {
                    nextInQueue();
                }
                else {
                    qRunning = false;
                }
            }, 0);
        },

        /**
         * add to execution queue
         * @function
         * @param {Function} fn
         * @param {Object} scope
         * @param {[]} args
         * @ignore
         */
        next        = function(fn, scope, args) {
            args = args || [];
            queue.push([fn, scope, args]);
            if (!qRunning) {
                nextInQueue();
            }
        },

        /**
         * returns function which receives value from previous promise
         * and tries to resolve next promise with new value returned from given function(prev value)
         * or reject on error.
         * promise1.then(success, failure) -> promise2
         * wrapper(success, promise2) -> fn
         * fn(promise1 resolve value) -> new value
         * promise2.resolve(new value)
         *
         * @function
         * @param {Function} fn
         * @param {Promise} promise
         * @returns {Function}
         * @ignore
         */
        resolveWrapper     = function(fn, promise) {
            return function(value) {
                try {
                    promise.resolve(fn(value));
                }
                catch (thrownError) {
                    promise.reject(thrownError);
                }
            };
        };


    /**
     * @class MetaphorJs.lib.Promise
     */

    /**
     * @constructor 
     * @method Promise
     * @param {Function} fn {
     *  @description Constructor accepts two parameters: resolve and reject functions.
     *  @param {function} resolve {
     *      @param {*} value
     *  }
     *  @param {function} reject {
     *      @param {*} reason
     *  }
     * }
     * @param {Object} context
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @param {Thenable} thenable
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @param {*} value Value to resolve promise with
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @returns {Promise}
     */
    var Promise = function(fn, context) {

        if (fn instanceof Promise) {
            return fn;
        }

        if (!(this instanceof Promise)) {
            return new Promise(fn, context);
        }

        var self = this,
            then;

        self._fulfills   = [];
        self._rejects    = [];
        self._dones      = [];
        self._fails      = [];

        if (arguments.length > 0) {

            if (then = isThenable(fn)) {
                if (fn instanceof Promise) {
                    fn.then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
                else {
                    (new Promise(then, fn)).then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
            }
            else if (isFunction(fn)) {
                try {
                    fn.call(context,
                            bind(self.resolve, self),
                            bind(self.reject, self));
                }
                catch (thrownError) {
                    self.reject(thrownError);
                }
            }
            else {
                self.resolve(fn);
            }
        }
    };

    extend(Promise.prototype, {

        _state: PENDING,

        _fulfills: null,
        _rejects: null,
        _dones: null,
        _fails: null,

        _wait: 0,

        _value: null,
        _reason: null,

        _triggered: false,

        /**
         * Is promise still pending (as opposed to resolved or rejected)
         * @method
         * @returns {boolean}
         */
        isPending: function() {
            return this._state === PENDING;
        },

        /**
         * Is the promise fulfilled. Same as isResolved()
         * @method
         * @returns {boolean}
         */
        isFulfilled: function() {
            return this._state === FULFILLED;
        },

        /**
         * Is the promise resolved. Same as isFulfilled()
         * @method
         * @returns {boolean}
         */
        isResolved: function() {
            return this._state === FULFILLED;
        },

        /**
         * Is the promise rejected
         * @method
         * @returns {boolean}
         */
        isRejected: function() {
            return this._state === REJECTED;
        },

        /**
         * Is the promise was destroyed before resolving or rejecting
         * @method
         * @returns {boolean}
         */
        isCancelled: function() {
            return this._state === CANCELLED;
        },

        /**
         * Did someone subscribed to this promise
         * @method
         * @returns {boolean}
         */
        hasListeners: function() {
            var self = this,
                ls  = [self._fulfills, self._rejects, self._dones, self._fails],
                i, l;

            for (i = 0, l = ls.length; i < l; i++) {
                if (ls[i] && ls[i].length) {
                    return true;
                }
            }

            return false;
        },

        _cleanup: function() {
            var self    = this;

            self._fulfills = null;
            self._rejects = null;
            self._dones = null;
            self._fails = null;
        },

        _processValue: function(value, cb, allowThenanle) {

            var self    = this,
                then;

            if (self._state !== PENDING) {
                return;
            }

            if (value === self) {
                self._doReject(new TypeError("cannot resolve promise with itself"));
                return;
            }

            if (allowThenanle) {
                try {
                    if (then = isThenable(value)) {
                        if (value instanceof Promise) {
                            value.then(
                                bind(self._processResolveValue, self),
                                bind(self._processRejectReason, self)
                            );
                        }
                        else {
                            (new Promise(then, value)).then(
                                bind(self._processResolveValue, self),
                                bind(self._processRejectReason, self)
                            );
                        }
                        return;
                    }
                }
                catch (thrownError) {
                    if (self._state === PENDING) {
                        self._doReject(thrownError);
                    }
                    return;
                }
            }

            cb.call(self, value);
        },


        _callResolveHandlers: function() {

            var self    = this;

            self._done();

            var cbs  = self._fulfills,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._value]);
            }

            self._cleanup();
        },


        _doResolve: function(value) {
            var self    = this;

            self._value = value;
            self._state = FULFILLED;

            if (self._wait === 0) {
                self._callResolveHandlers();
            }
        },

        _processResolveValue: function(value) {
            this._processValue(value, this._doResolve, true);
        },

        /**
         * Resolve the promise
         * @method
         * @param {*} value
         */
        resolve: function(value) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;
            self._processResolveValue(value);

            return self;
        },


        _callRejectHandlers: function() {

            var self    = this;

            self._fail();

            var cbs  = self._rejects,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._reason]);
            }

            self._cleanup();
        },

        _doReject: function(reason) {

            var self        = this;

            self._state     = REJECTED;
            self._reason    = reason;

            if (self._wait === 0) {
                self._callRejectHandlers();
            }
        },


        _processRejectReason: function(reason) {
            this._processValue(reason, this._doReject, false);
        },

        /**
         * Reject the promise
         * @method
         * @param {*} reason
         */
        reject: function(reason) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;

            self._processRejectReason(reason);

            return self;
        },

        /**
         * @method
         * @async
         * @param {Function} resolve -- called when this promise is resolved; 
         *  returns new resolve value or promise
         * @param {Function} reject -- called when this promise is rejected; 
         *  returns new reject reason
         * @param {object} context -- resolve's and reject's functions "this" object
         * @returns {Promise} new promise
         */
        then: function(resolve, reject, context) {

            var self            = this,
                promise         = new Promise,
                state           = self._state;

            if (context) {
                if (resolve) {
                    resolve = bind(resolve, context);
                }
                if (reject) {
                    reject = bind(reject, context);
                }
            }

            if (state === PENDING || self._wait !== 0) {

                if (resolve && isFunction(resolve)) {
                    self._fulfills.push([resolveWrapper(resolve, promise), null]);
                }
                else {
                    self._fulfills.push([promise.resolve, promise])
                }

                if (reject && isFunction(reject)) {
                    self._rejects.push([resolveWrapper(reject, promise), null]);
                }
                else {
                    self._rejects.push([promise.reject, promise]);
                }
            }
            else if (state === FULFILLED) {

                if (resolve && isFunction(resolve)) {
                    next(resolveWrapper(resolve, promise), null, [self._value]);
                }
                else {
                    promise.resolve(self._value);
                }
            }
            else if (state === REJECTED) {
                if (reject && isFunction(reject)) {
                    next(resolveWrapper(reject, promise), null, [self._reason]);
                }
                else {
                    promise.reject(self._reason);
                }
            }

            return promise;
        },

        /**
         * Add reject listener.
         * @method
         * @async
         * @param {Function} reject -- same as then(null, reject)
         * @returns {Promise} new promise
         */
        "catch": function(reject) {
            return this.then(null, reject);
        },

        _done: function() {

            var self    = this,
                cbs     = self._dones,
                cb;

            while (cb = cbs.shift()) {
                try {
                    cb[0].call(cb[1] || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
        },

        /**
         * Add resolve listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise is resolved
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        done: function(fn, context) {
            var self    = this,
                state   = self._state;

            if (state === FULFILLED && self._wait === 0) {
                try {
                    fn.call(context || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state === PENDING) {
                self._dones.push([fn, context]);
            }

            return self;
        },

        _fail: function() {

            var self    = this,
                cbs     = self._fails,
                cb;

            while (cb = cbs.shift()) {
                try {
                    cb[0].call(cb[1] || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
        },

        /**
         * Add reject listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise is rejected.
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        fail: function(fn, context) {

            var self    = this,
                state   = self._state;

            if (state === REJECTED && self._wait === 0) {
                try {
                    fn.call(context || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state === PENDING) {
                self._fails.push([fn, context]);
            }

            return self;
        },

        /**
         * Add both resolve and reject listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise resolved or rejected
         * @param {Object} context -- function's "this" object
         * @return {Promise} same promise
         */
        always: function(fn, context) {
            this.done(fn, context);
            this.fail(fn, context);
            return this;
        },

        /**
         * Get a thenable object
         * @method
         * @returns {object} then: function, done: function, fail: function, always: function
         */
        promise: function() {
            var self = this;
            return {
                then: bind(self.then, self),
                done: bind(self.done, self),
                fail: bind(self.fail, self),
                always: bind(self.always, self),
                "catch": bind(self['catch'], self)
            };
        },

        /**
         * Resolve this promise after <code>value</code> promise is resolved.
         * @method
         * @param {*|Promise} value
         * @returns {Promise} self
         */
        after: function(value) {

            var self = this;

            if (isThenable(value)) {

                self._wait++;

                var done = function() {
                    self._wait--;
                    if (self._wait === 0 && self._state !== PENDING) {
                        self._state === FULFILLED ?
                            self._callResolveHandlers() :
                            self._callRejectHandlers();
                    }
                };

                if (isFunction(value.done)) {
                    value.done(done);
                }
                else {
                    value.then(done);
                }
            }

            return self;
        },

        /**
         * Cancel and destroy current promise. No resolve or reject 
         * callbacks will be called. isCancelled() will return true.
         * @method
         */
        $destroy: function() {
            this._cleanup();
            this._state === PENDING && (this._state = CANCELLED);
        }
    }, true, false);


    /**
     * Call function <code>fn</code> with given args in given context
     * and use its return value as resolve value for a new promise.
     * Then return this promise.
     * @static
     * @method
     * @param {function} fn
     * @param {object} context
     * @param {[]} args
     * @returns {Promise}
     */
    Promise.fcall = function(fn, context, args) {
        return Promise.resolve(fn.apply(context, args || []));
    };

    /**
     * Create new promise and resolve it with given value
     * @static
     * @method
     * @param {*} value
     * @returns {Promise}
     */
    Promise.resolve = function(value) {
        var p = new Promise;
        p.resolve(value);
        return p;
    };


    /**
     * Create new promise and reject it with given reason
     * @static
     * @method
     * @param {*} reason
     * @returns {Promise}
     */
    Promise.reject = function(reason) {
        var p = new Promise;
        p.reject(reason);
        return p;
    };


    /**
     * Take a list of promises or values and once all promises are resolved,
     * create a new promise and resolve it with a list of final values.<br>
     * If one of the promises is rejected, it will reject the returned promise.
     * @static
     * @method
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.all = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = new Array(len),
            cnt     = len,
            i,
            item,
            done    = function(value, inx) {
                values[inx] = value;
                cnt--;

                if (cnt === 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {

            (function(inx){
                item = promises[i];

                if (item instanceof Promise) {
                    item.done(function(value){
                        done(value, inx);
                    })
                        .fail(p.reject, p);
                }
                else if (isThenable(item) || isFunction(item)) {
                    (new Promise(item))
                        .done(function(value){
                            done(value, inx);
                        })
                        .fail(p.reject, p);
                }
                else {
                    done(item, inx);
                }
            })(i);
        }

        return p;
    };

    /**
     * Same as <code>all()</code> but it treats arguments as list of values.
     * @static
     * @method
     * @param {Promise|*} promise1
     * @param {Promise|*} promise2
     * @param {Promise|*} promiseN
     * @returns {Promise}
     */
    Promise.when = function() {
        return Promise.all(arguments);
    };

    /**
     * Same as <code>all()</code> but the resulting promise
     * will not be rejected if ones of the passed promises is rejected.
     * @static
     * @method
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.allResolved = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = [],
            cnt     = len,
            i,
            item,
            settle  = function(value) {
                values.push(value);
                proceed();
            },
            proceed = function() {
                cnt--;
                if (cnt === 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {
            item = promises[i];

            if (item instanceof Promise) {
                item.done(settle).fail(proceed);
            }
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(settle).fail(proceed);
            }
            else {
                settle(item);
            }
        }

        return p;
    };

    /**
     * Given the list of promises or values it will return a new promise
     * and resolve it with the first resolved value.
     * @static
     * @method
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.race = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p   = new Promise,
            len = promises.length,
            i,
            item;

        for (i = 0; i < len; i++) {
            item = promises[i];

            if (item instanceof Promise) {
                item.done(p.resolve, p).fail(p.reject, p);
            }
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(p.resolve, p).fail(p.reject, p);
            }
            else {
                p.resolve(item);
            }

            if (!p.isPending()) {
                break;
            }
        }

        return p;
    };

    /**
     * Takes a list of async functions and executes 
     * them in given order consequentially
     * @static
     * @method
     * @param {[]} functions -- array of promises or resolve values or functions
     * @returns {Promise}
     */
    Promise.waterfall = function(functions) {

        if (!functions.length) {
            return Promise.resolve(null);
        }

        var first   = functions.shift(),
            promise = isFunction(first) ? Promise.fcall(first) : Promise.resolve(fn),
            fn;

        while (fn = functions.shift()) {
            if (isThenable(fn)) {
                promise = promise.then(function(fn){
                    return function(){
                        return fn;
                    };
                }(fn));
            }
            else if (isFunction(fn)) {
                promise = promise.then(fn);
            }
            else {
                promise.resolve(fn);
            }
        }

        return promise;
    };

    /**
     * Works like Array.forEach but it expects passed function to 
     * return a Promise.
     * @static
     * @method 
     * @param {array} items 
     * @param {function} fn {
     *  @param {*} value
     *  @param {int} index
     *  @returns {Promise|*}
     * }
     * @param {object} context 
     * @param {boolean} allResolved if true, the resulting promise
     * will fail if one of the returned promises fails.
     */
    Promise.forEach = function(items, fn, context, allResolved) {

        var left = items.slice(),
            p = new Promise,
            values = [],
            i = 0;

        var next = function() {

            if (!left.length) {
                p.resolve(values);
                return;
            }

            var item = left.shift(),
                index = i;

            i++;

            Promise.fcall(fn, context, [item, index])
                .done(function(result){
                    values.push(result);
                    next();
                })
                .fail(function(reason){
                    if (allResolved) {
                        p.reject(reason);
                    }
                    else {
                        values.push(null);
                        next();
                    }
                });
        };

        next();

        return p;
    };

    /**
     * Returns a promise with additional <code>countdown</code>
     * method. Call this method <code>cnt</code> times and
     * the promise will get resolved.
     * @static
     * @method
     * @param {int} cnt 
     * @returns {Promise}
     */
    Promise.counter = function(cnt) {

        var promise     = new Promise;

        promise.countdown = function() {
            cnt--;
            if (cnt === 0) {
                promise.resolve();
            }
        };

        return promise;
    };

    return Promise;
}();









/**
 * Text renderer
 * @class MetaphorJs.lib.Text
 */
var lib_Text = MetaphorJs.lib.Text = (function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        events                  = new lib_Observable,

        _procExpr               = function(expr, scope, observers) {
            if (observers) {
                var w = lib_MutationObserver.get(scope, expr);
                observers.push(w);
                return w.getValue();
            }
            else {
                return lib_Expression.get(expr, scope);
            }
        },

        eachText                = function(text, fn) {

            var index       = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                expr,
                result      = "";

            while (index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) !== -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) !== -1) &&
                    text.substr(startIndex - 1, 1) !== '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex !== startIndex + startSymbolLength) {
                        expr = text.substring(startIndex + startSymbolLength, endIndex);
                        expr = expr.trim();
                        result += fn(expr);
                    }

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }

            return result;
        },

        render = function(text, scope, observers, recursive, fullExpr) {

            var result,
                prev = text,
                iter = 0;

            while (true) {
                if (iter > 100) {
                    throw new Error(
                        "Got more than 100 iterations on template: " + self.origin);
                }

                if (fullExpr) {
                    result = _procExpr(text, scope, observers);
                    fullExpr = false;
                }
                else {
                    result = eachText(prev, function(expr){
                        return _procExpr(expr, scope, observers);
                    });
                }
                
                if (!recursive || result === prev) {
                    return result;
                }

                prev = result;
                iter++;
            }
        };


    /**
     * @constructor
     * @method
     * @param {object} dataObj
     * @param {string} text 
     * @param {object} opt {
     *  @type {bool} recursive
     * }
     */
    var Text = function(scope, text, opt) {
        opt = opt || {};

        var self        = this;

        self.id         = nextUid();
        self.origin     = text;
        self.text       = "";
        self.scope      = scope;
        self.destroyed  = false;
        self.fullExpr   = false;
        self.recursive  = false;
        self.once       = false;

        if (opt.recursive === true || opt.recursive === false) {
            self.recursive = opt.recursive;
        }
        if (opt.fullExpr === true || opt.fullExpr === false) {
            self.fullExpr = opt.fullExpr;
        }
        if (opt.once === true || opt.once === false) {
            self.once = opt.once;
        }

        self._processDelegate = bind(self._process, self);
        self.observers  = [];

        self._process(true);
    };

    extend(Text.prototype, {

        _process: function(initial) {

            if (this.destroyed) {
                return;
            }

            var self = this,
                obs = self.observers.slice();

            self._observeData(obs, "unsubscribe");
            self.observers = [];

            self.text = render(self.origin, self.scope, 
                                self.observers, 
                                self.recursive, 
                                self.fullExpr);

            self._observeData(self.observers, "subscribe");
            self._destroyObservers(obs);

            if (!initial) {
                events.trigger(self.id, self);
            }
        },

        _onDataChange: function() {
            async(this._processDelegate);
        },

        _observeData: function(obs, mode) {
            var i, l,
                self = this;
            for (i = 0, l = obs.length; i < l; i++) {
                // subscribe/unsubscribe
                obs[i][mode](self._onDataChange, self);
            }
        },

        _destroyObservers: function(obs) {
            var i, l;
            for (i = 0, l = obs.length; i < l; i++) {
                obs[i].$destroy(true);
            }
        },

        /**
         * Get processed text
         * @method
         * @returns {string}
         */
        getString: function() {
            return this.text;
        },

        /**
         * Subscribe to changes in text
         * @param {function} fn 
         * @param {object} context 
         * @param {object} opt {
         *  lib_Observable.on() options
         * }
         */
        subscribe: function(fn, context, opt) {
            return events.on(this.id, fn, context, opt);
        },

        /**
         * Unsubscribe from changes in text
         * @param {function} fn 
         * @param {object} context 
         */
        unsubscribe: function(fn, context) {
            return events.un(this.id, fn, context);
        },

        /**
         * Used only in standalone mode. When part of an app, 
         * use scope.$check()
         * @method
         * @returns {int}
         */
        check: function() {
            return lib_MutationObserver.check(this.scope);
        },

        /**
         * Destroy text container
         * @method
         */
        $destroy: function() {
            var self = this;
            self.destroyed  = true;
            events.destroyEvent(self.id);
            self._observeData(self.observers, "unsubscribe");
            self._destroyObservers(self.observers);
        }
    });

    /**
     * Statically process text without subscribing to changes
     * @static
     * @method
     * @param {string} text Text template
     * @param {object} dataObj Data object (app.Scope) to read variables from
     * @param {array|null} observers {
     *  Pass empty array 
     *  @type {lib_MutationObserver} observer
     * }
     * @param {bool} recursive Recursively process text template
     * @returns {string}
     */
    Text.render = render;

    /**
     * @static
     * @method
     * @param {string} text Text template
     * @param {function} fn {
     *  @param {string} expression
     *  @returns {string} replacement
     * }
     * @returns {string} processed template
     */
    Text.eachText = eachText;

    /**
     * Does the text have expressions
     * @static
     * @method
     * @param {string} text
     * @returns {boolean}
     */
    Text.applicable = function(text) {
        return !text || !text.indexOf ||
                text.indexOf(startSymbol) === -1 ? false : true;
    };

    return Text;
}());



MetaphorJs.dom = MetaphorJs.dom || {};





var dom_setAttr = MetaphorJs.dom.setAttr = function(el, name, value) {
    return el.setAttribute(name, value);
};



var dom_commentWrap = MetaphorJs.dom.commentWrap = function commentWrap(node, name) {
    name = name || "";

    var before = window.document.createComment(name + " - start"),
        after = window.document.createComment(name + " - end"),
        parent = node.parentNode;

    parent.insertBefore(before, node);

    if (node.nextSibling) {
        parent.insertBefore(after, node.nextSibling);
    }
    else {
        parent.appendChild(after);
    }

    return [before, after];
};

/**
 * Converts given value to boolean. <br>
 * false: "", 0, false, undefined, null, "false", "no", "0"<br>
 * true: everything else
 * @function toBool
 * @param {*} val 
 * @returns {boolean}
 */
function toBool(val) {
    if (!val) { // real false, empty string, null, zero
        return false;
    }
    if (typeof val === "string") {
        val = val.toLowerCase();
        if (val === "false" || val === "no" || val === '0') {
            return false;
        }
    }
    return true;
};



/**
 * Check if given value is a primitive (string, number, boolean)
 * @function isPrimitive
 * @param {*} value 
 * @returns {boolean}
 */
function isPrimitive(value) {
    var vt = _varType(value);
    return vt < 3 && vt > -1;
};






/**
 * @class MetaphorJs.lib.Config
 */
var lib_Config = MetaphorJs.lib.Config = (function(){

    var $$observable = new lib_Observable;

    var MODE_STATIC = 1,
        MODE_DYNAMIC = 2,
        MODE_SINGLE = 3,
        MODE_GETTER = 4,
        MODE_SETTER = 5,
        MODE_FUNC = 6,
        MODE_FNSET = 7,
        MODE_LISTENER = 8;

    /**
     * @constructor
     * @method
     * @param {object} properties Attribute expressions/properties map
     * @param {object} cfg {
     *  @type {object} scope Data object
     *  @type {object} setTo set all values to this object
     * }
     */
    var Config = function(properties, cfg) {

        var self = this,
            k;

        self.id = nextUid();
        self.values = {};
        self.properties = {};
        self.cfg = cfg || {};
        self.keys = [];

        if (properties) {
            for (k in properties) {
                self.setProperty(
                    k, 
                    isPrimitive(properties[k]) ? 
                        {expression: properties[k]}:
                        properties[k]
                );
            }
        }
    };

    extend(Config.prototype, {

        id: null,
        properties: null,
        values: null,
        keys: null,
        cfg: null,

        _initMo: function(name) {
            var self = this,
                prop = self.properties[name];
            prop.mo = lib_MutationObserver.get(
                prop.scope || self.cfg.scope, 
                prop.expression
            );
            prop.mo.subscribe(self._onPropMutated, self, {
                append: [name]
            });
        }, 

        _unsetMo: function(name) {
            var self = this, prop = self.properties[name];
            if (prop.mo) {
                prop.mo.unsubscribe(self._onPropMutated, self);
                prop.mo.$destroy(true);
                prop.mo = null;
            }
        },

        _calcProperty: function(name) {

            var self = this,
                prop = self.getProperty(name),
                value,
                setTo;

            if (!prop || prop.disabled) {
                return null;
            }

            if (prop.expression) {

                if (!prop.mode) {
                    prop.mode = self.cfg.defaultMode || MODE_DYNAMIC;
                }

                if (prop.mode === MODE_STATIC) {
                    value = prop.expression;
                }
                else if (prop.mode === MODE_SINGLE) {
                    value = lib_Expression.get(
                        prop.expression, 
                        self.cfg.scope
                    );
                }
                else if (prop.mode === MODE_DYNAMIC) {
                    !prop.mo && self._initMo(name);
                    value = prop.mo.getValue();
                }
                else if (prop.mode === MODE_GETTER || 
                         prop.mode === MODE_SETTER) {
                    value = lib_Expression.parse(
                        prop.expression,
                        {
                            setter: prop.mode === MODE_SETTER,
                            setterOnly: prop.mode === MODE_SETTER,
                            getterOnly: prop.mode === MODE_GETTER
                        }
                    );
                }
                else if (prop.mode === MODE_FNSET) {
                    value = {
                        getter: lib_Expression.getter(prop.expression),
                        setter: lib_Expression.setter(prop.expression)
                    };
                }
                else if (prop.mode === MODE_FUNC) {
                    value = lib_Expression.func(prop.expression);
                }
                else if (prop.mode === MODE_LISTENER) {
                    if (prop.expression.indexOf('(') === -1 && 
                        prop.expression.indexOf('=') === -1) {
                        value = lib_Expression.get(
                            prop.expression, 
                            self.cfg.scope
                        );
                    }
                    else {
                        value = lib_Expression.func(prop.expression);
                    }
                }
            }

            if (value === undf) {
                value = prop.defaultValue;
            }

            value = self._prepareValue(value, prop);
            self.values[name] = value;

            setTo = self.cfg.setTo || prop.setTo;
            if (setTo) {
                setTo[name] = value;
            }

            return value;
        },


        _prepareValue: function(value, prop) {

            if (!prop.type) {
                return value;
            }

            if (value === true && 
                prop.type !== "bool" && 
                prop.type !== "boolean" && 
                prop.defaultValue) {
                value = prop.defaultValue;
            }

            switch (prop.type) {
                case 'int':
                    return parseInt(value);
                case 'float':
                case 'number':
                    return parseFloat(value);
                case 'bool':
                case 'boolean':
                    return toBool(value);
                case 'array':
                case 'list':
                    return !isArray(value) ? [value] : value;
                case 'string':
                case 'str':
                    return "" + value;
            }

            return value;
        },

        _onPropMutated: function(val, prev, name) {

            var self = this,
                prop = self.properties[name],
                setTo = prop.setTo || self.cfg.setTo,
                value;

            value = self._prepareValue(val, prop);

            self.values[name] = value;
            if (setTo) {
                setTo[name] = value;
            }

            $$observable.trigger(this.id, name, value, prev);
            $$observable.trigger(this.id +'-'+ name, value, prev);
        },

        /**
         * Set Config's option
         * @method
         * @param {string} name 
         * @param {*} value 
         */
        setOption: function(name, value) {
            this.cfg[name] = value;
        },

        /**
         * Get config's option
         * @param {string} name 
         * @returns {*}
         */
        getOption: function(name) {
            return this.cfg[name];
        },

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {object} cfg {
         *  @type {string} type int|float|array|bool|string
         *  @type {object} setTo
         *  @type {boolean} disabled
         *  @type {*} defaultValue
         *  @type {int} defaultMode
         *  @type {int} mode 1: static, 2: dynamic, 3: single run
         * }
         */

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {string} cfg 
         * @param {*} val 
         */
        setProperty: function(name, cfg, val) {

            var self = this,
                props = self.properties,
                prop,
                changed = false,
                value;

            if (!props[name]) {
                props[name] = {};
                self.keys.push(name);
                changed = true;
            }

            prop = props[name];

            if (val === undf) {
                var k;
                for (k in cfg) {
                    if (k === "value") {
                        value = cfg[k];
                        continue;
                    }
                    if (cfg[k] !== prop[k]) {
                        changed = true;
                        prop[k] = cfg[k];
                    }
                }
            }
            else {
                if (cfg === "value") {
                    value = val;
                }
                else if (val !== prop[cfg]) {
                    changed = true;
                    prop[cfg] = val;
                }
            }

            if (!prop.mode) {
                if (prop.defaultMode) {
                    prop.mode = prop.defaultMode;
                    changed = true;
                }
                else if (prop.expression === true) {
                    prop.mode = MODE_STATIC;
                    changed = true;
                }
                else if (self.cfg.defaultMode) {
                    prop.mode = self.cfg.defaultMode;
                    changed = true;
                }
            }

            if (prop.mode === MODE_DYNAMIC && 
                prop.expression && 
                !prop.mo && 
                !prop.disabled) {
                self._initMo(name);
                changed = true;
            }

            if (value !== undf) {
                self.values[name] = value;
            }
            else if (changed && self.values[name] !== undf) {
                delete self.values[name];
            }

            return changed;
        },

        /**
         * Get property config
         * @method
         * @param {string} name 
         * @returns {object}
         */
        getProperty: function(name) {
            return this.properties[name] || null;
        },

        /**
         * Create prop definition copy (without mutation observer)
         * @param {string} name 
         */
        copyProperty: function(name) {
            var prop = this.properties[name],
                cp;

            if (prop) {
                cp = extend({}, prop, false, false);
                cp.scope = cp.scope || this.cfg.scope;
                delete cp['mo'];
                return cp;
            }
            else return null;
        },

        /**
         * Get property mode (or null, if not defined)
         * @method
         * @param {string} name 
         * @returns {int|null}
         */
        getMode: function(name) {
            var prop = this.getProperty(name);
            return prop ? prop.mode || null : null;
        },

        /**
         * Get property expression
         * @method
         * @param {string} name 
         */
        getExpression: function(name) {
            var prop = this.getProperty(name);
            return prop ? (prop.expression || null) : null;
        },

        /**
         * Get all config values
         * @method
         * @returns {object}
         */
        getAll: function() {
            var self = this, k, vs = {};
            for (k in self.properties) {
                if (self.values[k] === undf) {
                    vs[k] = self._calcProperty(k);
                }
                else vs[k] = self.values[k];
            }
            return vs;
        },

        /**
         * Iterate over properties
         * @method
         * @param {function} fn {
         *  @param {string} key
         *  @param {object} property
         *  @param {MetaphorJs.lib.Config} self
         * } 
         * @param {object} context 
         */
        eachProperty: function(fn, context) {
            var k, self = this;
            for (k in self.properties) {
                fn.call(context, k, self.properties[k], self);
            }
        },

        /**
         * Does this config has a property
         * @method
         * @param {string} name 
         * @returns {bool}
         */
        hasProperty: function(name) {
            return !!this.properties[name];
        },

        /**
         * Does this config has a property with expression
         * @method
         * @param {string} name 
         * @returns {bool}
         */
        hasExpression: function(name) {
            return !!(this.properties[name] && this.properties[name].expression);
        },

        /**
         * Does this config has an expression to calc value or 
         * already calculated value or default value
         * @method
         * @param {string} name 
         * @returns {boolean}
         */
        has: function(name) {
            var self = this;
            return self.values[name] !== undf || (
                self.properties[name] && 
                (self.properties[name].defaultValue !== undf ||
                 self.properties[name].expression !== undf)
            );
        },

        _toggleProperty: function(name, val) {
            var self = this,
                prop = self.properties[name],
                prev = prop ? prop.disabled || false : false;

            if (!prop) {
                prop = self.setProperty(name, {
                    disabled: val
                });
            }
            else if (prev !== val) {
                prop.mode === MODE_DYNAMIC && self[!val ? "_initMo" : "_unsetMo"](name);
                prop.disabled = val;
            }
        },

        /**
         * Disable MutationObserver on a property
         * @method
         * @param {string} name 
         */
        disableProperty: function(name) {
            this._toggleProperty(name, true);
        },

        /**
         * Enable MutationObserver on a property
         * @method
         * @param {string} name 
         */
        enableProperty: function(name) {
            this._toggleProperty(name, false);
        },

        /**
         * Remove config property and its value
         * @param {string} name 
         */
        removeProperty: function(name) {
            if (this.properties[name]) {
                this._toggleProperty(name, true);
                delete this.properties[name];
                delete this.values[name];
                var inx = this.keys.indexOf(name);
                if (inx !== -1) {
                    this.keys.splice(inx, 1);
                }
            }
        },

        /**
         * Set property mode
         * @method
         * @param {string} name 
         * @param {int} mode 
         */
        setMode: function(name, mode) {
            this.setProperty(name, "mode", mode);
        },

        /**
         * Set property type
         * @method
         * @param {string} name 
         * @param {string} type 
         * @param {int} defaultMode {
         *  @optional
         * }
         * @param {*} defaultValue {
         *  @optional
         * }
         */
        setType: function(name, type, defaultMode, defaultValue) {
            if (type) {
                this.setProperty(name, "type", type);
            }
            if (defaultMode) {
                this.setProperty(name, "defaultMode", defaultMode);
            }
            if (defaultValue !== undf) {
                this.setProperty(name, "defaultValue", defaultValue);
            }
        },

        /**
         * Set default mode
         * @method
         * @param {string} name 
         * @param {int} mode 
         */
        setDefaultMode: function(name, mode) {
            this.setProperty(name, "defaultMode", mode);
        },

        /**
         * Set default value
         * @method
         * @param {string} name 
         * @param {*} val 
         */
        setDefaultValue: function(name, val) {
            this.setProperty(name, "defaultValue", val);
        },

        /**
         * Force property to static mode with given value
         * @param {string} name 
         * @param {*} val 
         */
        set: function(name, val) {
            var self = this;
            if (self.properties[name]) {
                var prev = self.values[val];
                self.setMode(name, MODE_STATIC);
                self.values[name] = val;
                if (prev != val) {
                    $$observable.trigger(self.id, name, val, prev);
                    $$observable.trigger(self.id +'-'+ name, val, prev) ;
                }
            }
        },

        /**
         * Get property keys
         * @method
         * @returns {array}
         */
        getKeys: function() {
            return this.keys;
        },

        /**
         * Get all keys starting with "value"
         * @method
         */
        getAllValues: function() {
            var self = this,
                i, l, k, name,
                vs = {};

            for (i = 0, l = self.keys.length; i < l; i++) {
                k = self.keys[i];
                if (k === "value") {
                    name = "";
                }
                else if (k.indexOf("value.") === 0) {
                    name = k.replace("value.", "");
                }
                else continue;
                vs[name] = self.get(k);
            }

            return vs;
        },

        /**
         * Get property value
         * @method
         * @param {string} name 
         * @returns {*}
         */
        get: function(name) {
            if (this.values[name] === undf) {
                this._calcProperty(name);
            }
            return this.values[name];
        },

        /**
         * @method on
         * @param {string} name 
         * @param {function} fn {
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt lib_Observable.on() options
         */

         /**
         * @method on
         * @param {function} fn {
         *  @param {string} name
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt lib_Observable.on() options
         */
        on: function(name, fn, context, opt) {
            if (typeof name === "string") {
                $$observable.on(this.id +'-'+ name, fn, context, opt);
            }
            else {
                $$observable.on(this.id, name, fn, context);
            }
        },

        /**
         * @method un
         * @param {string} name 
         * @param {function} fn
         * @param {object} context 
         */

         /**
         * @method un
         * @param {function} fn 
         * @param {object} context 
         */
        un: function(name, fn, context) {
            if (typeof name === "string") {
                $$observable.on(this.id +'-'+ name, fn, context);
            }
            else {
                $$observable.on(this.id, name, fn);
            }
        },

        /**
         * Set property values to this object
         * @method
         * @param {object} obj 
         */
        setTo: function(obj) {
            this.cfg.setTo = obj;
        },

        /**
         * Import properties and values from another config
         * @method
         * @param {MetaphorJs.lib.Config} config 
         */
        importConfig: function(config, overwrite) {
            var name,
                ps = this.properties,
                vs = this.values;

            for (name in config.properties) {
                if (config.properties.hasOwnProperty(name)) {

                    if (ps[name] && !overwrite) {
                        continue;
                    }
                    ps[name] = extend({}, config.properties[name]);
                    vs[name] = config.values[name];
                }
            }
        },

        /**
         * Create a new config with given properties
         * @method
         * @param {array} props
         * @param {object} cfg override new config cfg with these values
         * @returns MetaphorJs.lib.Config
         */
        slice: function(props, overrideCfg) {
            var map = {}, self = this, 
                name, i, l,
                values = {},
                existing = self.properties;
            for (i = 0, l = props.length; i < l; i++) {
                name = props[i];
                if (existing[name]) {
                    map[name] = extend({}, existing[name], false, false);
                    values[name] = self.values[name];
                    delete map[name].mo;
                }
            }
            var newCfg = new Config(
                map,
                extend({}, self.cfg, overrideCfg, true, false)
            );
            newCfg.values = values;
            return newCfg;
        },

        /**
         * Check for changes of specific property
         * @method
         * @param {string} name 
         * @returns {bool}
         */

        /**
         * Check for changes
         * @method
         * @returns {int} number of changed properties
         */
        check: function(name) {
            var self = this,
                keys = name ? [name] : self.keys,
                i, l, key, prop,
                res = name ? 0 : false;
            
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                prop = self.properties[key];
                if (prop.mo) {
                    if (name) {
                        return prop.mo.check();
                    }
                    res += prop.mo.check() ? 1 : 0;
                }
            }

            return res;
        },

        /**
         * Check scope based on property opts 
         * (does it require checking parent or root)
         * @method
         * @param {string} propName 
         */
        checkScope: function(propName) {

            if (!this.cfg) {
                return;
            }

            var scope = this.cfg.scope,
                descr = lib_Expression.describeExpression(
                    this.getExpression(propName)
                );

            if (descr.indexOf("r") !== -1) {
                return scope.$root.$check();
            }
            else if (descr.indexOf("p") !== -1) {
                return scope.$parent ? 
                        scope.$parent.$check() : 
                        scope.$root.$check();
            }
            else {
                return scope.$check();
            }
        },

        /**
         * Stop all observers, clear data, remove listeners.
         * But keep values and properties
         * @method
         */
        clear: function() {
            var self = this,
            id = self.id,
            k;

            if (self.properties === null) {
                return;
            }

            for (k in self.properties) {
                self._unsetMo(k);
                $$observable.destroyEvent(id +'-'+ k);
            }

            $$observable.destroyEvent(id);

            self.subscribe = emptyFn;
            self.unsubscribe = emptyFn;
        },

        /**
         * @method
         */
        $destroy: function() {
            var self = this;

            if (self.properties !== null) {
                self.clear();
            }

            self.properties = null;
            self.values = null;
            self.cfg = null;
        }
    });

    Config.MODE_STATIC = MODE_STATIC;
    Config.MODE_DYNAMIC = MODE_DYNAMIC;
    Config.MODE_SINGLE = MODE_SINGLE;
    Config.MODE_GETTER = MODE_GETTER;
    Config.MODE_SETTER = MODE_SETTER;
    Config.MODE_FUNC = MODE_FUNC;
    Config.MODE_FNSET = MODE_FNSET;
    Config.MODE_LISTENER = MODE_LISTENER;

    return Config;

}());




var lib_Cache = MetaphorJs.lib.Cache = (function(){

    var globalCache;

    /**
     * @class MetaphorJs.lib.Cache
     */

    /**
     * @method
     * @constructor
     * @param {bool} cacheRewritable
     */
    var Cache = function(cacheRewritable) {

        var storage = {},

            finders = [];

        if (arguments.length == 0) {
            cacheRewritable = true;
        }

        return {

            /**
             * Add finder function. If cache doesn't have an entry
             * with given name, it calls finder functions with this
             * name as a parameter. If one of the functions
             * returns anything else except undefined, it will
             * store this value and return every time given name
             * is requested.
             * @param {function} fn {
             *  @param {string} name
             *  @param {Cache} cache
             *  @returns {* | undefined}
             * }
             * @param {object} context
             * @param {bool} prepend Put in front of other finders
             */
            addFinder: function(fn, context, prepend) {
                finders[prepend? "unshift" : "push"]({fn: fn, context: context});
            },

            /**
             * Add cache entry
             * @method
             * @param {string} name
             * @param {*} value
             * @param {bool} rewritable
             * @returns {*} value
             */
            add: function(name, value, rewritable) {

                if (storage[name] && storage[name].rewritable === false) {
                    return storage[name];
                }

                storage[name] = {
                    rewritable: typeof rewritable != strUndef ? rewritable : cacheRewritable,
                    value: value
                };

                return value;
            },

            /**
             * Get cache entry
             * @method
             * @param {string} name
             * @param {*} defaultValue {
             *  If value is not found, put this default value it its place
             * }
             * @returns {* | undefined}
             */
            get: function(name, defaultValue) {

                if (!storage[name]) {
                    if (finders.length) {

                        var i, l, res,
                            self = this;

                        for (i = 0, l = finders.length; i < l; i++) {

                            res = finders[i].fn.call(finders[i].context, name, self);

                            if (res !== undf) {
                                return self.add(name, res, true);
                            }
                        }
                    }

                    if (defaultValue !== undf) {
                        return this.add(name, defaultValue);
                    }

                    return undf; 
                }

                return storage[name].value;
            },

            /**
             * Remove cache entry
             * @method
             * @param {string} name
             * @returns {*}
             */
            remove: function(name) {
                var rec = storage[name];
                if (rec && rec.rewritable === true) {
                    delete storage[name];
                }
                return rec ? rec.value : undf;
            },

            /**
             * Check if cache entry exists
             * @method
             * @param {string} name
             * @returns {boolean}
             */
            exists: function(name) {
                return !!storage[name];
            },

            /**
             * Walk cache entries
             * @method
             * @param {function} fn {
             *  @param {*} value
             *  @param {string} key
             * }
             * @param {object} context
             */
            eachEntry: function(fn, context) {
                var k;
                for (k in storage) {
                    fn.call(context, storage[k].value, k);
                }
            },

            /**
             * Clear cache
             * @method
             */
            clear: function() {
                storage = {};
            },

            /**
             * Clear and destroy cache
             * @method
             */
            $destroy: function() {

                var self = this;

                if (self === globalCache) {
                    globalCache = null;
                }

                storage = null;
                cacheRewritable = null;

                self.add = null;
                self.get = null;
                self.destroy = null;
                self.exists = null;
                self.remove = null;
            }
        };
    };

    /**
     * Get global cache
     * @method
     * @static
     * @returns {Cache}
     */
    Cache.global = function() {

        if (!globalCache) {
            globalCache = new Cache(true);
        }

        return globalCache;
    };

    return Cache;
    
}());





/**
 * Check if given value is an object (non-scalar)
 * @function isObject
 * @param {*} value 
 * @returns {boolean}
 */
function isObject(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = _varType(value);
    return vt > 2 || vt == -1;
};




/**
 * @class MetaphorJs.lib.Namespace
 * @code src-docs/examples/main.js
 */

/**
 * Construct namespace
 * @constructor
 * @param {object} root {
 *  Namespace root object. Everything you register
 *  will be assigned as property of root object at some level.
 *  The parameter is optional. Pass your own object or window or global
 *  to have direct access to its properties. 
 *  @optional
 * }
 */
var lib_Namespace = MetaphorJs.lib.Namespace = function(root) {

    root        = root || {};

    var self    = this,
        cache   = new lib_Cache(false);

    var parseNs     = function(ns) {

        var tmp     = ns.split("."),
            i,
            last    = tmp.pop(),
            parent  = tmp.join("."),
            len     = tmp.length,
            name,
            current = root;

        if (cache[parent]) {
            return [cache[parent], last, ns];
        }

        if (len > 0) {
            for (i = 0; i < len; i++) {

                name    = tmp[i];

                if (current[name] === undf) {
                    current[name]   = {};
                }

                current = current[name];
            }
        }

        return [current, last, ns];
    };

    /**
     * Get namespace/cache object. 
     * @method
     * @param {string} objName Object name to get link to. Use the same name
     * as you used then registered or added the object.
     * @param {bool} cacheOnly Only get cached value. 
     * Return undefined if there is no cached value.
     * @returns {*}
     */
    var get       = function(objName, cacheOnly) {

        var ex = cache.get(objName);
        if (ex !== undf || cacheOnly) {
            return ex;
        }

        var tmp     = objName.split("."),
            i,
            len     = tmp.length,
            name,
            current = root;

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (current[name] === undf) {
                return undf;
            }

            current = current[name];
        }

        if (current) {
            cache.add(objName, current);
        }

        return current;
    };

    /**
     * Register item in namespace and cache. Given <code>root</code> is your
     * root object, registering <code>register("My.Value", 1)</code> will 
     * result in <code>root.My.Value === 1</code>.
     * @method
     * @param {string} objName Object name to register
     * @param {*} value
     * @returns {*} value
     */
    var register    = function(objName, value) {

        var parse   = parseNs(objName),
            parent  = parse[0],
            name    = parse[1];

        if (isObject(parent) && parent[name] === undf) {
            parent[name]        = value;
            cache.add(parse[2], value);
        }

        return value;
    };

    /**
     * Check if given object name exists in namespace.
     * @method
     * @param {string} objName
     * @returns {boolean}
     */
    var exists      = function(objName) {
        return get(ns, true) !== undf;
    };

    /**
     * Add item only to cache. This method will not add anything
     * to the root object. The <code>get</code> method will still return
     * value of this object.
     * @method
     * @param {string} objName
     * @param {*} value
     * @returns {*} value
     */
    var add = function(objName, value) {
        return cache.add(objName, value);
    };

    /**
     * Remove item from cache. Leaves namespace object unchanged.
     * @method
     * @param {string} objName
     * @returns {*} removed value
     */
    var remove = function(objName) {
        return cache.remove(objName);
    };

    /**
     * Make alias in the cache.
     * @method
     * @param {string} from
     * @param {string} to
     * @returns {*} value
     */
    var makeAlias = function(from, to) {

        var value = cache.get(from);

        if (value !== undf) {
            cache.add(to, value);
        }

        return value;
    };

    /**
     * Destroy namespace and all classes in it
     * @method $destroy
     */
    var destroy     = function() {

        var self = this,
            k;

        cache.eachEntry(function(entry){
            if (entry && entry.$destroy) {
                entry.$destroy();
            }
        });

        cache.$destroy();
        cache = null;

        for (k in self) {
            self[k] = null;
        }
    };

    self.register   = register;
    self.exists     = exists;
    self.get        = get;
    self.add        = add;
    self.remove     = remove;
    self.makeAlias  = makeAlias;
    self.$destroy    = destroy;
};




/**
 * Instantite class when you have a list of arguments
 * and you can't just use .apply()
 * @function instantiate
 * @param {function} fn Class constructor
 * @param {array} args Constructor arguments
 * @returns {object}
 */
function instantiate(fn, args) {

    var Temp = function(){},
        inst, ret;

    Temp.prototype  = fn.prototype;
    inst            = new Temp;
    ret             = fn.apply(inst, args);

    // If an object has been returned then return it otherwise
    // return the original instance.
    // (consistent with behaviour of the new operator)
    return isObject(ret) || ret === false ? ret : inst;
};

/**
 * Function interceptor
 * @function intercept
 * @param {function} origFn Original function
 * @param {function} interceptor Function that should execute instead(ish)
 * @param {object|null} context Function's context
 * @param {object|null} origContext Original function's context
 * @param {string} when {
 *  before | after | instead
 *  @default before
 * }
 * @param {bool} replaceValue true to return interceptor's return value
 * instead of original
 * @returns {Function}
 */
function intercept(origFn, interceptor, context, origContext, when, replaceValue) {

    when = when || "before";

    return function() {

        var intrRes,
            origRes;

        if (when == "instead") {
            return interceptor.apply(context || origContext, arguments);
        }
        else if (when == "before") {
            intrRes = interceptor.apply(context || origContext, arguments);
            origRes = intrRes !== false ? origFn.apply(origContext || context, arguments) : null;
        }
        else {
            origRes = origFn.apply(origContext || context, arguments);
            intrRes = interceptor.apply(context || origContext, arguments);
        }

        return replaceValue ? intrRes : origRes;
    };
};




var classManagerFactory = function(){


    var proto   = "prototype",
        constr  = "$constructor",

        $constr = function $constr() {
            var self = this;
            if (self.$super && self.$super !== emptyFn) {
                self.$super.apply(self, arguments);
            }
        },

        collectMixinEvents = function(events, pConstr) {
            var pp;
            while (pConstr) {
                pp = pConstr[proto];
                if (pp.$mixinEvents) {
                    events = events.concat(pp.$mixinEvents);
                }
                pConstr = pConstr.$parent;
            }
            return events;
        },

        wrapPrototypeMethod = function wrapPrototypeMethod(parent, k, fn) {

            var $super = parent[proto][k] ||
                        (k === constr ? parent : emptyFn) ||
                        emptyFn;

            return function() {
                var ret,
                    self    = this,
                    prev    = self.$super;

                if (self.$destroyed) {
                    self.$super = null;
                    return null;
                }

                self.$super     = $super;
                ret             = fn.apply(self, arguments);
                self.$super     = prev;

                return ret;
            };
        },

        preparePrototype = function preparePrototype(prototype, cls, parent, onlyWrap, mixEvents) {
            var k, ck, pk, pp = parent[proto],
                i, l, name;

            for (k in cls) {
                if (cls.hasOwnProperty(k)) {
                    
                    pk = pp[k];
                    ck = cls[k];

                    prototype[k] = isFunction(ck) && (!pk || isFunction(pk)) ?
                                    wrapPrototypeMethod(parent, k, ck) :
                                    ck;
                }
            }

            if (onlyWrap) {
                return;
            }

            prototype.$plugins      = null;
            prototype.$pluginMap    = null;

            if (mixEvents) {
                for (i = 0, l = mixEvents.length; i < l; i++) {
                    name = mixEvents[i];
                    if (pp[name]) {
                        if (typeof pp[name] === 'function') {
                            throw new Error("Cannot override method " + 
                                            name + 
                                            " with mixin event");
                        }
                        prototype[name] = pp[name].slice();
                    }
                    else {
                        prototype[name] = [];
                    }
                }
            }
        },
        
        mixinToPrototype = function(prototype, mixin, events) {
            
            var k;

            for (k in mixin) {
                if (mixin.hasOwnProperty(k)) {
                    if (events.indexOf(k) !== -1) {
                        prototype[k].push(mixin[k]);
                    }
                    else if (!prototype[k]) {
                        prototype[k] = mixin[k];
                    }
                }
            }
        };


    /**
     * Instantiate class system with namespace.
     * @group api
     * @function
     * @param {lib_Namespace} ns {
     *  Provide your own namespace or a new private ns will be 
     *  constructed automatically. 
     *  @optional
     * }
     * @returns {object} Returns cls() function/object. 
     */
    var classManagerFactory = function(ns) {

        if (!ns) {
            ns = new lib_Namespace;
        }

        var createConstructor = function(className) {

            return function() {

                var self    = this,
                    before  = [],
                    after   = [],
                    args    = arguments,
                    newArgs,
                    i, l,
                    plugins, plugin,
                    pmap,
                    plCls;

                if (!self) {
                    throw new Error("Must instantiate via new: " + className);
                }

                self.$plugins   = [];

                newArgs = self[constr].apply(self, arguments);

                if (newArgs && isArray(newArgs)) {
                    args = newArgs;
                }

                plugins = self.$plugins;
                pmap    = self.$pluginMap = {};

                if (self.$beforeInit) 
                    for (i = -1, l = self.$beforeInit.length; ++i < l;
                         before.push([self.$beforeInit[i], self])) {}

                if (self.$afterInit)
                    for (i = -1, l = self.$afterInit.length; ++i < l;
                         after.push([self.$afterInit[i], self])) {}

                if (plugins && plugins.length) {

                    for (i = 0, l = plugins.length; i < l; i++) {

                        plugin = plugins[i];

                        if (isString(plugin)) {
                            plCls = plugin;
                            plugin = ns ? ns.get(plugin) : null;
                            if (!plugin) {
                                throw plCls + " not found";
                            }
                        }
 
                        plugin = new plugin(self, args);
                        pmap[plugin.$class] = plugin;

                        if (plugin.$beforeHostInit) {
                            before.push([plugin.$beforeHostInit, plugin]);
                        }
                        if (plugin.$afterHostInit) {
                            after.push([plugin.$afterHostInit, plugin]);
                        }

                        plugins[i] = plugin;
                    }
                }

                for (i = -1, l = before.length; ++i < l;
                     before[i][0].apply(before[i][1], args)){}

                if (self.$init) {
                    self.$init.apply(self, args);
                }

                for (i = -1, l = after.length; ++i < l;
                     after[i][0].apply(after[i][1], args)){}

            };
        };


        /**
         * All classes defined with <code>cls</code> extend this class.
         * Basically,<code>cls({});</code> is the same as 
         * <code>BaseClass.$extend({})</code>.
         * @group api
         * @class MetaphorJs.cls.BaseClass
         */
        var BaseClass = function() {

        };

        extend(BaseClass.prototype, {

            /**
             * Class name
             * @property {string} 
             */
            $class: null,
            $extends: null,

            /**
             * List of plugin names or constructors before class 
             * is initialised, list of plugin instances after initialisation
             * @property {array} 
             */
            $plugins: null,
            $pluginMap: null,
            $mixins: null,
            $mixinEvents: ["$beforeInit", "$afterInit",
                            "$beforeDestroy", "$afterDestroy"],

            $destroyed: false,
            $destroying: false,

            $constructor: emptyFn,
            $init: emptyFn,
            $beforeInit: [],
            $afterInit: [],
            $beforeDestroy: [],
            $afterDestroy: [],

            /**
             * Call mixins for a specified mixin event
             * @param {string} eventName 
             */
            $callMixins: function(eventName) {
                var self = this,
                    fns = self[eventName],
                    i, l,
                    args = toArray(arguments);

                args.shift();

                for (i = 0, l = fns.length; i < l; i++) {
                    fns[i].apply(self, args);
                }
            },

            /**
             * Get this instance's class name
             * @method
             * @returns {string}
             */
            $getClass: function() {
                return this.$class;
            },

            /**
             * Is this object instance of <code>cls</code>
             * @param {string} cls
             * @returns {boolean}
             */
            $is: function(cls) {
                return isInstanceOf(this, cls);
            },

            /**
             * Get parent class name
             * @method
             * @returns {string | null}
             */
            $getParentClass: function() {
                return this.$extends;
            },

            /**
             * Intercept method
             * @method
             * @param {string} method Intercepted method name
             * @param {function} fn function to call before or after intercepted method
             * @param {object} newContext optional interceptor's "this" object
             * @param {string} when optional, when to call interceptor 
             *                         before | after | instead; default "before"
             * @param {bool} replaceValue optional, return interceptor's return value 
             *                  or original method's; default false
             * @returns {function} original method
             */
            $intercept: function(method, fn, newContext, when, replaceValue) {
                var self = this,
                    orig = self[method];
                self[method] = intercept(orig || emptyFn, fn, newContext || self, 
                                            self, when, replaceValue);
                return orig || emptyFn;
            },

            /**
             * Implement new methods or properties on instance
             * @method
             * @param {object} methods
             */
            $implement: function(methods) {
                var $self = this.constructor;
                if ($self && $self.$parent) {
                    preparePrototype(this, methods, $self.$parent, true);
                }
            },

            /**
             * Does this instance have a plugin
             * @method
             * @param cls
             * @returns {boolean}
             */
            $hasPlugin: function(cls) {
                return cls ? !!this.$pluginMap[cls] : false;
            },

            /**
             * Get plugin instance
             * @method
             * @param {string} cls Plugin class name
             * @returns {object|null}
             */
            $getPlugin: function(cls) {
                return cls ? this.$pluginMap[cls] || null : null;
            },

            /**
             * Get a bound to this object function
             * @method
             * @param {function} fn
             * @returns {Function}
             */
            $bind: function(fn) {
                var self = this;
                return function() {
                    if (!self.$isDestroyed()) {
                        return fn.apply(self, arguments);
                    }
                };
            },

            /**
             * Is this object destroyed
             * @method
             * @return {boolean}
             */
            $isDestroyed: function() {
                return self.$destroying || self.$destroyed;
            },

            /**
             * Destroy this instance. Also destroys plugins and
             * calls all beforeDestroy and afterDestroy handlers.
             * Also calls onDestroy.<br>
             * Safe to call multiple times.
             * @method
             */
            $destroy: function() {

                var self    = this,
                    before  = self.$beforeDestroy,
                    after   = self.$afterDestroy,
                    plugins = self.$plugins,
                    i, l, res;

                if (self.$destroying || self.$destroyed) {
                    return;
                }

                self.$destroying = true;

                for (i = -1, l = before.length; ++i < l;
                     before[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    if (plugins[i].$beforeHostDestroy) {
                        plugins[i].$beforeHostDestroy.call(plugins[i], arguments);
                    }
                }

                res = self.onDestroy.apply(self, arguments);

                for (i = -1, l = after.length; ++i < l;
                     after[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    plugins[i].$destroy.apply(plugins[i], arguments);
                }

                if (res !== false) {
                    for (i in self) {
                        if (self.hasOwnProperty(i)) {
                            self[i] = null;
                        }
                    }
                }

                self.$destroying = false;
                self.$destroyed = true;
            },

            /**
             * Overridable method. Put your destructor here
             * @method
             */
            onDestroy: function(){}
        });

        BaseClass.$self = BaseClass;

        /**
         * Create an instance of current class. Same as <code>cls.factory(name)</code>
         * @method
         * @static
         * @code var myObj = My.Class.$instantiate(arg1, arg2, ...);
         * @returns {object} class instance
         */
        BaseClass.$instantiate = function() {

            var cls = this,
                args = arguments,
                cnt = args.length;

            // lets make it ugly, but without creating temprorary classes and leaks.
            // and fallback to normal instantiation.

            switch (cnt) {
                case 0:
                    return new cls;
                case 1:
                    return new cls(args[0]);
                case 2:
                    return new cls(args[0], args[1]);
                case 3:
                    return new cls(args[0], args[1], args[2]);
                case 4:
                    return new cls(args[0], args[1], args[2], args[3]);
                default:
                    return instantiate(cls, args);
            }
        };

        /**
         * Override class methods (on prototype level, not on instance level)
         * @method
         * @static
         * @param {object} methods
         */
        BaseClass.$override = function(methods) {
            var $self = this.$self,
                $parent = this.$parent;

            if ($self && $parent) {
                preparePrototype($self.prototype, methods, $parent);
            }
        };

        /**
         * Create new class extending current one
         * @static
         * @method
         * @param {object} definition
         * @param {object} statics
         * @returns {function}
         */
        BaseClass.$extend = function(definition, statics) {
            return defineClass(definition, statics, this);
        };

        /**
         * Destroy class (not the instance)
         * @method
         * @static
         */
        BaseClass.$destroy = function() {
            var self = this,
                k;

            for (k in self) {
                self[k] = null;
            }
        };
        /**
         * @end-class
         */


        /**
         * Constructed class system. Also this is a function, same as 
         * <code>cls.define</code>
         * @group api
         * @object cls
         */

        /**
         * @property {function} define {
         *  @param {object} definition {
         *      @type {string} $class optional class name
         *      @type {string} $extends optional parent class
         *      @type {array} $mixins optional list of mixins
         *      @type {function} $constructor optional low-level constructor
         *      @type {function} $init optional constructor
         *      @type {function} onDestroy your own destroy function
         *  }
         *  @param {object} statics any statis properties or methods
         * }
         * @code var Name = cls({$class: "Name"});
         */
        var defineClass = function defineClass(definition, statics, $extends) {

            definition          = definition || {};
            
            var name            = definition.$class,
                parentClass     = $extends || definition.$extends,
                mixins          = definition.$mixins,
                mixEvents       = definition.$mixinEvents || [],
                alias           = definition.$alias,
                pConstructor,
                allMixEvents,
                i, l, k, prototype, c, mixin;

            if (parentClass) {
                if (isString(parentClass)) {
                    pConstructor = ns.get(parentClass);
                }
                else {
                    pConstructor = parentClass;
                    parentClass = pConstructor.$class || "";
                }
            }
            else {
                pConstructor = BaseClass;
                parentClass = "";
            }

            if (parentClass && !pConstructor) {
                throw parentClass + " not found";
            }

            definition.$class   = name;
            definition.$extends = parentClass;
            delete definition.$mixins;
            delete definition.$mixinEvents;

            allMixEvents        = collectMixinEvents(mixEvents, pConstructor);
            prototype           = Object.create(pConstructor[proto]);
            definition[constr]  = definition[constr] || $constr;

            preparePrototype(prototype, definition, pConstructor, false, allMixEvents);

            if (mixins) {
                for (i = 0, l = mixins.length; i < l; i++) {
                    mixin = mixins[i];
                    if (isString(mixin)) {
                        if (!ns) {
                            throw new Error("Mixin " + mixin + " not found");
                        }
                        mixin = ns.get(mixin, true);
                    }
                    mixinToPrototype(prototype, mixin, allMixEvents);
                }
            }

            c = createConstructor(name);
            prototype.constructor = c;
            prototype.$self = c;
            prototype.$mixinEvents = mixEvents;
            c[proto] = prototype;

            for (k in BaseClass) {
                if (k !== proto && BaseClass.hasOwnProperty(k)) {
                    c[k] = BaseClass[k];
                }
            }

            for (k in pConstructor) {
                if (k !== proto && pConstructor.hasOwnProperty(k)) {
                    c[k] = pConstructor[k];
                }
            }

            if (statics) {
                for (k in statics) {
                    if (k !== proto && statics.hasOwnProperty(k)) {
                        c[k] = statics[k];
                    }
                }
            }

            c.$parent   = pConstructor;
            c.$self     = c;

            if (ns) {
                if (name) {
                    ns.register(name, c);
                }
                if (alias) {
                    ns.register(alias, c);
                }
            }

            return c;
        };




        /**
         * Instantiate class. Pass constructor parameters after "name"
         * @property {function} factory {
         * @code cls.factory("My.Class.Name", arg1, arg2, ...);
         * @param {string} name Full name of the class
         * @returns {object} class instance
         * }
         */
        var factory = function(name) {

            var cls     = ns ? ns.get(name) : null,
                args    = toArray(arguments).slice(1);

            if (!cls) {
                throw name + " not found";
            }

            return cls.$instantiate.apply(cls, args);
        };



        /**
         * Is given object instance of class
         * @property {function} isInstanceOf {
         * @code cls.instanceOf(myObj, "My.Class");
         * @code cls.instanceOf(myObj, My.Class);
         * @param {object} cmp
         * @param {string|object} name
         * @returns {boolean}
         * }
         */
        var isInstanceOf = function(cmp, name) {
            var _cls    = isString(name) && ns ? ns.get(name) : name;
            return _cls ? cmp instanceof _cls : false;
        };



        /**
         * Is one class subclass of another class
         * @property {function} isSubclassOf {
         * @code cls.isSubclassOf("My.Subclass", "My.Class");
         * @code cls.isSubclassOf(myObj, "My.Class");
         * @code cls.isSubclassOf("My.Subclass", My.Class);
         * @code cls.isSubclassOf(myObj, My.Class);
         * @param {string|object} childClass
         * @param {string|object} parentClass
         * @return {boolean}
         * }
         */
        var isSubclassOf = function(childClass, parentClass) {

            var p   = childClass,
                g   = ns ? ns.get : function(){};

            if (!isString(parentClass)) {
                parentClass  = parentClass.prototype.$class;
            }

            if (isString(childClass)) {
                p   = g(childClass);
            }

            while (p && p.prototype) {

                if (p.prototype.$class === parentClass) {
                    return true;
                }

                p = p.$parent;
            }

            return false;
        };


        /**
         * Reference to the managerFactory
         * @property {function} classManagerFactory
         */
        defineClass.classManagerFactory = classManagerFactory;
        defineClass.factory = factory;
        defineClass.isSubclassOf = isSubclassOf;
        defineClass.isInstanceOf = isInstanceOf;
        defineClass.define = defineClass;

        /**
         * @property {function} Namespace Namespace constructor
         */
        defineClass.Namespace = lib_Namespace;

        /**
         * @property {class} BaseClass
         */
        defineClass.BaseClass = BaseClass;

        /**
         * @property {object} ns Namespace instance
         */
        defineClass.ns = ns;

        /**
         * @property {function} $destroy Destroy class system and namespace
         */
        defineClass.$destroy = function() {
            BaseClass.$destroy();
            BaseClass = null;
            if (ns) {
                ns.$destroy();
                ns = null;
            }
        };

        return defineClass;
    };

    return classManagerFactory;
}();




/**
 * Already constructed private namespace 
 * with <code>MetaphorJs</code> object and its alias <code>mjs</code> 
 * registered at top level.
 * @var ns 
 */
var ns = (function(){
    var ns = new lib_Namespace;
    ns.register("MetaphorJs", MetaphorJs);
    ns.register("mjs", MetaphorJs);
    return ns;
}());




var cls = classManagerFactory(ns);










var Directive = MetaphorJs.app.Directive = (function() {

    var attr = {},
        tag = {},
        component = {},
        attributes          = [],
        attributesSorted    = false,
        compare             = function(a, b) {
            return a.priority - b.priority;
        }

    MetaphorJs.directive = MetaphorJs.directive || {
        attr: attr,
        tag: tag,
        component: component
    };

    return cls({

        watcher: null,
        stateFn: null,
        scope: null,
        node: null,
        mods: null,
        wrapperOpen: null,
        wrapperClose: null,
        autoOnChange: true,

        $init: function(scope, node, config, renderer, attrSet) {

            var self        = this;

            config.setDefaultMode("saveState", lib_Config.MODE_SETTER);

            self.config     = config;
            self.node       = node;
            self.scope      = scope;

            if (config.hasExpression("saveState")) {
                self.stateFn = config.get("saveSate");
            }

            scope.$on("destroy", self.onScopeDestroy, self);
            scope.$on("reset", self.onScopeReset, self);

            self.initialSet();
        },

        initialSet: function() {
            var self = this,
                val;
            self.config.on("value", self.onChange, self);
            if (self.autoOnChange && (val = self.config.get("value")) !== undf) {
                self.onChange(val, undf);
            }
        },

        getChildren: function() {
            return null;
        },

        createCommentWrap: function(node, name) {
            var cmts = dom_commentWrap(node, name || this.$class);
            this.wrapperOpen = cmts[0];
            this.wrapperClose = cmts[1];
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onScopeReset: function() {},

        onChange: function(val) {
            this.saveStateOnChange(val);
        },

        saveStateOnChange: function(val) {
            if (this.stateFn) {
                this.stateFn(this.scope, val);
            }
        },

        onDestroy: function() {
            var self    = this;

            if (self.scope) {
                self.scope.$un("destroy", self.onScopeDestroy, self);
                self.scope.$un("reset", self.onScopeReset, self);
            }

            if (self.watcher) {
                self.watcher.unsubscribe(self.onChange, self);
                self.watcher.$destroy(true);
            }

            if (self.config) {
                self.config.$destroy();
            }

            if (self.wrapperOpen) {
                self.wrapperOpen.parentNode.removeChild(self.wrapperOpen);
            }
            if (self.wrapperClose) {
                self.wrapperClose.parentNode.removeChild(self.wrapperClose);
            }

            self.$super();
        }
    }, {

        attr: {},
        tag: {},

        /**
         * Get directive by name
         * @static
         * @method
         * @param {string} type 
         * @param {string} name 
         */
        getDirective: function(type, name) {
            return ns.get("MetaphorJs.directive." + type +"."+ name);
        },

        /**
         * Register attribute directive
         * @param {string} name Attribute name
         * @param {int} priority 
         * @param {function|MetaphorJs.app.Directive} handler 
         */
        registerAttribute: function registerAttribute(name, priority, handler) {
            if (!attr[name]) {
                attributes.push({
                    priority: priority,
                    name: name,
                    handler: attr[name] = handler
                });
                attributesSorted = false;
            }
        },

        /**
         * Get attribute directives sorted by priority
         * @static
         * @method
         * @returns {array}
         */
        getAttributes: function getAttributes() {
            if (!attributesSorted) {
                attributes.sort(compare);
                attributesSorted = true;
            }
            return attributes;
        },

        /**
         * Register tag directive
         * @param {string} name Tag name (case insensitive)
         * @param {function|MetaphorJs.app.Directive} handler 
         */
        registerTag: function registerTag(name, handler) {
            if (!tag[name]) {
                tag[name] = handler;
            }
        },

        /**
         * Register tag component
         * @param {string} name Tag name (case sensitive)
         * @param {MetaphorJs.app.Component} cmp 
         */
        registerComponent: function(name, cmp) {
            if (!cmp) {
                cmp = name;
            }
            if (isString(cmp)) {
                cmp = ns.get(cmp, true);
            }
            if (!component[name]) {
                component[name] = cmp;
            }
        }
    });
}());






/**
 * Remove element's attribute
 * @function MetaphorJs.dom.removeAttr
 * @param {DomNode} node 
 * @param {string} name
 */
var dom_removeAttr = MetaphorJs.dom.removeAttr = function dom_removeAttr(el, name) {
    return el.removeAttribute(name);
};


/**
 * Convert dashes to camel case
 * @function toCamelCase
 * @param {string} str 
 * @returns {string}
 */
function toCamelCase(str) {
    return str.replace(/-./g, function(match) {
        return match.charAt(1).toUpperCase();
    });
};









/**
 * Get node attributes classified by directive
 * @function MetaphorJs.dom.getAttrSet
 * @param {DomNode} node
 * @returns {object}
 */
var dom_getAttrSet = MetaphorJs.dom.getAttrSet = (function() {

    // regular expression seems to be a few milliseconds faster
    // than plain parsing
    var reg = /^([\[({#$@])([^)\]}"':\*]+)[\])}]?([:\*!]?)$/;

    var removeDirective = function removeDirective(node, directive) {
        if (this.inflated) {
            delete this.directive[directive];
            return;
        }
        if (this.directive[directive] && 
            this.directive[directive].original) {
            dom_removeAttr(node, this.directive[directive].original);
        }
        var i, l, sn = this.names[directive];
        if (sn) {
            for (i = 0, l = sn.length; i < l; i++) {
                dom_removeAttr(node, sn[i]);
            }
            delete this.names[directive];
        }
    };

    var execModes = {
        '*': lib_Config.MODE_DYNAMIC,
        ':': lib_Config.MODE_STATIC,
        '!': lib_Config.MODE_SINGLE,
        '': null
    };

    var dtypes = {
        '{': "dir",
        '(': "event",
        '[': "attr",
        '$': "cfg"
    };

    var getEmpty = function() {
        return {
            directive: {},
            attribute: {},
            config: {},
            rest: {},
            reference: [],
            at: null,
            names: {},
            removeDirective: removeDirective
        };
    };

    var inflate = function(set) {
        extend(set, getEmpty(), false, false);
        set.inflated = true;
    };

    var ccName = function(name) {
        return name.indexOf('--') !== -1 ? name : toCamelCase(name);
    };

    return function dom_getAttrSet(node) {

        var set = getEmpty(),
            i, l, tagName,
            name, value,
            match, parts,
            coll, mode,
            subname,
            prop, execMode,
            attrs = isArray(node) ? node : node.attributes;

        /**
         * mjs="<id>" - attribute always present, even after cloning 
         * data-mjscfg - copy of original config, id always present
         * node._mjscfg - equals data-mjscfg. After cloning, this property
         *  disappears and we must make a new copy of config
         *  from data-mjscfg version
         */

        if (node.nodeType && node.hasAttribute && node.hasAttribute("mjs")) {
            set = MetaphorJs.prebuilt.configs[node.getAttribute("mjs")];
            //dom_removeAttr(node, "mjs");
            inflate(set);
            return set;
        }

        for (i = 0, l = attrs.length; i < l; i++) {

            name = attrs[i].name;
            value = attrs[i].value;
            mode = null;
            execMode = null;
            match = name.match(reg);

            if (match) {
                name = match[2];
                mode = match[1];
                execMode = execModes[match[3]];

                if (mode === '#') {
                    set.reference.push(name);
                    continue;
                }
                if (mode === '@') {
                    set.at = name;
                    continue;
                }
            }
            else {
                if (name.substr(0, 4) === "mjs-") {
                    name = name.substr(4);
                    mode = '{';
                }
                else {
                    set['rest'][name] = value;
                    continue;
                }
            }


            if (mode === '$') {
                if (value === "") {
                    value = true;
                }

                tagName = node.tagName.toLowerCase();

                set['config'][ccName(name)] = {
                    expression: value,
                    mode: execMode,
                    dtype: dtypes[mode]
                };

                if (!set['names'][tagName]) {
                    set['names'][tagName] = [];
                }

                set['names'][tagName].push(attrs[i].name);
            }
            else if (mode === '(' || mode === '{') { 

                parts = name.split(".");
                name = parts.shift();

                coll = set['directive'];
                subname = parts.length ? parts.join(".") : null;

                if (value === "") {
                    value = true;
                }

                if (!coll[name]) {
                    coll[name] = {
                        //name: name,
                        original: null,
                        config: {},
                        dtype: dtypes[mode]
                    };
                }

                if (!subname) {
                    coll[name].original = attrs[i].name;
                }

                if (subname && !set['names'][name]) {
                    set['names'][name] = [];
                }

                if (subname && subname[0] === '$') {
                    
                    prop = ccName(subname.substr(1));
                    coll[name].config[prop] = {
                        mode: execMode,
                        expression: value,
                        original: attrs[i].name
                    };
                    set['names'][name].push(attrs[i].name);
                }
                else {
                    if (subname) {
                        prop = "value." + parts.join(".");
                        // directive value keys are not camelcased
                        // do this inside directive if needed
                        // ('class' directive needs originals)
                        coll[name].config[prop] = {
                            mode: execMode,
                            expression: value,
                            original: attrs[i].name
                        };
                        set['names'][name].push(attrs[i].name);
                    }
                    else {
                        coll[name].config['value'] = {
                            mode: execMode,
                            expression: value,
                            original: attrs[i].name
                        };
                    }
                }
            }
            else if (mode === '[') {
                set['attribute'][name] = {
                    value: value,
                    original: attrs[i].name
                };
            }
        }

        return set;
    }

}());













var app_Renderer = MetaphorJs.app.Renderer = function() {

    var handlers                = null,
        //createText              = TextRenderer.create,
        dirs                    = MetaphorJs.directive,

        nodeChildren = function(res, el, fn, fnScope, finish, cnt) {

            var children = [],
                i, len;

            if (res && res !== true) {
                if (res.nodeType) {
                    cnt.countdown += 1;
                    eachNode(res, fn, fnScope, finish, cnt);
                    return;
                }
                else {
                    children = res.slice();
                }
            }

            if (!children.length) {
                children = toArray(el.childNodes || el);
            }

            len = children.length;

            cnt.countdown += len;

            for(i = -1;
                ++i < len;
                eachNode(children[i], fn, fnScope, finish, cnt)){}
        },


        collectNodes    = function(coll, add) {

            if (add) {
                if (add.nodeType) {
                    coll.push(add);
                }
                else if (isArray(add)) {
                    for (var i = -1, l = add.length; ++i < l; collectNodes(coll, add[i])){}
                }
            }
        },

        skipMap = {
            "script": true,
            "template": true,
            "mjs-template": true,
            "style": true,
            "link": true
        },

        eachNode = function(el, fn, fnScope, finish, cnt) {

            if (!el) {
                return;
            }

            var res,
                tag = el.nodeName;

            if (!cnt) {
                cnt = {countdown: 1};
            }

            if (tag && skipMap[tag.toLowerCase()]) { //tag.match(rSkipTag)) {
                --cnt.countdown === 0 && finish && finish.call(fnScope);
                return;
            }

            res = fn.call(fnScope, el);

            if (res !== false) {

                if (isThenable(res)) {

                    res.done(function(response){

                        if (response !== false) {
                            nodeChildren(response, el, fn, fnScope, finish, cnt);
                        }

                        --cnt.countdown === 0 && finish && finish.call(fnScope);
                    });
                    return; // prevent countdown
                }
                else {
                    nodeChildren(res, el, fn, fnScope, finish, cnt);
                }
            }

            --cnt.countdown === 0 && finish && finish.call(fnScope);
        },

        applyDirective = function(dir, parentScope, node, config, attrs, renderer, passDirectives) {

            var scope   = dir.$breakScope  ?
                           parentScope.$new() :
                           parentScope,
                app     = parentScope.$app,
                inject  = {
                    $scope: scope,
                    $node: node,
                    $nodeConfig: config,
                    $attrSet: attrs,
                    $renderer: renderer
                },
                args    = [scope, node, config, renderer, attrs],
                inst;

            if (app) {
                inst = app.inject(dir, null, inject, args);
            }
            else if (dir.$instantiate) {
                inst = dir.$instantiate.apply(dir, args);
            }
            else {
                inst = dir.apply(null, args);
            }

            if (app && dir.$registerBy && inst) {
                if (isThenable(inst)) {
                    inst.done(function(cmp){
                        app.registerCmp(cmp, parentScope, dir.$registerBy);
                    });
                }
                else {
                    app.registerCmp(inst, parentScope, dir.$registerBy);
                }
            }

            if (inst && inst.$destroy) {
                renderer && renderer.on("destroy", inst.$destroy, inst);
                !renderer && parentScope.$on("destroy", inst.$destroy, inst);
            }
            else if (typeof inst === "function") {
                renderer && renderer.on("destroy", inst);
                !renderer && parentScope.$on("destroy", inst);
            }

            if (dir.$stopRenderer) {
                return false;
            }

            if (inst && inst.getChildren) {
                return inst.getChildren();
            }

            return inst;
        },

        observer = new lib_Observable;

    var Renderer = function(el, scope, parent) {

        var self            = this;

        self.id             = nextUid();
        self.el             = el;
        self.scope          = scope;
        self.texts          = [];
        self.parent         = parent;

        if (scope instanceof lib_Scope) {
            scope.$on("destroy", self.$destroy, self);
        }

        if (parent) {
            parent.on("destroy", self.$destroy, self);
        }
    };
    
    
    extend(Renderer.prototype, {

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,
        passedAttrs: null,
        reportFirstNode: true,

        on: function(event, fn, context, opt) {
            return observer.on(event + '-' + this.id, fn, context, opt);
        },

        un: function(event, fn, context) {
            return observer.un(event + '-' + this.id, fn, context);
        },

        trigger: function(event) {
            arguments[0] = event + "-" + this.id;
            return observer.trigger.apply(observer, arguments);
        },

        getEl: function() {
            return this.el;
        },

        processNode: function(node) {

            var self        = this,
                nodeType    = node.nodeType,
                texts       = self.texts,
                scope       = self.scope,
                textStr,
                textRenderer,
                ref;

            // comment
            if (nodeType === 8) {
                var cmtData = node.textContent || node.data;
                if (cmtData.substring(0,2) === '##') {
                    observer.trigger(
                        "reference-" + self.id, 
                        "node",
                        cmtData.substring(2),
                        node
                    );
                }
            }
            // text node
            else if (nodeType === 3) {

                textStr = node.textContent || node.nodeValue;

                if (lib_Text.applicable(textStr)) {
                    textRenderer = new lib_Text(
                        self.scope,
                        textStr
                    );
                    textRenderer.subscribe(self.onTextChange, self, {
                        append: [texts.length]
                    });
                    texts.push({
                        node: node,
                        tr: textRenderer
                    });
                    self.renderText(texts.length - 1);
                }
            }

            // element node
            else if (nodeType === 1) {

                if (self.reportFirstNode) {
                    observer.trigger("first-node-" + self.id, node);
                    self.reportFirstNode = false;
                }

                if (!handlers) {
                    handlers = Directive.getAttributes();
                }

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    i, f, len, c,
                    attrs, as, config,
                    attrProps,
                    name,
                    res,
                    handler;

                if (tag.substr(0, 4) === "mjs-") {
                    tag = tag.substr(4);
                }

                attrs = dom_getAttrSet(node);

                if (attrs.config.ignore) {
                    return false;
                }

                // this tag represents component
                // we just pass it to attr.cmp directive
                // by adding it to the attr map
                if (c = dirs.component[tag]) {

                    as = attrs.config.tag ? attrs.config.tag.expression : null;

                    // TODO do not make this a separate branch
                    if (as) {

                        attrs["directive"]['cmp'] = {
                            name: "cmp",
                            original: "{cmp}",
                            config: extend({}, attrs.config, {
                                value: {
                                    mode: lib_Config.MODE_STATIC,
                                    expression: c.prototype.$class
                                }
                            })
                        };

                        as = window.document.createElement(as);
                        node.parentNode.replaceChild(as, node);
                        while (node.firstChild) {
                            as.appendChild(node.firstChild);
                        }
                        node = as;
                        for (name in attrs.rest) {
                            dom_setAttr(node, name, attrs.rest[name]);
                        }
                    }
                    else {

                        f = dirs.attr.cmp;
                        delete attrs['directive']['cmp'];

                        config = new lib_Config(
                            extend({}, attrs.config, {
                                value: {
                                    mode: lib_Config.MODE_STATIC,
                                    expression: c
                                }
                            }, true, false),
                            {scope: self.scope}
                        );
                        self.on("destroy", config.$destroy, config);

                        res = applyDirective(f, scope, node, config, attrs, self, true);
                        attrs['directive'] = {};

                        if (res === false) {
                            return false;
                        }
                        if (isThenable(res)) {
                            defers.push(res);
                        }
                        else {
                            collectNodes(nodes, res);
                        }
                    }
                }

                // this is a tag directive
                else if (f = dirs.tag[tag]) {

                    config = new lib_Config(
                        attrs.config, 
                        {scope: self.scope}
                    );
                    self.on("destroy", config.$destroy, config);
                    res = applyDirective(f, scope, node, config, attrs, self);

                    attrs.removeDirective(node, tag);

                    if (res === false) {
                        return false;
                    }
                    if (isThenable(res)) {
                        defers.push(res);
                    }
                    else {
                        collectNodes(nodes, res);
                    }
                }


                // this is an attribute directive
                for (i = 0, len = handlers.length; i < len; i++) {
                    name    = handlers[i].name;

                    if ((attrProps = attrs['directive'][name]) !== undf &&
                        !attrProps.handled) {

                        handler = handlers[i].handler;

                        if (!handler.$keepAttribute) {
                            dom_removeAttr(node, attrProps.original);
                        }
                        attrs.removeDirective(node, name);

                        config = new lib_Config(
                            attrProps.config, 
                            {scope: self.scope}
                        );
                        self.on("destroy", config.$destroy, config);
                        res     = applyDirective(handler, scope, node, config, attrs, self);

                        attrProps.handled = true;

                        if (res === false) {
                            return false;
                        }
                        if (isThenable(res)) {
                            defers.push(res);
                        }
                        else {
                            collectNodes(nodes, res);
                        }
                    }
                }

                if (attrs.reference && attrs.reference.length) {
                    for (i = 0, len = attrs.reference.length; i < len; i++) {
                        ref = attrs.reference[i];
                        if (ref[0] === '#') {
                            observer.trigger(
                                "reference-" + self.id, 
                                "node",
                                ref.substring(1),
                                node
                            );
                        }
                        else {
                            scope[ref] = node;
                        }
                        dom_removeAttr(node, '#' + ref);
                    }
                }

                if (defers.length && !attrs.config.ignoreInside) {
                    var deferred = new lib_Promise;
                    lib_Promise.all(defers).done(function(values){
                        collectNodes(nodes, values);
                        deferred.resolve(nodes);
                    });
                    return deferred;
                }

                // this is a plain attribute
                for (i in attrs['attribute']) {

                    textStr = attrs['attribute'][i].value;
                    textRenderer = new lib_Text(self.scope, textStr, {
                        recursive: !!attrs.config.recursive,
                        fullExpr: !lib_Text.applicable(textStr)
                    });

                    dom_removeAttr(node, attrs['attribute'][i].original);
                    textRenderer.subscribe(self.onTextChange, self, {
                        append: [texts.length]
                    });
                    texts.push({
                        node: node,
                        attr: i,
                        tr: textRenderer
                    });
                    self.renderText(texts.length - 1);
                }

                if (attrs.config.ignoreInside) {
                    if (defers.length) {
                        var deferred = new lib_Promise;
                        lib_Promise.all(defers).done(function(){
                            return deferred.resolve(false);
                        });
                        return deferred;
                    }
                    else {
                        return false;
                    }
                }

                return nodes.length ? nodes : true;
            }

            return true;
        },

        process: function() {
            var self    = this;

            if (self.el.nodeType) {
                eachNode(self.el, self.processNode, self,
                    self.onProcessingFinished, {countdown: 1});
            }
            else {
                nodeChildren(
                    null, self.el, self.processNode,
                    self, self.onProcessingFinished, {countdown: 0});
            }
        },

        onProcessingFinished: function() {
            observer.trigger("rendered-" + this.id, this);
        },


        onTextChange: function(textRenderer, inx) {
            this.renderText(inx);
        },

        renderText: function(inx) {

            var self        = this,
                text        = self.texts[inx],
                res         = text.tr.getString(),
                attrName    = text.attr;

            if (attrName) {

                if (attrName === "value") {
                    text.node.value = res;
                }
                else if (attrName === "class") {
                    text.node.className = res;
                }
                else if (attrName === "src") {
                    text.node.src = res;
                }

                dom_setAttr(text.node, attrName, res);
            }
            else {
                //text.node.textContent = res;
                text.node.nodeValue = res;
            }
        },


        $destroy: function() {

            var self    = this,
                texts   = self.texts,
                i, len;

            for (i = -1, len = texts.length; ++i < len; texts[i].tr.$destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.$destroy, self);
            }

            observer.trigger("destroy-" + self.id);
        }

    });
    
    Renderer.skip = function(tag, value) {
        skipMap[tag] = value;
    };

    Renderer.applyDirective = applyDirective;

    return Renderer;

}();






/**
 * Get node attribute value
 * @function MetaphorJs.dom.getAttr
 * @param {DomNode} node
 * @returns {string}
 */
var dom_getAttr = MetaphorJs.dom.getAttr = function dom_getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
};




/**
 * A storage of plural definitions
 * @class MetaphorJs.lib.LocalText
 */
var lib_LocalText = MetaphorJs.lib.LocalText = function(){

    var pluralDef       = function($number, $locale) {

            if ($locale === "pt_BR") {
                // temporary set a locale for brasilian
                $locale = "xbr";
            }

            if ($locale.length > 3) {
                $locale = $locale.substr(0, -$locale.lastIndexOf('_'));
            }

            switch($locale) {
                case 'bo':
                case 'dz':
                case 'id':
                case 'ja':
                case 'jv':
                case 'ka':
                case 'km':
                case 'kn':
                case 'ko':
                case 'ms':
                case 'th':
                case 'tr':
                case 'vi':
                case 'zh':
                    return 0;

                case 'af':
                case 'az':
                case 'bn':
                case 'bg':
                case 'ca':
                case 'da':
                case 'de':
                case 'el':
                case 'en':
                case 'eo':
                case 'es':
                case 'et':
                case 'eu':
                case 'fa':
                case 'fi':
                case 'fo':
                case 'fur':
                case 'fy':
                case 'gl':
                case 'gu':
                case 'ha':
                case 'he':
                case 'hu':
                case 'is':
                case 'it':
                case 'ku':
                case 'lb':
                case 'ml':
                case 'mn':
                case 'mr':
                case 'nah':
                case 'nb':
                case 'ne':
                case 'nl':
                case 'nn':
                case 'no':
                case 'om':
                case 'or':
                case 'pa':
                case 'pap':
                case 'ps':
                case 'pt':
                case 'so':
                case 'sq':
                case 'sv':
                case 'sw':
                case 'ta':
                case 'te':
                case 'tk':
                case 'ur':
                case 'zu':
                    return ($number === 1) ? 0 : 1;

                case 'am':
                case 'bh':
                case 'fil':
                case 'fr':
                case 'gun':
                case 'hi':
                case 'ln':
                case 'mg':
                case 'nso':
                case 'xbr':
                case 'ti':
                case 'wa':
                    return (($number === 0) || ($number === 1)) ? 0 : 1;

                case 'be':
                case 'bs':
                case 'hr':
                case 'ru':
                case 'sr':
                case 'uk':
                    return (($number % 10 === 1) && ($number % 100 !== 11)) ?
                           0 :
                           ((($number % 10 >= 2) && ($number % 10 <= 4) &&
                             (($number % 100 < 10) || ($number % 100 >= 20))) ? 1 : 2);

                case 'cs':
                case 'sk':
                    return ($number === 1) ? 0 : ((($number >= 2) && ($number <= 4)) ? 1 : 2);

                case 'ga':
                    return ($number === 1) ? 0 : (($number === 2) ? 1 : 2);

                case 'lt':
                    return (($number % 10 === 1) && ($number % 100 !== 11)) ?
                           0 :
                           ((($number % 10 >= 2) &&
                             (($number % 100 < 10) || ($number % 100 >= 20))) ? 1 : 2);

                case 'sl':
                    return ($number % 100 === 1) ?
                           0 :
                           (($number % 100 === 2) ?
                                1 :
                                ((($number % 100 === 3) || ($number % 100 === 4)) ? 2 : 3));

                case 'mk':
                    return ($number % 10 === 1) ? 0 : 1;

                case 'mt':
                    return ($number === 1) ?
                           0 :
                           ((($number === 0) || (($number % 100 > 1) && ($number % 100 < 11))) ?
                                1 :
                                ((($number % 100 > 10) && ($number % 100 < 20)) ? 2 : 3));

                case 'lv':
                    return ($number === 0) ? 0 : ((($number % 10 === 1) && ($number % 100 !== 11)) ? 1 : 2);

                case 'pl':
                    return ($number === 1) ?
                           0 :
                           ((($number % 10 >= 2) && ($number % 10 <= 4) &&
                             (($number % 100 < 12) || ($number % 100 > 14))) ? 1 : 2);

                case 'cy':
                    return ($number === 1) ? 0 : (($number === 2) ? 1 : ((($number === 8) || ($number === 11)) ? 2 : 3));

                case 'ro':
                    return ($number === 1) ?
                           0 :
                           ((($number === 0) || (($number % 100 > 0) && ($number % 100 < 20))) ? 1 : 2);

                case 'ar':
                    return ($number === 0) ?
                           0 :
                           (($number === 1) ?
                                1 :
                                (($number === 2) ?
                                    2 :
                                    ((($number >= 3) && ($number <= 10)) ?
                                        3 :
                                        ((($number >= 11) && ($number <= 99)) ? 4 : 5))));

                default:
                    return 0;
            }
        };


    /**
     * @method LocalText
     * @constructor
     * @param {string} locale 2char locale id
     */
    var LocalText = function(locale) {

        var self    = this;
        self.store  = {};
        if (locale) {
            self.locale = locale;
        }
    };

    extend(LocalText.prototype, {

        store: null,
        locale: "en",

        /**
         * @method
         * @param {string} locale 2char locale id
         */
        setLocale: function(locale) {
            this.locale = locale;
        },

        /**
         * Set plural definition
         * @method
         * @param {string} key
         * @param {array|object} value {
         *  Array:<br>
         *  0: Singular form<br>
         *  1: LocalText form<br>
         *  2: Second plural form<br>
         *  3: Third plural form<br>
         *  Object:<br>
         *  <int>: Respective number<br>
         *  "one": Singular form for 1<br>
         *  "negative": Negative values form<br>
         *  "other": All other
         * }
         */
        set: function(key, value) {
            var store = this.store;
            if (store[key] === undf) {
                store[key] = value;
            }
        },

        /**
         * Load plural definitions
         * @method
         * @param {object} keys {
         *  key: definition pairs; see set()
         * }
         */
        load: function(keys) {
            extend(this.store, keys, false, false);
        },

        /**
         * Get definition. If key is not found, will return -- key --
         * @method
         * @param {string} key
         * @returns {array|object|string}
         */
        get: function(key) {
            var self = this;
            return self.store[key] ||
                   (self === globalText ? '-- ' + key + ' --' : globalText.get(key));
        },

        /**
         * Get variant best suited for the number
         * @method
         * @param {string} key
         * @param {int} number
         * @returns {string}
         */
        plural: function(key, number) {
            var self    = this,
                strings = typeof key === "string" ? self.get(key): key,
                def     = pluralDef(number, self.locale);

            if (!isArray(strings)) {
                if (isPlainObject(strings)) {
                    if (strings[number]) {
                        return strings[number];
                    }
                    if (number === 1 && strings.one !== undf) {
                        return strings.one;
                    }
                    else if (number < 0 && strings.negative !== undf) {
                        return strings.negative;
                    }
                    else {
                        return strings.other;
                    }
                }
                return strings;
            }
            else {
                return strings[def];
            }
        },

        /**
         * Destroy definitions store
         * @method
         */
        $destroy: function() {
            this.store = null;
        }

    }, true, false);


    var globalText  = new LocalText;

    LocalText.global     = function() {
        return globalText;
    };

    return LocalText;
}();




    


var lib_Provider = MetaphorJs.lib.Provider = (function(){

var VALUE       = 1,
    CONSTANT    = 2,
    FACTORY     = 3,
    SERVICE     = 4,
    PROVIDER    = 5,
    globalProvider;

var Provider = function() {
    this.store  = {};
};

extend(Provider.prototype, {

    store: null,

    instantiate: function(fn, context, args, isClass) {
        if (fn.$instantiate) {
            return fn.$instantiate.apply(fn, args);
        }
        else if (isClass) {
            return instantiate(fn, args);
        }
        else {
            return fn.apply(context, args);
        }
    },

    inject: function(injectable, context, currentValues, callArgs, isClass) {

        currentValues   = currentValues || {};
        callArgs        = callArgs || [];

        var self = this;

        if (isFunction(injectable)) {

            if (injectable.inject) {
                var tmp = injectable.inject.slice();
                tmp.push(injectable);
                injectable = tmp;
            }
            else {
                return self.instantiate(injectable, context, callArgs, isClass);
            }
        }
        else if (isString(injectable)) {
            return self.resolve(injectable, currentValues);
        }
        else {
            injectable = injectable.slice();
        }

        var values  = [],
            fn      = injectable.pop(),
            i, l;

        for (i = -1, l = injectable.length; ++i < l;
                values.push(self.resolve(injectable[i], currentValues))) {}

        return lib_Promise.all(values).then(function(values){
            return self.instantiate(fn, context, values, isClass);
        });
    },

    value: function(name, value) {
        this.store[name] = {
            type: VALUE,
            value: value
        };
    },

    constant: function(name, value) {
        var store = this.store;
        if (!store[name]) {
            store[name] = {
                type: CONSTANT,
                value: value
            };
        }
    },

    factory: function(name, fn, context, singleton) {

        if (isBool(context)) {
            singleton = context;
            context = null;
        }

        this.store[name] = {
            type: FACTORY,
            singleton: singleton,
            fn: fn,
            context: context
        };
    },

    service: function(name, constr, singleton) {
        this.store[name] = {
            type: SERVICE,
            singleton: singleton,
            fn: constr
        };
    },

    provider: function(name, constr) {

        this.store[name + "Provider"] = {
            name: name,
            type: PROVIDER,
            fn: constr,
            instance: null
        };
    },

    resolve: function(name, currentValues, callArgs) {

        var self    = this,
            store   = self.store,
            type,
            item,
            res;

        currentValues = currentValues || {};
        callArgs = callArgs || [];

        if (currentValues[name] !== undf) {
            return currentValues[name];
        }

        if (item = store[name]) {

            type    = item.type;

            if (type === VALUE || type === CONSTANT) {
                return item.value;
            }
            else if (type === FACTORY) {
                res = self.inject(item.fn, item.context, currentValues, callArgs);
            }
            else if (type === SERVICE) {
                res = self.inject(item.fn, null, currentValues, callArgs, true);
            }
            else if (type === PROVIDER) {

                if (!item.instance) {

                    item.instance = lib_Promise.resolve(
                            self.inject(item.fn, null, currentValues)
                        )
                        .done(function(instance){
                            item.instance = instance;
                            store[item.name] = {
                                type: FACTORY,
                                fn: instance.$get,
                                context: instance
                            };
                        });
                }

                return item.instance;
            }

            if (item.singleton) {
                item.type = VALUE;
                item.value = res;

                if (type === FACTORY && isThenable(res)) {
                    res.done(function(value){
                        item.value = value;
                    });
                }
            }

            return currentValues[name] = res;
        }
        else {

            if (store[name + "Provider"]) {
                self.resolve(name + "Provider", currentValues);
                return self.resolve(name, currentValues);
            }

            if (self === globalProvider) {
                throw new Error("Could not provide value for " + name);
            }
            else {
                return globalProvider.resolve(name);
            }
        }
    },

    $destroy: function() {
        this.store = null;
    }

}, true, false);

Provider.global = function() {
    return globalProvider;
};

globalProvider = new Provider;

return Provider;
}());




var mixin_Provider = MetaphorJs.mixin.Provider = {

    /**
     * @type {Provider}
     */
    $$provider: null,

    $beforeInit: function() {
        this.$$provider = new lib_Provider;
    },

    value: function() {
        var p = this.$$provider;
        return p.value.apply(p, arguments);
    },

    constant: function() {
        var p = this.$$provider;
        return p.constant.apply(p, arguments);
    },

    factory: function() {
        var p = this.$$provider;
        return p.factory.apply(p, arguments);
    },

    service: function() {
        var p = this.$$provider;
        return p.service.apply(p, arguments);
    },

    provider: function() {
        var p = this.$$provider;
        return p.provider.apply(p, arguments);
    },

    resolve: function() {
        var p = this.$$provider;
        return p.resolve.apply(p, arguments);
    },

    inject: function() {
        var p = this.$$provider;
        return p.inject.apply(p, arguments);
    },

    $afterDestroy: function() {

        this.$$provider.$destroy();
        this.$$provider = null;

    }
};




/**
 * @mixin MetaphorJs.mixin.Observable
 * @description Mixin adds observable features to the host object.
 *              It adds 'callback' option to the host config. See $beforeInit.
 *              Mixin is designed for MetaphorJs class system.
 * @code src-docs/examples/mixin.js
 */
var mixin_Observable = MetaphorJs.mixin.Observable = {

    /**
     * @private
     * @type {Observable}
     * @description You can use this instance in your $init function
     */
    $$observable: null,

    /**
     * @private
     * @type {object}
     */
    $$callbackContext: null,

    /**
     * @protected
     * @type {object} {
     *      Override this to define event properties. 
     *      Object's key is event name, value - either returnResult or 
     *      options object. See {@link class:lib_Observable.createEvent}
     * }
     */
    $$events: null,

    /**
     * @method
     * @private
     * @param {object} cfg {
     *      This is a config that was passed to the host object's constructor.
     *      It is being passed to mixin's $beforeInit automatically.
     *      @type {object} callback {
     *          Here, except for 'context', '$context' and 'scope', 
     *          keys are event names and values are listeners. 
     *          @type {object} context All given listeners context
     *          @type {object} scope The same
     *      }
     * }
     */
    $beforeInit: function(cfg) {
        var self = this;
        self.$$observable = new lib_Observable;
        self.$initObservable(cfg);
    },

    /**
     * @method
     * @private
     * @ignore
     * @param {object} cfg
     */
    $initObservable: function(cfg) {
        lib_Observable.$initHost(this, cfg, this.$$observable);
    },

    /**
     * @method
     * @see {@link class:Observable.on}
     */
    on: function() {
        var o = this.$$observable;
        return o ? o.on.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.un}
     */
    un: function() {
        var o = this.$$observable;
        return o ? o.un.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.once}
     */
    once: function() {
        var o = this.$$observable;
        return o ? o.once.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.trigger}
     */
    trigger: function() {
        var o = this.$$observable;
        return o ? o.trigger.apply(o, arguments) : null;
    },

    /**
     * @method
     * @private
     * @ignore
     */
    $beforeDestroy: function() {
        this.$$observable.trigger("before-destroy", this);
    },

    /**
     * @method
     * @private
     * @ignore
     */
    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.$destroy();
        self.$$observable = null;
    }
};












/**
 * @class MetaphorJs.app.App
 */
var app_App = MetaphorJs.app.App = cls({

    $mixins: [mixin_Observable, 
                mixin_Provider],

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,
    sourceObs: null,

    /**
     * @constructor
     * @method
     * @param {Node} node 
     * @param {object} data 
     */
    $init: function(node, data) {

        var self        = this,
            scope       = data instanceof lib_Scope ? 
                                data : 
                                new lib_Scope(data),
            args;

        dom_removeAttr(node, "mjs-app");

        scope.$app      = self;
        self.$super();

        self.lang       = new lib_LocalText;

        self.scope          = scope;
        self.cmpListeners   = {};
        self.components     = {};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootScope', scope.$root);
        self.value('$lang', self.lang);
        self.value('$locale', self.lang);

        self.renderer       = new app_Renderer(node, scope);
        self.renderer.on("rendered", self.afterRender, self);

        args = toArray(arguments);
        args[1] = scope;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    afterRender: function() {

    },

    /**
     * Start processing the DOM
     * @method
     */
    run: function() {
        this.renderer.process();
    },

    /**
     * Create data source gate
     * @param {string} name Source name
     * @param {string|bool} returnResult See MetaphorJs.lib.Observable.createEvent()
     */
    createSource: function(name, returnResult) {
        var key = "source-" + name,
            self = this;

        if (!self.$$observable.getEvent(key)) {
            self.$$observable.createEvent(key, returnResult || "nonempty");
        }
    },

    /**
     * Register data source
     * @param {string} name Source name
     * @param {function} fn Function yielding the data
     * @param {object} context fn's context
     */
    registerSource: function(name, fn, context) {
        this.on("source-" + name, fn, context);
    },

    /**
     * Unregister data source
     * @param {string} name Source name
     * @param {function} fn Data function
     * @param {object} context fn's context
     */
    unregisterSource: function(name, fn, context) {
        this.un("source-" + name, fn, context);
    },

    /**
     * Collect data from data source
     * @param {string} name Source name
     * @returns {object|array}
     */
    collect: function(name) {
        arguments[0] = "source-" + arguments[0];
        return this.trigger.apply(this, arguments);
    },

    /**
     * Get parent component for given node
     * @param {Node} node 
     * @param {bool} includeSelf 
     * @returns {MetaphorJs.app.Component}
     */
    getParentCmp: function(node, includeSelf) {

        var self    = this,
            parent  = includeSelf ? node : node.parentNode,
            id;

        while (parent) {
            if (id = (dom_getAttr(parent, "cmp-id") || parent.$$cmpId)) {
                return self.getCmp(id);
            }
            parent = parent.parentNode;
        }

        return null;
    },

    /**
     * Register callback for when component becomes available
     * @param {string} cmpId 
     * @param {function} fn 
     * @param {object} context 
     * @returns {lib_Promise}
     */
    onAvailable: function(cmpId, fn, context) {

        var self = this,
            cmpListeners = self.cmpListeners,
            components = self.components;

        if (!cmpListeners[cmpId]) {
            cmpListeners[cmpId] = new lib_Promise;
        }

        if (fn) {
            cmpListeners[cmpId].done(fn, context);
        }

        if (components[cmpId]) {
            cmpListeners[cmpId].resolve(components[cmpId])
        }

        return cmpListeners[cmpId];
    },

    /**
     * Get component
     * @param {string} id 
     * @returns {MetaphorJs.app.Component}
     */
    getCmp: function(id) {
        return this.components[id] || null;
    },

    /**
     * Register component
     * @param {MetaphorJs.app.Component} cmp 
     * @param {lib_Scope} scope 
     * @param {string} byKey 
     */
    registerCmp: function(cmp, scope, byKey) {
        var self = this,
            id = cmp[byKey],
            deregister = function() {
                delete self.cmpListeners[id];
                delete self.components[id];
            };

        self.components[id] = cmp;

        if (self.cmpListeners[id]) {
            self.cmpListeners[id].resolve(cmp);
        }

        if (cmp.on) {
            cmp.on("destroy", deregister);
        }
        scope.$on("destroy", deregister);
    },

    onDestroy: function() {

        var self    = this;

        self.renderer.$destroy();
        self.scope.$destroy();
        self.lang.$destroy();

        self.$super();
    }

});





/**
 * Is node attached to DOM
 * @function MetaphorJs.dom.isAttached
 * @param {DomNode} node
 * @returns {boolean}
 */
var isAttached = MetaphorJs.dom.isAttached = function dom_isAttached(node) {

    if (node === window) {
        return true;
    }
    if (node.nodeType == 3) {
        if (node.parentElement) {
            return dom_isAttached(node.parentElement);
        }
        else {
            return true;
        }
    }

    var html = window.document.documentElement;

    return node === html ? true : html.contains(node);
};






/**
 * Get dom data value
 * @function MetaphorJs.dom.data
 * @param {Element} el
 * @param {string} key
 */

/**
 * Set dom data value
 * @function MetaphorJs.dom.data
 * @param {Element} el
 * @param {string} key
 * @param {*} value
 * @param {string|null} action Pass "remove" to delete one data key or all keys
 * @returns {*}
 */
var dom_data = MetaphorJs.dom.data = function(){
//dataCache   = {},
    var getNodeKey  = function(key) {
            return '$$mjs-' + key;
        }/*,

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        }*/;


    return function dom_data(el, key, value, action) {
        //var id  = getNodeId(el),
        //    obj = dataCache[id];
        var nodekey = getNodeKey(key);

        if (action === 'remove') {
            if (key) {
                //obj && (delete obj[key]);
                delete el[nodekey];
            }
            else {
                //delete dataCache[id];
            }
            return;
        }

        if (value !== undf) {
            /*if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;*/
            el[nodekey] = value;
            return value;
        }
        else {
            //return obj ? obj[key] : undf;
            return el[nodekey];
        }
    };

}();




var dom_toFragment = MetaphorJs.dom.toFragment = function dom_toFragment(nodes, doc) {

    var fragment = (doc || window.document).createDocumentFragment(),
        i, l;

    if (isString(nodes)) {
        var tmp = window.document.createElement('div');
        tmp.innerHTML = nodes;
        nodes = tmp.childNodes;
    }

    if (!nodes) {
        return fragment;
    }

    if (nodes.nodeType) {
        fragment.appendChild(nodes);
    }
    else {
        // due to a bug in jsdom, we turn NodeList into array first
        if (nodes.item) {
            var tmpNodes = nodes;
            nodes = [];
            for (i = -1, l = tmpNodes.length >>> 0; ++i !== l; nodes.push(tmpNodes[i])) {}
        }

        for (i = -1, l = nodes.length; ++i !== l; fragment.appendChild(nodes[i])) {}
    }

    return fragment;
};





/**
 * Clone dom node (or array of nodes)
 * @function MetaphorJs.dom.clone
 * @param {[]|Element} node
 * @returns {[]|Element}
 */
var dom_clone = MetaphorJs.dom.clone = function dom_clone(node) {

    var i, len, cloned;

    if (isArray(node)) {
        cloned = [];
        for (i = 0, len = node.length; i < len; i++) {
            cloned.push(dom_clone(node[i]));
        }
        return cloned;
    }
    else if (node) {
        switch (node.nodeType) {
            // element
            case 1:
                return node.cloneNode(true);
            // text node
            case 3:
                return window.document.createTextNode(node.innerText || node.textContent);
            // document fragment
            case 11:
                return node.cloneNode(true);

            default:
                return null;
        }
    }

    return null;
};




MetaphorJs.animate = MetaphorJs.animate || {};





var animate_getPrefixes = MetaphorJs.animate.getPrefixes = function(){

    var domPrefixes         = ['Moz', 'Webkit', 'ms', 'O', 'Khtml'],
        animationDelay      = "animationDelay",
        animationDuration   = "animationDuration",
        transitionDelay     = "transitionDelay",
        transitionDuration  = "transitionDuration",
        transform           = "transform",
        transitionend       = null,
        prefixes            = null,

        probed              = false,

        detectCssPrefixes   = function() {

            var el = window.document.createElement("div"),
                animation = false,
                pfx,
                i, len;

            if (el.style['animationName'] !== undf) {
                animation = true;
            }
            else {
                for(i = 0, len = domPrefixes.length; i < len; i++) {
                    pfx = domPrefixes[i];
                    if (el.style[ pfx + 'AnimationName' ] !== undf) {
                        animation           = true;
                        animationDelay      = pfx + "AnimationDelay";
                        animationDuration   = pfx + "AnimationDuration";
                        transitionDelay     = pfx + "TransitionDelay";
                        transitionDuration  = pfx + "TransitionDuration";
                        transform           = pfx + "Transform";
                        break;
                    }
                }
            }

            if (animation) {
                if('ontransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'transitionend';
                }
                else if('onwebkittransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'webkitTransitionEnd';
                }
            }

            return animation;
        };


    /**
     * Get css prefixes used in current browser
     * @function MetaphorJs.animate.getPrefixes
     * @returns {object} {
     *  @type {string} animationDelay
     *  @type {string} animationDuration
     *  @type {string} transitionDelay
     *  @type {string} transitionDuration
     *  @type {string} transform
     *  @type {string} transitionend
     * }
     */
    return function() {

        if (!probed) {
            if (detectCssPrefixes()) {
                prefixes = {
                    animationDelay: animationDelay,
                    animationDuration: animationDuration,
                    transitionDelay: transitionDelay,
                    transitionDuration: transitionDuration,
                    transform: transform,
                    transitionend: transitionend
                };
            }
            else {
                prefixes = {};
            }

            probed = true;
        }


        return prefixes;
    };
}();






var animate_getDuration = MetaphorJs.animate.getDuration = function(){

    var parseTime       = function(str) {
            if (!str) {
                return 0;
            }
            var time = parseFloat(str);
            if (str.indexOf("ms") === -1) {
                time *= 1000;
            }
            return time;
        },

        getMaxTimeFromPair = function(max, dur, delay) {

            var i, sum, len = dur.length;

            for (i = 0; i < len; i++) {
                sum = parseTime(dur[i]) + parseTime(delay[i]);
                max = Math.max(sum, max);
            }

            return max;
        },

        pfx                 = false,
        animationDuration   = null,
        animationDelay      = null,
        transitionDuration  = null,
        transitionDelay     = null;


    /**
     * Get duration in milliseconds from html 
     * element based on current computed style
     * @function MetaphorJs.animate.getDuration
     * @param {Element} el
     * @returns {number}
     */
    return function(el) {

        if (pfx === false) {
            pfx = animate_getPrefixes();
            animationDuration = pfx ? pfx.animationDuration : null;
            animationDelay = pfx ? pfx.animationDelay : null;
            transitionDuration = pfx ? pfx.transitionDuration : null;
            transitionDelay = pfx ? pfx.transitionDelay : null;
        }

        if (!pfx) {
            return 0;
        }

        var style       = window.getComputedStyle ? window.getComputedStyle(el, null) : el.style,
            duration    = 0,
            animDur     = (style[animationDuration] || '').split(','),
            animDelay   = (style[animationDelay] || '').split(','),
            transDur    = (style[transitionDuration] || '').split(','),
            transDelay  = (style[transitionDelay] || '').split(',');

        duration    = Math.max(duration, getMaxTimeFromPair(duration, animDur, animDelay));
        duration    = Math.max(duration, getMaxTimeFromPair(duration, transDur, transDelay));

        return duration;
    };

}();








/**
 * Is css animation supported in current browser
 * @function MetaphorJs.animate.isCssSupported
 * @returns {bool}
 */
var animate_isCssSupported = MetaphorJs.animate.isCssSupported = (function(){

    var cssAnimations = null;

    return function() {
        if (cssAnimations === null) {
            cssAnimations   = !!animate_getPrefixes();
        }
        return cssAnimations;
    };
}());




//https://gist.github.com/gre/1650294
var animate_easing = MetaphorJs.animate.easing = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity 
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity 
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity 
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity 
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}



/**
 * Get cached regular expression
 * @function getRegExp
 * @param {string} expr
 * @returns {RegExp}
 */
function getRegExp(expr) {
    var g = lib_Cache.global(),
        k = "regex_"+expr;
    return g.get(k) || g.add(k, new RegExp(expr));
};






/**
 * @param {String} cls
 * @returns {RegExp}
 */
var dom_getClsReg = MetaphorJs.dom.getClsReg = function(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};





/**
 * @function MetaphorJs.dom.hasClass
 * @param {Element} el
 * @param {String} cls
 * @returns {boolean}
 */
var dom_hasClass = MetaphorJs.dom.hasClass = function(el, cls) {
    return cls ? dom_getClsReg(cls).test(el.className) : false;
};





/**
 * @function MetaphorJs.dom.addClass
 * @param {Element} el
 * @param {string} cls
 */
var dom_addClass = MetaphorJs.dom.addClass = function dom_addClass(el, cls) {
    if (cls && !dom_hasClass(el, cls)) {
        el.className += " " + cls;
    }
};








/**
 * Remove element's class
 * @function MetaphorJs.dom.removeClass
 * @param {DomNode} el
 * @param {string} cls
 */
var dom_removeClass = MetaphorJs.dom.removeClass = function(el, cls) {
    if (cls) {
        el.className = el.className.replace(dom_getClsReg(cls), '');
    }
};



var raf = function() {

    var raf,
        cancel;

    if (typeof window !== strUndef) {
        var w   = window;
        raf     = w.requestAnimationFrame ||
                    w.webkitRequestAnimationFrame ||
                    w.mozRequestAnimationFrame;
        cancel  = w.cancelAnimationFrame ||
                    w.webkitCancelAnimationFrame ||
                    w.mozCancelAnimationFrame ||
                    w.webkitCancelRequestAnimationFrame;

        if (raf) {
            return function(fn, context, args) {
                var id = raf(context || args ? function(){
                    fn.apply(context, args || []);
                } : fn);
                return function() {
                    cancel(id);
                };
            };
        }
    }

    return function(fn, context, args){
        var id = async(fn, context, args, 0);
        return function(){
            clearTimeout(id);
        };
    };

}();












var animate_animate = MetaphorJs.animate.animate = function(){

    var types           = {
            "show":     ["mjs-show"],
            "hide":     ["mjs-hide"],
            "enter":    ["mjs-enter"],
            "leave":    ["mjs-leave"],
            "move":     ["mjs-move"]
        },

        animId          = 0,
        dataParam       = "mjsAnimationQueue",

        callTimeout     = function(fn, startTime, duration) {
            var tick = function(){
                var time = (new Date).getTime();
                if (time - startTime >= duration) {
                    fn();
                }
                else {
                    raf(tick);
                }
            };
            raf(tick);
        },


        nextInQueue     = function(el) {
            var queue = dom_data(el, dataParam),
                next;
            if (queue.length) {
                next = queue[0];
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false, next.id, next.step);
            }
            else {
                dom_data(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback,
                                                  deferred, first, id, stepCallback) {

            var stopped   = function() {
                var q = dom_data(el, dataParam);
                if (!q || !q.length || q[0].id != id) {
                    deferred.reject(el);
                    return true;
                }
                return false;
            };

            var finishStage = function() {

                if (stopped()) {
                    return;
                }

                var thisPosition = position;

                position++;

                if (position === stages.length) {
                    deferred.resolve(el);
                    dom_data(el, dataParam).shift();
                    nextInQueue(el);
                }
                else {
                    dom_data(el, dataParam)[0].position = position;
                    animationStage(el, stages, position, null, deferred, false, id, stepCallback);
                }

                dom_removeClass(el, stages[thisPosition]);
                dom_removeClass(el, stages[thisPosition] + "-active");
            };

            var setStage = function() {

                if (!stopped()) {

                    dom_addClass(el, stages[position] + "-active");

                    lib_Promise.resolve(stepCallback && stepCallback(el, position, "active"))
                        .done(function(){
                            if (!stopped()) {

                                var duration = animate_getDuration(el);

                                if (duration) {
                                    callTimeout(finishStage, (new Date).getTime(), duration);
                                }
                                else {
                                    raf(finishStage);
                                }
                            }
                        });
                }

            };

            var start = function(){

                if (!stopped()) {
                    dom_addClass(el, stages[position]);

                    lib_Promise.waterfall([
                            stepCallback && stepCallback(el, position, "start"),
                            function(){
                                return startCallback ? startCallback(el) : null;
                            }
                        ])
                        .done(function(){
                            !stopped() && raf(setStage);
                        });
                }
            };

            first ? raf(start) : start();
        },


        jsAnimation = function(el, animation, deferred, startCallback, stepCallback) {

            var duration    = animation.duration || 500,
                timingFn    = animation.timing || "linear",
                from        = animation.from,
                to          = animation.to,
                draw        = animation.draw;
                
            timingFn = typeof timingFn === "string" ? 
                            animate_easing[timingFn] :
                            timingFn;

            if (!timingFn) {
                throw new Error("Missing easing function " + animation.timing);
            }

            typeof from === "function" && (from = from(el));
            typeof to === "function" && (to = to(el));

            var calc = animation.calc || function(from, to, frac) {
                return from + ((to - from) * frac);
            };
            
            var apply = function(progress) {

                var res;

                if (isPlainObject(to)) {
                    res = {};
                    for (var k in to) {
                        res[k] = calc(from[k], to[k], progress, k);
                    }
                }
                else {
                    res = calc(from, to, progress);
                }

                draw(el, res);
                stepCallback && stepCallback(el, res);
            };

            var step = function() {
                // timeFraction goes from 0 to 1
                var time = (new Date).getTime();
                var timeFraction = (time - start) / duration;
                if (timeFraction > 1) timeFraction = 1;
    
                // calculate the current animation state
                var progress = timingFn(timeFraction);
    
                apply(progress); // draw it
    
                if (timeFraction < 1) {
                    raf(step);
                }
                else {
                    deferred.resolve(el);
                }
            };
            
            var start = (new Date).getTime();
            startCallback && startCallback(el);
            step(start);
        };


    /**
     * @function MetaphorJs.animate.animate
     * @param {Element} el Element being animated
     * @param {string|function|[]|object} animation {
     *  'string' - registered animation name,<br>
     *  'function' - fn(el, callback) - your own animation<br>
     *  'array' - array or stages (class names)<br>
     *  'array' - [{before}, {after}] - jquery animation<br>
     *  'object' - {stages, fn, before, after, options, context, duration, start}
     * }
     * @param {function} startCallback call this function before animation begins
     * @param {function} stepCallback call this function between stages
     * @returns {lib_Promise}
     */
    var animate = function animate(el, animation, startCallback, stepCallback) {

        var deferred    = new lib_Promise,
            queue       = dom_data(el, dataParam) || [],
            id          = ++animId,
            stages,
            jsFn,
            before, after,
            options, context,
            duration;

        if (animation) {

            if (isString(animation)) {
                stages = types[animation];
            }
            else if (isFunction(animation)) {
                jsFn = animation;
            }
            else if (isArray(animation)) {
                if (isString(animation[0])) {
                    stages = animation;
                }
                else {
                    before = animation[0];
                    after = animation[1];
                }
            }
            else if (isPlainObject(animation)) {
                stages      = animation.stages;
                jsFn        = animation.fn;
                before      = animation.before;
                after       = animation.after;
                options     = animation.options ? extend({}, animation.options) : {};
                context     = animation.context || null;
                duration    = animation.duration || null;
                startCallback   = startCallback || options.start;
            }

            if (animate_isCssSupported() && stages) {

                queue.push({
                    el: el,
                    stages: stages,
                    start: startCallback,
                    step: stepCallback,
                    deferred: deferred,
                    position: 0,
                    id: id
                });
                dom_data(el, dataParam, queue);

                if (queue.length === 1) {
                    animationStage(el, stages, 0, startCallback, deferred, true, id, stepCallback);
                }

                return deferred;
            }
            else if (animation.draw) {
                jsAnimation(el, animation, deferred, startCallback, stepCallback);
                return deferred;
            }
            else {

                options = options || {};

                startCallback && (options.start = function(){
                    startCallback(el);
                });

                options.complete = function() {
                    deferred.resolve(el);
                };

                duration && (options.duration = duration);

                if (jsFn && isFunction(jsFn)) {
                    if (before) {
                        extend(el.style, before, true, false);
                    }
                    startCallback && startCallback(el);
                    dom_data(el, dataParam, jsFn.call(context, el, function(){
                        deferred.resolve(el);
                    }));
                    return deferred;
                }
                else if (window.jQuery) {

                    var j = $(el);
                    before && j.css(before);
                    dom_data(el, dataParam, "stop");

                    if (jsFn && isString(jsFn)) {
                        j[jsFn](options);
                        return deferred;
                    }
                    else if (after) {
                        j.animate(after, options);
                        return deferred;
                    }
                }
            }
        }

        // no animation happened

        if (startCallback) {
            var promise = startCallback(el);
            if (isThenable(promise)) {
                promise.done(function(){
                    deferred.resolve(el);
                });
            }
            else {
                deferred.resolve(el);
            }
        }
        else {
            deferred.resolve(el);
        }

        return deferred;
    };

    /**
     * @function MetaphorJs.animate.animate.addAnimationType
     * @param {string} name 
     * @param {array} stages 
     */
    animate.addAnimationType     = function(name, stages) {
        types[name] = stages;
    };

    return animate;
}();






/**
 * Modified version of YASS (http://yass.webo.in)
 */

/**
 * Returns array of nodes or an empty array
 * @function MetaphorJs.dom.select
 * @param {string} selector
 * @param {Element} root to look into
 */
var select = MetaphorJs.dom.select = function() {

    var rGeneric    = /^[\w[:#.][\w\]*^|=!]*$/,
        rQuote      = /=([^\]]+)/,
        rGrpSplit   = / *, */,
        rRepPlus    = /(\([^)]*)\+/,
        rRepTild    = /(\[[^\]]+)~/,
        rRepAll     = /(~|>|\+)/,
        rSplitPlus  = / +/,
        rSingleMatch= /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?::([^(]+)(?:\(([^)]+)\))?)?/,
        rNthNum     = /(?:(-?\d*)n)?(?:(%|-)(\d*))?/,
        rNonDig     = /\D/,
        rRepPrnth   = /[^(]*\(([^)]*)\)/,
        rRepAftPrn  = /\(.*/,
        rGetSquare  = /\[([^!~^*|$ [:=]+)([$^*|]?=)?([^ :\]]+)?\]/,

        doc         = window.document,
        bcn         = !!doc.getElementsByClassName,
        qsa         = !!doc.querySelectorAll,

        /*
         function calls for CSS2/3 modificatos. Specification taken from
         http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
         on success return negative result.
         */
        mods        = {
            /* W3C: "an E element, first child of its parent" */
            'first-child': function (child) {
                /* implementation was taken from jQuery.1.2.6, line 1394 */
                return child.parentNode.getElementsByTagName('*')[0] !== child;
            },
            /* W3C: "an E element, last child of its parent" */
            'last-child': function (child) {
                var brother = child;
                /* loop in lastChilds while nodeType isn't element */
                while ((brother = brother.nextSibling) && brother.nodeType !== 1) {}
                /* Check for node's existence */
                return !!brother;
            },
            /* W3C: "an E element, root of the document" */
            root: function (child) {
                return child.nodeName.toLowerCase() !== 'html';
            },
            /* W3C: "an E element, the n-th child of its parent" */
            'nth-child': function (child, ind) {
                var i = child.nodeIndex || 0,
                    a = ind[3] = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                /* check if we have already looked into siblings, using exando - very bad */
                if (i) {
                    return !( (i + a) % b);
                } else {
                    /* in the other case just reverse logic for n and loop siblings */
                    var brother = child.parentNode.firstChild;
                    i++;
                    /* looping in child to find if nth expression is correct */
                    do {
                        /* nodeIndex expando used from Peppy / Sizzle/ jQuery */
                        if (brother.nodeType === 1 && (brother.nodeIndex = ++i) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.nextSibling);
                    return 1;
                }
            },
            /*
             W3C: "an E element, the n-th child of its parent,
             counting from the last one"
             */
            'nth-last-child': function (child, ind) {
                /* almost the same as the previous one */
                var i = child.nodeIndexLast || 0,
                    a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                if (i) {
                    return !( (i + a) % b);
                } else {
                    var brother = child.parentNode.lastChild;
                    i++;
                    do {
                        if (brother.nodeType === 1 && (brother.nodeLastIndex = i++) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.previousSibling);
                    return 1;
                }
            },
            /*
             Rrom w3.org: "an E element that has no children (including text nodes)".
             Thx to John, from Sizzle, 2008-12-05, line 416
             */
            empty: function (child) {
                return !!child.firstChild;
            },
            /* thx to John, stolen from Sizzle, 2008-12-05, line 413 */
            parent: function (child) {
                return !child.firstChild;
            },
            /* W3C: "an E element, only child of its parent" */
            'only-child': function (child) {
                return child.parentNode.getElementsByTagName('*').length !== 1;
            },
            /*
             W3C: "a user interface element E which is checked
             (for instance a radio-button or checkbox)"
             */
            checked: function (child) {
                return !child.checked;
            },
            /*
             W3C: "an element of type E in language "fr"
             (the document language specifies how language is determined)"
             */
            lang: function (child, ind) {
                return child.lang !== ind && doc.documentElement.lang !== ind;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 398 */
            enabled: function (child) {
                return child.disabled || child.type === 'hidden';
            },
            /* thx to John, from Sizzle, 2008-12-05, line 401 */
            disabled: function (child) {
                return !child.disabled;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 407 */
            selected: function(elem){
                /*
                 Accessing this property makes selected-by-default
                 options in Safari work properly.
                 */
                var tmp = elem.parentNode.selectedIndex;
                return !elem.selected;
            }
        },

        attrRegCache = {},

        getAttrReg  = function(value) {
            return attrRegCache[value] || (attrRegCache[value] = new RegExp('(^| +)' + value + '($| +)'));
        },

        attrMods    = {
            /* W3C "an E element with a "attr" attribute" */
            '': function (child, name) {
                return dom_getAttr(child, name) !== null;
            },
            /*
             W3C "an E element whose "attr" attribute value is
             exactly equal to "value"
             */
            '=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name)) && attrValue === value;
            },
            /*
             from w3.prg "an E element whose "attr" attribute value is
             a list of space-separated values, one of which is exactly
             equal to "value"
             */
            '&=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name)) && getAttrReg(value).test(attrValue);
            },
            /*
             from w3.prg "an E element whose "attr" attribute value
             begins exactly with the string "value"
             */
            '^=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name) + '') && !attrValue.indexOf(value);
            },
            /*
             W3C "an E element whose "attr" attribute value
             ends exactly with the string "value"
             */
            '$=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name) + '') &&
                       attrValue.indexOf(value) === attrValue.length - value.length;
            },
            /*
             W3C "an E element whose "attr" attribute value
             contains the substring "value"
             */
            '*=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name) + '') && attrValue.indexOf(value) !== -1;
            },
            /*
             W3C "an E element whose "attr" attribute has
             a hyphen-separated list of values beginning (from the
             left) with "value"
             */
            '|=': function (child, name, value) {
                var attrValue;
                return (attrValue = dom_getAttr(child, name) + '') &&
                       (attrValue === value || !!attrValue.indexOf(value + '-'));
            },
            /* attr doesn't contain given value */
            '!=': function (child, name, value) {
                var attrValue;
                return !(attrValue = dom_getAttr(child, name)) || !getAttrReg(value).test(attrValue);
            }
        };


    return function(selector, root, noNative) {

        /* clean root with document */
        root = root || doc;

        /* sets of nodes, to handle comma-separated selectors */
        var sets    = [],
            qsaErr  = null,
            idx, cls, nodes,
            i, node, ind, mod,
            attrs, attrName, eql, value;

        if (qsa && root.querySelectorAll && !noNative) {
            /* replace not quoted args with quoted one -- Safari doesn't understand either */
            try {
                sets = toArray(root.querySelectorAll(selector.replace(rQuote, '="$1"')));
            }
            catch (thrownError) {
                error(thrownError);
                qsaErr = true;
            }
        }

        if (!qsa || qsaErr || noNative) {

            /* quick return or generic call, missed ~ in attributes selector */
            if (rGeneric.test(selector)) {

                /*
                 some simple cases - only ID or only CLASS for the very first occurence
                 - don't need additional checks. Switch works as a hash.
                 */
                idx = 0;

                /* the only call -- no cache, thx to GreLI */
                switch (selector.charAt(0)) {

                    case '#':
                        idx = selector.slice(1);
                        sets = doc.getElementById(idx);

                        /*
                         workaround with IE bug about returning element by name not by ID.
                         Solution completely changed, thx to deerua.
                         Get all matching elements with this id
                         */
                        if (sets.id !== idx) {
                            sets = doc.all[idx];
                        }

                        sets = sets ? [sets] : [];
                        break;

                    case '.':

                        cls = selector.slice(1);

                        if (bcn) {

                            sets = toArray((idx = (sets = root.getElementsByClassName(cls)).length) ? sets : []);

                        } else {

                            /* no RegExp, thx to DenVdmj */
                            cls = ' ' + cls + ' ';

                            nodes = root.getElementsByTagName('*');
                            i = 0;

                            while (node = nodes[i++]) {
                                if ((' ' + node.className + ' ').indexOf(cls) !== -1) {
                                    sets[idx++] = node;
                                }

                            }
                            sets = idx ? sets : [];
                        }
                        break;

                    case ':':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        ind     = selector.replace(rRepPrnth,"$1");
                        mod     = selector.replace(rRepAftPrn,'');

                        while (node = nodes[i++]) {
                            if (mods[mod] && !mods[mod](node, ind)) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    case '[':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        attrs   = rGetSquare.exec(selector);
                        attrName    = attrs[1];
                        eql     = attrs[2] || '';
                        value   = attrs[3];

                        while (node = nodes[i++]) {
                            /* check either attr is defined for given node or it's equal to given value */
                            if (attrMods[eql] && (attrMods[eql](node, attrName, value) ||
                                                  (attrName === 'class' && attrMods[eql](node, 'className', value)))) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    default:
                        sets = toArray((idx = (sets = root.getElementsByTagName(selector)).length) ? sets : []);
                        break;
                }

            } else {

                /* number of groups to merge or not result arrays */
                /*
                 groups of selectors separated by commas.
                 Split by RegExp, thx to tenshi.
                 */
                var groups  = selector.split(rGrpSplit),
                    gl      = groups.length - 1, /* group counter */
                    concat  = !!gl, /* if we need to concat several groups */
                    group,
                    singles,
                    singles_length,
                    single, /* to handle RegExp for single selector */
                    ancestor, /* to remember ancestor call for next childs, default is " " */
                /* for inner looping */
                    tag, id, klass, newNodes, J, child, last, childs, item, h;

                /* loop in groups, maybe the fastest way */
                while (group = groups[gl--]) {

                    /*
                     Split selectors by space - to form single group tag-id-class,
                     or to get heredity operator. Replace + in child modificators
                     to % to avoid collisions. Additional replace is required for IE.
                     Replace ~ in attributes to & to avoid collisions.
                     */
                    singles_length = (singles = group
                        .replace(rRepPlus,"$1%")
                        .replace(rRepTild,"$1&")
                        .replace(rRepAll," $1 ").split(rSplitPlus)).length;

                    i = 0;
                    ancestor = ' ';
                    /* is cleanded up with DOM root */
                    if (root instanceof DocumentFragment) {
                        nodes = root.children;
                    }
                    else {
                        nodes = [root];
                    }

                    /*
                     John's Resig fast replace works a bit slower than
                     simple exec. Thx to GreLI for 'greed' RegExp
                     */
                    while (single = singles[i++]) {

                        /* simple comparison is faster than hash */
                        if (single !== ' ' && single !== '>' &&
                            single !== '~' && single !== '+' && nodes) {

                            single = single.match(rSingleMatch);

                            /*
                             Get all required matches from exec:
                             tag, id, class, attribute, value, modificator, index.
                             */
                            tag     = single[1] || '*';
                            id      = single[2];
                            klass   = single[3] ? ' ' + single[3] + ' ' : '';
                            attrName    = single[4];
                            eql     = single[5] || '';
                            mod     = single[7];

                            /*
                             for nth-childs modificator already transformed into array.
                             Example used from Sizzle, rev. 2008-12-05, line 362.
                             */
                            ind = mod === 'nth-child' ||
                                    mod === 'nth-last-child' ?
                                  rNthNum.exec(
                                      single[8] === 'even' && '2n' ||
                                      single[8] === 'odd' && '2n%1' ||
                                      !rNonDig.test(single[8]) && '0n%' + single[8] ||
                                      single[8]
                                  ) :
                                  single[8];

                            /* new nodes array */
                            newNodes = [];

                            /*
                             cached length of new nodes array
                             and length of root nodes
                             */
                            idx = J = 0;

                            /* if we need to mark node with expando yeasss */
                            last = i === singles_length;

                            /* loop in all root nodes */
                            while (child = nodes[J++]) {
                                /*
                                 find all TAGs or just return all possible neibours.
                                 Find correct 'children' for given node. They can be
                                 direct childs, neighbours or something else.
                                 */
                                switch (ancestor) {
                                    case ' ':
                                        if (child.getElementsByTagName) {
                                            childs = child.getElementsByTagName(tag);
                                            h = 0;
                                            while (item = childs[h++]) {
                                                /*
                                                check them for ID or Class. Also check for expando 'yeasss'
                                                to filter non-selected elements. Typeof 'string' not added -
                                                if we get element with name="id" it won't be equal to given ID string.
                                                Also check for given attributes selector.
                                                Modificator is either not set in the selector, or just has been nulled
                                                by modificator functions hash.
                                                */
                                                if ((!id || item.id === id) &&
                                                    (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                    (!attrName || (attrMods[eql] &&
                                                            (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                attrMods[eql](item, 'className', single[6]))))) &&
                                                    !item.yeasss && !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                    /*
                                                    Need to define expando property to true for the last step.
                                                    Then mark selected element with expando
                                                    */
                                                    if (last) {
                                                        item.yeasss = 1;
                                                    }
                                                    newNodes[idx++] = item;
                                                }
                                            }
                                        }
                                        break;
                                    /* W3C: "an F element preceded by an E element" */
                                    case '~':

                                        tag = tag.toLowerCase();

                                        /* don't touch already selected elements */
                                        while ((child = child.nextSibling) && !child.yeasss) {
                                            if (child.nodeType === 1 &&
                                                (tag === '*' || child.nodeName.toLowerCase() === tag) &&
                                                (!id || child.id === id) &&
                                                (!klass || (' ' + child.className + ' ').indexOf(klass) !== -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !child.yeasss &&
                                                !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                                if (last) {
                                                    child.yeasss = 1;
                                                }
                                                newNodes[idx++] = child;
                                            }
                                        }
                                        break;

                                    /* W3C: "an F element immediately preceded by an E element" */
                                    case '+':
                                        while ((child = child.nextSibling) && child.nodeType !== 1) {}
                                        if (child &&
                                            (child.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') &&
                                            (!id || child.id === id) &&
                                            (!klass || (' ' + item.className + ' ').indexOf(klass) !== -1) &&
                                            (!attrName ||
                                             (attrMods[eql] && (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                 attrMods[eql](item, 'className', single[6]))))) &&
                                            !child.yeasss && !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                            if (last) {
                                                child.yeasss = 1;
                                            }
                                            newNodes[idx++] = child;
                                        }
                                        break;

                                    /* W3C: "an F element child of an E element" */
                                    case '>':
                                        if (child.getElementsByTagName) {
                                            childs = child.getElementsByTagName(tag);
                                            i = 0;
                                            while (item = childs[i++]) {
                                                if (item.parentNode === child &&
                                                    (!id || item.id === id) &&
                                                    (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                    (!attrName || (attrMods[eql] &&
                                                            (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                attrMods[eql](item, 'className', single[6]))))) &&
                                                    !item.yeasss &&
                                                    !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                    if (last) {
                                                        item.yeasss = 1;
                                                    }
                                                    newNodes[idx++] = item;
                                                }
                                            }
                                        }
                                        break;
                                }
                            }

                            /* put selected nodes in local nodes' set */
                            nodes = newNodes;

                        } else {

                            /* switch ancestor ( , > , ~ , +) */
                            ancestor = single;
                        }
                    }

                    if (concat) {
                        /* if sets isn't an array - create new one */
                        if (!nodes.concat) {
                            newNodes = [];
                            h = 0;
                            while (item = nodes[h]) {
                                newNodes[h++] = item;
                            }
                            nodes = newNodes;
                            /* concat is faster than simple looping */
                        }
                        sets = nodes.concat(sets.length === 1 ? sets[0] : sets);

                    } else {

                        /* inialize sets with nodes */
                        sets = nodes;
                    }
                }

                /* define sets length to clean up expando */
                idx = sets.length;

                /*
                 Need this looping as far as we also have expando 'yeasss'
                 that must be nulled. Need this only to generic case
                 */
                while (idx--) {
                    sets[idx].yeasss = sets[idx].nodeIndex = sets[idx].nodeIndexLast = null;
                }
            }
        }

        /* return and cache results */
        return sets;
    };
}();



/**
 * Transform xml into a document
 * @function parseXML
 * @param {string} data 
 * @param {string} type 
 * @returns {Document}
 */
function parseXML(data, type) {

    var xml, tmp;

    if (!data || !isString(data)) {
        return null;
    }

    // Support: IE9
    try {
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, type || "text/xml");
    } 
    catch (thrownError) {
        error(thrownError);
        xml = undf;
    }

    if (!xml || xml.getElementsByTagName("parsererror").length) {
        throw new Error("Invalid XML: " + data);
    }

    return xml;
};




/**
 * @mixin MetaphorJs.mixin.Promise
 */
var mixin_Promise = MetaphorJs.mixin.Promise = {

    $$promise: null,

    $beforeInit: function() {
        this.$$promise = new lib_Promise;
    },

    /**
     * @method
     * @async
     * @param {Function} resolve -- called when this promise is resolved; 
     *  returns new resolve value or promise
     * @param {Function} reject -- called when this promise is rejected; 
     *  returns new reject reason
     * @param {object} context -- resolve's and reject's functions "this" object
     * @returns {Promise} new promise
     */
    then: function() {
        return this.$$promise.then.apply(this.$$promise, arguments);
    },

    /**
     * Add resolve listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise is resolved
     * @param {Object} context -- function's "this" object
     * @returns {Promise} same promise
     */
    done: function() {
        this.$$promise.done.apply(this.$$promise, arguments);
        return this;
    },

    /**
     * Add both resolve and reject listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise resolved or rejected
     * @param {Object} context -- function's "this" object
     * @return {Promise} same promise
     */
    always: function() {
        this.$$promise.always.apply(this.$$promise, arguments);
        return this;
    },

    /**
     * Add reject listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise is rejected.
     * @param {Object} context -- function's "this" object
     * @returns {Promise} same promise
     */
    fail: function() {
        this.$$promise.fail.apply(this.$$promise, arguments);
        return this;
    }

};



MetaphorJs.ajax = MetaphorJs.ajax || {transport: {}};





// partly from jQuery serialize.js

var ajax_serializeParam = MetaphorJs.ajax.serializeParam = function(){

    var r20 = /%20/g,
        rbracket = /\[\]$/;

    function buildParams(prefix, obj, add) {
        var name,
            i, l, v;

        if (isArray(obj)) {
            // Serialize array item.

            for (i = 0, l = obj.length; i < l; i++) {
                v = obj[i];

                if (rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);

                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(
                        prefix + "[" + ( typeof v === "object" ? i : "" ) + "]",
                        v,
                        add
                    );
                }
            }
        } else if (isPlainObject(obj)) {
            // Serialize object item.
            for (name in obj) {
                buildParams(prefix + "[" + name + "]", obj[ name ], add);
            }

        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }

    return function(obj) {

        var prefix,
            s = [],
            add = function( key, value ) {
                // If value is a function, invoke it and return its value
                value = isFunction(value) ? value() : (value == null ? "" : value);
                s[s.length] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
            };

        for ( prefix in obj ) {
            buildParams(prefix, obj[prefix], add);
        }

        // Return the resulting serialization
        return s.join( "&" ).replace( r20, "+" );
    };


}();






var ajax_transport_XHR = MetaphorJs.ajax.transport.XHR = (function(){

    var accepts     = {
            xml:        "application/xml, text/xml",
            html:       "text/html",
            script:     "text/javascript, application/javascript",
            json:       "application/json, text/javascript",
            text:       "text/plain",
            _default:   "*/*"
        },

        createXHR       = function() {

            var xhr;

            if (!window.XMLHttpRequest || !(xhr = new XMLHttpRequest())) {
                if (!(xhr = new ActiveXObject("Msxml2.XMLHTTP"))) {
                    if (!(xhr = new ActiveXObject("Microsoft.XMLHTTP"))) {
                        throw new Error("Unable to create XHR object");
                    }
                }
            }

            return xhr;
        },

        httpSuccess     = function(r) {
            try {
                return (!r.status && window.location && 
                        window.location.protocol === "file:")
                       || (r.status >= 200 && r.status < 300)
                       || r.status === 304 || r.status === 1223; // || r.status === 0;
            } 
            catch (thrownError) {
                error(thrownError);
            }
            return false;
        };

    return cls({

        type: "xhr",
        _xhr: null,
        _deferred: null,
        _ajax: null,

        $init: function(opt, deferred, ajax) {

            var self    = this,
                xhr;

            self._xhr = xhr     = createXHR();
            self._deferred      = deferred;
            self._opt           = opt;
            self._ajax          = ajax;

            if (opt.progress) {
                xhr.onprogress = bind(opt.progress, opt.context);
            }
            if (opt.uploadProgress && xhr.upload) {
                xhr.upload.onprogress = bind(opt.uploadProgress, opt.context);
            }

            xhr.onreadystatechange = bind(self.onReadyStateChange, self);
        },

        setHeaders: function() {

            var self = this,
                opt = self._opt,
                xhr = self._xhr,
                i;

            if (opt.xhrFields) {
                for (i in opt.xhrFields) {
                    xhr[i] = opt.xhrFields[i];
                }
            }
            if (opt.data && opt.contentType) {
                xhr.setRequestHeader("Content-Type", 
                    opt.contentTypeHeader || opt.contentType
                );
            }
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("Accept",
                opt.dataType && accepts[opt.dataType] ?
                accepts[opt.dataType] + ", */*; q=0.01" :
                accepts._default
            );
            for (i in opt.headers) {
                xhr.setRequestHeader(i, opt.headers[i]);
            }

        },

        onReadyStateChange: function() {

            var self        = this,
                xhr         = self._xhr,
                deferred    = self._deferred;

            if (xhr.readyState === 0) {
                xhr.onreadystatechange = emptyFn;
                deferred.resolve(xhr);
                return;
            }

            if (xhr.readyState === 4) {
                xhr.onreadystatechange = emptyFn;

                if (httpSuccess(xhr)) {
                    self._ajax.processResponse(
                        isString(xhr.responseText) ? xhr.responseText : undf,
                        xhr.getResponseHeader("content-type") || ''
                    );
                }
                else {

                    xhr.responseData = null;

                    try {
                        // dirty hack. Prevent response processing tools
                        // from resolving the promise.
                        // they are needed to process the response though
                        // even it failed. 
                        self._ajax.$$promise = new lib_Promise;
                        xhr.responseData = self._ajax.returnResponse(
                            isString(xhr.responseText) ? xhr.responseText : undf,
                            xhr.getResponseHeader("content-type") || ''
                        );
                        self._ajax.$$promise = deferred;
                    }
                    catch (thrownErr) {
                        error(thrownError);
                    }

                    deferred.reject(xhr);
                }
            }
        },

        abort: function() {
            var self    = this;
            self._xhr.onreadystatechange = emptyFn;
            self._xhr.abort();
        },

        send: function() {

            var self    = this,
                opt     = self._opt;

            try {
                self._xhr.open(opt.method, opt.url, true, opt.username, opt.password);
                self.setHeaders();
                self._xhr.send(opt.data);
            }
            catch (thrownError) {
                error(thrownError);
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
            }
        }
    });

}());




/**
 * Function that returns false
 * @function returnFalse
 * @returns {boolean}
 */
function returnFalse() {
    return false;
};

/**
 * Function that returns true
 * @function returnTrue
 * @returns {boolean}
 */
function returnTrue() {
    return true;
};

/**
 * Check if given value is a null value
 * @function isNull
 * @param {*} value 
 * @returns {boolean}
 */
function isNull(value) {
    return value === null;
};



// from jQuery

/**
 * Dom event wrapper.
 * @class MetaphorJs.lib.DomEvent
 */

/**
 * @method DomEvent
 * @constructor
 * @param {Event} src Native event
 */
var lib_DomEvent = MetaphorJs.lib.DomEvent = function(){

var DomEvent = function DomEvent(src) {

    if (src instanceof DomEvent) {
        return src;
    }

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof DomEvent)) {
        return new DomEvent(src);
    }


    var self    = this;

    for (var i in src) {
        if (!self[i]) {
            try {
                self[i] = src[i];
            }
            catch (thrownError){}
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
    if (self.pageX === undf && !isNull(src.clientX)) {
        eventDoc = self.target ? self.target.ownerDocument || window.document : window.document;
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
    if ( !self.which && button !== undf ) {
        self.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
    }

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    self.isDefaultPrevented = src.defaultPrevented ||
                              src.defaultPrevented === undf &&
                                  // Support: Android<4.0
                              src.returnValue === false ?
                              returnTrue :
                              returnFalse;


    // Create a timestamp if incoming event doesn't have one
    self.timeStamp = src && src.timeStamp || (new Date).getTime();
};

// Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
extend(DomEvent.prototype, {

    /**
     * @method isDefaultPrevented
     * @returns {boolean}
     */
    isDefaultPrevented: returnFalse,

    /**
     * @method isPropagationStopped
     * @returns {boolean}
     */
    isPropagationStopped: returnFalse,

    /**
     * @method isImmediatePropagationStopped
     * @returns {boolean}
     */
    isImmediatePropagationStopped: returnFalse,

    /**
     * @method
     */
    preventDefault: function() {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;
        e.returnValue = false;

        if ( e && e.preventDefault ) {
            e.preventDefault();
        }
    },

    /**
     * @method
     */
    stopPropagation: function() {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;
        e.cancelBubble = true;

        if ( e && e.stopPropagation ) {
            e.stopPropagation();
        }
    },

    /**
     * @method
     */
    stopImmediatePropagation: function() {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if ( e && e.stopImmediatePropagation ) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    }
}, true, false);

return DomEvent;

}();





var dom_normalizeEvent = MetaphorJs.dom.normalizeEvent = function(originalEvent) {
    return new lib_DomEvent(originalEvent);
};


// from jquery.mousewheel plugin





var _mousewheelHandler = function(e) {

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    var nullLowestDeltaTimeout, lowestDelta;

    var mousewheelHandler = function(fn) {

        return function mousewheelHandler(e) {

            var event = dom_normalizeEvent(e || window.event),
                args = slice.call(arguments, 1),
                delta = 0,
                deltaX = 0,
                deltaY = 0,
                absDelta = 0,
                offsetX = 0,
                offsetY = 0;


            event.type = 'mousewheel';

            // Old school scrollwheel delta
            if ('detail'      in event) { deltaY = event.detail * -1; }
            if ('wheelDelta'  in event) { deltaY = event.wheelDelta; }
            if ('wheelDeltaY' in event) { deltaY = event.wheelDeltaY; }
            if ('wheelDeltaX' in event) { deltaX = event.wheelDeltaX * -1; }

            // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
            if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
                deltaX = deltaY * -1;
                deltaY = 0;
            }

            // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
            delta = deltaY === 0 ? deltaX : deltaY;

            // New school wheel delta (wheel event)
            if ('deltaY' in event) {
                deltaY = event.deltaY * -1;
                delta = deltaY;
            }
            if ('deltaX' in event) {
                deltaX = event.deltaX;
                if (deltaY === 0) { delta = deltaX * -1; }
            }

            // No change actually happened, no reason to go any further
            if (deltaY === 0 && deltaX === 0) { return; }

            // Store lowest absolute delta to normalize the delta values
            absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));

            if (!lowestDelta || absDelta < lowestDelta) {
                lowestDelta = absDelta;

                // Adjust older deltas if necessary
                if (shouldAdjustOldDeltas(event, absDelta)) {
                    lowestDelta /= 40;
                }
            }

            // Adjust older deltas if necessary
            if (shouldAdjustOldDeltas(event, absDelta)) {
                // Divide all the things by 40!
                delta /= 40;
                deltaX /= 40;
                deltaY /= 40;
            }

            // Get a whole, normalized value for the deltas
            delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
            deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
            deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);

            // Normalise offsetX and offsetY properties
            if (this.getBoundingClientRect) {
                var boundingRect = this.getBoundingClientRect();
                offsetX = event.clientX - boundingRect.left;
                offsetY = event.clientY - boundingRect.top;
            }

            // Add information to the event object
            event.deltaX = deltaX;
            event.deltaY = deltaY;
            event.deltaFactor = lowestDelta;
            event.offsetX = offsetX;
            event.offsetY = offsetY;
            // Go ahead and set deltaMode to 0 since we converted to pixels
            // Although this is a little odd since we overwrite the deltaX/Y
            // properties with normalized deltas.
            event.deltaMode = 0;

            // Add event and delta to the front of the arguments
            args.unshift(event, delta, deltaX, deltaY);

            // Clearout lowestDelta after sometime to better
            // handle multiple device types that give different
            // a different lowestDelta
            // Ex: trackpad = 3 and mouse wheel = 120
            if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
            nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);



            return fn.apply(this, args);
        }
    };

    mousewheelHandler.events = function() {
        var doc = window.document;
        return ( 'onwheel' in doc || doc.documentMode >= 9 ) ?
               ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    };

    return mousewheelHandler;

}();




/**
 * @function MetaphorJs.dom.addListener
 * @param {Element} el
 * @param {string} eventName
 * @param {function} func {
 *  @param {object} event
 * }
 */
var dom_addListener = MetaphorJs.dom.addListener = function(){

    var fn = null,
        prefix = null;

    return function dom_addListener(el, event, func) {

        if (fn === null) {
            if (el.addEventListener) {
                fn = "addEventListener";
                prefix = "";
            }
            else {
                fn = "attachEvent";
                prefix = "on";
            }
            //fn = el.attachEvent ? "attachEvent" : "addEventListener";
            //prefix = el.attachEvent ? "on" : "";
        }


        if (event == "mousewheel") {
            func = _mousewheelHandler(func);
            var events = _mousewheelHandler.events(),
                i, l;
            for (i = 0, l = events.length; i < l; i++) {
                el[fn](prefix + events[i], func, false);
            }
        }
        else {
            el[fn](prefix + event, func, false);
        }

        return func;
    }

}();






    
var ajax_transport_Script = MetaphorJs.ajax.transport.Script = cls({

    type: "script",
    _opt: null,
    _deferred: null,
    _ajax: null,
    _el: null,

    $init: function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    },

    send: function() {

        var self    = this,
            script  = document.createElement("script");

        dom_setAttr(script, "async", "async");
        dom_setAttr(script, "charset", "utf-8");
        dom_setAttr(script, "src", self._opt.url);

        dom_addListener(script, "load", bind(self.onLoad, self));
        dom_addListener(script, "error", bind(self.onError, self));

        document.head.appendChild(script);

        self._el = script;
    },

    onLoad: function(evt) {
        if (this._deferred) { // haven't been destroyed yet
            this._deferred.resolve(evt);
        }
    },

    onError: function(evt) {
        this._deferred.reject(evt);
    },

    abort: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    },

    onDestroy: function() {

        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }
});








var ajax_transport_IFrame = MetaphorJs.ajax.transport.IFrame = cls({

    type: "iframe",
    _opt: null,
    _deferred: null,
    _ajax: null,
    _el: null,
    _sent: false,

    $init: function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    },

    send: function() {

        var self    = this,
            frame   = document.createElement("iframe"),
            id      = "frame-" + nextUid(),
            form    = self._opt.form;

        dom_setAttr(frame, "id", id);
        dom_setAttr(frame, "name", id);
        frame.style.display = "none";
        document.body.appendChild(frame);

        dom_setAttr(form, "action", self._opt.url);
        dom_setAttr(form, "target", id);

        dom_addListener(frame, "load", bind(self.onLoad, self));
        dom_addListener(frame, "error", bind(self.onError, self));

        self._el = frame;

        var tries = 0;

        var submit = function() {

            tries++;

            try {
                form.submit();
                self._sent = true;
            }
            catch (thrownError) {
                error(thrownError);
                if (tries > 2) {
                    self._deferred.reject(thrownError);
                }
                else {
                    async(submit, null, [], 1000);
                }
            }
        };

        submit();
    },

    onLoad: function() {

        var self    = this,
            frame   = self._el,
            doc,
            data;

        if (!self._sent) {
            return;
        }

        if (self._opt && !self._opt.jsonp) {

            try {
                doc = frame.contentDocument || frame.contentWindow.document;
                data = doc.body.innerHTML;
                self._ajax.processResponse(data);
            }
            catch (thrownError) {
                error(thrownError);
                self._deferred.reject(thrownError);
            }
        }
    },

    onError: function(evt) {

        if (!this._sent) {
            return;
        }

        this._deferred.reject(evt);
    },

    abort: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    },

    onDestroy: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }

});















var ajax_Ajax = MetaphorJs.ajax.Ajax = (function(){

    var rquery          = /\?/,
        rurl            = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        rhash           = /#.*$/,
        rts             = /([?&])_=[^&]*/,
        rgethead        = /^(?:GET|HEAD)$/i,

        globalEvents    = new lib_Observable,

        formDataSupport = !!(window && window.FormData),

        processData     = function(data, opt, ct) {

            var type        = opt ? opt.dataType : null,
                selector    = opt ? opt.selector : null,
                doc;

            if (!isString(data)) {
                return data;
            }

            ct = ct || "";

            if (type === "xml" || !type && ct.indexOf("xml") >= 0) {
                doc = parseXML(data.trim());
                return selector ? select(selector, doc) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? select(selector, doc) : doc;
            }
            else if (type == "fragment") {
                var fragment    = document.createDocumentFragment(),
                    div         = document.createElement("div");

                div.innerHTML   = data;

                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }

                return fragment;
            }
            else if (type === "json" || !type && ct.indexOf("json") >= 0) {
                return JSON.parse(data.trim());
            }
            else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                globalEval(data);
            }

            return data + "";
        },


        fixUrlDomain    = function(url) {

            if (url.substr(0,1) == "/") {
                return location.protocol + "//" + location.host + url;
            }
            else {
                return url;
            }
        },

        prepareUrl  = function(url, opt) {

            url.replace(rhash, "");

            if (!opt.allowCache) {

                var stamp   = (new Date).getTime();

                url = rts.test(url) ?
                    // If there is already a '_' parameter, set its value
                      url.replace(rts, "$1_=" + stamp) :
                    // Otherwise add one to the end
                      url + (rquery.test(url) ? "&" : "?" ) + "_=" + stamp;
            }

            if (opt.data && opt.method != "POST" && !opt.contentType && 
                (!formDataSupport || !(opt.data instanceof window.FormData))) {

                opt.data = !isString(opt.data) ? 
                                ajax_serializeParam(opt.data) : 
                                opt.data;
                url += (rquery.test(url) ? "&" : "?") + opt.data;
                opt.data = null;
            }

            return url;
        },

        data2form       = function(data, form, name) {

            var i, input, len;

            if (!isObject(data) && !isFunction(data) && name) {
                input   = document.createElement("input");
                dom_setAttr(input, "type", "hidden");
                dom_setAttr(input, "name", name);
                dom_setAttr(input, "value", data);
                form.appendChild(input);
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    data2form(data[i], form, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        data2form(data[i], form, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },


        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
        serializeForm   = function(form) {

            var oField, sFieldType, nFile, obj = {};

            for (var nItem = 0; nItem < form.elements.length; nItem++) {

                oField = form.elements[nItem];

                if (dom_getAttr(oField, "name") === null) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                                dom_getAttr(oField, "type").toUpperCase() : 
                                "TEXT";

                if (sFieldType === "FILE") {
                    for (nFile = 0;
                         nFile < oField.files.length;
                         obj[oField.name] = oField.files[nFile++].name){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    obj[oField.name] = oField.value;
                }
            }

            return ajax_serializeParam(obj);
        },

        globalEval = function(code){
            var script, indirect = eval;
            if (code) {
                if (/^[^\S]*use strict/.test(code)) {
                    script = document.createElement("script");
                    script.text = code;
                    document.head.appendChild(script)
                        .parentNode.removeChild(script);
                } else {
                    indirect(code);
                }
            }
        };

    /**
     * @class MetaphorJs.ajax.Ajax
     * @mixes mixin:mixin_Promise
     */
    return cls({

        $mixins: [mixin_Promise],

        _jsonpName: null,
        _transport: null,
        _opt: null,
        _deferred: null,
        _promise: null,
        _timeout: null,
        _form: null,
        _removeForm: false,

        /**
         * @method
         * @constructor
         * @param {object} opt See ajax.defaults
         */
        $init: function(opt) {

            if (opt.url) {
                opt.url = fixUrlDomain(opt.url);
            }

            var self        = this,
                href        = window ? window.location.href : "",
                local       = rurl.exec(href.toLowerCase()) || [],
                parts       = rurl.exec(opt.url.toLowerCase());

            self._opt       = opt;

            if (opt.crossDomain !== true && opt.ignoreCrossDomain !== true) {
                opt.crossDomain = !!(parts &&
                                     (parts[1] !== local[1] || parts[2] !== local[2] ||
                                      (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                                      (local[3] || (local[1] === "http:" ? "80" : "443"))));
            }

            var transport;

            if (opt.files) {
                if (!formDataSupport) {
                    opt.transport = "iframe";
                }
            }

            if (opt.transport == "iframe" && !opt.form) {
                self.createForm();
                opt.form = self._form;
            }
            else if (opt.form) {
                self._form = opt.form;
                if (opt.method == "POST" && !formDataSupport) {
                    opt.transport = "iframe";
                }
            }

            if (opt.form && opt.transport != "iframe" && opt.method == "POST") {
                if (formDataSupport) {
                    opt.data = new FormData(opt.form);
                }
                else {
                    opt.contentType = "application/x-www-form-urlencoded";
                    opt.data = serializeForm(opt.form);
                }
            }
            else if (opt.contentType === "json") {
                opt.contentType = opt.contentTypeHeader || "application/json";
                opt.data = isString(opt.data) ? opt.data : JSON.stringify(opt.data);
            }
            else if (isPlainObject(opt.data) && opt.method == "POST" && formDataSupport) {

                var d = opt.data,
                    k;

                opt.data = new FormData;

                for (k in d) {
                    opt.data.append(k, d[k]);
                }
            }

            if (opt.files) {
                self.importFiles();
            }

            opt.url = prepareUrl(opt.url, opt);

            if ((opt.crossDomain || opt.transport == "script") && !opt.form) {
                transport   = new ajax_transport_Script(opt, self.$$promise, self);
            }
            else if (opt.transport == "iframe") {
                transport   = new ajax_transport_IFrame(opt, self.$$promise, self);
            }
            else {
                transport   = new ajax_transport_XHR(opt, self.$$promise, self);
            }

            //self._deferred      = deferred;
            self._transport     = transport;

            /**
             * On successful request
             * @event success
             * @param {*} value response data
             */
            self.$$promise.done(function(value) {
                globalEvents.trigger("success", value);
            });

            /**
             * On request error
             * @event error
             * @param {*} reason
             */
            self.$$promise.fail(function(reason) {
                globalEvents.trigger("error", reason);
            });

            /**
             * On request end (success or failure)
             * @event end
             */
            self.$$promise.always(function(){
                globalEvents.trigger("end");
            });

            /**
             * On request start
             * @event start
             */
            globalEvents.trigger("start");


            if (opt.timeout) {
                self._timeout = setTimeout(bind(self.onTimeout, self), opt.timeout);
            }

            if (opt.jsonp) {
                self.createJsonp();
            }

            /**
             * Before sending data
             * @event before-send
             * @param {object} opt ajax options
             * @param {MetaphorJs.ajax.transport.*} transport 
             * @returns {boolean|null} return false to cancel the request
             */
            if (globalEvents.trigger("before-send", opt, transport) === false) {
                self.$$promise.reject();
            }
            if (opt.beforeSend && opt.beforeSend.call(opt.context, opt, transport) === false) {
                self.$$promise.reject();
            }

            if (self.$$promise.isPending()) {
                async(transport.send, transport);
                self.$$promise.always(self.asyncDestroy, self);
            }
            else {
                async(self.asyncDestroy, self, [], 1000);
            }
        },

        asyncDestroy: function() {

            var self = this;

            if (self.$isDestroyed()) {
                return;
            }

            if (self.$$promise.hasListeners()) {
                async(self.asyncDestroy, self, [], 1000);
                return;
            }

            self.$destroy();
        },

        /*promise: function() {
            return this._promise;
        },*/

        /**
         * Cancel ajax request
         * @method
         * @param {string} reason
         */
        abort: function(reason) {
            this.$$promise.reject(reason || "abort");
            this._transport.abort();
            //this._deferred.reject(reason || "abort");
            return this;
        },

        onTimeout: function() {
            this.abort("timeout");
        },

        /**
         * Get current transport
         * @method
         * @returns {MetaphorJs.ajax.transport.*}
         */
        getTransport: function() {
            return this._transport;
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            dom_setAttr(form, "method", self._opt.method);
            dom_setAttr(form, "enctype", "multipart/form-data");

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        importFiles: function() {

            var self    = this,
                opt     = self._opt,
                files   = opt.files,
                form    = self._form,
                data    = opt.data,
                i, l,
                j, jl,
                name,
                input,
                file,
                item;

            for (i = 0, l = files.length; i < l; i++) {

                item = files[i];

                if (isArray(item)) {
                    name = item[0];
                    file = item[1];
                }
                else {
                    if (window.File && item instanceof File) {
                        name = item.uploadName || ("upload" + (l > 1 ? "[]" : ""));
                    }
                    else {
                        name = item.name || "upload" + (l > 1 ? "[]" : "");
                    }
                    file = item;
                }

                if (!window.File || !(file instanceof File)) {
                    input = file;
                    file = null;
                }

                if (form) {
                    if (input) {
                        form.appendChild(input);
                    }
                }
                else {
                    if (file) {
                        data.append(name, file);
                    }
                    else if (input.files && input.files.length) {
                        for (j = 0, jl = input.files.length; j < jl; j++) {
                            data.append(name, input.files[j]);
                        }
                    }
                }
            }
        },

        createJsonp: function() {

            var self        = this,
                opt         = self._opt,
                paramName   = opt.jsonpParam || "callback",
                cbName      = opt.jsonpCallback || "jsonp_" + nextUid();

            opt.url += (rquery.test(opt.url) ? "&" : "?") + paramName + "=" + cbName;

            self._jsonpName = cbName;

            if (typeof window != strUndef) {
                window[cbName] = bind(self.jsonpCallback, self);
            }
            if (typeof global != strUndef) {
                global[cbName] = bind(self.jsonpCallback, self);
            }

            return cbName;
        },

        jsonpCallback: function(data) {

            var self    = this,
                res;

            try {
                res = self.processResponseData(data);
            }
            catch (thrownError) {
                error(thrownError);
                if (self.$$promise) {
                    self.$$promise.reject(thrownError);
                }
                return;
            }

            if (self.$$promise) {
                self.$$promise.resolve(res);
            }
        },

        processResponseData: function(data, contentType) {

            var self    = this,
                opt     = self._opt;

            data    = processData(data, opt, contentType);

            if (globalEvents.hasListener("process-response")) {
                /**
                 * Process response data
                 * @event process-response
                 * @param {*} data response data
                 * @param {MetaphorJs.lib.Promise} promise Current request's promise
                 */
                globalEvents.trigger("process-response", data, self.$$promise);
            }

            if (opt.processResponse) {
                data    = opt.processResponse.call(opt.context, data, self.$$promise);
            }

            return data;
        },

        returnResponse: function(data, contentType) {

            var self    = this;

            if (!self._opt.jsonp) {
                return self.processResponseData(data, contentType);
            }

            return null;
        },

        processResponse: function(data, contentType) {

            var self        = this,
                deferred    = self.$$promise,
                result;

            if (!self._opt.jsonp) {
                try {
                    result = self.processResponseData(data, contentType)
                }
                catch (thrownError) {
                    error(thrownError);
                    deferred.reject(thrownError);
                    return;
                }

                deferred.resolve(result);
            }
            else {
                if (!data) {
                    deferred.reject(new Error("jsonp script is empty"));
                    return;
                }

                try {
                    globalEval(data);
                }
                catch (thrownError) {
                    error(thrownError);
                    deferred.reject(thrownError);
                }

                if (deferred.isPending()) {
                    deferred.reject(new Error("jsonp script didn't invoke callback"));
                }
            }
        },

        onDestroy: function() {

            var self    = this;

            if (self._timeout) {
                clearTimeout(self._timeout);
            }

            if (self._form && self._form.parentNode && self._removeForm) {
                self._form.parentNode.removeChild(self._form);
            }

            self._transport.$destroy();

            if (self._jsonpName) {
                if (typeof window != strUndef) {
                    delete window[self._jsonpName];
                }
                if (typeof global != strUndef) {
                    delete global[self._jsonpName];
                }
            }
        }

    }, {
        prepareUrl: prepareUrl,
        global: globalEvents
    });
}());






/*
* Contents of this file are partially taken from jQuery
*/

var ajax = function(){

    

    /**
     * The same set of options you can pass to ajax() and ajax.setup()
     * @object ajax.defaults 
     * @access private
     */
    var defaults    = {
            /**
             * @property {string} url Target url
             */
            url:            null,

            /**
             * @property {string|object} data Ajax payload
             */
            data:           null,

            /**
             * @property {string} method GET|POST|DELETE|PUT etc
             */
            method:         "GET",

            /**
             * @property {object} headers {
             *  Headers to add to XHR object:<br>
             *  Header-Name: header-value
             * }
             */
            headers:        null,

            /**
             * @property {string} username XHR username
             */
            username:       null,

            /**
             * @property {string} password XHR password
             */
            password:       null,

            /**
             * @property {string} dataType {
             * Response data type<br>
             * html|xml|json|fragment|script<br>
             * <code>html</code> - along with <code>selector</code> option treats
             * response as html, creates a document out of it and
             * returns selected element.<br>
             * <code>xml</code> - parse response as xml and return element(s)
             * using <code>selector</code> option<br>
             * <code>json</code> parse response as json and return the resulting
             * object<br>
             * <code>fragment</code> - turn response into a DocumentFragment<br>
             * <code>script</code> - evaluate response as a script
             */
            dataType:       null, // response data type

            /**
             * @property {int} timeout Abort on timeout
             */
            timeout:        0,

            /**
             * @property {string} contentType {
             *  Request content type. Set contentType: json to 
             *  transform data into json automatically and set 
             *  header to text/plain. 
             * }
             */
            contentType:    null, // request data type

            /**
             * @property {string} contentTypeHeader {
             *  If contentType = json, set this to specific header you want to send
             * }
             */
            contentTypeHeader: null,

            /**
             * @property {object} xhrFields Key:value pairs to set to xhr object
             */
            xhrFields:      null,

            /**
             * @property {boolean} jsonp Make a jsonp request
             */
            jsonp:          false,

            /**
             * @property {string} jsonParam {
             * Name of the parameter with callback
             * function name: url?<jsonParam>=<jsonCallback>
             * @default callback
             * }
             */
            jsonpParam:     null,

            /**
             * @property {string} jsonpCallback {
             *  Name of the callback function in global scope
             * }
             */
            jsonpCallback:  null,

            /**
             * @property {string} transport {
             *  iframe|xhr|script<br>
             *  If <code>files</code> or <code>form</code> options are set 
             *  and browser doesn't support FormData, 
             *  transport will be set to iframe.<br>
             * }
             */
            transport:      null,

            /**
             * @property {boolean} replace {
             *  When using <code>ajax.load(el, url, opt)</code>
             *  if replace=true, all contents of el will be replaced
             *  by response; <br>
             *  if replace=false, response will be appended.
             * }
             */
            replace:        false,

            /**
             * @property {string} selector See dataType
             */
            selector:       null,

            /**
             * @property {FormElement} form {
             *  Souce of request data and files, target url and request method
             * }
             */
            form:           null,

            /**
             * @property {function} beforeSend {
             *  @param {object} options Options passed to ajax()
             *  @param {object} transport Current transport object
             *  @returns {boolean|null} Return false to abort ajax
             * }
             */
            beforeSend:     null,

            /**
             * @property {function} progress XHR onprogress callback
             */
            progress:       null,

            /**
             * @property {function} uploadProgress XHR.upload progress callback
             */
            uploadProgress: null,

            /**
             * @property {function} processResponse {
             *  @param {*} response Either raw or pre-processed response data
             *  @param {MetaphorJs.lib.Promise} promise ajax's promise
             * }
             */
            processResponse:null,

            /**
             * @property {object} context All callback's context
             */
            context:        null,

            /**
             * @property {array} files Array of native File objects to send
             * via FormData or iframe
             */
            files:          null
        },
        /**
         * @end-object
         */

        defaultSetup    = {};


    /**
     * @function ajax
     * @param {string} url Url to load or send data to
     * @param {object} opt See ajax.defaults
     * @returns {ajax_Ajax}
     */

    /**
     * @function ajax
     * @param {object} opt See ajax.defaults
     * @returns {ajax_Ajax}
     */
    var ajax    = function ajax(url, opt) {

        opt = opt || {};

        if (url && !isString(url)) {
            opt = url;
        }
        else {
            opt.url = url;
        }

        if (!opt.url) {
            if (opt.form) {
                opt.url = dom_getAttr(opt.form, "action");
            }
            if (!opt.url) {
                throw new Error("Must provide url");
            }
        }

        extend(opt, defaultSetup, false, true);
        extend(opt, defaults, false, true);

        if (!opt.method) {
            if (opt.form) {
                opt.method = dom_getAttr(opt.form, "method").toUpperCase() || "GET";
            }
            else {
                opt.method = "GET";
            }
        }
        else {
            opt.method = opt.method.toUpperCase();
        }

        return new ajax_Ajax(opt);
    };

    /**
     * Set default ajax options
     * @function ajax.setup
     * @param {object} opt See ajax.defaults
     */
    ajax.setup  = function(opt) {
        extend(defaultSetup, opt, true, true);
    };

    /**
     * Subscribe to global ajax events. See 
     * MetaphorJs.lib.Observable.on 
     * @function ajax.on
     * @param {string} eventName
     * @param {function} fn 
     * @param {object} context 
     * @param {object} options
     */
    ajax.on     = function() {
        ajax_Ajax.global.on.apply(ajax_Ajax.global, arguments);
    };

    /**
     * Unsubscribe from global ajax events. See 
     * MetaphorJs.lib.Observable.un 
     * @function ajax.un
     * @param {string} eventName
     * @param {function} fn 
     * @param {object} context 
     * @param {object} options
     */
    ajax.un     = function() {
        ajax_Ajax.global.un.apply(ajax_Ajax.global, arguments);
    };

    /**
     * Same as ajax(), method is forcefully set to GET
     * @function ajax.get
     * @param {string} url 
     * @param {object} opt 
     * @returns {ajax_Ajax}
     */
    ajax.get    = function(url, opt) {
        opt = opt || {};
        opt.method = "GET";
        return ajax(url, opt);
    };

    /**
     * Same as ajax(), method is forcefully set to POST
     * @function ajax.post
     * @param {string} url 
     * @param {object} opt 
     * @returns {ajax_Ajax}
     */
    ajax.post   = function(url, opt) {
        opt = opt || {};
        opt.method = "POST";
        return ajax(url, opt);
    };

    /**
     * Load response to given html element
     * @function ajax.load
     * @param {Element} el
     * @param {string} url 
     * @param {object} opt 
     * @returns {ajax_Ajax}
     */
    ajax.load   = function(el, url, opt) {

        opt = opt || {};

        if (!isString(url)) {
            opt = url;
        }

        opt.dataType = "fragment";

        return ajax(url, opt).done(function(fragment){
            if (opt.replace) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
            el.appendChild(fragment);
        });
    };

    /**
     * Load script
     * @function ajax.loadScript
     * @param {string} url 
     * @returns {ajax_Ajax}
     */
    ajax.loadScript = function(url) {
        return ajax(url, {transport: "script"});
    };

    /**
     * Send form
     * @function ajax.submit
     * @param {FormElement} form
     * @param {object} opt
     * @returns {ajax_Ajax}
     */
    ajax.submit = function(form, opt) {
        opt = opt || {};
        opt.form = form;
        return ajax(null, opt);
    };

    /**
     * Utility function that prepares url by adding random seed or
     * jsonp params and does other stuff based on options
     * @function ajax.prepareUrl
     * @param {string} url 
     * @param {object} opt 
     */
    ajax.prepareUrl = function(url, opt) {
        return ajax_Ajax.prepareUrl(url, opt || {});
    };

    return ajax;
}();
























var app_Template = MetaphorJs.app.Template = function() {

    var observable      = new lib_Observable,
        cache           = new lib_Cache,
        options         = {},
        pblt,
        pbltOpt,

        //TODO: Check if this is a performance issue
        getFragmentContent  = function(frg) {
            var div = window.document.createElement("div");
            div.appendChild(dom_clone(frg));
            return div.innerHTML;
        },

        resolveInclude  = function(cmt, tplId) {
            var frg = getTemplate(tplId.trim());
            if (!frg) {
                return "";
            }
            if (typeof frg === "string") {
                return frg;
            }
            return getFragmentContent(frg);
        },

        resolveIncludes = function(tpl) {
            return tpl.replace(/<!--\s*include (.+?)-->/ig, resolveInclude);
        },

        getTemplate     = function(tplId) {

            var tpl = cache.get(tplId),
                opt = options[tplId] || {};

            if (typeof tpl === "function") {
                tpl = tpl(tplId);
            }
            if (typeof tpl === "string" && !opt.text) {
                if (!opt.processed) {
                    tpl = processTextTemplate(tplId, tpl);
                }
                tpl = dom_toFragment(tpl);
                cache.add(tplId, tpl);
            }
            else if (tpl && tpl.nodeType) {
                // do not re-create fragments;
                if (tpl.nodeType !== 11) { // document fragment
                    if ("content" in tpl) {
                        tpl = tpl.content;
                    }
                    else {
                        tpl = dom_toFragment(tpl.childNodes);
                    }
                    cache.add(tplId, tpl);
                }
            }

            return tpl;
        },

        processTextTemplate = function(tplId, tpl) {

            var opt, inx;

            if (tpl.substring(0,5) === "<!--{") {
                inx = tpl.indexOf("-->");
                opt = lib_Expression.get(tpl.substr(4, inx-4), {});
                options[tplId] = opt;
                tpl = tpl.substr(inx + 3);
            }

            if (!options[tplId]) {
                options[tplId] = {};
            }
            
            opt = options[tplId];           
            opt.processed = true;

            if (opt.includes) {
                tpl = resolveIncludes(tpl);
            }

            if (opt.text) {
                return tpl;
            }

            return dom_toFragment(tpl);
        },

        findInPrebuilt = function(tplId) {
            var tpl;
            if (!pblt) {
                pblt = MetaphorJs.prebuilt.templates;
                pbltOpt = MetaphorJs.prebuilt.templateOptions;
            }
            if (tpl = pblt[tplId]) {
                delete pblt[tplId];
                if (pbltOpt[tplId]) {
                    options[tplId] = pbltOpt[tplId];
                    delete pbltOpt[tplId];
                }
                return tpl;
            }
        },

        findInScripts = function(tplId) {
            var tplNode = window.document.getElementById(tplId),
                tpl,
                tag;

            if (tplNode) {
                tag = tplNode.tagName.toLowerCase();
                if (tag === "script") {
                    tpl = tplNode.innerHTML;
                    tplNode.parentNode.removeChild(tplNode);
                    return tpl;
                }
                else {
                    return tplNode;
                }
            }
        },

        loadTemplate = function(tplUrl) {
            if (!cache.exists(tplUrl)) {
                return cache.add(tplUrl,
                    ajax(tplUrl, {dataType: 'fragment'})
                        .then(function(fragment){
                            return cache.add(tplUrl, fragment);
                        })
                );
            }
            return cache.get(tplUrl);
        };

    if (MetaphorJs.prebuilt && MetaphorJs.prebuilt.templates) {
        cache.addFinder(findInPrebuilt);
    }

    cache.addFinder(findInScripts);

    var Template = function(cfg) {
        var self    = this;

        extend(self, cfg, true, false);

        self.id = nextUid();
        observable.createEvent("rendered-" + self.id, {
            returnResult: false,
            autoTrigger: true
        });

        if (!self.scope) {
            self.scope = new lib_Scope;
        }
        if (!self.config) {
            self.config = new lib_Config(null, {
                scope: self.scope
            });
        }
        else if (!(self.config instanceof lib_Config)) {
            self.config = new lib_Config(
                self.config, 
                {
                    scope: self.scope
                }
            );
        }

        var config = self.config,
            node = self.node;

        config.setDefaultMode("name", lib_Config.MODE_STATIC);
        config.setDefaultMode("html", lib_Config.MODE_STATIC);
        config.setType("animate", "bool", 
                        lib_Config.MODE_STATIC, self.animate);
        self.name && config.setDefaultValue("name", self.name);
        self.html && config.setDefaultValue("html", self.html);

        if (self.replace && node && node.parentNode) {
            var cmts = dom_commentWrap(node, self.id);
            self._prevEl = cmts[0];
            self._nextEl = cmts[1];
        }

        if (!node) {
            self.deferRendering = true;
        }

        if ((config.has("name") || config.has("html")) && 
            node && node.firstChild) {
            dom_data(node, "mjs-transclude", 
                dom_toFragment(node.childNodes));
        }

        self.childrenPromise    = new lib_Promise;

        lib_Observable.$initHost(this, cfg, observable);

        if (self.ownRenderer) {
            self.childrenPromise.resolve(false);
        }

        if (config.has("name")) {
            config.on("name", self._onChange, self);
            self._resolveTemplate()
                .done(function(){
                    if (!self.deferRendering || !self.ownRenderer) {
                        self._applyTemplate();
                    }
                });
        }
        else if (config.has("html")) {
            config.on("html", self._onHtmlChange, self);
            if (!self.deferRendering || !self.ownRenderer) {
                self._resolveHtml();
            }
        }
        else {
            if (self.replace) {
                throw new Error("Template's name or html properties must be defined");
            }
            // run renderer on given node without any templates
            if (!self.deferRendering && self.ownRenderer) {
                self._runRenderer();
            }
        }

        if (self.ownRenderer && self.parentRenderer) {
            self.parentRenderer.on("destroy",
                self._onParentRendererDestroy,
                self);
        }

        self.scope.$on("destroy", self._onScopeDestroy, self);
    };

    extend(Template.prototype, {

        _renderer:          null,
        _initial:           true,
        _fragment:          null,
        _prevEl:            null,
        _nextEl:            null,

        scope:              null,
        node:               null,
        config:             null,
        ownRenderer:        true,
        childrenPromise:    null,
        resolvePromise:     null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,
        animate:            false,

        _runRenderer: function() {
            var self = this;
            if (!self._renderer) {
                self._renderer   = new app_Renderer(
                        self.node, self.scope
                );
                observable.relayEvent(self._renderer, "reference", "reference-" + self.id);
                observable.relayEvent(self._renderer, "first-node", "first-node-" + self.id);
                observable.relayEvent(self._renderer, "rendered", "rendered-" + self.id);
                self._renderer.process();
            }
        },

        createEvent: function(event, opt) {
            return observable.createEvent(event + "-" + this.id, opt);
        },

        on: function(event, fn, context, opt) {
            return observable.on(event + "-" + this.id, fn, context, opt);
        },

        un: function(event, fn, context) {
            return observable.un(event + "-" + this.id, fn, context);
        },

        moveTo: function(parent, before) {
            var self = this,
                el,
                moved = false,
                els = [], i, l, j, jl;
            self._prevEl && els.push(self._prevEl);
            self.node && els.push(self.node);
            self._nextEl && els.push(self._nextEl);

            for (i = 0, l = els.length; i < l; i++) {
                el = els[i];
                if (isArray(el)) 
                    for (j = -1, jl = el.length; ++j < jl;) {
                        if (el[j].parentNode !== parent) {
                            moved = true;
                        }
                        parent.insertBefore(el[j], before);
                    }
                else {
                    if (el.parentNode !== parent) {
                        moved = true;
                    }
                    parent.insertBefore(el, before);
                } 
            }

            return moved;
        },

        startRendering: function() {

            var self    = this;
            if (self.deferRendering && 
                (self.node || self.node === false)) {
                self.deferRendering = false;

                if (self.config.has("name")) {
                    self._resolveTemplate().done(self._applyTemplate, self);
                }
                else if (self.config.has("html")) {
                    self._resolveHtml();
                }
                else {
                    self._runRenderer();
                }
            }

            return self.childrenPromise;
        },

        _resolveTemplate: function(renew) {

            var self    = this;

            if (self.resolvePromise) {
                if (renew) {
                    self.resolvePromise.$destroy();
                    self.resolvePromise = null;
                }
                else {
                    return self.resolvePromise;
                }
            }

            return self.resolvePromise = new lib_Promise(
                function(resolve, reject) {
                    var tpl = self.config.get("name");
                    if (tpl) {
                        resolve(getTemplate(tpl) || loadTemplate(tpl));
                    }
                    else {
                        reject();
                    }
                }
            )
            .done(function(fragment){
                self._fragment = fragment;
            })
            .fail(self.childrenPromise.reject, self.childrenPromise);
        },

        _resolveHtml: function() {
            var self = this,
                htmlVal = self.config.get("html");

            if (htmlVal) {
                self._fragment = dom_toFragment(htmlVal);
                self._applyTemplate();
            }
        },

        _onHtmlChange: function() {
            var self    = this;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            if (self.deferRendering) {
                return;
            }

            //self._clearNode();
            self._resolveHtml();
            
        },

        _onChange: function() {

            var self    = this;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            //self._clearNode();

            var tplVal = self.config.get("name");

            if (tplVal) {
                self._resolveTemplate(true)
                    .done(self._applyTemplate, self);
            }
        },

        _clearNode: function() {
            var self = this;

            if (!self.node) {
                return;
            }

            if (self.replace) {
                var next = self._nextEl, prev = self._prevEl;
                while (prev.parentNode && prev.nextSibling && 
                        prev.nextSibling !== next) {
                    prev.parentNode.removeChild(prev.nextSibling);
                }
            }
            else {
                var el = self.node;
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
        },

        _doApplyTemplate: function() {

            var self    = this,
                el      = self.node,
                frg,
                children;

            self._clearNode();

            if (self.replace) {

                frg = dom_clone(self._fragment);
                children = toArray(frg.childNodes);

                if (el && el.nodeType) {
                    
                    /*var transclude = el ? dom_data(el, "mjs-transclude") : null;

                    if (transclude) {
                        var tr = select(
                            "[{transclude}], [mjs-transclude], mjs-transclude", frg, true);
                        if (tr.length) {
                            dom_data(tr[0], "mjs-transclude", transclude);
                        }
                    }*/

                    el.parentNode && el.parentNode.removeChild(el);
                }

                self._nextEl.parentNode.insertBefore(frg, self._nextEl);
                self.node = children;
                self.childrenPromise.resolve(children);
            }
            else {

                if (el) {
                    el.appendChild(dom_clone(self._fragment));
                }
                else {
                    self.node = el = dom_clone(self._fragment);
                }

                self.childrenPromise.resolve(el);
            }

            observable.trigger("before-render-" + self.id, self);

            if (self.ownRenderer) {
                self._runRenderer();
            }
        },

        _applyTemplate: function() {

            var self        = this,
                el          = self.node,
                initial     = self._initial,
                deferred    = new lib_Promise;

            self._initial = false;

            if (!initial && self.config.get("animate")) {
                animate_animate(el, "leave")
                    .done(self._doApplyTemplate, self)
                    .done(deferred.resolve, deferred);
                animate_animate(el, "enter");
            }
            else {
                self._doApplyTemplate();
                deferred.resolve();
            }

            return deferred;
        },

        _onParentRendererDestroy: function() {
            var self = this;

            if (!self.$destroyed && self._renderer &&
                !self._renderer.$destroyed) {
                self._renderer.$destroy();
            }

            self.$destroy();
        },

        _onScopeDestroy: function() {
            this.$destroy();
        },

        $destroy: function() {

            var self = this;

            if (self._nextEl && self._nextEl.parentNode) {
                self._nextEl.parentNode.removeChild(self._nextEl);
            }

            if (self._prevEl && self._prevEl.parentNode) {
                self._prevEl.parentNode.removeChild(self._prevEl);
            }

            if (self.config) {
                self.config.clear();
                self.config = null;
            }
        }
    });

    Template.cache = cache;

    Template.prepareConfig = function(def, tplConfig) {
        if (typeof def === 'string') {
            tplConfig.setProperty("name", {
                expression: def,
                mode: lib_Config.MODE_STATIC
            });
        }
        else if (def) {
            if (def.name || def.nameExpression) {
                tplConfig.setProperty("name", {
                    expression: def.name || def.nameExpression,
                    mode: def.nameExpression ? 
                        lib_Config.MODE_DYNAMIC :
                        lib_Config.MODE_STATIC
                });
            }
            if (def.html || def.htmlExpression) {
                tplConfig.setProperty("html", {
                    expression: def.html || def.htmlExpression,
                    mode: def.htmlExpression ? 
                        lib_Config.MODE_DYNAMIC :
                        lib_Config.MODE_STATIC
                });
            }
        }
    };

    return Template;
}();






var htmlTags = MetaphorJs.dom.htmlTags = [
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "keygen",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "math",
    "menu",
    "menuitem",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rb",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "slot",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "svg",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
];
















/**
 * @class MetaphorJs.app.Component
 */
var app_Component = MetaphorJs.app.Component = cls({

    $mixins: [mixin_Observable],
    $mixinEvents: ["$initConfig"],

    /**
     * @access protected
     * @var string
     */
    id:             null,

    /**
     * @access private
     * @var bool
     */
    _originalId:    false,

    /**
     * @var Element
     * @access protected
     */
    node:           null,

    /**
     * @var boolean
     * @access private
     */
    _nodeReplaced:  false,

    /**
     * @var string|Element
     * @access protected
     */
    renderTo:       null,

    /**
     * @var {boolean}
     */
    autoRender:     false,

    /**
     * @var bool
     * @access protected
     */
    _rendered:       false,

    /**
     * @var bool
     * @access protected
     */
    destroyEl:      true,

    /**
     * @var {bool}
     */
    destroyScope:   false,

    /**
     * @var {Scope}
     */
    scope:          null,

    /**
     * @var {Template}
     */
    template:       null,

    /**
     * @var {object|bool}
     */
    supportsDirectives: false,

    $constructor: function(cfg) {
        var self = this,
            viewCls = self.$view || (cfg ? cfg.$view : null);

        viewCls && self.$plugins.push(viewCls);
        self.$super();
    },

    /**
     * @constructor
     * @param {object} cfg {
     *      @type string id Element id
     *      @type string|Element el
     *      @type string|Element renderTo
     *      @type bool hidden
     *      @type bool destroyEl
     * }
     */
    $init: function(cfg) {

        var self    = this;

        cfg = cfg || {};

        self.$super(cfg);
        extend(self, cfg, true, false);

        if (!self.scope) {
            self.scope = new lib_Scope;
        }
        if (!self.config) {
            self.config = new lib_Config(null, {
                scope: self.parentScope || self.scope
            });
        }
        else if (!(self.config instanceof lib_Config)) {
            var cfgScope = self.config.scope;
            if (cfgScope) {
                delete self.config.scope;
            }
            self.config = new lib_Config(
                self.config, 
                {
                    scope: cfgScope || self.parentScope || self.scope
                }
            );
        }

        self.$refs = {node: {}, cmp: {}};
        self.scope.$cfg = {};
        self.config.setTo(self.scope.$cfg);
        self._initConfig();
        self.$callMixins("$initConfig");

        if (self.$view) {
            self.scope.$view = self.$view;
        }
        if (self.config.has("as")) {
            self.scope[self.config.get("as")] = self;
        }

        if (self.node) {
            var nodeId = dom_getAttr(self.node, "id");
            if (nodeId) {
                self._originalId = true;
                if (!self.id) {
                    self.id = nodeId;
                }
            }
        }

        self.id = self.id || "cmp-" + nextUid();

        if (!self.node && self.node !== false) {
            self.node = window.document.createElement(self.config.get("tag"));
        }

        self.beforeInitComponent.apply(self, arguments);
        self.initComponent.apply(self, arguments);

        if (self.scope.$app) {
            self.scope.$app.registerCmp(self, self.scope, "id");
        }

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self._onParentRendererDestroy, self);
        }

        if (self.node) {
            self._claimNode();
        }

        self._initTemplate();
    },

    _initTemplate: function() {

        var self = this,
            tpl = self.template;

        self._nodeReplaced = htmlTags.indexOf(self.node.tagName.toLowerCase()) === -1;
        
        if (tpl instanceof app_Template) {
            // it may have just been created
            self.template.node = self.node;
            self.template.on("reference", self._onChildReference, self);
            self.template.on("rendered", self._onRenderingFinished, self);
        }
        else {

            var tplConfig = self.config.slice(["animate"], {
                // component config's scope is from parent,
                // template's scope must be the same as component's
                scope: self.scope
            });
            app_Template.prepareConfig(tpl, tplConfig);
            self.template = tpl = new app_Template({
                scope: self.scope,
                node: self.node,
                deferRendering: self._nodeReplaced || !self.autoRender,
                ownRenderer: true,
                replace: self._nodeReplaced, // <some-custom-tag>
                config: tplConfig,
                callback: {
                    context: self,
                    reference: self._onChildReference,
                    rendered: self._onRenderingFinished,
                    "first-node": self._onFirstNodeReported
                }
            });
        }

        self.afterInitComponent.apply(self, arguments);

        if (self.autoRender) {
            tpl.childrenPromise.done(self.render, self);
        }
    },

    _initConfig: function() {
        var self = this,
            config = self.config,
            ctx;

        config.setDefaultMode("tag", lib_Config.MODE_STATIC);
        config.setDefaultValue("tag", "div");
        config.setDefaultMode("as", lib_Config.MODE_STATIC);

        if (self.as) {
            config.setDefaultValue("as", self.as);
        }

        config.setDefaultMode("callbackContext", lib_Config.MODE_SINGLE);
        config.eachProperty(function(name) {
            if (name.substring(0,4) === 'on--') {
                config.setMode(name, lib_Config.MODE_LISTENER);
                if (!ctx) {
                    if (self.scope.$app)
                        ctx = config.get("callbackContext") ||
                                self.scope.$app.getParentCmp(self.node) ||
                                self.scope.$app ||
                                self.scope;
                    else 
                        ctx = config.get("callbackContext") || self.scope;
                }
                self.on(name.substring(4), config.get(name), ctx);
            }
        });
    },

    _initDirectives: function() {
        var self = this,
            dirs = self.directives,
            support = self.supportsDirectives,
            dirCfg,
            config,
            handlers = Directive.getAttributes(),
            i, len, name,
            parentScope =   dirs.scope ||
                            self.parentScope ||
                            self.scope.$parent || 
                            self.config.getOption("scope") ||
                            self.scope;

        if (!support) {
            return;
        }

        for (i = 0, len = handlers.length; i < len; i++) {
            name    = handlers[i].name;

            if (name === "scope") {
                continue;
            }

            if (!(support === true || support[name])) {
                continue;
            }

            if ((dirCfg = dirs[name]) !== undf) {
                if (typeof dirCfg === "string") {
                    dirCfg = {
                        value: dirCfg
                    }
                }
                config = new lib_Config(
                    dirCfg, 
                    {scope: parentScope}
                );
                self.on("destroy", config.$destroy, config);
                app_Renderer.applyDirective(
                    handlers[i].handler, parentScope, self, config
                );
            }
        }
    },

    _onFirstNodeReported: function(node) {
        var self = this;
        if (self._nodeReplaced) {
            self._claimNode(node);
        }
    },

    _onChildReference: function(type, ref, item) {
        var self = this;
        if (!self.$refs[type]) {
            self.$refs[type] = {};
        }
        self.$refs[type][ref] = item;
    },

    _claimNode: function(node) {
        var self = this;
        node = node || self.node;
        dom_setAttr(node, "cmp-id", self.id);
        if (!self._originalId) {
            dom_setAttr(node, "id", self.id);
        }
        node.$$cmpId = self.id;
    },

    _releaseNode: function(node) {
        node = node || this.node;
        dom_removeAttr(node, "cmp-id");
        if (!self._originalId) {
            dom_removeAttr(node, "id");
        }
        node.$$cmpId = null;
    },

    _replaceNodeWithTemplate: function() {
        var self = this;

        if (self._nodeReplaced && self.node.parentNode) {
            dom_removeAttr(self.node, "id");
        }

        self.node = self.template.node;

        // document fragment
        if (self.node.nodeType === 11 || isArray(self.node)) {
            var ch = self.node.nodeType === 11 ?
                    self.node.childNodes :
                    self.node,
                i, l;
            for (i = 0, l = ch.length; i < l; i++) {
                if (ch[i].nodeType === 1) {
                    self.node = ch[i];
                    break;
                }
            }
        }

        self._claimNode();
    },








    render: function(parent, before) {

        var self = this;

        if (self._rendered) {
            parent && self.attach(parent, before);
            return;
        }
        else if (parent) {
            self.renderTo = parent;
            self.renderBefore = before;
        }

        self.onBeforeRender();
        self.trigger('render', self);

        if (self.template) {
            self.template.startRendering();
        }
    },

    isAttached: function(parent) {
        if (!this.node || !this.node.parentNode) 
            return false;
        return parent ? this.node.parentNode === parent : true;
    },

    attach: function(parent, before) {
        var self = this;

        if (!parent) {
            throw new Error("Parent node is required");
        }
        if (self.isAttached(parent)) {
            return;
        }

        self.detach(true);
        self.renderTo = parent;
        self.renderBefore = before;

        if (self.template.moveTo(parent, before)) {
            self.afterAttached();
            self.trigger('attached', self);
        }
    },

    detach: function(willAttach) {
        var self = this;
        if (self.isAttached()) {
            self.node.parentNode.removeChild(self.node);
            self.afterDetached(willAttach);
            self.trigger('detached', self, willAttach);
        }
    },

    getRefEl: function(name) {
        return this.$refs['node'][name];
    },

    onBeforeRender: function() {
        this.config.getAll(); // calc all props and put into scope.$cfg
    },

    _onRenderingFinished: function() {
        var self = this;

        if ((self._nodeReplaced && self.node !== self.template.node) ||
            !self.node) {
            self._replaceNodeWithTemplate();
        }

        self._rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);

        if (self.directives) {
            self._initDirectives();
        }

        if (isAttached(self.node)) {
            self.afterAttached();
            self.trigger('after-attached', self);
        }
        else if (self.renderTo && self.node.parentNode !== self.renderTo) {
            self.attach(self.renderTo, self.renderBefore);
        }
    },






    freeze: function() {
        var self = this;
        self._releaseNode();
        self.scope.$freeze();
        self.trigger("freeze", self);
    },

    unfreeze: function() {
        var self = this;
        self._claimNode();
        self.scope.$unfreeze();
        self.trigger("unfreeze", self);
        self.scope.$check();
    },






    /**
     * @access public
     * @return bool
     */
    isRendered: function() {
        return this._rendered;
    },

    /**
     * @access public
     * @return bool
     */
    isDestroyed: function() {
        return this.destroyed;
    },

    /**
     * @access public
     * @return Element
     */
    getEl: function() {
        return this.node;
    },

    /**
     * Returns api (in a simplest case - dom element) 
     * for directive to work with
     * @param {string} directive 
     */
    getDomApi: function(directive) {
        var sup = this.supportsDirectives;
        if (!sup) {
            return null;
        }
        if (sup[directive] === true) {
            return this.node;
        }
        return this.$refs.node[sup[directive]];
    },

    /**
     * @method
     * @access protected
     */
    beforeInitComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    initComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterInitComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterRender:    emptyFn,

    /**
     * @method
     * @access protected
     */
    afterAttached:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterDetached:  emptyFn,


    
    _onParentRendererDestroy: function() {
        this.$destroy();
    },

    onDestroy:      function() {

        var self    = this;

        if (self.template) {
            self.template.$destroy();
        }

        if (self.destroyEl) {
            if (self.node && isAttached(self.node)) {
                self.node.parentNode.removeChild(self.node);
            }
        }
        else if (self.node) {

            if (!self._originalId) {
                dom_removeAttr(self.node, "id");
            }

            self._releaseNode();
        }

        self.config.$destroy();

        if (self.destroyScope && self.scope) {
            self.scope.$destroy();
        }

        self.$super();
    }

}, {
    registerDirective: function(cmp) {
        if (typeof(cmp) === "string") {
            Directive.registerComponent(cmp);
        }
        else {
            Directive.registerComponent(cmp.prototype.$class, cmp);
        }
    }
});







MetaphorJs.app.component.View = cls({

    $init: function(host) {
        this.component = host;
        this.component.$view = this;
    }
});



MetaphorJs.app = MetaphorJs.app || {};












var app_resolve = MetaphorJs.app.resolve = function app_resolve(cmp, cfg, scope, node, args) {

    cfg         = cfg || {};
    args        = args || [];

    scope       = scope || cfg.scope; // || new Scope;
    node        = node || cfg.node;
    var config  = cfg.config || null;

    cfg.config  = config;
    cfg.scope   = cfg.scope || scope;
    cfg.node    = cfg.node || node;

    if (args.length === 0) {
        args.push(cfg);
    }

    if (config) {

        if (isPlainObject(config)) {
            config = new lib_Config(config, {
                scope: scope
            });
        }

        config.setType("cloak", "bool", lib_Config.MODE_STATIC);
        config.setType("animate", "bool", lib_Config.MODE_STATIC);
    }

    var constr      = isString(cmp) ? ns.get(cmp) : cmp;
    if (!constr) {
        throw new Error("Component " + cmp + " not found");
    }

    var i,
        defers      = [],
        tpl         = constr.template || cfg.template || null,
        app         = scope ? scope.$app : null,
        gProvider   = lib_Provider.global(),
        injectFn    = app ? app.inject : gProvider.inject,
        injectCt    = app ? app : gProvider,
        cloak       = config ? config.get("cloak") : null,
        inject      = {
            $node: node || null,
            $scope: scope || null,
            $config: config || null,
            $args: args || null
        };

    if (constr.resolve) {

        for (i in constr.resolve) {
            (function(name){
                var d = new lib_Promise,
                    fn;

                defers.push(d.done(function(value){
                    inject[name] = value;
                    cfg[name] = value;
                    args.push(value);
                }));

                fn = constr.resolve[i];

                if (isFunction(fn)) {
                    d.resolve(fn(scope, node, config));
                }
                else {
                    d.resolve(
                        injectFn.call(
                            injectCt, fn, null, extend({}, inject, cfg, false, false)
                        )
                    );
                }

                d.fail(function(reason){
                    if (reason instanceof Error) {
                        error(reason);
                    }
                });

            }(i));
        }
    }

    if (tpl) {

        var tplConfig = new lib_Config(null, {
            scope: scope
        });
        if (config) {
            tplConfig.setProperty("animate", config.copyProperty("animate"));
        }
        app_Template.prepareConfig(tpl, tplConfig);

        cfg.template = new app_Template({
            scope: scope,
            node: node,
            deferRendering: true,
            ownRenderer: true,
            config: tplConfig
        });

        defers.push(cfg.template.childrenPromise);

        /*if (node && node.firstChild) {
            dom_data(
                node, "mjs-transclude", 
                dom_toFragment(node.childNodes));
        }*/
    }

    var p;

    if (defers.length) {
        p = new lib_Promise;
        lib_Promise.all(defers)
            .done(function(values){
                p.resolve(
                    injectFn.call(
                        injectCt, constr, null, extend({}, inject, cfg, false, false), args
                    )
                );
            })
            .fail(p.reject, p);
    }
    else {
        p = lib_Promise.resolve(
            injectFn.call(
                injectCt, constr, null, extend({}, inject, cfg, false, false), args
            )
        );
    }

    if (node && p.isPending() && cloak !== null) {
        cloak !== true ? dom_addClass(node, cloak) : node.style.visibility = "hidden";
        p.then(function() {
            cloak !== true ? dom_removeClass(node, cloak) : node.style.visibility = "";
        });
    }

    if (node) {
        p.then(function(){
            dom_removeClass(node, "mjs-cloak");
        });
    }

    return p;
};












MetaphorJs.app.Container = app_Component.$extend({

    initComponent: function() {
        var self = this;

        self.$super.apply(self, arguments);

        if (self.template && self.node.firstChild) {
            self._prepareDeclaredItems(toArray(self.node.childNodes));
        }

        self._initItems();
    },

    _prepareDeclaredItems: function(nodes) {

        var self = this,
            i, l, node, renderer,
            found = false,
            renderRef, attrSet,
            foundCmp, foundPromise,
            scope = self.config.getOption("scope"),
            items = self.items || [],
            
            refCallback = function(type, ref, cmp, cfg, attrSet){
                if (cfg.node === node) {
                    foundCmp = cmp;
                    renderRef = attrSet.at;
                }
            },

            promiseCallback = function(promise, cmpName, cfg, attrSet){
                if (cfg.node === node) {
                    foundPromise = promise;
                    renderRef = attrSet.at;
                }
            };

        if (isArray(items)) {
            items = {
                body: items
            }
        }

        for (i = 0, l = nodes.length; i < l; i++) {
            node = nodes[i];
            if (node.nodeType === 1) {

                foundCmp = null;
                foundPromise = null;
                renderRef = null;
                renderer = new app_Renderer(node, scope);
                renderer.on("reference", refCallback);
                renderer.on("reference-promise", promiseCallback);
                renderer.process();

                if (foundCmp || foundPromise) {
                    if (!renderRef) {
                        renderRef = "body";
                    }
                    if (!items[renderRef]) {
                        items[renderRef] = [];
                    }
                    items[renderRef].push({
                        type: "component",
                        renderRef: renderRef,
                        renderer: renderer,
                        component: foundCmp || foundPromise
                    })
                }   
                else {
                    attrSet = dom_getAttrSet(node);
                    renderRef = attrSet.at || "body";
                    if (!items[renderRef]) {
                        items[renderRef] = [];
                    }
                    items[renderRef].push({
                        type: "node",
                        renderRef: renderRef,
                        node: node
                    });
                }

                found = true;

                renderer.un("reference", refCallback);
                renderer.un("reference-promise", promiseCallback);
            }
        }

        if (found) {
            self.items = items;
        }

    },

    _initItems: function() {

        var self = this,
            items = self.items || [],
            defs,
            list = [],
            item,
            i, l;

        self.itemsMap = {};
        
        if (isArray(items)) {
            items = {
                body: items
            }
        }

        for (var ref in items) {
            defs = items[ref];
            if (!isArray(defs)) {
                defs = [defs];
            }
            for (i = -1, l = defs.length; ++i < l;) {
                item = self._processItemDef(defs[i]);
                item.renderRef = ref;
                list.push(item);
                self.itemsMap[item.id] = item;
            }
        }

        self.items = list;
    },

    _getIdKey: function() {
        return "$$container_" + this.id;
    },

    _processItemDef: function(def) {

        var self = this,
            idkey = self._getIdKey(),
            item = {
                type: "component",
                placeholder: window.document.createComment("***"),
                id: nextUid(),
                resolved: true
            };

        if (isPlainObject(def)) {
            item = extend({}, def, item, false, false);
            if (item.type === "component") {
                if (isThenable(item.component)) {
                    item.component.done(function(cmp){
                        cmp[idkey] = item.id;
                        self._onChildResolved(cmp);
                    });
                }
                else {
                    item.component[idkey] = item.id;
                    self._initChildEvents("on", item.component);
                }
            }
            else {
                item.node[idkey] = item.id;
            }
        }
        else if (def instanceof app_Component) {
            item.component = def;
            def[idkey] = item.id;
            self._initChildEvents("on", def);   
        }
        else if (def instanceof window.Node) {
            item.type = "node";
            item.node = def;
            def[idkey] = item.id;
        }
        else if (def instanceof app_Template) {
            item.component = new app_Component({
                scope: self.scope,
                template: def
            });
            item.component[idkey] = item.id;
            self._initChildEvents("on", item.component);
        }
        else if (typeof def === "string") {
            var cfg = {scope: self.scope};
            cfg[idkey] = item.id;
            item.resolved = false;
            item.component = MetaphorJs.app
                            .resolve(def, cfg)
                            .done(self._onChildResolved, self);
        }
        else if (isThenable(def)) {
            item.resolved = false;
            item.component = def;
            def.done(function(cmp){
                cmp[idkey] = item.id;
                self._onChildResolved(cmp);
            });
        }
        else {
            throw new Error("Failed to initialize item");
        }

        return item;
    },

    _initChildEvents: function(mode, cmp) {
        var self = this;
        cmp[mode]("remove-from-container", self._onChildRemove, self);
    },

    _onChildRemove: function(cmp) {
        var self = this,
            idkey = self._getIdKey(),
            itemid = cmp[idkey],
            item, inx;

        if (itemid && (item = self.itemsMap[itemid])) {
            delete cmp[idkey];
            delete self.itemsMap[itemid];
            inx = self.items.indexOf(item);
            if (cmp instanceof app_Component) {
                self._initChildEvents("un", cmp);
            }
            if (inx !== -1) {
                self.items.splice(inx, 1);
            }
            self._detachChildItem(item);
        }
    },

    _onChildResolved: function(cmp) {
        var self = this,
            idkey = self._getIdKey(),
            itemid = cmp[idkey],
            item;

        if (itemid && (item = self.itemsMap[itemid])) {
            item.resolved = true;
            item.component = cmp;

            self._initChildEvents("on", cmp);

            if (self._rendered) {
                self._attachChildItem(item);
            }
        }
    },

    render: function() {

        var self = this,
            items = self.items || [],
            i, l;

        for (i = -1, l = items.length; ++i < l;){
            if (items[i].type === "component" && items[i].resolved) {
                items[i].component.render();
            }
        }

        self.$super.apply(self, arguments);
    },

    _onRenderingFinished: function() {
        var self = this, i, l, items = self.items;
        self.$super();

        // empty container without template or content
        if (!self.node.firstChild) {
            self.$refs.node.body = self.node;
        }

        // insert all placeholders, but
        // attach only resolved items
        for (i = -1, l = items.length; ++i < l;){
            self._preparePlaceholder(items[i]);
            if (items[i].resolved) {
                self._attachChildItem(items[i]);
            }
        }
    },

    _preparePlaceholder: function(item) {
        var self = this,
            refnode = self.getRefEl(item.renderRef);
        if (!refnode) {
            throw new Error("Can't find referenced node: " + item.renderRef);
        }
        // comment
        if (refnode.nodeType === 8) {
            refnode.parentNode.insertBefore(item.placeholder, refnode);
        }
        else refnode.appendChild(item.placeholder);
    },

    // only resolved components get here; so do attach
    _attachChildItem: function(item) {
        var self = this,
            refnode = self.getRefEl(item.renderRef);

        if (item.type === "node") {
            if (refnode.nodeType === 8)
                refnode.parentNode.insertBefore(item.node, item.placeholder);
            else refnode.insertBefore(item.node, item.placeholder);
        }
        else if (item.type === "component") {
            if (refnode.nodeType === 8)
                item.component.render(refnode.parentNode, item.placeholder);    
            else item.component.render(refnode, item.placeholder);
        }
    },

    _detachChildItem: function(item) {
        if (item.type === "node") {
            item.node.parentNode && item.node.parentNode.removeChild(item.node);
        }
        else if (item.type === "component") {
            item.component.detach();
            item.placeholder.parentNode && 
                item.placeholder.parentNode.removeChild(item.placeholder);
        }
    },

    hasItem: function(cmp) {
        var self = this,
        idkey = self._getIdKey();
        return !!cmp[idkey];
    },

    addItem: function(cmp, to) {
        var self = this,
            item;

        if (self.hasItem(cmp)) {
            return;
        }

        if (cmp instanceof app_Component) {
            cmp.trigger("remove-from-container", cmp);
        }

        item = self._processItemDef(cmp);
        item.renderRef = to || "body";
        self.items.push(item);
        self.itemsMap[item.id] = item;

        if (self._rendered) {
            self._preparePlaceholder(item);
            if (item.resolved) {
                self._attachChildItem(item);
            }
        }
    },

    removeItem: function(cmp) {
        var self = this;

        if (!self.hasItem(cmp)) {
            return;
        }

        if (cmp instanceof app_Component) {
            cmp.trigger("remove-from-container", cmp);
        }
        else {
            self._onChildRemove(cmp);
        }
    },

    onDestroy: function() {

        var self = this,
            i, l, item;

        for (i = 0, l = self.items.length; i < l; i++) {
            item = self.items[i];
            if (item.renderer) {
                item.renderer.$destroy();
            }
            if (item.type === "component") {
                item.component.$destroy && item.component.$destroy();
            }
        }
        self.items = null;

        self.$super();
    }
});



/**
 * Check if given value is a number (not number-like)
 * @function isNumber
 * @param {*} value 
 * @returns {boolean}
 */
function isNumber(value) {
    return _varType(value) === 1;
};



var lib_Queue = MetaphorJs.lib.Queue = (function(){


var Queue = function(cfg) {

    var self = this;

    cfg = cfg || {};

    self._queue = [];
    self._map = {};
    self.id = "$$" + nextUid();
    self._f = bind(self._finish, self);

    for (var i in cfg) {
        self[i] = cfg[i];
    }
};


Queue.REPLACE = 1;
Queue.ONCE = 2;
Queue.MULTIPLE = 3;
Queue.ONCE_EVER = 4;


extend(Queue.prototype, {

    _queue: null,
    _map: null,
    _nextRequested: false,
    _running: false,

    length: 0,
    id: null,
    async: true,
    auto: true,
    thenable: false,
    stack: false,
    context: null,
    mode: Queue.MULTIPLE,

    add: function(fn, context, args, mode, prepend, async) {

        var self    = this,
            qid     = self.id,
            id      = fn[qid] || nextUid(),
            item    = {
                id: id,
                fn: fn,
                context: context,
                args: args,
                async: async
            };

        mode = mode || self.mode;

        if (mode === Queue.ONCE_EVER && fn[qid]) {
            return fn[qid];
        }

        fn[qid] = id;

        if (self._map[id]) {
            if (mode === Queue.REPLACE) {
                self.remove(id);
            }
            else if (mode === Queue.ONCE) {
                return id;
            }
        }

        self._queue[prepend ? "unshift" : "push"](item);
        self._map[id] = item;

        self.length = self._queue.length;

        if (self.auto) {
            self.next();
        }

        return id;
    },

    append: function(fn, context, args, mode, async) {
        return this.add(fn, context, args, mode, false, async);
    },

    prepend: function(fn, context, args, mode, async) {
        return this.add(fn, context, args, mode, true, async);
    },

    remove: function(id) {
        var self = this,
            queue = self._queue,
            i, l;

        for (i = 0, l = queue.length; i < l; i++) {
            if (queue[i].id === id) {
                queue.splice(i, 1);
                break;
            }
        }
        delete self._map[id];
    },

    isEmpty: function() {
        return this.length === 0;
    },

    isRunning: function() {
        return this._running;
    },

    next: function() {

        var self    = this,
            item,
            res;

        if (self._running) {
            self._nextRequested = true;
            return;
        }

        self._nextRequested = false;

        item = self._queue[self.stack ? "pop" : "shift"]();
        self.length = self._queue.length;

        if (!item) {
            return;
        }

        self._running = true;

        delete self._map[item.id];

        var fn = function(){
            try {
                res = item.fn.apply(item.context || self.context, item.args || []);
            }
            catch (thrown) {
                error(thrown);
            }
            finally {
                if (isThenable(res)) {
                    res.catch(error);
                    res.then(self._f, self._f);
                }
                else {
                    self._finish();
                }
            }
        };

        var asnc = item.async || self.async || false;

        !asnc && fn();
        asnc === "raf" && raf(fn);
        asnc && asnc !== "raf" && async(fn, null, null, isNumber(asnc) ? asnc : 0);
    },

    _finish: function() {
        var self = this;
        if (self._running) {
            self._running = false;
            if (self.auto || self._nextRequested) {
                self.next();
            }
        }
    },

    $destroy: function() {

        var self = this;

        self._queue = null;
        self._map = null;
        self.context = null;
        self._nextRequested = false;
        self._running = false;
        self.next = emptyFn;

    }
}, true, false);

return Queue;
}());






/**
 * @function levenshteinDiff {
 *  @param {array} from
 *  @param {array} to
 *  @returns {object} {
 *      @type {number} changes
 *      @type {int} distance
 *      @type {array} prescription {
 *          List of instructions D(delete),R(replace),I(insert)
 *      }
 *  }
 * }
 */
function levenshteinDiff(from, to) {

    var m = from.length,
        n = to.length,
        D = new Array(m + 1),
        P = new Array(m + 1),
        i, j, c,
        route,
        cost,
        dist,
        ops = 0;

    if (m == n && m === 0) {
        return {
            changes: 0,
            distance: 0,
            prescription: []
        };
    }

    for (i = 0; i <= m; i++) {
        D[i]    = new Array(n + 1);
        P[i]    = new Array(n + 1);
        D[i][0] = i;
        P[i][0] = 'D';
    }
    for (i = 0; i <= n; i++) {
        D[0][i] = i;
        P[0][i] = 'I';
    }

    for (i = 1; i <= m; i++) {
        for (j = 1; j <= n; j++) {
            cost = (!equals(from[i - 1], to[j - 1])) ? 1 : 0;

            if(D[i][j - 1] < D[i - 1][j] && D[i][j - 1] < D[i - 1][j - 1] + cost) {
                //Insert
                D[i][j] = D[i][j - 1] + 1;
                P[i][j] = 'I';
            }
            else if(D[i - 1][j] < D[i - 1][j - 1] + cost) {
                //Delete
                D[i][j] = D[i - 1][j] + 1;
                P[i][j] = 'D';
            }
            else {
                //Replace or noop
                D[i][j] = D[i - 1][j - 1] + cost;
                if (cost === 1) {
                    P[i][j] = 'R';
                }
                else {
                    P[i][j] = '-';
                }
            }
        }
    }

    //Prescription
    route = [];
    i = m;
    j = n;

    do {
        c = P[i][j];
        route.push(c);
        if (c !== '-') {
            ops++;
        }
        if(c === 'R' || c === '-') {
            i --;
            j --;
        }
        else if(c === 'D') {
            i --;
        }
        else {
            j --;
        }
    } while((i !== 0) || (j !== 0));

    dist = D[m][n];

    return {
        changes: ops / route.length,
        distance: dist,
        prescription: route.reverse()
    };
};





/**
 * @function levenshteinMove {
 *  @param {array} a1
 *  @param {array} a2 
 *  @param {array} prescription Prescription from levenshteinDiff
 *  @param {function} getKey {
 *      Function that tracks unique items of array
 *      @param {*} item 
 *      @returns {string} item id
 *  }
 * }
 */
function levenshteinMove(a1, a2, prs, getKey) {

    var newPrs = [],
        i, l, k, action,
        map1 = {},
        prsi,
        a2i,
        index;

    for (i = 0, l = a1.length; i < l; i++) {
        k = getKey(a1[i]);
        if (k) {
            map1[k] = i;
        }
    }

    a2i = 0;
    var used = {};

    for (prsi = 0, l = prs.length; prsi < l; prsi++) {

        action = prs[prsi];

        if (action === 'D') {
            continue;
        }

        k = getKey(a2[a2i]);

        if (k !== undf && used[k] !== true && (index = map1[k]) !== undf) {
            newPrs.push(index);
            used[k] = true;
        }
        else {
            newPrs.push(action);
        }
        a2i++;
    }

    return newPrs;
};













var app_ListRenderer = MetaphorJs.app.ListRenderer = cls({

    id: null,

    cfg: null,
    model: null,
    itemName: null,
    tpl: null,
    renderers: null,
    parentEl: null,
    prevEl: null,
    nextEl: null,
    trackBy: null,
    trackByWatcher: null,
    animateMove: false,
    animate: false,
    trackByFn: null,
    griDelegate: null,
    tagMode: false,

    queue: null,

    buffered: false,
    bufferPlugin: null,

    $constructor: function(scope, node, config, parentRenderer, attrSet) {

        config.setDefaultMode("trackBy", lib_Config.MODE_STATIC);

        var self    = this, 
            cfg     = config.getAll();

        self.cfg            = config;
        self.scope          = scope;

        self.tagMode        = node.nodeName.toLowerCase() === "mjs-each";
        self.animateMove    = !self.tagMode && 
                                !cfg['buffered'] &&
                                cfg["animateMove"] && 
                                animate_isCssSupported();
        self.animate        = !self.tagMode && 
                                !cfg['buffered'] && 
                                cfg["animate"];
        self.id             = cfg['id'] || nextUid();

        if (self.animate) {
            self.$plugins.push(cfg['animatePlugin'] || "MetaphorJs.plugin.ListAnimated");
        }

        if (cfg['observable']) {
            self.$plugins.push(cfg['observable'] || "MetaphorJs.plugin.Observable");
        }

        if (cfg['buffered'] && !self.tagMode) {
            self.buffered = true;
            self.$plugins.push(cfg['buffered'] || "MetaphorJs.plugin.ListBuffered");
        }

        if (cfg['plugin']) {
            self.$plugins.push(cfg['plugin']);
        }

        if (config.get('trackby') === false) {
            self.trackBy = false;
        }
    },

    $init: function(scope, node, config, parentRenderer, attrSet) {

        var self = this,
            expr;

        if (self.tagMode) {
            expr = dom_getAttr(node, "value");
        }
        else {
            expr = config.getExpression("value");
        }

        self.parseExpr(expr);

        self.tpl        = self.tagMode ? dom_toFragment(node.childNodes) : node;
        self.renderers  = [];

        var cmts = dom_commentWrap(node,  "list -" + self.id);

        self.prevEl     = cmts[0];
        self.nextEl     = cmts[1];
        self.parentEl   = node.parentNode;
        self.node       = null; //node;

        self.queue      = new lib_Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: lib_Queue.ONCE
        });

        self.parentEl.removeChild(node);

        self.afterInit(scope, node, config, parentRenderer, attrSet);

        self.queue.add(self.render, self, [toArray(self.watcher.getValue())]);
    },

    afterInit: function(scope, node) {

        var self        = this,
            cfg         = self.cfg;

        self.watcher    = lib_MutationObserver.get(scope, self.model, self.onChange, self);
        self.trackBy    = cfg.get("trackBy"); // lowercase from attributes
        
        if (self.trackBy !== false) {
            if (self.trackBy && self.trackBy !== '$') {
                self.trackByWatcher = lib_MutationObserver.get(scope, self.trackBy, self.onChangeTrackBy, self);
            }
            else if (self.trackBy !== '$' && !self.watcher.hasInputPipes()) {
                self.trackBy    = '$$'+self.watcher.id;
            }
        }

        self.griDelegate = bind(self.scopeGetRawIndex, self);
    },

    trigger: emptyFn,

    /*
     * <!-- render and re-render
     */

    render: function(list) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {
            renderers.push(self.createItem(tpl.cloneNode(true), list, i));
        }

        self.doRender();
    },

    doRender: function() {

        var self        = this,
            fragment    = window.document.createDocumentFragment(),
            renderers   = self.renderers,
            tm          = self.tagMode,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {

            if (!renderers[i].hidden) {
                if (tm) {
                    fragment.appendChild(dom_toFragment(renderers[i].el));
                }
                else {
                    fragment.appendChild(renderers[i].el);
                }
                renderers[i].attached = true;
            }
        }

        self.parentEl.insertBefore(fragment, self.nextEl);
        self.doUpdate();

        self.trigger("render", self);
    },

    doUpdate: function(start, end, action, renderOnly) {

        var self        = this,
            renderers   = self.renderers,
            index       = start || 0,
            cnt         = renderers.length,
            x           = end || cnt - 1,
            list        = self.watcher.getValue(),
            trackByFn   = self.getTrackByFunction();

        if (x > cnt - 1) {
            x = cnt - 1;
        }

        for (; index <= x; index++) {

            if (action && renderers[index].action !== action) {
                continue;
            }

            self.renderItem(index, renderers, list, trackByFn, renderOnly);
        }
    },

    renderItem: function(index, rs, list, trackByFn, renderOnly) {

        var self = this;

        list = list || self.watcher.getValue();
        rs = rs || self.renderers;
        trackByFn = trackByFn || self.getTrackByFunction();

        var item        = rs[index],
            scope       = item.scope,
            last        = rs.length - 1,
            even        = !(index % 2);

        if (renderOnly && item.rendered) {
            return;
        }

        scope.$index    = index;
        scope.$first    = index === 0;
        scope.$last     = index === last;
        scope.$even     = even;
        scope.$odd      = !even;
        scope.$trackId  = trackByFn(list[index]);
        scope.$getRawIndex = self.griDelegate;

        if (!item.renderer) {
            item.renderer  = new app_Renderer(item.el, scope);
            item.renderer.process();
            item.rendered = true;
        }
        else {
            scope.$check();
        }
    },


    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemName,
            itemScope   = self.scope.$new(),
            tm          = self.tagMode;

        itemScope.$on("changed", self.scope.$check, self.scope);

        itemScope[iname]    = self.getListItem(list, index);
        el = tm ? toArray(el.childNodes) : el;

        return {
            index: index,
            action: "enter",
            el: el,
            firstEl: tm ? el[0] : el,
            lastEl: tm ? el[el.length - 1] : el,
            scope: itemScope,
            attached: false,
            rendered: false,
            hidden: false
        };
    },

    /*
     * render and re-render -->
     */

    /*
     * <!-- reflect changes
     */

    onChange: function(current, prev) {
        var self = this;
        self.queue.prepend(self.applyChanges, self, [prev], 
                            lib_Queue.REPLACE);
    },

    applyChanges: function(prevList) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            index       = 0,
            list        = toArray(self.watcher.getValue()),
            updateStart = null,
            animateMove = self.animateMove,
            newrs       = [],
            iname       = self.itemName,
            origrs      = renderers.slice(),
            doesMove    = false,
            prevr,
            prevrInx,
            i, len,
            r,
            action;

        if (self.trackBy === false) {
            renderers = self.renderers.slice();
            updateStart = 0;
            doesMove = false;
            for (i = 0, len = list.length; i < len; i++) {
                r = self.createItem(tpl.cloneNode(true), list, i);
                newrs.push(r);
            }
        }
        else {

            var prs = levenshteinDiff(prevList, list);
            prs = levenshteinMove(prevList, list, prs.prescription, self.getTrackByFunction());

            // redefine renderers
            for (i = 0, len = prs.length; i < len; i++) {

                action = prs[i];

                if (isNumber(action)) {
                    prevrInx    = action;
                    prevr       = renderers[prevrInx];

                    if (prevrInx !== index && isNull(updateStart)) {
                        updateStart = i;
                    }

                    prevr.action = "move";
                    prevr.scope[iname] = self.getListItem(list, i);
                    doesMove = animateMove;

                    newrs.push(prevr);
                    renderers[prevrInx] = null;
                    index++;
                }
                else {
                    if (isNull(updateStart)) {
                        updateStart = i;
                    }
                    r = self.createItem(tpl.cloneNode(true), list, i);
                    newrs.push(r);
                    // add new elements to old renderers
                    // so that we could correctly determine positions
                }
            }
        }

        self.renderers  = newrs;
        self.reflectChanges({
            oldRenderers:   renderers,
            updateStart:    updateStart,
            newRenderers:   newrs,
            origRenderers:  origrs,
            doesMove:       doesMove
        });
    },


    reflectChanges: function(vars) {
        var self = this;
        self.applyDomPositions(vars.oldRenderers);
        self.doUpdate(vars.updateStart || 0);
        self.removeOldElements(vars.oldRenderers);
        self.trigger("change", self);
    },



    removeOldElements: function(rs) {
        var i, len, r,
            j, jl,
            self    = this,
            parent  = self.parentEl;

        for (i = 0, len = rs.length; i < len; i++) {
            r = rs[i];
            if (r && r.attached) {
                r.attached = false;
                if (!self.tagMode && r.el.parentNode) {
                    r.el.parentNode.removeChild(r.el);
                }
                else {
                    for (j = 0, jl = r.el.length; j < jl; j++) {
                        if (r.el[j].parentNode) {
                            r.el[j].parentNode.removeChild(r.el[j]);
                        }
                    }
                }
            }
            if (r && r.scope) {
                r.scope.$destroy();
            }
        }
    },


    applyDomPositions: function(oldrs) {

        var self        = this,
            rs          = self.renderers,
            parent      = self.parentEl,
            prevEl      = self.prevEl,
            tm          = self.tagMode,
            nc          = self.nextEl,
            next,
            i, l, el, r,
            j;

        /*if (nc && nc.parentNode !== parent) {
            nc = null;
        }
        //if (!nc && prevEl && prevEl.parentNode === parent) {
        //    nc = prevEl.nextSibling;
        //}*/

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;
            next = null;

            if (r.hidden) {
                if (el.parentNode) {
                    if (tm) {
                        el.parentNode.removeChild(dom_toFragment(el));
                    }
                    else {
                        el.parentNode.removeChild(el);
                    }
                    r.attached = false;
                }
                continue;
            }

            for (j = Math.max(i - 1, 0); j >= 0; j--) {
                if (rs[j].attached) {
                    next = rs[j].lastEl.nextSibling;
                    break;
                }
            }

            if (!next) {
                next = nc;
            }

            if (r.firstEl !== next) {
                if (next && r.lastEl.nextSibling !== next) {
                    parent.insertBefore(tm ? dom_toFragment(el) : el, next);
                }
                else if (!next) {
                    parent.appendChild(tm ? dom_toFragment(el) : el);
                }
            }

            r.attached = true;
        }
    },

    /*
     * reflect changes -->
     */


    /*
     * <!-- configurable item functions
     */


    getListItem: function(list, index) {
        return list[index];
    },

    onChangeTrackBy: function(val) {
        this.trackByFn = null;
        this.trackBy = val;
    },

    getTrackByFunction: function() {

        var self = this,
            trackBy;

        if (!self.trackByFn) {

            trackBy = self.trackBy;

            if (!trackBy || trackBy === '$') {
                self.trackByFn = function(item) {
                    return isPrimitive(item) ? item : undf;
                };
            }
            else if (isFunction(trackBy)) {
                self.trackByFn = trackBy;
            }
            else {
                self.trackByFn = function(item){
                    return item && !isPrimitive(item) ? item[trackBy] : undf;
                };
            }
        }

        return self.trackByFn;
    },


    scopeGetRawIndex: function(id) {

        if (id === undf) {
            return -1;
        }

        var self        = this,
            list        = self.watcher.getValue(),
            trackByFn   = self.getTrackByFunction(),
            i, l;

        for (i = 0, l = list.length; i < l; i++) {
            if (trackByFn(list[i]) === id) {
                return i;
            }
        }

        return -1;
    },

    /*
     * configurable item functions -->
     */



    parseExpr: function(expr) {

        var tmp = expr.split(" "),
            i, len,
            model, name,
            row;

        for (i = 0, len = tmp.length; i < len; i++) {

            row = tmp[i];

            if (row === "" || row === "in") {
                continue;
            }

            if (!name) {
                name = row;
            }
            else {
                model = tmp.slice(i).join(" ");
                break;
            }
        }

        this.model = model;
        this.itemName = name || "item";
    },


    onDestroy: function() {

        var self        = this,
            renderers   = self.renderers,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            if (renderers[i].renderer && !renderers[i].renderer.$destroyed) {
                renderers[i].renderer.$destroy();
            }
        }

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribe(self.onChangeTrackBy, self);
            self.trackByWatcher.$destroy(true);
        }

        self.queue.$destroy();

        if (self.watcher) {
            self.watcher.unsubscribe(self.onChange, self);
            self.watcher.$destroy(true);
        }
    }

}, {
    $stopRenderer: true,
    $registerBy: "id"
});








var app_StoreRenderer = MetaphorJs.app.StoreRenderer = app_ListRenderer.$extend({

    store: null,

    $constructor: function(scope, node, config, parentRenderer, attrSet) {

        var cfg = config.getAll();

        if (cfg.pullNext) {
            if (cfg.buffered) {
                cfg.bufferedPullNext = true;
                cfg.buffered = false;
            }

            this.$plugins.push(
                typeof cfg.pullNext === "string" ?
                    cfg.pullNext : "MetaphorJs.plugin.ListPullNext");
        }

        this.$super(scope, node, config, parentRenderer, attrSet);
    },

    afterInit: function(scope, node, config, parentRenderer, attrSet) {

        var self            = this,
            store;

        self.store          = store = lib_Expression.get(self.model, scope);
        self.watcher        = lib_MutationObserver.get(store, "this.current", self.onChange, self);
        
        if (self.trackByFn !== false) {
            self.trackByFn      = bind(store.getRecordId, store);
        }
        
        self.griDelegate    = bind(store.indexOfId, store);
        self.bindStore(store, "on");
    },

    bindStore: function(store, fn) {

        var self    = this;

        store[fn]("update", self.onStoreUpdate, self);
        store[fn]("clear", self.onStoreUpdate, self);
        store[fn]("destroy", self.onStoreDestroy, self);
    },

    onStoreUpdate: function() {
        this.watcher.check();
    },

    getListItem: function(list, index) {
        return this.store.getRecordData(list[index]);
    },

    onStoreDestroy: function() {
        var self = this;
        if (self.watcher) {
            self.onStoreUpdate();
            self.watcher.unsubscribe(self.onChange, self);
            self.watcher.$destroy(true);
            self.watcher = null;
        }
    },

    onDestroy: function() {
        var self = this;
        if (!self.store.$destroyed) {
            self.bindStore(self.store, "un");
        }
        self.$super();
    }

},
{
    $stopRenderer: true,
    $registerBy: "id"
}
);















var app_view_Base = MetaphorJs.app.view.Base = cls({

    $init: function(cfg)  {

        var self    = this;

        extend(self, cfg, true, false);

        if (!self.config) {
            self.config = new lib_Config(null, {
                scope: self.scope
            });
        }

        self.initConfig();

        var node = self.node;

        if (node && node.firstChild) {
            dom_data(node, "mjs-transclude", 
                dom_toFragment(node.childNodes));
        }

        if (!self.id) {
            self.id = nextUid();
        }

        self.scope.$app.registerCmp(self, self.scope, "id");        
        self.initView();
    },

    initView: function() {},

    initConfig: function() {
        var config = this.config;
        config.setType("scrollOnChange", "bool", lib_Config.MODE_STATIC);
        config.setDefaultMode("defaultCmp", lib_Config.MODE_STATIC);
    },


    clearComponent: function() {
        var self    = this,
            node    = self.node;

        if (self.currentComponent) {

            animate_animate(node, self.config.get("animate") ? "leave" : null).done(function(){

                if (self.currentComponent &&
                    !self.currentComponent.$destroyed &&
                    !self.currentComponent.$destroying) {
                    self.currentComponent.$destroy();
                }

                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }

                self.currentComponent = null;
            });
        }
    },

    onCmpDestroy: function(cmp) {},

    setComponent: function(cmp) {

        var self    = this,
            node    = self.node;

        self.beforeCmpChange(cmp);
        MetaphorJs.animate.stop(self.node);
        self.clearComponent();

        animate_animate(node, self.config.get("animate") ? "enter" : null, function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.app.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;
            cfg.autoRender = true;

            return app_resolve(cls, cfg, scope, node, [cfg]).done(function(newCmp){
                newCmp.on("destroy", self.onCmpDestroy, self);
                self.currentComponent = newCmp;
                self.afterCmpChange();
            });
        });
    },

    beforeCmpChange: function(cmpCls) {},

    afterCmpChange: function() {
        var self = this;
        if (self.config.get("scrollOnChange")) {
            raf(function () {
                self.node.scrollTop = 0;
            });
        }
    },

    onDestroy: function() {

        var self = this;

        self.clearComponent();

        if (self.node) {
            dom_data(self.node, "mjs-transclude", null, "remove");
        }

        self.scope = null;
        self.currentComponent = null;
        self.currentView = null;

        self.$super();
    }
});





MetaphorJs.app.view.Component = app_view_Base.$extend({

    initConfig: function() {
        this.config.setDefaultMode("value", lib_Config.MODE_DYNAMIC);
        this.$super();
    },

    initView: function() {
        var self = this;
        self.config.on("value", self.onCmpChange, self);
        self.onCmpChange();
    },

    onCmpChange: function() {
        var self    = this,
            cmp     = self.config.get("value") || 
                        self.config.get("defaultCmp");

        if (!cmp) {
            self.currentComponent && self.clearComponent();
        }
        else {
            self.setComponent(cmp);
        }
    }
});




var regexp_location = MetaphorJs.regexp.location = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;





var browser_parseLocation = MetaphorJs.browser.parseLocation = function(url) {

    var matches = url.match(regexp_location) || [],
        wl = (typeof window != "undefined" ? window.location : null) || {};

    return {
        protocol: matches[4] || wl.protocol || "http:",
        hostname: matches[11] || wl.hostname || "",
        host: ((matches[11] || "") + (matches[12] ? ":" + matches[12] : "")) || wl.host || "",
        username: matches[8] || wl.username || "",
        password: matches[9] || wl.password || "",
        port: parseInt(matches[12], 10) || wl.port || "",
        href: url,
        path: (matches[13] || "/") + (matches[16] || ""),
        pathname: matches[13] || "/",
        search: matches[16] || "",
        hash: matches[17] && matches[17] != "#" ? matches[17] : ""
    };
};



var browser_joinLocation = MetaphorJs.browser.joinLocation = function(location, opt) {

    var url = "";
    opt = opt || {};

    if (!opt.onlyPath) {
        url += location.protocol + "//";

        if (location.username && location.password) {
            url += location.username + ":" + location.password + "@";
        }

        url += location.hostname;

        if (location.hostname && location.port) {
            url += ":" + location.port;
        }
    }

    if (!opt.onlyHost) {
        url += (location.pathname || "/");

        if (location.search && location.search != "?") {
            url += location.search;
        }

        if (location.hash && location.hash != "#") {
            url += location.hash;
        }
    }

    return url;
};











var lib_History = MetaphorJs.lib.History = function() {

    var win,
        history,
        location,
        observable      = new lib_Observable,
        api             = {},
        programId       = nextUid(),
        stateKeyId      = "$$" + programId,
        currentId       = nextUid(),

        hashIdReg       = new RegExp("#" + programId + "=([A-Z0-9]+)"),

        pushState,
        replaceState,

        windowLoaded    = typeof window == "undefined",

        prevLocation    = null,

        pushStateSupported,
        hashChangeSupported,
        useHash;


    observable.createEvent("before-location-change", false);
    observable.createEvent("void-click", false);

    var initWindow = function() {
        win                 = window;
        history             = win.history;
        location            = win.location;
        pushStateSupported  = !!history.pushState;
        hashChangeSupported = "onhashchange" in win;
        useHash             = false; //pushStateSupported && (navigator.vendor || "").match(/Opera/);
        prevLocation        = extend({}, location, true, false);
    };

    var preparePushState = function(state) {
        state = state || {};
        if (!state[stateKeyId]) {
            state[stateKeyId] = nextUid();
        }
        currentId = state[stateKeyId];

        return state;
    };

    var prepareReplaceState = function(state) {
        state = state || {};
        if (!state[stateKeyId]) {
            state[stateKeyId] = currentId;
        }
        return state;
    };


    var hostsDiffer = function(prev, next) {

        if (typeof prev == "string") {
            prev = browser_parseLocation(prev);
        }
        if (typeof next == "string") {
            next = browser_parseLocation(next);
        }

        var canBeEmpty = ["protocol", "host", "port"],
            i, l,
            k;

        for (i = 0, l = canBeEmpty.length; i < l; i++) {
            k = canBeEmpty[i];
            if (prev[k] && next[k] && prev[k] != next[k]) {
                return true;
            }
        }

        return false;
    };

    var pathsDiffer = function(prev, next) {

        if (typeof prev == "string") {
            prev = browser_parseLocation(prev);
        }
        if (typeof next == "string") {
            next = browser_parseLocation(next);
        }

        return hostsDiffer(prev, next) || prev.pathname != next.pathname ||
            prev.search != next.search || prev.hash != next.hash;
    };









    var preparePath = function(url) {

        var loc = browser_parseLocation(url);

        if (!pushStateSupported || useHash) {
            return loc.path;
        }

        return browser_joinLocation(loc, {onlyPath: true});
    };






    var getCurrentStateId = function() {


        if (pushStateSupported) {
            return history.state ? history.state[stateKeyId] : null;
        }
        else {
            return parseOutHashStateId(location.hash).id;
        }

    };

    var parseOutHashStateId = function(hash) {

        var id = null;

        hash = hash.replace(hashIdReg, function(match, idMatch){
            id = idMatch;
            return "";
        });

        return {
            hash: hash,
            id: id
        };
    };

    var setHash = function(hash, state) {

        if (hash) {
            if (hash.substr(0,1) != '#') {
                hash = parseOutHashStateId(hash).hash;
                hash = "!" + hash + "#" + programId + "=" + currentId;
            }
            location.hash = hash;
        }
        else {
            location.hash = "";
        }
    };

    var getCurrentUrl = function() {
        var loc,
            tmp;

        if (pushStateSupported) {
            //loc = location.pathname + location.search + location.hash;
            loc = browser_joinLocation(location);
        }
        else {
            loc = location.hash.substr(1);
            tmp = extend({}, location, true, false);

            if (loc) {

                loc = parseOutHashStateId(loc).hash;

                if (loc.substr(0, 1) == "!") {
                    loc = loc.substr(1);
                }
                var p = decodeURIComponent(loc).split("?");
                tmp.pathname = p[0];
                tmp.search = p[1] ? "?" + p[1] : "";
            }

            loc = browser_joinLocation(tmp);
        }

        return loc;
    };


    var onLocationPush = function(url) {
        prevLocation = extend({}, location, true, false);
        triggerEvent("location-change", url);
    };

    var onLocationPop = function() {
        if (pathsDiffer(prevLocation, location)) {

            var url     = getCurrentUrl(),
                state   = history.state || {};

            triggerEvent("before-location-pop", url);

            currentId       = getCurrentStateId();
            prevLocation    = extend({}, location, true, false);

            triggerEvent("location-change", url);
        }
    };

    var triggerEvent = function triggerEvent(event, data, anchor) {
        var url     = data || getCurrentUrl(),
            loc     = browser_parseLocation(url),
            path    = loc.pathname + loc.search + loc.hash;
        return observable.trigger(event, path, anchor, url);
    };

    var init = function() {

        initWindow();

        // normal pushState
        if (pushStateSupported) {

            //history.origPushState       = history.pushState;
            //history.origReplaceState    = history.replaceState;

            dom_addListener(win, "popstate", onLocationPop);

            pushState = function(url, anchor, state) {
                if (triggerEvent("before-location-change", url, anchor) === false) {
                    return false;
                }
                history.pushState(preparePushState(state), null, preparePath(url));
                onLocationPush(url);
            };


            replaceState = function(url, anchor, state) {
                history.replaceState(prepareReplaceState(state), null, preparePath(url));
                onLocationPush(url);
            };

            replaceState(getCurrentUrl());
        }
        else {

            // onhashchange
            if (hashChangeSupported) {

                pushState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
                        return false;
                    }
                    async(setHash, null, [preparePath(url), preparePushState(state)]);
                };

                replaceState = function(url, anchor, state) {
                    async(setHash, null, [preparePath(url), prepareReplaceState(state)]);
                };

                dom_addListener(win, "hashchange", onLocationPop);
            }
            // iframe
            else {

                var frame   = null,
                    initialUpdate = false;

                var createFrame = function() {
                    frame   = window.document.createElement("iframe");
                    frame.src = 'about:blank';
                    frame.style.display = 'none';
                    window.document.body.appendChild(frame);
                };

                win.onIframeHistoryChange = function(val) {
                    if (!initialUpdate) {
                        async(function(){
                            setHash(val);
                            onLocationPop();
                        });
                    }
                };

                var pushFrame = function(value) {
                    var frameDoc;
                    if (frame.contentDocument) {
                        frameDoc = frame.contentDocument;
                    }
                    else {
                        frameDoc = frame.contentWindow.document;
                    }
                    frameDoc.open();
                    //update iframe content to force new history record.
                    frameDoc.write('<html><head><title>' + document.title +
                                   '</title><script type="text/javascript">' +
                                   'var hashValue = "'+value+'";'+
                                   'window.top.onIframeHistoryChange(hashValue);' +
                                   '</script>' +
                                   '</head><body>&nbsp;</body></html>'
                    );
                    frameDoc.close();
                };

                var replaceFrame = function(value) {
                    frame.contentWindow.hashValue = value;
                };


                pushState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
                        return false;
                    }
                    pushFrame(preparePath(url));
                };

                replaceState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
                        return false;
                    }
                    replaceFrame(preparePath(url));
                };

                var initFrame = function(){
                    createFrame();
                    initialUpdate = true;
                    pushFrame(preparePath(location.hash.substr(1)));
                    initialUpdate = false;
                };

                if (windowLoaded) {
                    initFrame();
                }
                else {
                    dom_addListener(win, "load", initFrame);
                }
            }
        }

        dom_addListener(window.document.documentElement, "click", function(e) {

            e = dom_normalizeEvent(e || win.event);

            var a = e.target,
                href;

            while (a && a.nodeName.toLowerCase() != "a") {
                a = a.parentNode;
            }

            if (a && !e.isDefaultPrevented()) {

                href = dom_getAttr(a, "href");

                if (href == "#") {

                    var res = observable.trigger("void-click", a);

                    if (!res) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }

                if (href && href.substr(0,1) != "#" && !dom_getAttr(a, "target")) {

                    var prev = extend({}, location, true, false),
                        next = browser_parseLocation(href);

                    if (hostsDiffer(prev, next)) {
                        return null;
                    }

                    if (pathsDiffer(prev, next)) {
                        pushState(href, a);
                    }
                    else {
                        triggerEvent("same-location", null, a);
                    }

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            return null;
        });

        init = emptyFn;
    };


    dom_addListener(window, "load", function() {
        windowLoaded = true;
    });


    /**
     * Browser pushState wrapper and polyfill. 
     * @object MetaphorJs.lib.History
     */
    return extend(api, {

        /**
         * @property {function} on {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * @param {object} options
         * }
         */
        on: function() {
            return observable.on.apply(observable, arguments);
        },

        /**
         * @property {function} un {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * }
         */
        un: function() {
            return observable.un.apply(observable, arguments);
        },

        /**
         * @property {function} once {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * }
         */
        once: function() {
            return observable.once.apply(observable, arguments);
        },

        /**
         * @property {function} push {
         *  Push new url
         *  @param {string} url
         *  @param {object} state
         * }
         */
        push: function(url, state) {
            init();

            var prev = extend({}, location, true, false),
                next = browser_parseLocation(url);

            if (hostsDiffer(prev, next)) {
                return null;
            }

            if (pathsDiffer(prev, next)) {
                pushState(url, null, state);
            }
        },

        /**
         * @property {function} replace {
         *  Replace current url with another url
         *  @param {string} url
         *  @param {object} state
         * }
         */
        replace: function(url, state) {
            init();
            replaceState(url, null, state);
        },

        /**
         * Update state of current url
         * @property {function} saveState {
         *  @param {object} state
         * }
         */
        saveState: function(state) {
            init();
            replaceState(getCurrentUrl(), null, state);
        },

        /**
         * Merge new state into current state 
         * @property {function} mergeState {
         *  @param {object} state
         * }
         */
        mergeState: function(state) {
            this.saveState(extend({}, history.state, state, true, false));
        },

        /**
         * Get current state
         * @property {function} getState {
         *  @returns {object}
         * }
         */
        getState: function() {
            return history.state;
        },

        /**
         * Get current instance id
         * @property {functrion} getCurrentStateId {
         *  @returns {string}
         * }
         */
        getCurrentStateId: function() {
            return currentId;
        },

        /**
         * Get current url
         * @property {function} current {
         *  @returns {string} url
         * }
         */
        current: function() {
            init();
            return getCurrentUrl();
        },

        /**
         * Initialize instance 
         * @property {function} init
         */
        init: function() {
            return init();
        },

        /**
         * Polyfill window.pushState and replaceState
         * @property {function} polyfill
         */
        polyfill: function() {
            init();
            window.history.pushState = function(state, title, url) {
                pushState(url, null, state);
            };
            window.history.replaceState = function(state, title, url) {
                replaceState(url, null, state);
            };
        }
    });

}();






    


var lib_UrlParam = MetaphorJs.lib.UrlParam = (function(){

    var cache = {};

    /**
     * Url param watcher
     * @class MetaphorJs.lib.UrlParam
     */
    var UrlParam = cls({

        $mixins: [mixin_Observable],

        id: null,
        name: null,
        extractor: null,
        context: null,
        regexp: null,
        valueIndex: 1,
        prev: null,
        value: null,
        enabled: true,

        /**
         * @method
         * @constructor
         * @param {object} cfg {
         *  @type {string} id unique param id
         *  @type {string|RegExp} regexp
         *  @type {string} name
         *  @type {function} extractor {
         *      @param {string} url     
         *      @returns {*} value
         *  }
         *  @type {object} context extractor's context
         *  @type {int} valueIndex {
         *      Index in regexp match array
         *      @default 1
         *  }
         * }
         */
        $init: function(cfg) {

            var self = this;

            extend(self, cfg, true, false);

            if (self.regexp && isString(self.regexp)) {
                self.regexp = getRegExp(self.regexp);
            }

            if (self.name && !self.regexp && !self.extractor) {
                self.regexp = getRegExp(self.name + "=([^&]+)");
            }

            if (!self.regexp && !self.extractor) {
                throw new Error("Invalid UrlParam config, missing regexp or extractor");
            }

            if (self.enabled) {
                self.enabled = false;
                self.enable();
            }
        },

        /**
         * Enable watcher (enabled by default)
         * @method 
         */
        enable: function() {
            var self = this;
            if (!self.enabled) {
                self.enabled = true;
                lib_History.on("location-change", self.onLocationChange, self);
                var url = lib_History.current(),
                    loc = browser_parseLocation(url);
                self.onLocationChange(loc.pathname + loc.search + loc.hash);
            }
        },

        /**
         * Disable watcher
         * @method
         */
        disable: function() {
            var self = this;
            if (self.enabled) {
                self.enabled = false;
                lib_History.un("location-change", self.onLocationChange, self);
            }
        },

        onLocationChange: function(url) {

            var self = this,
                value = self.extractValue(url);

            if (self.value != value) {
                self.prev = self.value;
                self.value = value;
                self.trigger("change", value, self.prev);
            }
        },

        /**
         * Extract param value from url
         * @method
         * @param {string} url
         * @returns {string}
         */
        extractValue: function(url) {
            var self = this;
            if (self.regexp) {
                var match = url.match(self.regexp);
                return match ? match[self.valueIndex] : null;
            }
            else if (self.extractor) {
                return self.extractor.call(self.context, url);
            }
        },

        /**
         * Get current param value
         * @method
         * @returns {string|null}
         */
        getValue: function() {
            return this.value;
        },

        /**
         * Get previous value
         * @method
         * @returns {string|null}
         */
        getPrev: function() {
            return this.prev;
        },

        /**
         * Destroy param watcher if there are no listeners
         * @method
         */
        destroyIfIdle: function() {
            var self = this;
            if (!self.$$observable.hasListener()) {
                self.$destroy();
            }
        },

        onDestroy: function() {
            var self = this;
            self.disable();
        }

    }, {

        /**
         * Get already initialized instance based on cfg.id
         * @static
         * @method
         * @param {object} cfg See constructor
         * @returns {MetaphorJs.lib.UrlParam}
         */
        get: function(cfg) {
            if (cfg.id && cache[cfg.id]) {
                return cache[cfg.id];
            }
            else {
                return new UrlParam(cfg);
            }
        }

    });

    return UrlParam;
}());







/**
 * Stop ongoing animation for given element
 * @function MetaphorJs.animate.stop
 * @param {Element} el
 */
var animate_stop = MetaphorJs.animate.stop = function(el) {

    var queue = dom_data(el, "mjsAnimationQueue"),
        current,
        position,
        stages;

    if (isArray(queue) && queue.length) {
        current = queue[0];

        if (current) {
            if (current.stages) {
                position = current.position;
                stages = current.stages;
                dom_removeClass(el, stages[position]);
                dom_removeClass(el, stages[position] + "-active");
            }
            if (current.deferred) {
                current.deferred.reject(current.el);
            }
        }
    }
    else if (isFunction(queue)) {
        queue(el);
    }
    else if (queue === "stop") {
        $(el).stop(true, true);
    }

    dom_data(el, "mjsAnimationQueue", null);
};


















var app_view_Router = MetaphorJs.app.view.Router = app_view_Base.$extend({

    initView: function() {

        var self = this;

        self.routeMap = {};
        self.cmpCache = {};
        self.domCache = {};
        self.route = self.route || [];

        lib_History.init();
        lib_History.on("location-change", self.onLocationChange, self);
        self.initRoutes();
        self.onLocationChange();
    },

    initRoutes: function() {

        var self = this,
            routes = self.route,
            params,
            param,
            route,
            i, l,
            j, z;

        for (i = 0, l = routes.length; i < l; i++) {
            route = routes[i];
            route.id = route.id || nextUid();

            if (route.params) {
                params = {};
                for (j = 0, z = route.params.length; j < z; j++) {
                    param = route.params[j];
                    if (param.name) {
                        params[param.name] = new lib_UrlParam(
                            extend({}, param, {enabled: false}, true, false)
                        );
                    }
                }
                route.params = params;
            }

            self.routeMap[route.id] = route;
        }
    },


    onLocationChange: function() {

        var self        = this,
            url         = lib_History.current(),
            loc         = browser_parseLocation(url),
            path        = loc.pathname + loc.search + loc.hash,
            routes      = self.route,
            def,
            i, len,
            r, matches;

        for (i = 0, len = routes.length; i < len; i++) {
            r = routes[i];

            if (r.regexp && (matches = loc.pathname.match(r.regexp))) {
                self.resolveRoute(r, matches);
                return;
            }
            else if (r.regexpFull && (matches = path.match(r.regexp))) {
                self.resolveRoute(r, matches);
                return;
            }
            if (r['default'] && !def) {
                def = r;
            }
        }
    
        var tmp = self.onNoMatchFound(loc);

        if (tmp) {
            if (isThenable(tmp)) {
                tmp.done(self.resolveRoute, self);
                tmp.fail(function(){
                    self.finishOnLocationChange(def);
                });
            }
            else {
                self.resolveRoute(tmp);
            }
        }
        else {
            self.finishOnLocationChange(def);
        }
    },

    finishOnLocationChange: function(def) {
        var self = this;
        if (def) {
            self.resolveRoute(def);
        }
        else if (self.config.hasExpression("defaultCmp")) {
            self.setComponent(self.config.get("defaultCmp"));
        }
    },

    resolveRoute: function(route, matches) {

        var self = this;

        matches = matches || [];

        if (route.resolve) {
            var promise = route.resolve.call(self, route, matches);
            if (isThenable(promise)) {
                promise.done(function(){
                    self.setRouteComponent(route, matches);
                });
            }
            else if (promise) {
                self.setRouteComponent(route, matches);
            }
        }
        else {
            self.setRouteComponent(route, matches);
        }

    },


    onNoMatchFound: function() {},

    toggleRouteParams: function(route, fn) {
        if (route.params) {
            for (var i in route.params) {
                route.params[i][fn]();
            }
        }
    },

    setRouteClasses: function(route) {
        var self    = this;

        if (route.cls) {
            self.currentCls = route.cls;
            dom_addClass(self.node, route.cls);
        }
        if (route.htmlCls) {
            self.currentHtmlCls = route.htmlCls;
            dom_addClass(window.document.documentElement, route.htmlCls);
        }
    },

    onRouteFail: function(route) {},

    setRouteComponent: function(route, matches) {

        var self    = this,
            node    = self.node,
            params  = route.params,
            cview   = self.currentView || {};

        if (route.id === cview.id) {
            if (self.currentComponent && self.currentComponent.onViewRepeat) {
                self.currentComponent.onViewRepeat();
            }
            return;
        }

        if (route.ttlTmt) {
            clearTimeout(route.ttlTmt);
        }

        self.beforeRouteCmpChange(route);

        self.toggleRouteParams(cview, "disable");
        self.toggleRouteParams(route, "enable");
        animate_stop(self.node);
        self.clearComponent();

        if (cview.teardown) {
            cview.teardown(cview, route, matches);
        }

        self.setRouteClasses(route);

        self.currentView = route;

        animate_animate(node, self.config.get("animate") ? "enter" : null, function(){

            var args    = matches || [],
                cfg     = {
                    destroyEl: false,
                    autoRender: true,
                    node: node,
                    destroyScope: true,
                    scope: self.scope.$new()
                };

            if (route.config) {
                cfg.config = route.config;
            }
            if (route.template) {
                cfg.template = route.template;
            }

            args.shift();

            if (params) {
                extend(cfg, params, false, false);
            }

            args.unshift(cfg);

            if (self.cmpCache[route.id]) {
                self.currentComponent = self.cmpCache[route.id];
                node.appendChild(self.domCache[route.id]);
                self.currentComponent.unfreeze(self);
                self.afterRouteCmpChange();
                self.afterCmpChange();
            }
            else {

                if (route.setup) {
                    route.setup(route, matches);
                }
                else {

                    return app_resolve(
                        route.cmp || "MetaphorJs.app.Component",
                        cfg,
                        cfg.scope,
                        node,
                        args
                    )
                    .done(function (newCmp) {

                        self.currentComponent = newCmp;

                        if (route.keepAlive) {
                            newCmp[self.id] = route.id;
                            self.cmpCache[route.id] = newCmp;
                            self.domCache[route.id] = window.document.createDocumentFragment();
                            newCmp.on("destroy", self.onCmpDestroy, self);
                        }

                        self.afterRouteCmpChange();
                        self.afterCmpChange();
                    })
                    .fail(function(){
                        self.onRouteFail(route);
                    });
                }
            }
        });
    },



    clearComponent: function() {
        var self    = this,
            node    = self.node,
            cview   = self.currentView || {};

        if (self.currentCls) {
            dom_removeClass(self.node, self.currentCls);
        }

        self.currentView = null;

        if (self.currentHtmlCls) {
            dom_removeClass(window.document.documentElement, self.currentHtmlCls);
        }

        if (self.currentComponent) {

            animate_animate(node, self.config.get("animate") ? "leave" : null).done(function(){
                
                if (!cview.keepAlive) {

                    if (self.currentComponent &&
                        !self.currentComponent.$destroyed &&
                        !self.currentComponent.$destroying) {
                        self.currentComponent.$destroy();
                    }

                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                }
                else {
                    self.currentComponent.freeze(self);
                    var frg = self.domCache[cview.id];
                    while (node.firstChild) {
                        frg.appendChild(node.firstChild);
                    }
                    if (cview.ttl) {
                        cview.ttlTmt = async(self.onCmpTtl, self, [cview], cview.ttl);
                    }
                }

                self.currentComponent = null;
            });
        }
    },


    onCmpTtl: function(currentView) {

        var self = this,
            id = currentView.id;
        route.ttlTmt = null;

        if (self.cmpCache[id]) {
            self.cmpCache[id].$destroy();
            delete self.cmpCache[id];
            delete self.domCache[id];
        }
    },

    onCmpDestroy: function(cmp) {

        var self = this,
            id = cmp[self.id];

        if (id && self.cmpCache[id]) {
            delete self.cmpCache[id];
            delete self.domCache[id];
        }
    },


    beforeRouteCmpChange: function(route) {},
    afterRouteCmpChange: function() {},



    onDestroy: function() {

        var self    = this,
            i, l, j

        lib_History.un("location-change", self.onLocationChange, self);

        for (i = 0, l = self.route.length; i < l; i++) {
            if (self.route[i].params) {
                for (j in self.route[i].params) {
                    self.route[i].params[j].$destroy();
                }
            }
        }

        self.route = null;
        self.$super();
    }
});



var app = (function(){







var appDirective = function() {
    return false;
};

appDirective.$prebuild = {
    defaultMode: lib_Config.MODE_STATIC,
    ignore: true
};

Directive.registerAttribute("app", 100, appDirective);
}());



/**
 * Is given element a field
 * @function MetaphorJs.dom.isField
 * @param {DomNode} node
 * @returns {boolean}
 */
var dom_isField = MetaphorJs.dom.isField = function dom_isField(el) {
    var tag	= el && el.nodeName ? el.nodeName.toLowerCase() : null,
        type = el.type;
    if (tag == 'input' || tag == 'textarea' || tag == 'select') {
        if (type != "submit" && type != "reset" && type != "button") {
            return true;
        }
    }
    return false;
};





/**
 * @function MetaphorJs.dom.getInputValue
 * @param {Element} elem
 * @returns {string}
 */
var dom_getInputValue = MetaphorJs.dom.getInputValue = function(){


    var rreturn = /\r/,

        hooks = {

        option: function(elem) {
            var val = elem.getAttribute("value") || elem.value;

            return val !== undf ?
                   val :
                   ( elem.innerText || elem.textContent ).trim();
        },

        select: function(elem) {

            var value, option,
                options = elem.options,
                index = elem.selectedIndex,
                one = elem.type === "select-one" || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                disabled,
                i = index < 0 ?
                    max :
                    one ? index : 0;

            // Loop through all the selected options
            for ( ; i < max; i++ ) {
                option = options[ i ];

                disabled = option.disabled ||
                           option.parentNode.disabled;

                // IE6-9 doesn't update selected after form reset (#2551)
                if ((option.selected || i === index) && !disabled ) {
                    // Get the specific value for the option
                    value = MetaphorJs.dom.getInputValue(option);

                    // We don't need an array for one selects
                    if ( one ) {
                        return value;
                    }

                    // Multi-Selects return an array
                    values.push( value );
                }
            }

            return values;
        },

        radio: function( elem ) {
            return isNull(elem.getAttribute("value")) ? "on" : elem.value;
        },

        checkbox: function( elem ) {
            return isNull(elem.getAttribute("value")) ? "on" : elem.value;
        }
    };

    return function dom_getInputValue(elem) {

        var hook, ret;

        hook = hooks[elem.type] || hooks[elem.nodeName.toLowerCase()];

        if (hook && (ret = hook(elem, "value")) !== undf) {
            return ret;
        }

        ret = elem.value;

        return isString(ret) ?
            // Handle most common string cases
               ret.replace(rreturn, "") :
            // Handle cases where value is null/undef or number
               ret == null ? "" : ret;

    };
}();









/**
 * @function MetaphorJs.dom.setInputValue
 * @param {Element} el
 * @param {*} val
 */
var dom_setInputValue = MetaphorJs.dom.setInputValue = function() {

    var hooks = {
        select:  function(elem, value) {

            var optionSet, option,
                options     = elem.options,
                values      = toArray(value),
                i           = options.length,
                selected,
                setIndex    = -1;

            while ( i-- ) {
                option      = options[i];
                selected    = values.indexOf(option.value) !== -1;

                if (selected) {
                    dom_setAttr(option, "selected", "selected");
                    option.selected = true;
                    optionSet = true;
                }
                else {
                    dom_removeAttr(option, "selected");
                }

                if (!selected && !isNull(dom_getAttr(option, "default-option"))) {
                    setIndex = i;
                }
            }

            // Force browsers to behave consistently when non-matching value is set
            if (!optionSet) {
                elem.selectedIndex = setIndex;
            }

            return values;
        }
    };

    hooks["radio"] = hooks["checkbox"] = function(elem, value) {
        if (isArray(value) ) {
            return (elem.checked = value.indexOf(
                dom_getInputValue(elem)
                ) !== -1);
        }
    };


    return function(el, val) {

        if (el.nodeType !== 1) {
            return;
        }

        // Treat null/undefined as ""; convert numbers to string
        if (isNull(val)) {
            val = "";
        }
        else if (isNumber(val)) {
            val += "";
        }

        var hook = hooks[el.type] || hooks[el.nodeName.toLowerCase()];

        // If set returns undefined, fall back to normal setting
        if (!hook || hook(el, val, "value") === undf) {
            el.value = val;
        }
    };
}();




/**
 * Remove listeners from element's events
 * @function MetaphorJs.dom.removeListener
 * @param {DomNode} el 
 * @param {string} eventName
 * @param {function} fn
 */
var dom_removeListener = MetaphorJs.dom.removeListener = function(){

    var fn = null,
        prefix = null;

    return function dom_removeListener(el, event, func) {

        if (fn === null) {
            if (el.removeEventListener) {
                fn = "removeEventListener";
                prefix = "";
            }
            else {
                fn = "detachEvent";
                prefix = "on";
            }
            //fn = el.detachEvent ? "detachEvent" : "removeEventListener";
            //prefix = el.detachEvent ? "on" : "";
        }

        el[fn](prefix + event, func);
    }
}();



MetaphorJs.browser = MetaphorJs.browser || {};





var browser_isAndroid = MetaphorJs.browser.isAndroid = function(){

    var android = null;

    return function browser_isAndroid() {

        if (android === null) {
            android = parseInt((/android (\d+)/i.exec(navigator.userAgent) || [])[1], 10) || false;
        }

        return android;
    };

}();




var isIE = MetaphorJs.browser.isIE = function(){

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






/**
 * Check if current browser supports event
 * @function MetaphorJs.browser.hasEvent
 * @param {string} event
 * @return {boolean}
 */
var browser_hasEvent = MetaphorJs.browser.hasEvent = function(){

    var eventSupport = {},
        divElm;

    return function browser_hasEvent(event) {
        // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
        // it. In particular the event is not fired when backspace or delete key are pressed or
        // when cut operation is performed.

        if (eventSupport[event] === undf) {

            if (event === 'input' && isIE() == 9) {
                return eventSupport[event] = false;
            }
            if (!divElm) {
                divElm = window.document.createElement('div');
            }

            eventSupport[event] = !!('on' + event in divElm);
        }

        return eventSupport[event];
    };
}();















var lib_Input = MetaphorJs.lib.Input = function(){

var observable = new lib_Observable,
    id = 0;

var Input = function(el, changeFn, changeFnContext, cfg) {

    if (el.$$input) {
        if (changeFn) {
            el.$$input.on("change", changeFn, changeFnContext);
        }
        return el.$$input;
    }

    var self    = this;

    cfg = cfg || {};

    //self.observable     = new lib_Observable;
    self.el             = el;
    self.id             = ++id;
    self.inputType      = el.type.toLowerCase();
    self.dataType       = cfg.type || dom_getAttr(el, "data-type") || self.inputType;
    self.listeners      = [];

    if (changeFn) {
        self.on("change", changeFn, changeFnContext);
    }
};

extend(Input.prototype, {

    el: null,
    inputType: null,
    dataType: null,
    listeners: null,
    radio: null,
    keydownDelegate: null,
    changeInitialized: false,

    $destroy: function() {

        var self        = this,
            i;

        //self.observable.$destroy();
        observable.destroyEvent("change-" + self.id);
        observable.destroyEvent("key-" + self.id);
        self._addOrRemoveListeners(dom_removeListener, true);

        self.el.$$input = null;

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }
    },

    _addOrRemoveListeners: function(fn, onlyUsed) {

        var self        = this,
            type        = self.inputType,
            listeners   = self.listeners,
            radio       = self.radio,
            el          = self.el,
            used,
            i, ilen,
            j, jlen;

        for (i = 0, ilen = listeners.length; i < ilen; i++) {

            used = !!listeners[i][2];

            if (used === onlyUsed) {
                if (type === "radio") {
                    for (j = 0, jlen = radio.length; j < jlen; j++) {
                        fn(radio[j], listeners[i][0], listeners[i][1]);
                    }
                }
                else {
                    fn(el, listeners[i][0], listeners[i][1]);
                }
                listeners[i][2] = !onlyUsed;
            }
        }
    },

    initInputChange: function() {

        var self = this,
            type = self.inputType;

        if (type === "radio") {
            self.initRadioInput();
        }
        else if (type === "checkbox") {
            self.initCheckboxInput();
        }
        else {
            self.initTextInput();
        }

        self._addOrRemoveListeners(dom_addListener, false);

        self.changeInitialized = true;
    },

    initRadioInput: function() {

        var self    = this,
            el      = self.el,
            name    = el.name,
            parent;

        if (isAttached(el)) {
            parent  = el.ownerDocument;
        }
        else {
            parent = el;
            while (parent.parentNode) {
                parent = parent.parentNode;
            }
        }

        self.radio  = select("input[name="+name+"]", parent);

        self.onRadioInputChangeDelegate = bind(self.onRadioInputChange, self);
        self.listeners.push(["click", self.onRadioInputChangeDelegate, false]);
    },

    initCheckboxInput: function() {

        var self    = this;

        self.clicked = false;

        self.onCheckboxInputChangeDelegate = bind(self.onCheckboxInputChange, self);
        self.onCheckboxInputClickDelegate = bind(self.onCheckboxInputClick, self);
        self.listeners.push(["click", self.onCheckboxInputClickDelegate, false]);
        self.listeners.push(["change", self.onCheckboxInputChangeDelegate, false]);
    },

    initTextInput: function() {

        var composing   = false,
            self        = this,
            listeners   = self.listeners,
            timeout;

        // In composition mode, users are still inputing intermediate text buffer,
        // hold the listener until composition is done.
        // More about composition events:
        // https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
        if (!browser_isAndroid()) {

            var compositionStart    = function() {
                composing = true;
            };

            var compositionEnd  = function() {
                composing = false;
                listener();
            };

            listeners.push(["compositionstart", compositionStart, false]);
            listeners.push(["compositionend", compositionEnd, false]);
        }

        var listener = self.onTextInputChangeDelegate = function(ev) {
            if (composing) {
                return;
            }
            self.onTextInputChange(ev);
        };

        var deferListener = function(ev) {
            if (!timeout) {
                timeout = setTimeout(function() {
                    listener(ev);
                    timeout = null;
                }, 0);
            }
        };

        var keydown = function(event) {
            event = event || window.event;
            var key = event.keyCode;

            // ignore
            //    command            modifiers                   arrows
            if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                return;
            }

            deferListener(event);
        };

        // if the browser does support "input" event, we are fine - except on
        // IE9 which doesn't fire the
        // input event on backspace, delete or cut
        if (browser_hasEvent('input')) {

            listeners.push(["input", listener, false]);

        } else {

            listeners.push(["keydown", keydown, false]);

            // if user modifies input value using context menu in IE,
            // we need "paste" and "cut" events to catch it
            if (browser_hasEvent('paste')) {
                listeners.push(["paste", deferListener, false]);
                listeners.push(["cut", deferListener, false]);
            }
        }


        // if user paste into input using mouse on older browser
        // or form autocomplete on newer browser, we need "change" event to catch it

        listeners.push(["change", listener, false]);
    },

    processValue: function(val) {

        switch (this.dataType) {
            case "number":
            case "float":
            case "double":
                if (val === "" || isNaN(val = parseFloat(val))) {
                    val = undf;
                }
                break;
            case "int":
            case "integer":
                if (val === "" || isNaN(val = parseInt(val, 10))) {
                    val = undf;
                }
                break;
            case "bool":
            case "boolean":
                return !(val === "false" || val === "0" || val === 0 ||
                        val === "off" || val === false || val === "");

        }

        return val;
    },

    onTextInputChange: function(ev) {

        var self    = this,
            val     = self.getValue();

        observable.trigger("change-"+self.id, self.processValue(val));
    },


    _checkboxChange: function() {
        var self    = this,
            node    = self.el;

        observable.trigger("change-"+self.id, self.processValue(
            node.checked ? (dom_getAttr(node, "value") || true) : false)
        );
    },

    onCheckboxInputChange: function() {
        if (!this.clicked) {
            this._checkboxChange();
        }
        this.clicked = false;
    },

    onCheckboxInputClick: function() {
        this._checkboxChange();
        this.clicked = true;
    },

    onRadioInputChange: function(e) {

        e = e || window.event;

        var self    = this,
            trg     = e.target || e.srcElement;

        observable.trigger("change-"+self.id, self.processValue(trg.value));
    },

    setValue: function(val) {

        var self    = this,
            type    = self.inputType,
            radio,
            i, len;

        val = self.processValue(val);

        if (type === "radio") {

            radio = self.radio;

            for (i = 0, len = radio.length; i < len; i++) {
                radio[i].checked = self.processValue(radio[i].value) == val;
            }
        }
        else if (type === "checkbox") {
            var node        = self.el;
            node.checked    = val === true || val == self.processValue(node.value);
        }
        else {

            if (val === undf) {
                val = "";
            }

            dom_setInputValue(self.el, val);
        }

        self.triggerChange();
    },

    getValue: function() {

        var self    = this,
            type    = self.inputType,
            radio,
            i, l;

        if (type === "radio") {
            radio = self.radio;
            for (i = 0, l = radio.length; i < l; i++) {
                if (radio[i].checked) {
                    return self.processValue(radio[i].value);
                }
            }
            return null;
        }
        else if (type === "checkbox") {
            return self.processValue(self.el.checked ? (dom_getAttr(self.el, "value") || true) : false);
        }
        else {
            return self.processValue(dom_getInputValue(self.el));
        }
    },


    on: function(event, fn, ctx, opt) {
        var self = this;
        if (event === "change" && !self.changeInitialized) {
            self.initInputChange();
        }
        else if (event === "key" && !self.keydownDelegate) {
            self.keydownDelegate = bind(self.keyHandler, self);
            self.listeners.push(["keydown", self.keydownDelegate, false]);
            dom_addListener(self.el, "keydown", self.keydownDelegate);
            observable.createEvent("key-"+self.id, {
                returnResult: false,
                triggerFilter: self.keyEventFilter
            });
        }
        return observable.on(event+"-"+self.id, fn, ctx, opt);
    },

    un: function(event, fn, ctx) {
        return observable.un(event+"-"+this.id, fn, ctx);
    },

    onChange: function(fn, context) {
        return this.on("change", fn, context);
    },

    unChange: function(fn, context) {
        return this.un("change", fn, context);
    },

    onKey: function(key, fn, context, args) {
        return this.on("key", fn, context, {
            key: key,
            prepend: args
        });
    },

    unKey: function(key, fn, context) {
        this.un("key", fn, context);
    },

    keyEventFilter: function(l, args) {

        var key = l.key,
            e = args[0];

        if (typeof key !== "object") {
            return key === e.keyCode;
        }
        else {
            if (key.ctrlKey !== undf && key.ctrlKey !== e.ctrlKey) {
                return false;
            }
            if (key.shiftKey !== undf && key.shiftKey !== e.shiftKey) {
                return false;
            }
            return !(key.keyCode !== undf && key.keyCode !== e.keyCode);
        }
    },

    keyHandler: function(event) {
        observable.trigger(
            "key-"+this.id, 
            dom_normalizeEvent(event || window.event)
        );
    },

    triggerChange: function() {
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            this.el.dispatchEvent(evt);
        }
        else {
            this.el.fireEvent("onchange");
        }
    }


}, true, false);


Input.get = function(node, scope) {
    if (node.$$input) {
        return node.$$input;
    }
    if (scope && scope.$app && !node.type) {
        var cmp = scope.$app.getParentCmp(node, true);
        if (cmp && cmp.getInputApi) {
            return cmp.getInputApi();
        }
    }
    return new Input(node);
};

Input.getValue = dom_getInputValue;
Input.setValue = dom_setInputValue;



return Input;

}();










Directive.registerAttribute("bind", 1000, 
    Directive.$extend({
        $class: "MetaphorJs.app.Directive.attr.Bind",
        isInput: false,
        input: null,
        textRenderer: null,
        observers: null,

        $init: function(scope, node, config, renderer) {

            var self    = this;

            config.setType("recursive", "bool");
            config.setType("once", "bool", lib_Config.MODE_STATIC);
            config.setType("locked", "bool");

            self.scope      = scope;
            self.node       = node;
            self.config     = config;

            self._initNode(node);
            
            self.optionsChangeDelegate = bind(self.onOptionsChange, self);
            dom_addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

            if (config.get("recursive")) {
                config.disableProperty("value");
                config.disableProperty("recursive");
                self.textRenderer = new lib_Text(
                    scope, 
                    config.getExpression("value"), 
                    {
                        recursive: true, 
                        fullExpr: true,
                        once: config.get("once")
                    }
                );
                self.textRenderer.subscribe(self.onTextRendererChange, self);
                self.onTextRendererChange();

                if (scope instanceof lib_Scope) {
                    scope.$on("destroy", self.onScopeDestroy, self);
                }
            }
            else {
                self.$super(scope, self.node, config);
            }
        },

        _initNode: function(node) {
            var self = this;
            if (node.getDomApi) {
                self.node = node.getDomApi("bind");
            }
            if (dom_isField(node)) {
                self.input = lib_Input.get(node);
            }
            else if (node.getInputApi) {
                self.input = node.getInputApi("bind");
            }
            if (self.input) {
                self.input.onChange(self.onInputChange, self);
            }
        },

        onInputChange: function(val) {
            var self = this,
                cfgVal = self.config.get("value") || null;
            val = val || null;
            if (self.config.get("locked") && val != cfgVal) {
                self.onChange(cfgVal);
            }
        },

        onTextRendererChange: function() {
            this.onChange(this.textRenderer.getString());
        },

        onOptionsChange: function() {
            this.onChange();
        },

        onChange: function(text) {
            this.updateElement(text);
        },

        updateElement: function(val) {

            var self = this;

            if (self.input) {
                self.input.setValue(val);
            }
            else {
                self.node[typeof self.node.textContent === "string" ? "textContent" : "innerText"] = val;
            }
        },

        onDestroy: function() {

            var self    = this;

            dom_removeListener(
                self.node, "optionschange", 
                self.optionsChangeDelegate);

            if (self.textRenderer) {
                self.textRenderer.$destroy();
                self.textRenderer = null;
            }

            if (self.input) {
                self.inputApi.unChange(self.onInputChange, self);
                self.input.$destroy();
                self.input = null;
            }

            self.$super();
        }
    }));




Directive.registerAttribute("bind-html", 1000, 
    Directive.attr.Bind.$extend({
        $class: "MetaphorJs.app.Directive.attr.BindHtml",
        _initNode: function(node) {
            if (node.getDomApi) {
                this.node = node.getDomApi("bind-html");
            }
        },
        updateElement: function(val) {
            this.node.innerHTML = val;
        }
    }));









/*
value is always an object in the end
{class: "condition", class: "condition"}

array turns into _: []
{_: [class, class]}
(which is then turned into {class: true, class: true}
DO NOT put class="{}" when using class.name="{}"
 */


(function(){

    var toggleClass = function(node, cls, toggle, doAnim) {

        var has;

        if (toggle !== null) {
            if (toggle === dom_hasClass(node, cls)) {
                return;
            }
            has = !toggle;
        }
        else {
            has = dom_hasClass(node, cls);
        }

        if (has) {
            if (doAnim) {
                animate_animate(node, [cls + "-remove"]).done(function(){
                    dom_removeClass(node, cls);
                });
            }
            else {
                dom_removeClass(node, cls);
            }
        }
        else {
            if (doAnim) {
                animate_animate(node, [cls + "-add"]).done(function(){
                    dom_addClass(node, cls);
                });
            }
            else {
                dom_addClass(node, cls);
            }
        }
    };


    var flatten = function(values) {
        var clss = {},
            i, l, val,
            j, jl;

        for (i = 0, l = values.length; i < l; i++) {
            val = values[i];

            if (typeof val === 'string') {
                clss[val] = true;
                continue;
            }
            else if (isArray(val)) {
                for (j = -1, jl = val.length; ++j < jl; clss[val[j]] = true){}
            }
            for (j in val) {
                if (j === '_') {
                    for (j = -1, jl = val._.length; ++j < jl;
                         clss[val._[j]] = true){}
                }
                else {
                    clss[j] = val[j];
                }
            }
        }

        return clss;
    };

    Directive.registerAttribute("class", 1000, Directive.$extend({

        $class: "MetaphorJs.app.Directive.attr.Class",
        initial: true,
        prev: null,

        $init: function(scope, node, config, renderer, attrSet) {

            var self = this;
            config.setType("animate", "bool");
            config.eachProperty(function(k) {
                if (k === 'value' || k.indexOf("value.") === 0) {
                    config.on(k, self.onChange, self);
                }
            });
            self.$super(scope, node, config, renderer, attrSet);
        },

        initialSet: function() {
            var self = this;
            if (self.autoOnChange) {
                self.onChange();
            }
        },

        getCurrentValue: function() {
            var all = this.config.getAllValues(),
                values = [];

            if (all[""]) {
                values.push(all['']);
                delete all[''];
            }
            values.push(all);
            
            return flatten(values);
        },

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.getCurrentValue(),
                prev    = self.prev,
                i;

            node = node.getDomApi ? node.getDomApi("class") : node;

            if (!node) {
                return;
            }

            animate_stop(node);

            if (prev) {
                for (i in prev) {
                    if (prev.hasOwnProperty(i)) {
                        if (clss[i] === undf) {
                            toggleClass(node, i, false, false);
                        }
                    }
                }
            }

            for (i in clss) {
                if (clss.hasOwnProperty(i)) {
                    toggleClass(node, i, !!clss[i], 
                        !self.initial && 
                        self.config.get("animate"));
                }
            }

            self.prev = clss;
            self.initial = false;
        }
    }));

}());






(function(){

    var cmpAttr = function(scope, node, config, parentRenderer, attrSet) { 

        config.setDefaultMode("value", lib_Config.MODE_STATIC);
        config.setType("sameScope", "bool", lib_Config.MODE_STATIC);
        config.setDefaultMode("as", lib_Config.MODE_STATIC);
        config.setDefaultMode("ref", lib_Config.MODE_STATIC);
        config.setMode("into", lib_Config.MODE_STATIC);

        var cmpName = config.get("value"),
            constr  = typeof cmpName === "string" ?
                        ns.get(cmpName, true) : cmpName,
            tag     = node.tagName.toLowerCase();

        if (!constr) {
            throw new Error("Component " + cmpName + " not found");
        }

        var sameScope   = config.get("sameScope") || constr.$sameScope;
        var newScope    = sameScope ? scope : scope.$new();

        config.removeProperty("value");

        var cfg = {
            scope: newScope,
            node: node,
            config: config,
            parentRenderer: parentRenderer,
            destroyScope: !sameScope,
            autoRender: true
        };

        if (MetaphorJs.directive.component[tag]) {
            var ds = {}, k;
            for(k in attrSet.directive) {
                if (attrSet.directive.hasOwnProperty(k)) {
                    ds[k] = attrSet.directive[k].config;
                }
            }
            cfg.directives = ds;
        }

        var res = app_resolve(cmpName, cfg, newScope, node, [cfg])
            .done(function(cmp) {
                parentRenderer.trigger(
                    "reference", "cmp", 
                    config.get("ref") || cmp.id, cmp, 
                    cfg, attrSet
                );
            });
        parentRenderer.trigger(
            "reference-promise", 
            res, cmpName, 
            cfg, attrSet
        );

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());








(function(){

    var types = [];

    function detectModelType(expr, scope) {
        var tmp = expr.split(" in "),
            model = tmp.length === 1 ? expr : tmp[1],
            obj = lib_Expression.get(model, scope),
            i = 0,
            l = types.length;

        for (; i < l; i++) {
            if (obj instanceof types[i][0]) {
                return types[i][1];
            }
        }

        return null;
    }

    var eachDirective = function eachDirective(scope, node, config, parentRenderer, attrSet) {
        config.disableProperty("value");
        var tagMode = node.nodeName.toLowerCase() === "mjs-each",
            expr;
        if (tagMode) {
            expr = dom_getAttr(node, "value");
        }
        else {
            expr = config.getExpression("value");
        }

        var handler = detectModelType(expr, scope) || app_ListRenderer;

        return new handler(scope, node, config, parentRenderer, attrSet);
    };


    eachDirective.registerType = function(objectClass, handlerClass) {
        types.push([objectClass, handlerClass]);
    };

    eachDirective.$stopRenderer = true;
    eachDirective.$registerBy = "id";
    eachDirective.$prebuild = {
        skip: true
    };

    eachDirective.registerType(Array, app_ListRenderer);

    Directive.registerAttribute("each", 100, eachDirective);
    Directive.registerTag("each", eachDirective);

}());







/**
 * Get element's style object
 * @function MetaphorJs.dom.getStyle
 * @param {DomNode} node
 * @returns {DomStyle}
 */

 /**
 * Get element's style property
 * @function MetaphorJs.dom.getStyle
 * @param {DomNode} node
 * @param {string} prop
 * @param {boolean} numeric return as number
 * @returns {string|int}
 */
var dom_getStyle = MetaphorJs.dom.getStyle = function dom_getStyle(node, prop, numeric) {

    var style, val;

    if (window.getComputedStyle) {
        if (node === window) {
            return prop? (numeric ? 0 : null) : {};
        }
        style = window.getComputedStyle(node, null);
        val = prop ? style[prop] : style;
    }
    else {
        style = node.currentStyle || node.style || {};
        val = prop ? style[prop] : style;
    }

    return numeric ? parseFloat(val) || 0 : val;
};




var _boxSizingReliable = function() {

    var boxSizingReliableVal;

    var computePixelPositionAndBoxSizingReliable = function() {

        var doc = window.document,
            container = doc.createElement("div"),
            div = doc.createElement("div"),
            body = doc.body;

        if (!div.style || !window.getComputedStyle) {
            return false;
        }

        container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
                                  "position:absolute";
        container.appendChild(div);

        div.style.cssText =
            // Support: Firefox<29, Android 2.3
            // Vendor-prefix box-sizing
        "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
        "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
        "border:1px;padding:1px;width:4px;position:absolute";
        div.innerHTML = "";
        body.appendChild(container);

        var divStyle = window.getComputedStyle(div, null),
            ret = divStyle.width === "4px";

        body.removeChild(container);

        return ret;
    };

    return function boxSizingReliable() {
        if (boxSizingReliableVal === undf) {
            boxSizingReliableVal = computePixelPositionAndBoxSizingReliable();
        }

        return boxSizingReliableVal;
    };
}();






var _dom_getDimensions = function(type, name) {

    // from jQuery
    var rnumnonpx = new RegExp( "^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$", "i"),
        cssExpand = [ "Top", "Right", "Bottom", "Left" ],
        defaultExtra = !type ? "content" : (type === "inner" ? "padding" : "");

    var augmentWidthOrHeight = function(elem, name, extra, isBorderBox, styles) {
        var i = extra === (isBorderBox ? "border" : "content") ?
                // If we already have the right measurement, avoid augmentation
                4 :
                // Otherwise initialize for horizontal or vertical properties
                name === "width" ? 1 : 0,

            val = 0;

        for (; i < 4; i += 2) {
            // Both box models exclude margin, so add it if we want it
            if (extra === "margin") {
                val += parseFloat(styles[extra + cssExpand[i]]);
            }

            if (isBorderBox) {
                // border-box includes padding, so remove it if we want content
                if (extra === "content") {
                    val -= parseFloat(styles["padding" + cssExpand[i]]);
                }

                // At this point, extra isn't border nor margin, so remove border
                if (extra !== "margin") {
                    val -= parseFloat(styles["border" + cssExpand[i] + "Width"]);
                }
            } else {
                // At this point, extra isn't content, so add padding
                val += parseFloat(styles["padding" + cssExpand[i]]);

                // At this point, extra isn't content nor padding, so add border
                if (extra !== "padding") {
                    val += parseFloat(styles["border" + cssExpand[i] + "Width"]);
                }
            }
        }

        return val;
    };

    var getWidthOrHeight = function(elem, name, extra, styles) {

        // Start with offset property, which is equivalent to the border-box value
        var valueIsBorderBox = true,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            isBorderBox = styles["boxSizing"] === "border-box";

        // Some non-html elements return undefined for offsetWidth, so check for null/undefined
        // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
        // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
        if ( val <= 0 || val == null ) {
            val = elem.style[name];

            // Computed unit is not pixels. Stop here and return.
            if (rnumnonpx.test(val)) {
                return val;
            }

            // Check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox &&
                               (_boxSizingReliable() || val === elem.style[name]);

            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;
        }

        // Use the active box-sizing model to add/subtract irrelevant styles
        return val +
                 augmentWidthOrHeight(
                     elem,
                     name,
                     extra || (isBorderBox ? "border" : "content"),
                     valueIsBorderBox,
                     styles
                 );
    };


    return function dom_getDimensions(elem, margin) {

        if (elem === window) {
            return elem.document.documentElement["client" + name];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            var doc = elem.documentElement;

            // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
            // whichever is greatest
            return Math.max(
                elem.body["scroll" + name], doc["scroll" + name],
                elem.body["offset" + name], doc["offset" + name],
                doc["client" + name]
            );
        }

        return getWidthOrHeight(
            elem,
            name.toLowerCase(),
            defaultExtra || (margin === true ? "margin" : "border"),
            dom_getStyle(elem)
        );
    };

};




/**
 * Get element width
 * @function MetaphorJs.dom.getWidth
 * @param {DomNode} el
 * @returns {int}
 */
var dom_getWidth = MetaphorJs.dom.getWidth = _dom_getDimensions("", "Width");




/**
 * Get element height
 * @function MetaphorJs.dom.getHeight
 * @param {DomNode} el
 * @returns {int}
 */
var dom_getHeight = MetaphorJs.dom.getHeight = _dom_getDimensions("", "Height");



var _getScrollTopOrLeft = function(vertical) {

    var defaultST,
        wProp = vertical ? "pageYOffset" : "pageXOffset",
        sProp = vertical ? "scrollTop" : "scrollLeft",
        doc = window.document,
        body = doc.body,
        html = doc.documentElement;

    var ret = function(scroll, allowNegative) {
        if (scroll < 0 && allowNegative === false) {
            return 0;
        }
        return scroll;
    };

    if(window[wProp] !== undf) {
        //most browsers except IE before #9
        defaultST = function(){
            return window[wProp];
        };
    }
    else{
        if (html.clientHeight) {
            defaultST = function() {
                return html[sProp];
            };
        }
        else {
            defaultST = function() {
                return body[sProp];
            };
        }
    }

    return function(node, allowNegative) {
        if (!node || node === window) {
            return ret(defaultST(), allowNegative);
        }
        else if (node && node.nodeType == 1 &&
            node !== body && node !== html) {
            return ret(node[sProp], allowNegative);
        }
        else {
            return ret(defaultST(), allowNegative);
        }
    }

};




/**
 * Get element's vertical scroll position
 * @function MetaphorJs.dom.getScrollTop
 * @param {DomNode} element
 * @returns {int}
 */
var dom_getScrollTop = MetaphorJs.dom.getScrollTop = _getScrollTopOrLeft(true);





/**
 * Get element's horizontal scroll position
 * @function MetaphorJs.dom.getScrollLeft
 * @param {DomNode} element
 * @returns {int}
 */
var dom_getScrollLeft = MetaphorJs.dom.getScrollLeft = _getScrollTopOrLeft(false);











/**
 * Allows you to subscribe to a dom event and call handler
 * no sooner than given interval;<br>
 * Also you can subscribe to a specific change: like media query in css.
 * @class MetaphorJs.lib.EventBuffer
 */
var lib_EventBuffer = MetaphorJs.lib.EventBuffer = function(){

    var bufferKey = function(event, interval) {
        return '$$' + event + "_" + interval;
    };

    /**
     * @method EventBuffer
     * @constructor
     * @param {DomNode} node 
     * @param {string} event Dom event name
     * @param {int} interval 
     */
    var EventBuffer = function(node, event, interval) {

        var self = this,
            key = bufferKey(event, interval);

        if (node[key]) {
            return node[key];
        }

        node[key] = self;

        self.id = key;
        self.breaks = {};
        self.watchers = {};
        self.node = node;
        self.event = event;
        self.observable = new lib_Observable;
        self.interval = interval || 0;
        self.handlerDelegate = bind(self.handler, self);
        self.triggerDelegate = bind(self.trigger, self);

        self.up();
    };

    extend(EventBuffer.prototype, {

        observable: null,
        handlerDelegate: null,
        triggerDelegate: null,
        watchers: null,
        breaks: null,
        running: false,
        lastEvent: null,
        currentEvent: null,
        interval: null,
        id: null,

        handler: function(e) {
            var self = this;
            if (self.running) {
                if (e) {
                    self.lastEvent = e;
                }
            }
            else {
                self.next(e);
            }
        },

        next: function(e) {

            var self = this,
                itv = self.interval;

            e = e || self.lastEvent;

            if (!e) {
                return;
            }

            self.lastEvent = null;
            self.running = true;
            self.currentEvent = e;

            if (itv === "raf") {
                raf(self.triggerDelegate);
            }
            else {
                setTimeout(self.triggerDelegate, itv);
            }
        },

        /**
         * Shorthand for adding width watcher
         * @method
         */
        watchWidth: function() {
            this.addWatcher("width", dom_getWidth);
        },

        /**
         * Shorthand for adding height watcher
         * @method
         */
        watchHeight: function() {
            this.addWatcher("width", dom_getHeight);
        },

        /**
         * Shorthand for adding scrolltop watcher
         * @method
         */
        watchScrollTop: function() {
            this.addWatcher("scrollTop", dom_getScrollTop);
        },

        /**
         * Shorthand for adding scrollleft watcher
         * @method
         */
        watchScrollLeft: function() {
            this.addWatcher("scrollLeft", dom_getScrollLeft);
        },

        /**
         * Add your own watcher
         * @method
         * @param {string} name Watcher name
         * @param {function} fn {
         *  @param {DomNode} node
         * }
         * @param {object} context fn's context
         */
        addWatcher: function(name, fn, context) {
            if (!this.watchers[name]) {
                this.watchers[name] = {
                    fn:      fn,
                    context: context,
                    prev:    null,
                    current: parseInt(fn.call(context, this.node), 10)
                };
            }
        },

        /**
         * Remove watcher
         * @method
         * @param {string} name
         */
        removeWatcher: function(name) {
            delete this.watchers[name];
        },

        breakFilter: function(l, args, event) {

            if (!this.watchers[event.watcher]) {
                return false;
            }

            var self        = this,
                breakValue  = l.breakValue,
                luft        = l.breakLuft || 0,
                lowLuft     = l.breakLowLuft || luft,
                highLuft    = l.breakHighLuft || luft,
                lowBreak    = breakValue - lowLuft,
                highBreak   = breakValue + highLuft,
                w           = self.watchers[event.watcher],
                current     = w.current,
                prev        = w.prev,
                min         = Math.min(prev, current),
                max         = Math.max(prev, current);

            if (breakValue === "!=") {
                return prev != current;
            }

            args[0].breakPosition = current < lowBreak ? -1 :  (current >= highBreak ? 1 : 0);

            return (min <= lowBreak && lowBreak <= max) ||
                    (min <= highBreak && highBreak <= max);
        },


        /**
         * Add break listener (media query stop)
         * @method
         * @param {string} watcher Watcher name
         * @param {int} breakValue 
         * @param {function} fn {
         *  Listener function
         *  @param {Event} event Native dom event
         * }
         * @param {object} context fn's context
         * @param {object} options Options are passed to 
         * lib_Observable.on()
         */
        onBreak: function(watcher, breakValue, fn, context, options) {
            var self = this,
                name = watcher + "_" + breakValue;

            options = options || {};
            options.breakValue = breakValue;

            if (!self.breaks[name]) {
                self.breaks[name] = self.observable.createEvent(name, {
                    watcher: watcher,
                    triggerFilter: self.breakFilter,
                    filterContext: self
                });
            }

            self.breaks[name].on(fn, context, options);
        },

        /**
         * Unsubscribe from a break
         * @method
         * @param {string} watcher Watcher name
         * @param {int} breakValue 
         * @param {function} fn
         * @param {object} context fn's context
         * @param {boolean} destroy Destroy if there are no more listeners
         */
        unBreak: function(watcher, breakValue, fn, context, destroy) {
            var self = this,
                name = watcher + "_" + breakValue;
            if (self.breaks[name]) {
                self.breaks[name].un(fn, context);
                if (!self.breaks[name].hasListener()) {
                    self.observable.destroyEvent(name);
                    self.breaks[name] = null;
                    delete self.breaks[name];
                }
            }
            if (destroy) {
                self.destroyIfIdle();
            }
        },

        /**
         * Subscribe to dom event
         * @method
         * @param {function} fn {
         *  @param {Event} event 
         * }
         * @param {object} context fn's context
         * @param {object} options Observable's options
         */
        on: function(fn, context, options) {
            this.observable.on(this.event, fn, context, options);
        },

        /**
         * Ubsubscribe from dom event
         * @method
         * @param {function} fn 
         * @param {object} context fn's context
         * @param {boolean} destroy Destroy if there are no more listeners
         */
        un: function(fn, context, destroy) {
            var self = this;
            self.observable.un(self.event, fn, context);
            if (destroy) {
                self.destroyIfIdle();
            }
        },

        trigger: function() {
            var self = this,
                e = self.currentEvent,
                ws = self.watchers,
                bs = self.breaks,
                node = self.node,
                w, b;

            self.observable.trigger(self.event, e);

            for (w in ws) {
                ws[w].prev = ws[w].current;
                ws[w].current = parseInt(ws[w].fn.call(ws[w].context, node, e), 10);
            }

            for (b in bs) {
                bs[b].trigger(e);
            }

            self.running = false;
            self.currentEvent = null;

            self.next();
        },

        /**
         * Start listening to DOM event. (Called automatically from constructor)
         * @method
         */
        up: function() {
            var self = this;
            dom_addListener(self.node, self.event, self.handlerDelegate);
        },

        /**
         * Stop listening to DOM event
         * @method
         */
        down: function() {
            var self = this;
            dom_removeListener(self.node, self.event, self.handlerDelegate);
        },

        /**
         * Destroy if there are no listeners
         * @method
         */
        destroyIfIdle: function() {
            if (this.observable && !this.observable.hasListener()) {
                this.$destroy();
                return true;
            }
        },

        /**
         * @method
         */
        $destroy: function() {

            var self = this;

            delete self.node[self.id];

            self.down();
            self.observable.$destroy();

        }
    });


    /**
     * Get existing event buffer
     * @method get
     * @static
     * @param {DomNode} node 
     * @param {string} event 
     * @param {int} interval 
     * @returns {MetaphorJs.lib.EventBuffer}
     */
    EventBuffer.get = function(node, event, interval) {
        var key = bufferKey(event, interval);

        if (node[key]) {
            return node[key];
        }

        return node[key] = new EventBuffer(node, event, interval);
    
    };

    return EventBuffer;
}();












/**
 * Handles events as they come defined in html templates
 * @class MetaphorJs.lib.EventHandler
 */

/**
 * @method EventHandler
 * @constructor
 * @param {string} event Dom event name
 * @param {MetaphorJs.lib.Scope} scope 
 * @param {Node} node 
 * @param {MetaphorJs.lib.Config} cfg MetaphorJs.lib.Config
 */
MetaphorJs.lib.EventHandler = function(event, scope, node, cfg) {

    var self = this;

    self.config     = cfg;
    self.event      = event;
    self.prevEvent  = {};
    self.scope      = scope;
    self.node       = node;
    self.handler    = null;
    self.buffer     = null;

    if (cfg.hasExpression("if")) {
        cfg.on("if", self.onIfChange, self);
    }

    self.up();
};

extend(MetaphorJs.lib.EventHandler.prototype, {


    onIfChange: function(val) {
        this[val?"up":"down"]();
    },

    createHandler: function() {

        var self        = this,
            scope       = self.scope,
            asnc;

        var handler = function(e) {

            if (self.$destroyed || self.$destroying) {
                return;
            }

            var keyCode,
                preventDefault = false,
                returnValue = undf,
                stopPropagation = false,
                res,
                cfg = self.config.getAll(),
                handler = self.config.get("value");

            cfg.preventDefault !== undf && (preventDefault = cfg.preventDefault);
            cfg.stopPropagation !== undf && (stopPropagation = cfg.stopPropagation);
            cfg.returnValue !== undf && (returnValue = cfg.returnValue);
            cfg.keyCode !== undf && (keyCode = cfg.keyCode);

            e = dom_normalizeEvent(e || window.event);

            if (keyCode) {
                if (typeof keyCode === "number" && keyCode !== e.keyCode) {
                    return null;
                }
                else if (keyCode.indexOf(e.keyCode) === -1) {
                    return null;
                }
            }

            scope.$event = e;
            scope.$eventNode = self.node;
            scope.$prevEvent = self.prevEvent[e.type];

            if (handler) {
                res = handler.call(cfg.context || null, scope);

                if (res && isPlainObject(res)) {
                    res.preventDefault !== undf && (preventDefault = res.preventDefault);
                    res.stopPropagation !== undf && (stopPropagation = res.stopPropagation);
                    res.returnValue !== undf && (returnValue = res.returnValue);
                }
            }

            stopPropagation && e.stopPropagation();
            preventDefault && e.preventDefault();

            if (self.$destroyed || self.$destroying) {
                return returnValue !== undf ? returnValue : undf;
            }

            scope.$event = null;
            scope.$eventNode = null;

            self.prevEvent[e.type] = e;

            self.config.checkScope("value");

            if (returnValue !== undf) {
                return returnValue;
            }
        };

        if (asnc = self.config.get("async")) {
            return function(e) {
                async(handler, null, [e], 
                        typeof asnc == "number" ? asnc : null);
            };
        }
        else {
            return handler;
        }
    },

    /**
     * Start listening to event
     * @method
     */
    up: function() {

        var self    = this,
            cfg     = self.config,
            buffer  = cfg.get("buffer");

        if (!cfg.hasExpression("if") || cfg.get('if')) {
            self.handler = self.createHandler();

            if (buffer) {
                self.buffer = lib_EventBuffer.get(self.node, self.event, buffer);
                self.buffer.on(self.handler);
            }
            else {
                dom_addListener(self.node, self.event, self.handler);
            }
        }
    },

    /**
     * Stop listening to event
     * @method
     */
    down: function() {

        var self    = this;

        if (self.buffer) {
            self.buffer.un(self.handler);
            self.buffer.destroyIfIdle();
            self.buffer = null;
        }
        else {
            dom_removeListener(self.node, self.event, self.handler);
        }
    },

    /**
     * @method
     */
    $destroy: function() {
        var self = this;
        self.down();
        self.config.clear();
    }
});

var lib_EventHandler = MetaphorJs.lib.EventHandler;







(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress',
                  'change',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'load', 'mousewheel',
                  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'],
        i, len;

    var prepareConfig = function(config) {
        config.setProperty("preventDefault", {
            type: "bool", 
            defaultValue: true,
            defaultMode: lib_Config.MODE_STATIC
        });
        config.setType("stopPropagation", "bool", lib_Config.MODE_STATIC);
        config.setType("if", "bool");
        config.eachProperty(function(k){
            if (k === 'value' || k.indexOf('value.') === 0) {
                config.setMode(k, lib_Config.MODE_FUNC);
            }
        });
        return config;
    };

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute(name, 1000,
                function(scope, node, config, renderer, attrSet) {

                if (node.getDomApi) {
                    node = node.getDomApi(name);
                    if (!node) {
                        return null;
                    }
                }

                var eh = new lib_EventHandler(
                    name, scope, node, prepareConfig(config)
                );

                return function(){
                    eh.$destroy();
                    eh = null;
                };
            });

        }(events[i]));
    }

    Directive.registerAttribute("submit", 1000, function(scope, node, config) {

        prepareConfig(config);

        var fn = config.get("value"),
            handler = function(){
                fn(scope);
                config.checkScope("value")
            };

        lib_Input.get(node).onKey(13, handler);

        return function() {
            lib_Input.get(node).unKey(13, handler);
            handler = null;
            fn = null;
        };
    });

    events = null;

}());









Directive.registerAttribute("show", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Show",
    initial: true,

    initialSet: function() {
        this.config.setType("display", 
            "string", lib_Config.MODE_STATIC, "");
        this.config.setType("animate", 
            "bool", lib_Config.MODE_STATIC, false);
        this.$super();
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = self.config.get("display");
                }
            };

        self.initial || !self.config.get("animate") ? done() : animate_animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    return new lib_Promise(function(resolve){
                        raf(function(){
                            style.display = self.config.get("display");
                            resolve();
                        });
                    });
                }
            })
            .done(done);
    },

    onChange: function(val) {
        var self    = this;
        self.runAnimation(val);
        self.initial = false;
        self.$super(val);
    }
}));







Directive.registerAttribute("hide", 500, Directive.attr.Show.$extend({

    $class: "MetaphorJs.app.Directive.attr.Hide",

    onChange: function(val) {
        var self    = this;
        self.runAnimation(!val);
        self.initial = false;
        self.saveStateOnChange(val);
    }
}));







Directive.registerAttribute("if", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.If",
    parentEl: null,
    prevEl: null,
    nextEl: null,
    el: null,
    initial: true,
    cfg: null,
    animate: false,

    $init: function(scope, node, config, renderer, attrSet) {

        var self    = this;
        config.setType("value", "bool");
        config.setType("once", "bool", lib_Config.MODE_STATIC);
        self.createCommentWrap(node, "if");
        self.$super(scope, node, config, renderer, attrSet);
    },

    onScopeDestroy: function() {

        var self    = this;
        self.wrapperOpen = null;
        self.wrapperClose = null;
        self.$super();
    },

    onChange: function() {
        var self    = this,
            val     = self.config.get("value"),
            parent  = self.wrapperOpen.parentNode,
            node    = self.node;

        var show    = function(){
            parent.insertBefore(node, self.wrapperClose);
        };

        var hide    = function() {
            parent.removeChild(node);
        };

        if (val) {
            self.initial || !self.config.get("animate") ?
                show() : animate_animate(node, "enter", show);
        }
        else {
            if (node.parentNode) {
                self.initial || !self.config.get("animate") ?
                    hide() : animate_animate(node, "leave").done(hide);
            }
        }

        self.$super(val);

        if (self.initial) {
            self.initial = false;
        }
        else {
            if (self.config.get("once")) {
                self.$destroy();
            }
        }
    }
}));





Directive.registerAttribute("in-focus", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.InFocus",

    $init: function(scope, node) {
        if (node.getDomApi) {
            arguments[1] = node.getDomApi();
        }
        this.$super.apply(this, arguments);
    },

    initialSet: function() {
        this.config.setType("value", "bool");
        this.$super();
    },

    onChange: function(val) {
        var self    = this;
        if (val) {
            async(self.node.focus, self.node, [], 300);
        }
    }
}));







Directive.registerAttribute("include", 1100,
    function(scope, node, config, parentRenderer, attrSet){

    config.disableProperty("value");
    config.setProperty("name", config.getProperty("value"));
    config.removeProperty("value");
    config.enableProperty("name");

    config.setType("asis", "bool", lib_Config.MODE_STATIC);
    config.setType("animate", "bool", lib_Config.MODE_STATIC);

    var tpl = new app_Template({
        scope: scope,
        node: node,
        parentRenderer: parentRenderer,
        config: config,
        ownRenderer: !config.get("asis") // do not render if asis=true
    });

    parentRenderer.on("destroy", function(){
        tpl.$destroy();
        tpl = null;
    });

    return false; // stop renderer
});






Directive.registerAttribute("init", 250, function(){
    var initDir = function(scope, node, config) {
        config.eachProperty(function(k, prop) {
            if (k === 'value' || k.indexOf('value.') === 0) {
                lib_Expression.run(prop.expression, scope, null, {
                    noReturn: true
                });
            }
        });
        config.clear();
    };

    initDir.$prebuild = {
        noReturn: true
    };

    return initDir;
}());







(function(){

var keys = {
    "enter": 13,
    "esc": 27,
    "backspace": 8
};

/*
value is always an array in the end:
[{keyCode: 1, handler: fn}, {...}]

DO NOT MIX {key}="{...}" with  {key.enter}="{...}"

NO:
{key}="{...}"
{key.enter}="{...}"

YES:
{key}="{...}"

or

{key}="[{...}]"
{key.enter}="{...}"

 */

Directive.registerAttribute("key", 1000, function(scope, node, config, renderer, attrSet){

    config.disableProperty("value");
    config.eachProperty(function(k, prop){
        if (k.indexOf('value.') === 0) {
            if (prop.expression.charAt(0) !== '{') {
                config.setMode(k, lib_Config.MODE_FUNC);
            }
        }
    });

    var createHandler = function(name, cfg) {

        if (typeof cfg === "function") {
            cfg = {handler: cfg};
        }

        var h = cfg.handler;
        var context = cfg.context || scope;

        delete cfg.handler;
        delete cfg.context;

        if (!cfg.keyCode) {
            cfg.keyCode = keys[name] || parseInt(name,10);
        }

        var handler = function(e) {
            scope.$event = e;
            h(scope);
            scope.$event = null;
            scope.$check();
        };
        
        lib_Input.get(node).onKey(cfg, handler, context);

        return function() {
            lib_Input.get(node).unKey(cfg, handler, context);
        };
    };

    var cfgs = config.getAllValues(),
        name,
        uninstall = [];
    
    for (name in cfgs) {
        if (cfgs.hasOwnProperty(name) && cfgs[name]) {
            uninstall.push(createHandler(name, cfgs[name]));
        }
    }

    return function() {
        var i, l;
        for (i = 0, l = uninstall.length; i < l; i++) {
            uninstall[i]();
        }
        uninstall = null;
    };
});

}());












Directive.registerAttribute("model", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Model",
    inProg: false,
    input: null,
    binding: null,
    updateRoot: false,
    changeCb: null,
    initial: false,

    autoOnChange: false,

    $init: function(scope, node, config, renderer, attrSet) {

        var self    = this,
            expr    = config.getExpression("value"),
            descr   = lib_Expression.describeExpression(expr);

        config.setMode("value", lib_Config.MODE_FNSET);
        config.setProperty("checkRoot", {
            type: 'bool',
            defaultValue: descr.indexOf('r') !== -1
        });
        config.setProperty("checkParent", {
            type: 'bool',
            defaultValue: descr.indexOf('p') !== -1
        });
        config.setProperty("binding", {
            defaultValue: "both",
            defaultMode: lib_Config.MODE_STATIC
        });

        if (config.hasExpression("change")) {
            self.changeFn   = lib_Expression.func(config.get("change"));
        }

        self.input          = dom_isField(node) ?
                                 lib_Input.get(node, scope) :
                                 node.getInputApi("model");
        self.node           = node.getDomApi ? node.getDomApi("model") : node;
        //self.binding        = config.get("binding");
        self.mo             = lib_MutationObserver.get(
                                scope, expr, null, null, {
                                    setter: true
                                }
                            );

        self.mo.subscribe(self.onChange, self);
        self.input.onChange(self.onInputChange, self);

        self.optionsChangeDelegate = bind(self.onOptionsChange, self);
        dom_addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

        self.$super(scope, node, config, renderer, attrSet);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.mo.getValue(),
            binding         = self.config.get("binding");

        self.initial = true;

        if (scopeValue !== inputValue) {
            // scope value takes priority
            if (binding !== "input" && scopeValue !== undf) {
                self.onChange(scopeValue);
            }
            else if (binding !== "scope" && inputValue !== undf) {
                self.onInputChange(inputValue);
            }
        }

        self.initial = false;
    },

    initialSet: emptyFn,

    onOptionsChange: function() {
        this.onChange();
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.config.get("binding") !== "scope") {

            if (val && isString(val) && val.indexOf('\\{') !== -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.mo.getValue() == val) {
                return;
            }

            self.mo.setValue(val);
            self.inProg = true;

            if (scope instanceof lib_Scope) {
                if (self.config.get("checkRoot")) {
                    scope.$root.$check();
                }
                else if (self.config.get("checkParent")) {
                    scope.$parent ? 
                        scope.$parent.$check() : 
                        scope.$root.$check();
                }
                else {
                    scope.$check();
                }
            }
            else {
                self.config.check("value");
            }
            self.inProg = false;
        }
    },

    onDestroy: function() {
        var self        = this;

        dom_removeListener(
            self.node, "optionschange", 
            self.optionsChangeDelegate);

        self.input.unChange(self.onInputChange, self);
        self.input.$destroy();
        self.input = null;

        if (self.mo) {
            self.mo.unsubscribe(self.onChange, self);
            self.mo.$destroy(true);
        }

        self.$super();
    },


    onChange: function() {

        var self    = this,
            val     = self.mo.getValue(), //self.getterFn(self.scope),
            binding = self.binding || self.config.get("binding"),
            ie;

        if (binding !== "input" && !self.inProg) {

            // when scope value changed but this field
            // is not in focus, it should try to
            // change input's value, but not react
            // to input's 'change' and 'input' events --
            // fields like select or radio may not have
            // this value in its options. that will change
            // value to undefined and bubble back to scope
            if (window.document.activeElement !== self.node) {
                self.binding = "scope";
            }

            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }

            self.binding = null;
        }

        if (self.changeFn && !self.initial) {
            self.changeFn(self.scope);
        }
    }


}, {

    $prebuild: {
        skip: true
    }

}));





/**
 * Trigger DOM event on element
 * @function MetaphorJs.dom.triggerEvent
 * @param {DomNode} el
 * @param {string} event
 */
var dom_triggerEvent = MetaphorJs.dom.triggerEvent = function dom_triggerEvent(el, event) {

    var isStr   = typeof event === "string",
        type    = isStr ? event : event.type;

    if (el.fireEvent) {
        return el.fireEvent("on" + type);
    }
    else {
        if (isStr) {
            if (document.createEvent) {
                event = document.createEvent("Event");
                event.initEvent(type, true, true);
            }
            else {
                event = new Event(event);
            }
        }
        
        return el.dispatchEvent(event);
    }
};











Directive.registerAttribute("options", 100, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Options",

    model: null,
    store: null,
    getterFn: null,
    defOption: null,
    prevGroup: null,
    groupEl: null,
    fragment: null,
    initial: false,

    $init: function(scope, node, config) {

        config.disableProperty("value");

        var self    = this,
            expr    = config.getExpression("value");

        self.parseExpr(expr);

        self.config     = config;
        self.node       = node;
        self.scope      = scope;
        self.defOption  = node.options.length ? node.options[0] : null;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        self.defOption && dom_setAttr(self.defOption, "default-option", "");

        try {
            var value = lib_Expression.get(self.model, scope);
            if (cls.isInstanceOf(value, "MetaphorJs.model.Store")) {
                self.bindStore(value, "on");
            }
            else {
                self.watcher = lib_MutationObserver.get(
                    scope, self.model, self.onChange, self);
            }
        }
        catch (thrownError) {
            error(thrownError);
        }

        if (self.watcher) {
            self.renderAll();
        }
        else if (self.store) {
            self.renderStore();
        }
    },

    bindStore: function(store, mode) {
        var self = this;
        store[mode]("update", self.renderStore, self);
        self.store = store;
    },

    renderStore: function() {
        var self = this;
        self.render(self.store.toArray());
        self.dispatchOptionsChange();
    },

    renderAll: function() {
        this.render(toArray(this.watcher.getValue()));
        this.dispatchOptionsChange();
    },

    onChange: function() {
        var self = this;
        self.renderAll();
    },

    dispatchOptionsChange: function() {
        var self = this;
        if (!self.initial && self.node.dispatchEvent) {
            dom_triggerEvent(self.node, "optionschange");
        }
        self.initial = false;
    },

    renderOption: function(item, index, scope) {

        var self        = this,
            parent      = self.groupEl || self.fragment,
            msie        = isIE(),
            config,
            option;

        scope.item      = item;
        scope.$index    = index;

        if (self.defaultOptionTpl && isPlainObject(item)) {
            config      = item;
        }
        else {
            config      = self.getterFn(scope);
        }

        config.group    !== undf && (config.group = ""+config.group);

        if (config.group !== self.prevGroup) {

            if (config.group){
                self.groupEl = parent = window.document.createElement("optgroup");
                dom_setAttr(parent, "label", config.group);
                if (config.disabledGroup) {
                    dom_setAttr(parent, "disabled", "disabled");
                }
                self.fragment.appendChild(parent);
            }
            else {
                parent = self.fragment;
                self.groupEl = null;
            }
        }
        self.prevGroup  = config.group;

        option  = window.document.createElement("option");
        dom_setAttr(option, "value", config.value || "");
        option.text = config.name;

        if (msie && msie < 9) {
            option.innerHTML = config.name;
        }
        if (config.disabled) {
            dom_setAttr(option, "disabled", "disabled");
        }

        parent.appendChild(option);
    },

    render: function(list) {

        var self        = this,
            node        = self.node,
            value       = dom_getInputValue(node),
            def         = self.defOption,
            tmpScope    = self.scope.$new(),
            msie        = isIE(),
            parent, next,
            i, len;

        self.fragment   = window.document.createDocumentFragment();
        self.prevGroup  = null;
        self.groupEl    = null;

        while(node.firstChild) {
            node.removeChild(node.firstChild);
        }

        for (i = 0, len = list.length; i < len; i++) {
            self.renderOption(list[i], i, tmpScope);
        }

        if (def) {
            node.insertBefore(def, node.firstChild);
        }

        tmpScope.$destroy();

        // ie6 gives "unspecified error when trying to set option.selected"
        // on node.appendChild(fragment);
        // somehow this get fixed by detaching dom node
        // and attaching it back
        if (msie && msie < 8) {
            next = node.nextSibling;
            parent = node.parentNode;
            parent.removeChild(node);
        }

        node.appendChild(self.fragment);
        self.fragment = null;

        if (msie && msie < 8) {
            parent.insertBefore(node, next);
        }

        dom_setInputValue(node, value);
    },


    parseExpr: function(expr) {

        var splitIndex  = expr.indexOf(" in "),
            model, item;

        if (splitIndex === -1) {
            model   = expr;
            item    = '{name: this.item, value: this.$index}';
            this.defaultOptionTpl = true;
        }
        else {
            model   = expr.substr(splitIndex + 4);
            item    = expr.substr(0, splitIndex);
            this.defaultOptionTpl = false;
        }

        this.model = model;
        this.getterFn = lib_Expression.getter(item);
    },

    onDestroy: function() {

        var self = this;

        if (self.store){
            self.bindStore(self.store, "un");
        }

        self.$super();

    }

}, {
    $prebuild: {
        skip: true
    }
}));









(function(){

    var booleanAttrs = ["selected", "checked", "disabled", 
                        "readonly", "open", "required"],
        i, l;

    var PropertyDirective = Directive.$extend({

        propName: null,

        $init: function(scope, node, config, propName) {
            this.propName = propName;
            config.setType("value", "bool");
            this.$super(scope, node, config);
        },

        onChange: function(val) {

            var name = this.propName;

            val = !!val;

            if (val) {
                dom_setAttr(this.node, name, name);
            }
            else {
                dom_removeAttr(this.node, name);
            }
        }
    });

    for (i = 0, l = booleanAttrs.length; i < l; i++) {
        (function(name){
            Directive.registerAttribute("" + name, 1000, function(scope, node, config){
                return new PropertyDirective(scope, node, config, name);
            });
        }(booleanAttrs[i]));
    }

}());






Directive.registerAttribute("router", 200, 
    function(scope, node, config, parentRenderer) {

    config.setProperty("value", {
        defaultMode: lib_Config.MODE_STATIC,
        defaultValue: "MetaphorJs.app.view.Router"
    });

    var routes = [],
        r;

    config.eachProperty(function(k){
        if (k.indexOf("value.") === 0) {
            config.setDefaultMode(k, lib_Config.MODE_SINGLE);
            r = config.get(k);
            r['id'] = k.replace('value.', '');
            routes.push(r);
        }
    });

    var cfg = {scope: scope, node: node, config: config};

    if (routes.length !== 0) {
        cfg['route'] = routes;
    }

    app_resolve(
        config.get("value"),
        cfg,
        scope, node,
        [cfg]
    );

    return false;
});







Directive.registerAttribute("source-src", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.SourceSrc",

    usePreload: true,
    attr: null,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, config, renderer, attrSet) {

        config.setType("deferred", "bool", lib_Config.MODE_STATIC);
        config.setType("noCache", "bool", lib_Config.MODE_STATIC);
        config.setDefaultMode("plugin", lib_Config.MODE_STATIC);

        var self = this;

        if (config.get("deferred")) {
            self.$plugins.push("plugin.SrcDeferred");
        }

        if (config.get("plugin")) {
            var tmp = config.get("plugin").split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(tmp[i].trim());
            }
        }

        self.$super(scope, node, config);
    },


    onChange: function() {
        this.doChange();
    },

    doChange: function() {
        var self = this;
        
        if (self.$destroyed || self.$destroying) {
            return;
        }

        var src = self.config.get("value");

        if (!src) {
            return;
        }

        self.src = src;

        if (self.config.get("noCache")) {
            src += (src.indexOf("?") !== -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.node) {
            self.doChangeSource(src);
            self.onSrcChanged();
        }
    },

    doChangeSource: function(src) {
        var self = this,
            node = self.node,
            srcs = select("source", node),
            source = window.document.createElement("source"),
            i, l;

        if (srcs.length) {
            for (i  = 0, l = srcs.length; i < l; i++) {
                node.removeChild(srcs[i]);
            }
        }

        dom_setAttr(source, "src", src);
        node.appendChild(source);
    },

    onSrcChanged: function() {

    }
}));







var dom_preloadImage = MetaphorJs.dom.preloadImage = function() {

    var cache = {},
        loading = {},
        cacheCnt = 0;

    function dom_preloadImage(src) {

        if (cache[src] !== undefined) {
            if (cache[src] === false) {
                return lib_Promise.reject(src);
            }
            else {
                return lib_Promise.resolve(cache[src]);
            }
        }

        if (loading[src]) {
            return loading[src];
        }

        if (cacheCnt > 1000) {
            cache = {};
            cacheCnt = 0;
        }

        var doc = window.document,
            img = doc.createElement("img"),
            style = img.style,
            deferred = new lib_Promise;

        loading[src] = deferred;

        deferred.always(function(){
            delete loading[src];
        });

        dom_addListener(img, "load", function() {
            if (!cache[src]) {
                cache[src] = {
                    src:    src,
                    width:  img ? img.width : null,
                    height: img ? img.height : null
                };
                cacheCnt++;
            }
            if (deferred) {
                deferred.resolve(cache[src]);
            }
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            img = null;
            style = null;
            deferred = null;
        });

        dom_addListener(img, "error", function() {
            cache[src] = false;
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            if (deferred) {
                deferred.reject(src);
            }
        });

        deferred.abort = function() {
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            if (deferred) {
                deferred.reject(src);
            }
            img = null;
            style = null;
            deferred = null;
        };

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        doc.body.appendChild(img);
        img.src = src;

        return deferred;
    };

    dom_preloadImage.check = function(src) {
        if (cache[src] !== undefined) {
            return cache[src];
        }
        return loading[src] || null;
    };

    return dom_preloadImage;

}();








Directive.registerAttribute("src", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Src",

    queue: null,
    usePreload: true,
    noCache: false,
    attr: null,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, config, renderer, attrSet) {

        config.setType("deferred", "bool", lib_Config.MODE_STATIC);
        config.setType("noCache", "bool", lib_Config.MODE_STATIC);
        config.setType("noPreload", "bool", lib_Config.MODE_STATIC);
        config.setDefaultMode("preloadSize", lib_Config.MODE_STATIC);
        config.setDefaultMode("plugin", lib_Config.MODE_STATIC);

        var self = this;

        if (config.get("deferred")) {
            self.$plugins.push("MetaphorJs.plugin.SrcDeferred");
        }
        if (config.get("preloadSize")) {
            self.$plugins.push("MetaphorJs.plugin.SrcSize");
        }
        if (config.get("plugin")) {
            var tmp = config.get("plugin").split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(tmp[i].trim());
            }
        }

        self.$super(scope, node, config);
    },

    $init: function(scope, node, config, renderer, attrSet) {

        var self = this;

        self.usePreload = !config.get("noPreload");

        if (self.usePreload) {
            node.style.visibility = "hidden"
        }

        self.queue = new lib_Queue({auto: true, async: true, 
                                    mode: lib_Queue.REPLACE, thenable: true});
        self.$super(scope, node, config, renderer, attrSet);
    },


    onChange: function() {
        var self = this;
        self.cancelPrevious();
        if (self.usePreload) {
            self.node.style.visibility = "hidden";
        }
        self.queue.add(self.doChange, self);
    },

    doChange: function() {

        var self = this;

        if (self.$destroyed || self.$destroying) {
            return;
        }

        var src = self.config.get("value");

        if (!src) {
            return;
        }

        self.src = src;

        if (self.config.get("noCache")) {
            src += (src.indexOf("?") !== -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.usePreload) {
            self.lastPromise = dom_preloadImage(src);
            if (self.lastPromise) {
                self.lastPromise.done(self.onImagePreloaded, self);
            }
        }
        else {
            if (self.node) {
                self.node.src = src;
                dom_setAttr(self.node, "src", src);
                self.onSrcChanged();
            }
        }
    },

    cancelPrevious: function() {
        var self = this;

        if (self.lastPromise) {
            if (self.lastPromise.isPending()) {
                self.lastPromise.abort();
            }
            self.lastPromise = null;
        }
    },

    onImagePreloaded: function() {
        var self = this,
            src = self.src;

        if (self && self.node) {
            raf(function(){
                if (self.node) {
                    self.node.src = src;
                    dom_setAttr(self.node, "src", src);
                    self.onSrcChanged();
                    self.node.style.visibility = "";
                    self.scope.$scheduleCheck(50);
                }
            });
        }
        self.lastPromise = null;
    },

    onSrcChanged: function() {

    },

    onScopeReset: function() {
        this.cancelPrevious();
        this.$super();
    },

    onDestroy: function() {

        var self = this;

        if (!self.$destroyed) {
            self.cancelPrevious();
            self.queue.$destroy();
            self.$super();
        }
    }
}));




/**
 * Remove specific style from element
 * @function MetaphorJs.dom.removeStyle
 * @param {DomNode} node
 * @param {string} name Style property name
 */
var dom_removeStyle = MetaphorJs.dom.removeStyle = (function() {

    var div = window.document.createElement("div");

    if (div.style && div.style.removeProperty) {
        return function(node, name) {
            node.style.removeProperty(name);
        };
    }
    else {
        return function(node, name) {
            node.style.removeAttribute(name);
        };
    }

}());




/*
value is always an object in the end
DO NOT MIX style="{}" with style.prop="expression".
 */


Directive.registerAttribute("style", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Style",
    $init: function(scope, node, config, renderer, attrSet) {

        var self = this;

        config.eachProperty(function(k){
            if (k.indexOf("value.") === 0) {
                config.on(k, self.onChange, self);
            }
        });

        this.$super(scope, node, config);
    },

    getCurrentValue: function() {
        var style = this.config.getAllValues();
        
        if (style[""]) {
            extend(style, style[""]);
            delete style[''];
        }

        return style;
    },

    onChange: function() {

        var self    = this,
            node    = self.node,
            style   = node.style,
            props   = self.getCurrentValue(),
            prev    = self.prev,
            k, trg;

        node = node.getDomApi ? node.getDomApi("style") : node;

        if (!node) {
            return;
        }

        for (k in prev) {
            if (!props || props[k] === undf) {
                dom_removeStyle(node, k);
            }
        }

        if (props) {
            for (k in props) {

                trg = toCamelCase(k);

                if (props[k] !== undf && props[k] !== null) {
                    style[trg] = props[k];
                }
                else {
                    dom_removeStyle(node, k);
                }
            }
        }

        self.prev = props;
    }
}));









var dom_transclude = MetaphorJs.dom.transclude = function dom_transclude(node, replace) {

    var parent = node.parentNode,
        contents;

    while (parent) {
        contents = dom_data(parent, 'mjs-transclude');
        if (contents !== undf) {
            break;
        }
        parent  = parent.parentNode;
    }

    if (contents) {

        if (node.firstChild) {
            dom_data(node, "mjs-transclude", dom_toFragment(node.childNodes));
        }

        var parent      = node.parentNode,
            next        = node.nextSibling,
            cloned      = dom_clone(contents),
            children    = toArray(cloned.childNodes);

        if (replace) {
            parent.removeChild(node);
            parent.insertBefore(cloned, next);
        }
        else {
            node.appendChild(cloned);
        }

        return children;
    }

    return null;
};




Directive.registerAttribute("transclude", 1000, 
    function(scope, node, config, renderer, attrSet) {
    return dom_transclude(node);
});




    /*
        Update scope on given event.
        Not exactly template's business, but still
    */
Directive.registerAttribute("update-on", 1000,
    function(scope, node, config, renderer, attrSet) {

        var toggle = function(mode) {
            config.eachProperty(function(k){
                if (k.indexOf("value.")===0) {
                    var event = k.replace('value.', ''),
                        obj = config.get(k);
                    if (obj.$destroyed || obj.$destroying) {
                        return;
                    }
                    if (obj && (fn = (obj[mode] || obj['$' + mode]))) {
                        fn.call(obj, event, scope.$check, scope);
                    }
                }
            });
        };

        toggle("on");

        return function() {
            if (toggle) {
                toggle("un");
                cfgs = null;
                toggle = null;
            }
        };
});






Directive.registerAttribute("view", 200, 
    function(scope, node, config, parentRenderer) {

    var cfg = {scope: scope, node: node, config: config};

    app_resolve(
        "MetaphorJs.app.view.Component",
        cfg,
        scope, node,
        [cfg]
    );

    return false;
});





/**
 * Filter array of various objects by object field
 * @function filterArray
 * @param {array} list Array to filter
 * @param {string|boolean|regexp} by 
 * @param {string|boolean|null} opt true | false | "strict"
 * @code src-docs/examples/filterArray.js
 */

/**
 * Filter array of various objects by object field
 * @function filterArray
 * @param {array} list Array to filter
 * @param {function} by {
 *  @param {*} value array[i]
 *  @returns {boolean}
 * }
 * @param {object} opt true | false | "strict"
 */

/**
 * Filter array of various objects by object field
 * @function filterArray
 * @param {array} list Array to filter
 * @param {object} by 
 * @param {object} opt true | false | "strict"
 */
var filterArray = function(){


    var compareValues = function(value, to, opt) {

            if (isFunction(to)) {
                return to(value, opt);
            }
            else if (to === "" || to === undf) {
                return true;
            }
            else if (value === undf) {
                return false;
            }
            else if (isBool(value)) {
                return value === to;
            }
            else if (to instanceof RegExp) {
                return to.test("" + value);
            }
            else if (opt === "strict") {
                return ""+value === ""+to;
            }
            else if (opt === true || opt === null || opt === undf) {
                return (""+value).toLowerCase().indexOf((""+to).toLowerCase()) != -1;
            }
            else if (opt === false) {
                return (""+value).toLowerCase().indexOf((""+to).toLowerCase()) == -1;
            }
            return false;
        },

        compare = function(value, by, opt) {

            if (isFunction(by)) {
                return by(value, opt);
            }

            if (isPrimitive(value)) {
                if (by.$ === undf) {
                    return true;
                }
                else {
                    return compareValues(value, by.$, opt);
                }
            }

            var k, i;
            for (k in by) {
                if (k === '$') {
                    for (i in value) {
                        if (compareValues(value[i], by.$, opt)) {
                            return true;
                        }
                    }
                }
                else {
                    if (compareValues(value[k], by[k], opt)) {
                        return true;
                    }
                }
            }

            return false;
        };

    var filterArray = function filterArray(a, by, opt) {

        if (!isPlainObject(by) && !isFunction(by)) {
            by = {$: by};
        }

        var ret = [],
            i, l;

        for (i = -1, l = a.length; ++i < l;) {
            if (compare(a[i], by, opt)) {
                ret.push(a[i]);
            }
        }

        return ret;
    };

    filterArray.compare = compare;

    return filterArray;

}();



/**
 * Sort array of various objects by some field
 * @function sortArray
 * @param {array} arr Array to sort
 * @param {function|string|object} by {
 *  Either a string: object field name to sort by<br>
 *  Or a function: takes array item and returns value by which to sort<br>
 *  Or an object:
 *  @type {function} fn {
 *      @param {*} itemA
 *      @param {*} itemB
 *      @returns {number} -1,0,1
 *  }
 *  @type {object|null} context fn's context
 * }
 * @param {string} dir 
 * @returns {array}
 */
function sortArray(arr, by, dir) {

    if (!dir) {
        dir = "asc";
    }

    var ret = arr.slice(),
        fn, ctx;

    if (isPlainObject(by) && by.fn) {
        fn = by.fn;
        ctx = by.context;
    }

    ret.sort(function(a, b) {

        if (fn) {
            return fn.call(ctx, a, b);
        }

        var typeA   = typeof a,
            typeB   = typeof b,
            valueA  = a,
            valueB  = b;

        if (typeA != typeB) {
            return 0;
        }

        if (typeA === "object") {
            if (isFunction(by)) {
                valueA = by(a);
                valueB = by(b);
            }
            else {
                valueA = a[by];
                valueB = b[by];
            }
        }

        if (typeof valueA === "number") {
            return valueA - valueB;
        }
        else {
            valueA = ("" + valueA).toLowerCase();
            valueB = ("" + valueB).toLowerCase();

            if (valueA === valueB) return 0;
            return valueA > valueB ? 1 : -1;
        }
    });

    return dir == "desc" ? ret.reverse() : ret;

};


MetaphorJs.model = MetaphorJs.model || {};








var model_Model = MetaphorJs.model.Model = function(){

    
    var instances   = {},
        cache       = {};

    /**
     * @class MetaphorJs.model.Model
     */
    return cls({

        $mixins:        [mixin_Observable],

        type:           null,
        fields:         null,
        record:         null,
        store:          null,
        plain:          false,

        lastAjaxResponse: null,



        /**
         * @constructor
         * @method $init
         * @param {object} cfg {
         *      Properties 
         *      <code>json,id,url,data,success,extra,root,data,
         *              processRequest,validate,resolve</code> are valid 
         *      on the top level and inside all create/load/save/delete/controller
         *      groups.<br> Use string instead of object as shortcut
         *      for load.url/save.url etc.
         * 
         *      @type {string} type Record class
         *      @type {object} fields {
         *          Fields conf
         *          @type {object|string} *name* {
         *              Field name: conf
         *              @type {string} type {
         *                  int|bool|boolean|double|float|date
         *              }
         *              @type {function} parseFn {
         *                  Parse date field
         *                  @param {string} value
         *                  @param {string} format Format from this config
         *              }
         *              @type {function} formatFn {
         *                  Prepare date field for sending
         *                  @param {*} value
         *                  @param {string} format Format from this config
         *              }
         *              @type {string} format Date format {
         *                  If format == "timestamp", <code>date = parseInt(value) * 1000</code>
         *              }
         *              @type {function} restore {
         *                  Custom value processor (on receiving). Another way is to override
         *                  <code>onRestoreField(rec, name, value)</code> method
         *                  @param {object} rec Record from response
         *                  @param {*} value Data value
         *                  @param {string} name Field name
         *                  @returns {*}
         *              }
         *              @type {function} store {
         *                  Custom value processor (on sending). Another way is to override
         *                  <code>onStoreField(rec, value, name)</code> method.
         *                  @param {object} rec 
         *                  @param {*} value
         *                  @param {string} name
         *                  @returns {string}
         *              }
         *          }
         *      }
         *      
         *      @type {bool} json Send data as json string in the request body.
         *      @type {string|function} url Api endpoint. If url is function,
         *                      it accepts payload and returns Promise which
         *                      is then resolved with response.<br>
         *                      In url you can use <code>:name</code> placeholders,
         *                      they will be taken from payload.
         *      @type {string} id Id field. Where to take record id from or 
         *                      put record id to (when sending).
         *      @type {string|function} success Success field or function
         *                     that takes response and returns boolean. 
         *                     If resulted in false, request fails. Leave
         *                     undefined to skip this check.
         *      @type {object} data Main data payload.
         *      @type {object} extra Extra params object. Adds data to payload, 
         *                          overrides data fields.
         *      @type {string} root Records root. In "load" requests this is
         *                          the field to take records from,
         *                          in other requests (if defined) this will be the field
         *                          to put payload into.
         *      @type {object} ajax Various ajax settings from MetaphorJs.ajax module.
         *      @type {function} processRequest {
         *          Custom request processor.
         *          @param {lib_Promise} returnPromise The promise 
         *                          that is returned from load()/save() etc. 
         *                          You can take control of this promise if needed.
         *          @param {int|string|null} id Record id (if applicable)
         *          @param {object|string|null} data Payload
         *      }
         *      @type {function} validate {
         *          Validate request
         *          @param {int|string|null} id Record id (if applicable)
         *          @param {object|string|null} data Payload
         *          @returns {boolean} Return false to cancel the request and 
         *                              reject promise.
         *      }
         *      @type {function} resolve {
         *          Custom request resolver
         *          @param {int|string|null} id Record id (if applicable)
         *          @param {object|string|null} data Payload
         *          @returns {lib_Promise|*} If returned Promise, 
         *              this promise will be returned from the function making
         *              the request. If returned something else, 
         *              will return a new Promise resolved with this value. 
         *              If returned nothing, will continue making the request
         *              as usual.
         *      }
         * 
         *      @type {object} record {
         *          @type {string|object} create New record config
         *          @type {string|object} load Load one record config
         *          @type {string|object} save Save one record config
         *          @type {string|object} delete Delete one record config
         *          @type {object} extend {
         *              Use properties of this object to extend every
         *              received record. If you don't want to create
         *              a whole record class but want to add a few 
         *              methods to a record object.
         *          }
         *      }
         *      @type {object} store {
         *          @type {string} total Total count of records field
         *          @type {string} start Start field: pagination offset
         *          @type {string} limit Limit field: pagination per page
         *          @type {string|object} load Load multiple records
         *          @type {string|object} save Save multiple records
         *          @type {string|object} delete Delete multiple records
         *      }
         * 
         *      @type {object} controller {
         *          @type {object} *name* {
         *              Controller config (<code>id,root,data,success</code> etc).<br>
         *              Called via <code>model.runController("name")</code>
         *          }
         *      }
         * }
         * @code src-docs/snippets/model.js
         * @code src-docs/snippets/controller.js
         */
        $init: function(cfg) {

            var self        = this,
                defaults    = {
                    record: {
                        load:       null,
                        save:       null,
                        "delete":   null,
                        id:         null,
                        data:       null,
                        success:    null,
                        extra:      {}
                    },

                    store: {
                        load:       null,
                        save:       null,
                        "delete":   null,
                        id:         null,
                        data:       null,
                        total:      null,
                        start:      null,
                        limit:      null,
                        success:    null,
                        extra:      {}
                    }
                };


            if (!self.fields) {
                self.fields = {};
            }

            extend(self, defaults, false, true);
            extend(self, cfg, true, true);

            self.plain      = !self.type;
        },

        /**
         * Do records within this model have type (config's "type" property) 
         * or are they plain objects
         * @method
         * @returns {bool}
         */
        isPlain: function() {
            return this.plain;
        },

        /**
         * Get config property related to specific record action 
         * (create/save/load/delete).If there is no such config,
         * it will check a higher level config: <br>
         * config.record.load.url or config.record.url or
         * config.url
         * @method
         * @param {string} type create|load|save|delete
         * @param {string} prop
         * @returns {*}
         * @code model.getRecordProp("load", "url");
         */
        getRecordProp: function(type, prop) {
            return this.getProp("record", type, prop);
        },

        /**
         * Set record config property. See getRecordProp and constructor's config.
         * @method
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setRecordProp: function(prop, value) {
            this.record[prop] = value;
        },

        /**
         * Get config property related to specific store action 
         * (save/load/delete). If there is no such config,
         * it will check a higher level config: <br>
         * config.store.load.url or config.store.url or
         * config.url
         * @method
         * @param {string} type load|save|delete
         * @param {string} prop
         * @returns {*}
         */
        getStoreProp: function(type, prop) {
            return this.getProp("store", type, prop);
        },

        /**
         * Set store config property. See getStoreProp and constructor's config.
         * @method
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setStoreProp: function(prop, value) {
            this.store[prop] = value;
        },


        /**
         * Get config property related to specific action 
         * (save/load/delete). If there is no such config,
         * it will check a higher level config: <br>
         * config.:what:.:type:.:prop: or config.:what:.:prop: or
         * config.:prop:
         * @method
         * @param {string} what record|store
         * @param {string} type create|load|save|delete
         * @param {string} prop
         * @returns {*}
         */
        getProp: function(what, type, prop) {
            var profile = this[what];
            return (profile[type] && profile[type][prop]) || profile[prop] || this[prop] || null;
        },

        /**
         * Set config property. 
         * @method
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setProp: function(prop, value) {
            return this[prop] = value;
        },

        _prepareRequestUrl: function(url, data) {

            url = url.replace(/:([a-z0-9_\-]+)/gi, function(match, name){

                var value = data[name];

                if (value != undefined) {
                    delete data[name];
                    return value;
                }
                else {
                    return match;
                }

            });

            if (/:([a-z0-9_\-]+)/.test(url)) {
                return null;
            }

            return url;
        },

        _makeRequest: function(what, type, id, data) {

            var self        = this,
                profile     = self[what],
                cfg         = extend({},
                                    isString(profile[type]) || isFunction(profile[type]) ?
                                        {url: profile[type]} :
                                        profile[type]
                                    ),
                idProp      = self.getProp(what, type, "id"),
                dataProp    = self.getProp(what, type, "root"),
                url         = self.getProp(what, type, "url"),
                isJson      = self.getProp(what, type, "json"),
                res,
                ajaxCfg     = {};

            if (!cfg) {
                if (url) {
                    cfg     = {url: url};
                }
                else {
                    throw what + "." + type + " not defined";
                }
            }
            if (isString(cfg) || isFunction(cfg)) {
                cfg         = {url: cfg};
            }

            if (!cfg.url) {
                if (!url) {
                    throw what + "." + type + " url not defined";
                }
                cfg.url     = url;
            }

            ajaxCfg.url = cfg.url;

            if (cfg.ajax) {
                extend(ajaxCfg, cfg.ajax, true, false);
            }

            if (cfg.validate) {
                res = cfg.validate.call(self, id, data);
                if (res === false) {
                    return lib_Promise.reject(res);
                }
            }

            if (cfg.resolve) {
                res = cfg.resolve.call(self, id, data);
                if (res && isThenable(res)){
                    return res;
                }
                else if (res) {
                    return lib_Promise.resolve(res);
                }
            }

            ajaxCfg.data        = extend(
                {},
                cfg.data,
                self.extra,
                profile.extra,
                profile[type] ? profile[type].extra : null,
                ajaxCfg.data,
                data,
                true,
                true
            );

            if (isFunction(cfg.url)) {
                var df = cfg.url(ajaxCfg.data),
                    promise = new lib_Promise;

                df.then(function(response){
                    if (what === "record") {
                        self._processRecordResponse(type, response, promise);
                    }
                    else if (what === "store") {
                        self._processStoreResponse(type, response, promise);
                    }
                });

                return promise;
            }

            if (id && idProp) {
                ajaxCfg.data[idProp] = id;
            }

            if (data && dataProp && type !== "load") {
                ajaxCfg.data[dataProp] = data;
            }

            ajaxCfg.url = self._prepareRequestUrl(ajaxCfg.url, ajaxCfg.data);

            if (!ajaxCfg.url) {
                return lib_Promise.reject();
            }

            if (!ajaxCfg.method) {
                if (what !== "controller") {
                    ajaxCfg.method = type === "load" ? "GET" : "POST";
                }
                else {
                    ajaxCfg.method = "GET";
                }
            }

            if (isJson && ajaxCfg.data && ajaxCfg.method !== 'GET') { // && cfg.type != 'GET') {
                ajaxCfg.contentType = "text/plain";
                ajaxCfg.data        = JSON.stringify(ajaxCfg.data);
            }

            ajaxCfg.context = self;

            var returnPromise;

            if (what === "record") {
                ajaxCfg.processResponse = function(response, deferred) {
                    self.lastAjaxResponse = response;
                    self._processRecordResponse(type, response, deferred);
                };
                returnPromise = self._processRecordRequest(ajax(ajaxCfg), type, id, data);
            }
            else if (what === "store") {
                ajaxCfg.processResponse = function(response, deferred) {
                    self.lastAjaxResponse = response;
                    self._processStoreResponse(type, response, deferred);
                };
                returnPromise = self._processStoreRequest(ajax(ajaxCfg), type, id, data);
            }
            else if (what === "controller") {
                ajaxCfg.processResponse = function(response, deferred) {
                    self.lastAjaxResponse = response;
                    self._processControllerResponse(type, response, deferred);
                };
                returnPromise = self._processControllerRequest(ajax(ajaxCfg), type, id, data);
            }

            if (cfg.processRequest) {
                cfg.processRequest.call(self, returnPromise, id, data);
            }

            return returnPromise;
        },

        _processRecordRequest: function(promise, type, id, data) {
            return promise;
        },

        _processRecordResponse: function(type, response, df) {
            var self        = this,
                idProp      = self.getRecordProp(type, "id"),
                dataProp    = self.getRecordProp(type, "root"),
                data        = dataProp ? response[dataProp] : response,
                id          = (data && data[idProp]) || response[idProp];

            if (!self._getSuccess("record", type, response)) {
                df.reject(response);
            }
            else {
                //df.resolve(id, data);
                df.resolve({id: id, data: self.extendPlainRecord(data)});
            }
        },

        _processStoreRequest: function(promise, type, id, data) {
            return promise;
        },

        _processStoreResponse: function(type, response, df) {
            var self        = this,
                dataProp    = self.getStoreProp(type, "root"),
                totalProp   = self.getStoreProp(type, "total"),
                data        = dataProp ? response[dataProp] : response,
                total       = totalProp ? response[totalProp] : null;

            if (!self._getSuccess("store", type, response)) {
                df.reject(response);
            }
            else {
                //df.resolve(data, total);
                df.resolve({data: data, total: total});
            }
        },

        _processControllerRequest: function(promise, type, id, data) {
            return promise;
        },

        _processControllerResponse: function(type, response, df) {

            var self    = this;

            if (!self._getSuccess("controller", type, response)) {
                df.reject(response);
            }
            else {
                df.resolve(response);
            }
        },

        _getSuccess: function(what, type, response) {
            var self    = this,
                sucProp = self.getProp(what, type, "success");

            if (typeof sucProp === "function") {
                return sucProp(response);
            }

            if (sucProp && response[sucProp] != undf) {
                return response[sucProp];
            }
            else {
                return true;
            }
        },

        runController: function(name, id, data) {
            return this._makeRequest("controller", name, id, data);
        },


        /**
         * @method
         * @param {string|number} id Record id
         * @returns {lib_Promise}
         */
        loadRecord: function(id) {
            return this._makeRequest("record", "load", id);
        },

        /**
         * Send a create or save request with record data
         * @method
         * @param {MetaphorJs.model.Record} rec
         * @param {array|null} keys
         * @param {object|null} extra
         * @returns {lib_Promise}
         */
        saveRecord: function(rec, keys, extra) {
            return this._makeRequest(
                "record",
                rec.getId() ? "save" : "create",
                rec.getId(),
                extend({}, rec.storeData(rec.getData(keys)), extra)
            );
        },

        /**
         * Make a record/delete request.
         * @method
         * @param {MetaphorJs.model.Record} rec
         * @returns {lib_Promise}
         */
        deleteRecord: function(rec) {
            return this._makeRequest("record", "delete", rec.getId());
        },

        /**
         * Load store records
         * @method
         * @param {MetaphorJs.model.Store} store
         * @param {object} params
         * @returns {lib_Promise}
         */
        loadStore: function(store, params) {
            return this._makeRequest("store", "load", null, params);
        },

        /**
         * Send store records back to server for saving
         * @method
         * @param {MetaphorJs.model.Store} store
         * @param {object} recordData
         * @returns {lib_Promise}
         */
        saveStore: function(store, recordData) {
            return this._makeRequest("store", "save", null, recordData);
        },

        /**
         * Delete store records
         * @method
         * @param {MetaphorJs.model.Store} store
         * @param {array} ids
         * @returns {lib_Promise}
         */
        deleteRecords: function(store, ids) {
            return this._makeRequest("store", "delete", ids);
        },



        /**
         * Takes plain object and extends with properties
         * defined in model.record.extend
         * @method
         * @returns {object}
         */
        extendPlainRecord: function(rec) {
            var self    = this,
                ext     = self.getRecordProp(null, "extend");

            return ext ? extend(rec, ext, false, false) : rec;
        },

        /**
         * Get field configs
         * @method
         * @returns {object}
         */
        getFields: function() {
            return this.fields;
        },

        /**
         * Extract record id from a record
         * @method
         * @param {object} rec
         * @returns {*|null}
         */
        getRecordId: function(rec) {
            var idProp = this.getRecordProp("load", "id");
            return (rec.getId ? rec.getId() : rec[idProp]) || null;
        },

        /**
         * Convert field's value from database state to app state
         * @method
         * @param {MetaphorJs.model.Record} rec
         * @param {string} name
         * @param {string|int|bool|Date} value
         * @returns {*}
         */
        restoreField: function(rec, name, value) {

            var self    = this,
                f       = self.fields[name];

            if (f) {
                var type = isString(f) ? f : f.type;

                switch (type) {
                    case "int": {
                        value   = parseInt(value);
                        break;
                    }
                    case "bool":
                    case "boolean": {
                        if (isString(value)) {
                            value   = value.toLowerCase();
                            value   = !(value === "off" || value === "no" || value === "0" ||
                                        value == "false" || value == "null");
                        }
                        else {
                            value = value ? true : false;
                        }
                        break;
                    }
                    case "double":
                    case "float": {
                        value   = parseFloat(value);
                        break;
                    }
                    case "date": {
                        if (f['parseFn']) {
                            value   = f['parseFn'](value, f.format);
                        }
                        else if (Date['parse']) {
                            value   = Date['parse'](value, f.format);
                        }
                        else {
                            if (f.format === "timestamp") {
                                value   = parseInt(value) * 1000;
                            }
                            value   = new Date(value);
                        }
                        break;
                    }
                }

                if (f.restore) {
                    value   = f.restore.call(rec, value, name);
                }
            }

            return self.onRestoreField(rec, name, value);
        },

        /**
         * Override this method to have your own value processor
         * @method
         * @access protected
         * @param {MetaphorJs.model.Record} rec
         * @param {string} name
         * @param {string|int|bool} value
         * @returns {string|int|bool|Date}
         */
        onRestoreField: function(rec, name, value) {
            return value;
        },

        /**
         * Convert field's value from app state to database state
         * @method
         * @param {MetaphorJs.model.Record} rec
         * @param {string} name
         * @param {string|int|bool|Date} value
         * @returns {*}
         */
        storeField: function(rec, name, value) {

            var self    = this,
                f       = self.fields[name];

            if (f) {
                var type = isString(f) ? f : f.type;

                switch (type) {
                    case "bool":
                    case "boolean": {
                        value   = value ? "1" : "0";
                        break;
                    }
                    case "date": {
                        if (f['formatFn']) {
                            value   = f['formatFn'](value, f.format);
                        }
                        else if (Date.format) {
                            value   = Date.format(value, f.format);
                        }
                        else {
                            if (f.format === "timestamp") {
                                value   = value.getTime() / 1000;
                            }
                            else {
                                value   = value['format'] ? value['format'](f.format) : value.toString();
                            }
                        }
                        break;
                    }
                    default: {
                        value   = value.toString();
                    }
                }

                if (f.store) {
                    value   = f.store.call(rec, value, name);
                }
            }

            return self.onStoreField(rec, name, value);

        },

        /**
         * Override this method to have your own value processor
         * @method
         * @access protected
         * @param {MetaphorJs.model.Record} rec
         * @param {string} name
         * @param {string|int|bool} value
         * @returns {string|int}
         */
        onStoreField: function(rec, name, value) {
            return value;
        }


    }, {

        /**
         * @static
         * @method
         * @param {string} model Model class name
         * @param {object} cfg Model config
         * @returns {object}
         */
        create: function(model, cfg) {

            if (model === "MetaphorJs.model.Model") {
                return cls.factory(model, cfg);
            }
            else {
                if (cfg) {
                    return cls.factory(model, cfg);
                }
                else {
                    if (instances[model]) {
                        return instances[model];
                    }
                    else {
                        return instances[model] = cls.factory(model);
                    }
                }
            }
        },

        /**
         * @static
         * @method
         * @param {MetaphorJs.model.Record} rec
         */
        addToCache: function(rec) {

            var id      = rec.getId(),
                cname   = rec.$getClass();

            if (!(rec instanceof MetaphorJs.model.Record) && 
                cname) {
                if (!cache[cname]) {
                    cache[cname] = {};
                }
                cache[cname][id] = rec;
            }
        },

        /**
         * @static
         * @method
         * @param {string} type Class name
         * @param {string|int|bool} id
         */
        getFromCache: function(type, id) {

            if (cache[type] && cache[type][id]) {
                return cache[type][id];
            }
            else {
                return null;
            }
        },

        /**
         * @static
         * @method
         * @param {string} type Class name
         * @param {string|int|bool} id
         */
        removeFromCache: function(type, id) {
            if (cache[type] && cache[type][id]) {
                delete cache[type][id];
            }
        }
    });
}();









/**
 * @class MetaphorJs.model.Record
 * @mixes mixin_Observable
 */
var model_Record = MetaphorJs.model.Record = cls({

    /**
     * @event dirty-change {
     *  Record become changed on unchanged
     *  @param {MetaphorJs.model.Record} rec
     *  @param {boolean} dirty
     * }
     */
    /**
     * @event change {
     *  General record change event
     *  @param {MetaphorJs.model.Record} rec 
     *  @param {string} key
     *  @param {*} value 
     *  @param {*} prevValue
     * }
     */
    /**
     * @event change-_key_ {
     *  Specific key change event
     *  @param {MetaphorJs.model.Record} rec 
     *  @param {string} key
     *  @param {*} value 
     *  @param {*} prevValue
     * }
     */
    /**
     * @event before-load {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event load {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event failed-load {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event before-save {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event save {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event failed-save {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event before-delete {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event delete {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event failed-delete {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event reset {
     *  @param {MetaphorJs.model.Record}
     * }
     */


    $mixins: [mixin_Observable],

    id:             null,
    data:           null,
    orig:           null,
    modified:       null,
    loaded:         false,
    loading:        false,
    dirty:          false,
    model:          null,
    standalone:     true,
    stores:         null,
    importUponSave: false,
    importUponCreate: false,

    /**
     * @constructor
     * @method $init
     * @param {*} id
     * @param {object} cfg {
     *  @type {string|model_Model} model
     *  @type {boolean} autoLoad {
     *      Load record automatically when constructed
     *      @default true
     *  }
     *  @type {boolean} importUponSave {
     *      Import new data from response on save request
     *      @default false
     *  }
     *  @type {boolean} importUponCreate {
     *      Import new data from response on create request
     *      @default false
     *  }
     * }
     */

    /**
     * @constructor
     * @method $init
     * @param {object} cfg
     */

    /**
     * @constructor
     * @method $init
     * @param {string|int|null} id
     * @param {object} data
     * @param {object} cfg
     */
    $init: function(id, data, cfg) {

        var self    = this,
            args    = arguments.length;

        if (args === 1) {
            cfg     = id;
            id      = null;
            data    = null;
        }
        else if (args === 2) {
            cfg     = data;
            data    = null;
        }

        self.data       = {};
        self.orig       = {};
        self.stores     = [];
        self.modified   = {};
        cfg             = cfg || {};
        self.$super(cfg);

        if (isString(self.model)) {
            self.model  = model_Model.create(self.model);
        }
        else if (!(self.model instanceof model_Model)) {
            self.model  = new model_Model(self.model);
        }

        self.id     = id;

        if (data) {
            self.importData(data);
        }
        else if(cfg.autoLoad !== false && id) {
            self.load();
        }

        if (self.$getClass() !== "MetaphorJs.model.Record") {
            model_Model.addToCache(self);
        }
    },

    /**
     * Is record finished loading from server
     * @method
     * @returns {bool}
     */
    isLoaded: function() {
        return this.loaded;
    },

    /**
     * Is record still loading from server
     * @method
     * @returns {bool}
     */
    isLoading: function() {
        return this.loading;
    },

    /**
     * Is this record was created separately from a store
     * @method
     * @returns {bool}
     */
    isStandalone: function() {
        return this.standalone;
    },

    /**
     * Does this record have changes
     * @method
     * @returns {bool}
     */
    isDirty: function() {
        return this.dirty;
    },

    /**
     * @method
     * @returns {model_Model}
     */
    getModel: function() {
        return this.model;
    },

    /**
     * Make this record belong to a store
     * @method
     * @param {MetaphorJs.model.Store} store
     */
    attachStore: function(store) {
        var self    = this,
            sid     = store.getId();

        if (self.stores.indexOf(sid) == -1) {
            self.stores.push(sid);
        }
    },

    /**
     * Remove attachment to a store. If record is not standalone,
     * it will be destroyed.
     * @method
     * @param {MetaphorJs.model.Store} store
     */
    detachStore: function(store) {
        var self    = this,
            sid     = store.getId(),
            inx;

        if (!self.$destroyed && (inx = self.stores.indexOf(sid)) != -1) {
            self.stores.splice(inx, 1);

            if (self.stores.length == 0 && !self.standalone) {
                self.$destroy();
            }
        }
    },

    /**
     * Mark this record as having changes
     * @method
     * @param {bool} dirty
     */
    setDirty: function(dirty) {
        var self    = this;
        if (self.dirty != dirty) {
            self.dirty  = !!dirty;
            self.trigger("dirty-change", self, dirty);
        }
    },

    /**
     * Import record data. Resets record to a unchanged state
     * @method
     * @param {object} data
     */
    importData: function(data) {

        var self        = this,
            processed   = {},
            name;

        if (data) {
            for (name in data) {
                processed[name] = self.model.restoreField(self, name, data[name]);
            }

            self.data   = processed;
        }

        self.orig       = extend({}, self.data);
        self.modified   = {};
        self.loaded     = true;
        self.setDirty(false);
    },

    /**
     * Prepare data for sending to a server
     * @method
     * @access protected
     * @param {object} data
     * @returns {object}
     */
    storeData: function(data) {

        var self        = this,
            processed   = {},
            name;

        for (name in data) {
            processed[name] = self.model.storeField(self, name, data[name]);
        }

        return processed;
    },


    /**
     * Get record id
     * @method
     * @returns {*}
     */
    getId: function() {
        return this.id;
    },

    /**
     * Get record data. Returns a new object with all data keys 
     * or only the ones specified and without keys starting with $.
     * @method
     * @param {[]|null|string} keys
     * @returns {object}
     */
    getData: function(keys) {

        var data = {},
            i;

        if (keys) {
            var len,
                self    = this;

            keys = isString(keys) ? [keys] : keys;

            for (i = 0, len = keys.length; i < len; i++) {
                data[keys[i]] = self.data[keys[i]];
            }
            return data;
        }
        else {
            var sdata = this.data;

            for (i in sdata) {
                if (i.substr(0, 1) === "$") {
                    continue;
                }
                data[i] = sdata[i];
            }

            return data;
        }
    },

    /**
     * Get changed properties
     * @method
     * @returns {object}
     */
    getChanged: function() {
        return extend({}, this.modified);
    },

    /**
     * Is the field changed
     * @method
     * @param {string} key
     * @returns {bool}
     */
    isChanged: function(key) {
        return this.modified[key] || false;
    },

    /**
     * Get specific data key
     * @method
     * @param {string} key
     * @returns {*}
     */
    get: function(key) {
        return this.data[key];
    },

    /**
     * Set record id
     * @method
     * @param {*} id
     */
    setId: function(id) {
        if (!this.id && id) {
            this.id = id;
        }
    },

    /**
     * Set data field
     * @method
     * @param {string} key
     * @param {*} value
     */
    set: function(key, value) {

        var self    = this,
            prev    = self.data[key];

        value           = self.model.restoreField(self, key, value);
        self.data[key]  = value;

        if (prev != value) {
            self.modified[key]  = true;
            self.setDirty(true);
            self.trigger("change", self, key, value, prev);
            self.trigger("change-"+key, self, key, value, prev);
        }
    },

    /**
     * Revert record to the last saved state
     * @method
     */
    revert: function() {
        var self    = this;
        if (self.dirty) {
            self.data       = extend({}, self.orig);
            self.modified   = {};
            self.setDirty(false);
        }
    },

    /**
     * Load record from the server
     * @method
     * @returns {MetaphorJs.lib.Promise}
     */
    load: function() {
        var self    = this;
        self.loading = true;
        self.trigger("before-load", self);
        return self.model.loadRecord(self.id)
            .always(function(){
                self.loading = false;
            })
            .done(function(response) {
                self.setId(response.id);
                self.importData(response.data);
                self.trigger("load", self);
            })
            .fail(function() {
                self.trigger("failed-load", self);
            });
    },

    /**
     * Send data back to server 
     * @method
     * @param {array|null|string} keys Only send these keys
     * @param {object|null} extra Send this data along with record data
     * @returns {MetaphorJs.lib.Promise}
     */
    save: function(keys, extra) {
        var self    = this;
        self.trigger("before-save", self);

        var create  = !self.getId(),
            imprt   = create ? self.importUponCreate : self.importUponSave;

        return self.model.saveRecord(self, keys, extra)
            .done(function(response) {
                if (response.id) {
                    self.setId(response.id);
                }
                if (imprt) {
                    self.importData(response.data);
                }
                self.trigger("save", self);
            })
            .fail(function(response) {
                self.trigger("failed-save", self);
            });
    },

    /**
     * Send delete request
     * @method
     * @returns {MetaphorJs.lib.Promise}
     */
    "delete": function() {
        var self    = this;
        self.trigger("before-delete", self);
        return self.model.deleteRecord(self)
            .done(function() {
                self.trigger("delete", self);
                self.$destroy();
            }).
            fail(function() {
                self.trigger("failed-delete", self);
            });
    },


    /**
     * Set record back to unloaded state
     * @method
     */
    reset: function() {

        var self        = this;

        self.id         = null;
        self.data       = {};
        self.orig       = {};
        self.modified   = {};
        self.loaded     = false;
        self.dirty      = false;

        self.trigger("reset", self);
    },



    onDestroy: function() {

        var self    = this;
        model_Model.removeFromCache(self.$getClass(), self.id);
        self.$super();
    }

});




    


    


var model_Store = MetaphorJs.model.Store = function(){

    var allStores   = {};

    /**
     * @class MetaphorJs.model.Store
     * @mixes mixin_Observable
     */
    return cls({

        /**
         * @event update {
         *  Store contents got updated
         *  @param {MetaphorJs.model.Store} store
         *  @param {model_Record|object} rec
         * }
         */
        /**
         * @event before-load {
         *  Before store sends a get request to the server
         *  @param {MetaphorJs.model.Store} store
         *  @returns {boolean} return false to cancel laoding
         * }
         */
        /**
         * @event load {
         *  After store finished loading and updating its contents
         *  @param {MetaphorJs.model.Store} store
         * }
         */
        /**
         * @event loading-end {
         *  After store finished loading but before updating.<br>
         *  This event does not respect <code>silent</code> option. 
         *  The purpose of this event is to let you 
         *  display loading indicator or something like that.
         *  @param {MetaphorJs.model.Store} store
         * }
         */
        /**
         * @event loading-start {
         *  The store requested the server.<br>
         *  This event does not respect <code>silent</code> option. 
         *  The purpose of this event is to let you 
         *  display loading indicator or something like that.
         *  @param {MetaphorJs.model.Store} store
         * }
         */
        /**
         * @event failed-load {
         *  There was an error while loading
         *  @param {MetaphorJs.model.Store} store
         *  @param {string|Error} reason
         * }
         */
        /**
         * @event before-save {
         *  Before sending "save" request
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} recs
         *  @returns {boolean} return false to cancel saving
         * }
         */
        /**
         * @event save {
         *  Records have been saved
         *  @param {MetaphorJs.model.Store} store
         * }
         */
        /**
         * @event failed-save {
         *  There was an error while saving
         *  @param {MetaphorJs.model.Store} store
         *  @param {string|Error} reason
         * }
         */
        /**
         * @event before-delete {
         *  Before sending "delete" request
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} ids 
         *  @returns {boolean} return false to cancel deletion
         * }
         */
        /**
         * @event delete {
         *  Records have been deleted
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} ids 
         * }
         */
        /**
         * @event failed-delete {
         *  There was an error while deleting
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} ids 
         * }
         */
        /**
         * @event add {
         *  Some records were added to the store
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} recs 
         * }
         */
        /**
         * @event remove {
         *  Record got removed from the store
         *  @param {MetaphorJs.model.Store} store
         *  @param {model_Record|object} rec
         *  @param {string|int} id 
         * }
         */
        /**
         * @event replace {
         *  A record was replaced
         *  @param {MetaphorJs.model.Store} store
         *  @param {model_Record|object} old
         *  @param {model_Record|object} rec
         * }
         */
        /**
         * @event clear {
         *  The store has been cleared
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} recs
         * }
         */

            $mixins:        [mixin_Observable],

            id:             null,
            autoLoad:       false,
            clearOnLoad:    true,
            model:          null,

            extraParams:    null,
            loaded:         false,
            loading:        false,
            local:          false,

            items:          null,
            current:        null,
            map:            null,
            currentMap:     null,

            length:         0,
            currentLength:  0,
            maxLength:      0,
            totalLength:    0,

            start:          0,
            pageSize:       null,
            pages:          null,
            filtered:       false,
            sorted:         false,
            filterBy:       null,
            filterOpt:      null,
            sortBy:         null,
            sortDir:        null,
            publicStore:    false,

            idProp:         null,
            loadingPromise: null,

            /**
             * @constructor
             * @method $init
             * @param {object} options {
             *  @type {string} url Api endpoint url if not defined in model
             *  @type {boolean} local {
             *      This store does not load data from remote server
             *      @default false
             *  }
             *  @type {int} pageSize Number of records per page
             *  @type {boolean} autoLoad {
             *      @default false
             *  }
             *  @type {boolean} clearOnLoad {
             *      On load, remove everything already added 
             *      @default true
             *  }
             *  @type {string|object|model_Model} model
             *  @type {object} extraParams {
             *      Extra params to add to every request
             *  }
             *  @type {MetaphorJs.model.Store} sourceStore {
             *      Keep in sync with another store
             *  }
             * }
             * @param {array} initialData Array of records
             */

            /**
             * @constructor
             * @method $init
             * @param {string} url
             * @param {object} options
             * @param {array} initialData
             */
            $init:     function(url, options, initialData) {

                var self        = this;

                self.items      = [];
                self.current    = [];
                self.map        = {};
                self.currentMap = {};
                self.loaded     = false;
                self.extraParams    = self.extraParams || {};

                if (url && !isString(url)) {
                    initialData = options;
                    options     = url;
                    url         = null;
                }

                options         = options || {};

                if (url) {
                    options.url = url;
                }

                self.$super(options);
                extend(self, options, true, false);

                self.id         = self.id || nextUid();
                
                if (self.publicStore) {
                    allStores[self.id]  = self;
                }

                self.initModel(options);

                self.$$observable.createEvent("beforeload", false);

                if (!self.local && self.autoLoad) {
                    self.load();
                }
                else if (initialData) {
                    if (isArray(initialData)) {
                        self._loadArray(initialData);
                    }
                    else {
                        self._loadAjaxData(initialData);
                    }
                }

                if (self.local) {
                    self.loaded     = true;
                }

                if (self.sourceStore) {
                    self.initSourceStore(self.sourceStore, "on");
                }
            },

            /**
             * Change store's model
             * @param {model_Model} model 
             */
            setModel: function(model) {
                this.model = model;
                this.initModel({});
            },

            initModel: function(options) {

                var self = this;

                if (isString(self.model)) {
                    self.model  = model_Model.create(self.model);
                }
                else if (!(self.model instanceof model_Model)) {
                    self.model  = new model_Model(self.model);
                }

                if (options.url) {
                    self.model.store.load    = options.url;
                }

                self.idProp = self.model.getStoreProp("load", "id");
            },


            initSourceStore: function(sourceStore, mode) {
                var self = this;
                sourceStore[mode]("update", self.onSourceStoreUpdate, self);
            },

            onSourceStoreUpdate: function() {

                var self    = this;
                self.$$observable.suspendAllEvents();

                self.clear();
                self.addMany(self.sourceStore.toArray());

                self.$$observable.resumeAllEvents();
                self.trigger("update", self);
            },

            /**
             * Get store id
             * @method
             * @returns {string}
             */
            getId: function() {
                return this.id;
            },

            /**
             * Is this store finished loading data
             * @method
             * @returns {bool}
             */
            isLoaded: function() {
                return this.loaded;
            },

            /**
             * Is this store local (does not load remote data)
             * @method
             * @returns {bool}
             */
            isLocal: function() {
                return this.local;
            },

            /**
             * Make this store local or remote
             * @method
             * @param {bool} state
             */
            setLocal: function(state) {
                this.local  = !!state;
            },

            /**
             * Is this store currently loading
             * @method
             * @returns {bool}
             */
            isLoading: function() {
                return this.loading;
            },

            /**
             * Does this store have a filter applied
             * @method
             * @returns {bool}
             */
            isFiltered: function() {
                return this.filtered;
            },

            /**
             * Does this store have a sorter applied
             * @method
             * @returns {bool}
             */
            isSorted: function() {
                return this.sorted;
            },

            /**
             * Get number of records in this store
             * @method
             * @param {boolean} unfiltered
             * @returns {number}
             */
            getLength: function(unfiltered) {
                return unfiltered ? this.length : this.currentLength;
            },

            /**
             * Get number of records on the server
             * @method
             * @returns {number}
             */
            getTotalLength: function() {
                return this.totalLength || this.currentLength;
            },

            /**
             * Is this store currently empty
             * @method
             * @returns {boolean}
             */
            isEmpty: function() {
                return this.length === 0;
            },

            /**
             * Get number of pages (based on pageSize setting)
             * @method
             * @returns {number}
             */
            getPagesCount: function() {

                var self    = this;

                if (self.pageSize !== null) {
                    return parseInt(self.totalLength / self.pageSize);
                }
                else {
                    return 1;
                }
            },

            /**
             * Set extra param. It will be sent along with every request
             * @method
             * @param {string} k
             * @param {string|int|null} v
             */
            setParam: function(k, v) {
                if (v === null) {
                    delete this.extraParams[k];
                }
                else {
                    this.extraParams[k] = v;
                }
            },

            /**
             * Get extra param
             * @method
             * @param {string} k
             * @returns {*}
             */
            getParam: function(k) {
                return this.extraParams[k];
            },

            /**
             * Get all extra params (in a new object)
             * @method
             * @returns {object}
             */
            getParams: function() {
                return extend({}, this.extraParams);
            },

            /**
             * Clear all extra params
             * @method
             */
            clearParams: function() {
                this.extraParams = {};
            },

            /**
             * Set remote record offset
             * @method
             * @param {number} val
             */
            setStart: function(val) {
                this.start = val;
            },

            /**
             * Set page size
             * @method
             * @param {number} val
             */
            setPageSize: function(val) {
                this.pageSize = val;
            },

            /**
             * Get unprocessed response data
             * @method
             * @returns {object}
             */
            getAjaxData: function() {
                return this.ajaxData;
            },

            /**
             * Does this store have records marked as dirty
             * @method
             * @param {boolean} unfiltered If filter is appied this flag will 
             *  make this method ignore the filter
             * @returns {bool}
             */
            hasDirty: function(unfiltered) {
                if (this.model.isPlain()) {
                    return false;
                }
                var ret = false;
                this.each(function(rec){
                    if (rec.isDirty()) {
                        ret = true;
                        return false;
                    }
                    return true;
                }, null, unfiltered);
                return ret;
            },

            /**
             * Get list of records marked as dirty
             * @method
             * @param {boolean} unfiltered If filter is appied this flag will 
             *  make this method ignore the filter
             * @returns {array}
             */
            getDirty: function(unfiltered) {
                var recs    = [];
                if (this.model.isPlain()) {
                    return recs;
                }
                this.each(function(rec){
                    if (rec.isDirty()) {
                        recs.push(rec);
                    }
                }, null, unfiltered);
                return recs;
            },

            /**
             * Get current model
             * @method
             * @returns {model_Model}
             */
            getModel: function() {
                return this.model;
            },


            /**
             * Get list of records (affected by store filter)
             * @method
             * @returns {array}
             */
            toArray: function() {
                return this.current.slice();
            },



            /**
             * @ignore
             * initialize store with data from remote sever
             * @method
             * @param {object} data
             */
            _loadAjaxData: function(data, options) {

                var self    = this;

                options = options || {};

                if (!options.silent && self.trigger("before-load", self) === false) {
                    return;
                }

                self.ajaxData = data;

                self.model._processStoreResponse("load", data, {
                    resolve: function(response) {
                        self._onModelLoadSuccess(response, options);
                    },
                    reject: function(reason) {
                        self._onModelLoadFail(reason, options);
                    }
                });
            },

            /**
             * @ignore
             * initialize store with local data
             * @param {[]} recs
             * @param {{}} options
             */
            _loadArray: function(recs, options) {

                var self    = this;

                options = options || {};

                if (!options.silent && self.trigger("before-load", self) === false) {
                    return;
                }

                if (isArray(recs)) {
                    self._load(recs, options);
                    self.totalLength    = self.length;
                }
            },



            /**
             * @ignore
             * load records no matter where they came from
             * @param {[]} recs
             * @param {{}} options
             */
            _load: function(recs, options) {

                var self    = this,
                    prepend = options.prepend;

                options = options || {};
                recs = recs || [];

                if (prepend) {
                    self.insertMany(0, recs, true, true)
                }
                else {
                    self.addMany(recs, true, true);
                }

                /*for (var i = 0; i < recs.length; i++) {
                    if (prepend) {
                        self.insert(i, recs[i], true, true);
                    }
                    else {
                        self.add(recs[i], true, true);
                    }
                }*/

                self.loaded     = true;
                self.loading    = false;

                
                self.trigger("loading-end", self);
                self.onLoad();

                if (!options.skipUpdate) {
                    self.update();
                }

                if (!options.silent) {
                    self.trigger("load", self);
                }
            },

            /**
             * (Re)load store. 
             * @method
             * @param {object} params {
             *  Add these params to load request
             *  @optional
             * }
             * @param {object} options {
             *  @type {boolean} silent {
             *      Do not trigger events
             *      @default false
             *  }
             *  @type {boolean} noopOnEmpty {
             *      Stop doing anything as soon as we know the data is empty
             *      (do not clear and update)
             *      @default false
             *  }
             *  @type {boolean} prepend {
             *      Insert loaded data in front of old ones (and do not clear)
             *      @default false
             *  }
             *  @type {boolean} append {
             *      Insert loaded data after existing records (and do not clear)
             *      @default false
             *  }
             *  @type {boolean} skipUpdate {
             *      Skip updating store - re-filter, re-map
             *      @default false
             *  }
             * }
             * @returns {MetaphorJs.lib.Promise}
             */
            load: function(params, options) {

                var self    = this,
                    ms      = self.model.store,
                    sp      = ms.start,
                    lp      = ms.limit,
                    ps      = self.pageSize;

                if (self.loadingPromise && self.loadingPromise.abort) {
                    self.loadingPromise.abort();
                }

                options     = options || {};

                if (self.local) {
                    return null;
                }

                params      = extend({}, self.extraParams, params || {});

                if (ps !== null && !params[sp] && !params[lp]) {
                    if (sp) {
                        params[sp]    = self.start;
                    }
                    if (lp) {
                        params[lp]    = ps;
                    }
                }

                if (!options.silent && self.trigger("before-load", self) === false) {
                    return null;
                }

                self.loading = true;

                self.trigger("loading-start", self);

                return self.loadingPromise = self.model.loadStore(self, params)
                    .done(function(response) {
                        if (self.$destroyed) {
                            return;
                        }
                        self.loadingPromise = null;
                        self.ajaxData = self.model.lastAjaxResponse;
                        self._onModelLoadSuccess(response, options);
                    })
                    .fail(function(reason){
                        if (self.$destroyed) {
                            return;
                        }
                        self.loadingPromise = null;
                        self.ajaxData = self.model.lastAjaxResponse;
                        self._onModelLoadFail(reason, options);
                    });
            },

            _onModelLoadSuccess: function(response, options) {

                var self = this;
                options = options || {};

                if (options.noopOnEmpty && !response.data.length) {
                    return;
                }

                if ((!options.prepend && !options.append) && self.clearOnLoad && self.length > 0) {
                    self.clear(true);
                }

                self.totalLength = parseInt(response.total);
                self._load(response.data, options);
            },

            _onModelLoadFail: function(reason, options) {
                var self = this;
                self.onFailedLoad();
                if (!options.silent) {
                    self.trigger("failed-load", self, reason);
                }
            },

            /**
             * Override this method to catch successful loads
             * @method
             */
            onLoad: emptyFn,

            /**
             * Override this method to catch failed loads
             * @method
             */
            onFailedLoad: emptyFn,

            /**
             * Save all dirty records
             * @method
             * @param {boolean} silent {
             *  Do not trigger events
             *  @default false
             * }
             * @returns {MetaphorJs.lib.Promise}
             */
            save: function(silent) {

                var self    = this,
                    recs    = {},
                    cnt     = 0;

                if (self.local) {
                    return null;
                }

                if (self.model.isPlain()) {
                    throw new Error("Cannot save plain store");
                }

                self.each(function(rec) {
                    if (rec.isDirty()) {
                        recs[rec.getId()] = rec.storeData(rec.getData());
                        cnt++;
                    }
                });

                if (!cnt) {
                    return null;
                }

                if (!silent && self.trigger("before-save", self, recs) === false) {
                    return null;
                }

                return self.model.saveStore(self, recs)
                    .done(function(response){
                        self._onModelSaveSuccess(response, silent);
                    })
                    .fail(function(reason){
                        self._onModelSaveFail(reason, silent);
                    });

            },

            _onModelSaveSuccess: function(response, silent) {

                var self = this,
                    i, len,
                    id, rec,
                    data = response.data;

                if (data && data.length) {
                    for (i = 0, len = data.length; i < len; i++) {

                        id      = self.getRecordId(data[i]);
                        rec     = self.getById(id);

                        if (rec) {
                            rec.importData(data[i]);
                        }
                    }
                }

                self.onSave();
                if (!silent) {
                    self.trigger("save", self);
                }
            },

            _onModelSaveFail: function(reason, silent) {
                var self = this;
                self.onFailedSave(reason);
                if (!silent) {
                    self.trigger("failed-save", self, reason);
                }
            },

            /**
             * Override this method to catch successful saves
             * @method
             */
            onSave: emptyFn,

            /**
             * Override this method to catch failed saves
             * @method
             */
            onFailedSave: emptyFn,


            /**
             * Delete record by id (send delete request)
             * @method
             * @param {int|string|array} ids Record id(s)
             * @param {boolean} silent {
             *  Do not trigger events
             *  @default false
             * }
             * @param {boolean} skipUpdate {
             *  Skip updating store (re-filter, re-map)
             *  @default false
             * }
             * @returns {MetaphorJs.lib.Promise}
             */
            deleteById: function(ids, silent, skipUpdate) {

                var self    = this,
                    i, len, rec;

                if (self.local) {
                    return null;
                }

                if (!ids || (isArray(ids) && !ids.length)) {
                    throw new Error("Record id required");
                }

                if (!isArray(ids)) {
                    ids = [ids];
                }

                for (i = 0, len = ids.length; i < len; i++){
                    rec = self.getById(ids[i]);
                    self.remove(rec, silent, skipUpdate);
                    if (rec instanceof model_Record) {
                        rec.$destroy();
                    }
                }

                if (!silent && self.trigger("before-delete", self, ids) === false) {
                    return null;
                }

                return self.model.deleteRecords(self, ids)
                    .done(function() {
                        self.totalLength -= ids.length;
                        self.onDelete();
                        if (!silent) {
                            self.trigger("delete", self, ids);
                        }
                    })
                    .fail(function() {
                        self.onFailedDelete();
                        if (!silent) {
                            self.trigger("failed-delete", self, ids);
                        }
                    });
            },

            /**
             * Override this method to catch successful deletes
             * @method
             */
            onDelete: emptyFn,

            /**
             * Override this method to catch failed deletes
             * @method
             */
            onFailedDelete: emptyFn,

            /**
             * Delete record at index
             * @method
             * @param {number} inx Position at which to delete record
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns {MetaphorJs.lib.Promise}
             */
            deleteAt: function(inx, silent, skipUpdate) {
                var self    = this,
                    rec     = self.getAt(inx);

                if (!rec) {
                    throw new Error("Record not found at " + inx);
                }
                return self["delete"](rec, silent, skipUpdate);
            },

            /**
             * Delete record
             * @method
             * @param {model_Record} rec
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns {MetaphorJs.lib.Promise}
             */
            "delete": function(rec, silent, skipUpdate) {
                var self    = this;
                return self.deleteById(self.getRecordId(rec), silent, skipUpdate);
            },

            /**
             * Delete multiple records
             * @method
             * @param {model_Record[]} recs
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns {MetaphorJs.lib.Promise}
             */
            deleteRecords: function(recs, silent, skipUpdate) {
                var ids     = [],
                    self    = this,
                    i, len;

                for (i = 0, len = recs.length; i < len; i++) {
                    ids.push(self.getRecordId(recs[i]));
                }

                return self.deleteById(ids, silent, skipUpdate);
            },


            /**
             * Load store if not loaded or call provided callback
             * @method
             * @param {object} options See load()
             * @returns {MetaphorJs.lib.Promise}
             */
            loadOr: function(options) {

                var self    = this;

                if (!self.local && !self.isLoading() && !self.isLoaded()) {
                    return self.load(null, options);
                }

                return MetaphorJs.lib.Promise.resolve(self);
            },

            /**
             * Load previous page and prepend before current records
             * @method
             * @param {object} options {
             *      See load(). append,prepend and noopOnEmpty will be set to
             *      false, true and true.
             * }
             * @returns {MetaphorJs.lib.Promise}
             */
            addPrevPage: function(options) {
                var self    = this;

                options = options || {};
                options.append = false;
                options.prepend = true;
                options.noopOnEmpty = true;

                return self.loadPrevPage(options);
            },

            /**
             * Load next page and append after current records
             * @method
             * @param {object} options {
             *      See load(). append,prepend and noopOnEmpty will be set to
             *      true, false and true.
             * }
             * @returns {MetaphorJs.lib.Promise}
             */
            addNextPage: function(options) {

                var self    = this;

                options = options || {};
                options.append = true;
                options.prepend = false;
                options.noopOnEmpty = true;

                if (!self.local && (!self.totalLength || self.length < self.totalLength)) {
                    return self.load({
                        start:      self.length,
                        limit:      self.pageSize
                    }, options);
                }
                else {
                    return MetaphorJs.lib.Promise.resolve();
                }
            },

            /**
             * Load next page and replace current records with records from 
             * the next page
             * @method
             * @param {object} options See load()
             * @returns {MetaphorJs.lib.Promise}
             */
            loadNextPage: function(options) {

                var self    = this;

                if (!self.local && (!self.totalLength || 
                                    self.length < self.totalLength)) {
                    self.start += self.pageSize;
                    return self.load(null, options);
                }
                
                return MetaphorJs.lib.Promise.resolve();
            },

            /**
             * Load prev page and replace current records with records from 
             * the prev page
             * @method
             * @param {object} options See load()
             * @returns {MetaphorJs.lib.Promise}
             */
            loadPrevPage: function(options) {

                var self    = this;

                if (!self.local && self.start > 0) {
                    self.start -= self.pageSize;
                    if (self.start < 0) {
                        self.start = 0;
                    }
                    return self.load(null, options);
                }

                return MetaphorJs.lib.Promise.resolve();
            },

            /**
             * Load a page and replace current records with records from 
             * the page
             * @method
             * @param {int} start Records offset
             * @param {object} options See load()
             * @returns {MetaphorJs.lib.Promise}
             */
            loadPage: function(start, options) {
                var self = this;
                if (!self.local) {
                    self.start = parseInt(start, 10);
                    if (self.start < 0) {
                        self.start = 0;
                    }
                    return self.load(null, options);
                }
                return MetaphorJs.lib.Promise.resolve();
            },


            /**
             * Extract id from a record
             * @method
             * @param {model_Record|object} rec
             * @returns {int|string|null}
             */
            getRecordId: function(rec) {
                if (rec instanceof model_Record) {
                    return rec.getId();
                }
                else if (this.model) {
                    return this.model.getRecordId(rec) || rec[this.idProp] || null;
                }
                else {
                    return rec[this.idProp] || null;
                }
            },

            /**
             * Get record data as plain object
             * @method
             * @param {model_Record|object} rec
             * @returns {object}
             */
            getRecordData: function(rec) {
                return this.model.isPlain() ? rec : rec.data;
            },

            /**
             * @ignore
             * @method
             * @access protected
             * @param {model_Record|Object} item
             * @returns model_Record|Object
             */
            processRawDataItem: function(item) {

                var self    = this;

                if (item instanceof model_Record) {
                    return item;
                }

                if (self.model.isPlain()) {
                    return self.model.extendPlainRecord(item);
                }
                else {

                    var type    = self.model.type,
                        id      = self.getRecordId(item),
                        r;

                    if (id) {
                        r       = model_Model.getFromCache(type, id);
                    }

                    if (!r) {
                        r       = cls.factory(type, id, item, {
                                    model:      self.model,
                                    standalone: false
                        });
                    }

                    return r;
                }
            },

            /**
             * @ignore
             * @method
             * @param {string} mode on|un
             * @param {model_Record} rec
             * @returns {model_Record}
             */
            bindRecord: function(mode, rec) {
                var self = this;
                rec[mode]("change", self.onRecordChange, self);
                rec[mode]("destroy", self.onRecordDestroy, self);
                rec[mode]("dirty-change", self.onRecordDirtyChange, self);
                return rec;
            },

            /**
             * @ignore
             * @method
             * @access protected
             * @param {model_Record|Object} rec
             */
            onRecordDirtyChange: function(rec) {
                this.trigger("update", this, rec);
            },

            /**
             * @ignore
             * @method
             * @access protected
             * @param {model_Record|Object} rec
             * @param {string} k
             * @param {string|int|bool} v
             * @param {string|int|bool} prev
             */
            onRecordChange: function(rec, k, v, prev) {
                this.trigger("update", this, rec);
            },

            /**
             * @ignore
             * @method
             * @access protected
             * @param {model_Record|Object} rec
             */
            onRecordDestroy: function(rec) {
                this.remove(rec);
            },





            /**
             * Remove and return first record
             * @method
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @param {boolean} unfiltered Execute on unfiltered set of records
             * @returns {model_Record|Object|null}
             */
            shift: function(silent, skipUpdate, unfiltered) {
                return this.removeAt(0, 1, silent, skipUpdate, unfiltered);
            },

            /**
             * Insert record at the beginning. Works with unfiltered data
             * @method
             * @param {object|model_Record} rec
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {model_Record|object}
             */
            unshift: function(rec, silent, skipUpdate) {
                return this.insert(0, rec, silent, skipUpdate);
            },

            /**
             * Remove and return last record
             * @method
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @param {boolean} unfiltered Execute on unfiltered set of records
             * @returns {model_Record|object|null}
             */
            pop: function(silent, skipUpdate, unfiltered) {
                return this.removeAt(this.length - 1, 1, silent, skipUpdate, unfiltered);
            },

            /**
             * Add many records to the store. Works with unfiltered data
             * @method
             * @param {model_Record[]|object[]} recs
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             */
            addMany: function(recs, silent, skipUpdate) {
                var i, l, self = this, start = self.length;

                for (i = 0, l = recs.length; i < l; i++) {
                    self.insert(start + i, recs[i], true, true);
                }

                if (!skipUpdate) {
                    self.update();
                }

                if (l > 0 && !silent) {
                    self.trigger("add", recs);
                }
            },

            /**
             * Add one record to the store. Works with unfiltered data
             * @method
             * @param {model_Record|object} rec
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             */
            add: function(rec, silent, skipUpdate) {
                return this.insert(this.length, rec, silent, skipUpdate);
            },

            /**
             * Override this method to catch when records are added
             * @method 
             * @param {int} index
             * @param {model_Record|object} rec
             */
            onAdd: emptyFn,

            /**
             * Remove records from specific position
             * @method
             * @param {number} index {
             *  Starting index 
             *  @required
             * }
             * @param {number} length {
             *  Number of records to remove
             *  @default 1
             * }
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @param {boolean} unfiltered Execute on unfiltered set of records
             * @returns {model_Record|object|undefined}
             */
            removeAt: function(index, length, silent, skipUpdate, unfiltered) {

                var self    = this,
                    i       = 0,
                    l       = self.length;

                if (l === 0) {
                    return;
                }

                if (index === null) {
                    //index   = 0; ??
                    return;
                }
                while (index < 0) {
                    index   = l + index;
                }

                if (length == null) {
                    length = 1;
                }

                if (!unfiltered) {
                    index   = self.items.indexOf(self.current[index]);
                }

                while (index < self.length && index >= 0 && i < length) {

                    self.length--;
                    var rec     = self.items[index];
                    self.items.splice(index, 1);

                    var id      = self.getRecordId(rec);

                    if (id !== undf){
                        delete self.map[id];
                        delete self.currentMap[id];
                    }

                    self.onRemove(rec, id);

                    if (!skipUpdate) {
                        self.update();
                    }

                    if (!silent) {
                        self.trigger('remove', rec, id);
                    }

                    if (rec instanceof model_Record) {
                        self.bindRecord("un", rec);
                        rec.detachStore(self);

                        if (length === 1) {
                            return rec.$destroyed ? undf : rec;
                        }
                    }
                    else {
                        if (length === 1) {
                            return rec;
                        }
                    }

                    i++;
                }

                return undf;
            },

            /**
             * Remove records between start and end indexes
             * @method
             * @param {int} start Start index
             * @param {int} end End index
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @param {boolean} unfiltered Execute on unfiltered set of records
             * @returns {model_Record|object|undefined}
             */
            removeRange: function(start, end, silent, skipUpdate, unfiltered) {
                var l       = this.length;

                if (l === 0) {
                    return;
                }

                if (start == null && end == null) {
                    return this.clear(silent);
                }

                if (start == null) {
                    start   = 0;
                }
                while (start < 0) {
                    start   = l + start;
                }
                if (end == null) {
                    end     = l - 1;
                }
                while (end < 0) {
                    end     = l + start;
                }

                return this.removeAt(start, (end - start) + 1, silent, skipUpdate, unfiltered);
            },

            /**
             * Override this method to catch all record removals
             * @method
             * @param {model_Record|object} rec
             * @param {int|string|null} id
             */
            onRemove: emptyFn,

            /**
             * Insert multiple records at specific index. (Works with unfiltered set)
             * @method
             * @param {int} index {
             *  @required
             * }
             * @param {array} recs
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             */
            insertMany: function(index, recs, silent, skipUpdate) {
                var i, l, self = this;
                for (i = 0, l = recs.length; i < l; i++) {
                    self.insert(index + i, recs[i], true, true);
                }
                if (l > 0 && !skipUpdate) {
                    self.update();
                }
                if (l > 0 && !silent) {
                    self.trigger("add", recs);
                }
            },

            /**
             * Insert record at specific index. (Works with unfiltered set)
             * @method
             * @param {number} index {
             *  @required
             * }
             * @param {model_Record|object} rec
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {model_Record|object}
             */
            insert: function(index, rec, silent, skipUpdate) {

                var self = this,
                    id,
                    last = false;

                rec     = self.processRawDataItem(rec);
                id      = self.getRecordId(rec);

                if(self.map[id]){
                    self.$$observable.suspendAllEvents();
                    self.removeId(id);
                    self.$$observable.resumeAllEvents();
                }

                if(index >= self.length){
                    self.items.push(rec);
                    last = true;
                }
                else {
                    self.items.splice(index, 0, rec);
                }

                self.length++;

                if (self.maxLength && self.length > self.maxLength) {
                    if (last) {
                        self.pop(silent, true);
                    }
                    else {
                        self.shift(silent, true);
                    }
                }

                if(id !== undf){
                    self.map[id] = rec;
                }

                if (rec instanceof model_Record) {
                    rec.attachStore(self);
                    self.bindRecord("on", rec);
                }

                self.onAdd(index, rec);

                if (!skipUpdate) {
                    self.update();
                }

                if (!silent) {
                    self.trigger('add', [rec]);
                }

                return rec;
            },

            /**
             * Replace one record with another
             * @method
             * @param {model_Record|object} old Old record
             * @param {model_Record|object} rec New record
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {model_Record|object} new record
             */
            replace: function(old, rec, silent, skipUpdate) {
                var self    = this,
                    index;

                index   = self.items.indexOf(old);

                self.removeAt(index, 1, true, true, true);
                self.insert(index, rec, true, true);

                if (!skipUpdate) {
                    self.update();
                }

                self.onReplace(old, rec);

                if (!silent) {
                    self.trigger('replace', old, rec);
                }

                return rec;
            },


            /**
             * Replace record with given id by another record
             * @method
             * @param {int|string} id Old record id
             * @param {model_Record|object} rec New record
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {model_Record|object} new record
             */
            replaceId: function(id, rec, silent, skipUpdate) {
                var self    = this,
                    index;

                index = self.indexOfId(id);

                return self.replace(self.getAt(index), rec, silent, skipUpdate);
            },

            /**
             * Override this method to catch all record replacements
             * @method
             * @param {model_Record|object} old Old record
             * @param {model_Record|object} rec New record
             */
            onReplace: emptyFn,

            /**
             * Remove record from the store
             * @method
             * @param {model_Record|object} rec
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {model_Record|object|null}
             */
            remove: function(rec, silent, skipUpdate) {
                var inx = this.indexOf(rec, true);
                if (inx !== -1) {
                    return this.removeAt(inx, 1, silent, skipUpdate, true);
                }
                return null;
            },

            /**
             * Remove record from the store by record id
             * @method
             * @param {string|int} id Record id
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {model_Record|object|null}
             */
            removeId: function(id, silent, skipUpdate) {
                var inx = this.indexOfId(id, true);
                if (inx !== -1) {
                    return this.removeAt(inx, 1, silent, skipUpdate, true);
                }
            },



            /**
             * Does this store contains record
             * @method
             * @param {model_Record|object} rec
             * @param {boolean} unfiltered Check unfiltered set
             * @returns {boolean}
             */
            contains: function(rec, unfiltered) {
                return this.indexOf(rec, unfiltered) !== -1;
            },

            /**
             * Does this store contains a record with given id
             * @method
             * @param {string|int} id Record id
             * @param {boolean} unfiltered Check in unfiltered set
             * @returns {boolean}
             */
            containsId: function(id, unfiltered) {
                if (unfiltered) {
                    return this.map[id] !== undf;
                }
                else {
                    return this.currentMap[id] !== undf;
                }
            },

            /**
             * Remove all records from the store
             * @method
             * @param {boolean} silent Do not trigger events
             */
            clear: function(silent) {

                var self    = this,
                    recs    = self.getRange();

                self._reset();
                self.onClear();

                if (!silent) {
                    self.trigger('clear', self, recs);
                }
            },

            /**
             * Override this method to catch when the store is being cleared
             * @method
             */
            onClear: emptyFn,

            /**
             * Same as clear but it doesn't trigger any events. 
             * This is what clear() calls internally
             * @method
             */
            reset: function() {
                this._reset();
                this.start = 0;
            },

            _reset: function(keepRecords) {
                var self    = this,
                i, len, rec;

                if (!keepRecords) {
                    for (i = 0, len = self.items.length; i < len; i++) {
                        rec = self.items[i];
                        if (rec instanceof model_Record) {
                            self.bindRecord("un", rec);
                            rec.detachStore(self);
                        }
                    }
                }

                self.length         = 0;
                self.currentLength  = 0;
                self.totalLength    = 0;
                self.items          = [];
                self.current        = [];
                self.map            = {};
                self.currentMap     = {};
                self.loaded         = self.local;
            },


            /**
             * Get record at given index
             * @method
             * @param {int} index
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {model_Record|object|null}
             */
            getAt: function(index, unfiltered) {
                return unfiltered ?
                       (this.items[index] || undf) :
                       (this.current[index] || undf);
            },

            /**
             * Get record by id
             * @method
             * @param {string|int} id Record id
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {model_Record|object|null}
             */
            getById: function(id, unfiltered) {
                return unfiltered ?
                       (this.map[id] || undf) :
                       (this.currentMap[id] || undf);
            },

            /**
             * Get index of record
             * @method
             * @param {model_Record|object} rec
             * @param {boolean} unfiltered Lookup in unfiltered set
             * @returns {int} returns -1 if not found
             */
            indexOf: function(rec, unfiltered) {
                return unfiltered ?
                       this.items.indexOf(rec) :
                       this.current.indexOf(rec);
            },

            /**
             * Get index of record by given record id
             * @method
             * @param {string|int} id Record id
             * @param {boolean} unfiltered Lookup in unfiltered set
             * @returns {int} returns -1 if not found
             */
            indexOfId: function(id, unfiltered) {
                return this.indexOf(this.getById(id, unfiltered), unfiltered);
            },

            /**
             * Interate over store records
             * @method
             * @param {function} fn {
             *      @param {model_Record|object} rec
             *      @param {number} index
             *      @param {number} length
             *      @returns {boolean|null} return false to stop
             * }
             * @param {object} context fn's context
             * @param {boolean} unfiltered Iterate over unfiltered set
             */
            each: function(fn, context, unfiltered) {
                var items = unfiltered ?
                            this.items.slice() :
                            this.current.slice();

                for(var i = 0, len = items.length; i < len; i++){
                    if(fn.call(context, items[i], i, len) === false){
                        break;
                    }
                }
            },

            /**
             * Iterate over store records
             * @method
             * @param {function} fn {
             *      @param {string|number} id Record id
             *      @param {number} index Record position in set
             *      @param {number} length Set length
             *      @returns {boolean|null} return false to stop
             * }
             * @param {object} context fn's context
             * @param {boolean} unfiltered Iterate over unfiltered set
             */
            eachId: function(fn, context, unfiltered) {

                var self    = this;

                self.each(function(rec, i, len){
                    return fn.call(context, self.getRecordId(rec), i, len);
                }, null, unfiltered);
            },

            /**
             * Collect values of given field
             * @method
             * @param {string} f Field name
             * @param {boolean} unfiltered Collect from unfiltered set
             * @returns {array}
             */
            collect: function(f, unfiltered) {

                var coll    = [],
                    self    = this,
                    rt      = !self.model.isPlain();

                self.each(function(rec){

                    var val = rt ? rec.get(f) : rec[f];

                    if (val) {
                        coll.push(val);
                    }
                }, null, unfiltered);

                return coll;
            },

            /**
             * Get first record
             * @method
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {model_Record|object|null}
             */
            first : function(unfiltered){
                return unfiltered ? this.items[0] : 
                                    this.current[0];
            },

            /**
             * Get last record
             * @method
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {model_Record|object|null}
             */
            last : function(unfiltered){
                return unfiltered ? this.items[this.length-1] : 
                                    this.current[this.current-1];
            },

            /**
             * Get a slice of records list
             * @method
             * @param {number} start {
             *  Start index
             *  @default 0
             * }
             * @param {number} end {
             *  End index
             *  @default length-1
             * }
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {model_Record[]|object[]}
             */
            getRange : function(start, end, unfiltered){
                var self    = this,
                    items   = unfiltered ? self.items : self.current,
                    r       = [],
                    i;

                if(items.length < 1){
                    return r;
                }

                start   = start || 0;
                end     = Math.min(end == undf ? self.length-1 : end, self.length-1);

                if(start <= end){
                    for(i = start; i <= end; i++) {
                        r.push(items[i]);
                    }
                }else{
                    for(i = start; i >= end; i--) {
                        r.push(items[i]);
                    }
                }
                return r;
            },

            /**
             * Find and return record matching custom filter
             * @method
             * @param {function} fn {
             *      @param {model_Record|object} rec
             *      @param {string|int} id
             *      @returns {boolean} Return true to accept record
             * }
             * @param {object} context fn's context
             * @param {number} start { @default 0 }
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {model_Record|object|null}
             */
            findBy: function(fn, context, start, unfiltered) {
                var inx = this.findIndexBy(fn, context, start, unfiltered);
                return inx === -1 ? undf : this.getAt(inx, unfiltered);
            },

            /**
             * Find index of a record matching custom filter
             * @method
             * @param {function} fn {
             *      @param {model_Record|object} rec
             *      @param {string|int} id
             *      @returns {boolean} return true to accept record
             * }
             * @param {object} context fn's context
             * @param {number} start { @default 0 }
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {int} returns -1 if not found
             */
            findIndexBy : function(fn, context, start, unfiltered) {

                var self = this,
                    it  = unfiltered ? self.items : self.current;

                for(var i = (start||0), len = it.length; i < len; i++){
                    if(fn.call(context, it[i], self.getRecordId(it[i]))){
                        return i;
                    }
                }

                return -1;
            },

            /**
             * Find record by its field value
             * @method
             * @param {string} property Record's field name
             * @param {string|int|bool} value Value to compare to
             * @param {bool} exact Make a strict comparison
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {model_Record|object|null}
             * @code store.find("name", "Jane");
             */
            find: function(property, value, exact, unfiltered) {

                var self    = this,
                    rt      = !self.model.isPlain(),
                    v;

                var inx = self.findIndexBy(function(rec) {

                    v = rt ? rec.get(property) : rec[property];

                    if (exact) {
                        return v === value;
                    }
                    else {
                        return v == value;
                    }

                }, self, 0, unfiltered);

                return inx !== -1 ? self.getAt(inx, unfiltered) : null;
            },

            /**
             * Find record by its field value.<br>
             * Same as <code>find()</code> but with exact=true
             * @method
             * @param {string} property Record's field name
             * @param {string|int|bool} value Value to compare to
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {model_Record|object|null}
             */
            findExact: function(property, value, unfiltered) {
                return this.find(property, value, true, unfiltered);
            },

            /**
             * Find record by a set of fields
             * @method
             * @param {object} props A set of field:value pairs to match record against.
             * All fields must match for the record to be accepted.
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {model_Record|object|null}
             */
            findBySet: function(props, unfiltered) {

                var found   = null,
                    match,
                    i;

                this.each(function(rec){

                    match   = true;

                    for (i in props) {
                        if (props[i] != rec[i]) {
                            match   = false;
                            break;
                        }
                    }

                    if (match) {
                        found   = rec;
                        return false;
                    }

                    return true;
                }, null, unfiltered);

                return found;
            },




            /**
             * Re-apply filter and sorting. 
             * Call this function if you used <code>skipUpdate</code> before.
             * @method
             */
            update: function() {

                var self        = this,
                    filtered    = self.filtered,
                    sorted      = self.sorted,
                    isPlain     = self.model.isPlain();

                self.currentLength  = self.length;
                self.currentMap     = self.map;
                self.current        = self.items;

                if (filtered) {

                    var by              = self.filterBy,
                        opt             = self.filterOpt,
                        current,
                        map;

                    self.current        = current = [];
                    self.currentMap     = map = {};

                    self.each(function(rec){
                        if (filterArray.compare(isPlain ? rec : rec.data, by, opt)) {
                            current.push(rec);
                            map[self.getRecordId(rec)] = rec;
                        }
                    }, null, true);

                    self.currentLength  = self.current.length;
                }

                if (sorted) {
                    var sortBy          = self.sortBy,
                        rt              = !self.model.isPlain(),
                        getterFn        = function(item) {
                            return rt ? item.get(sortBy) : item[sortBy];
                        };
                    self.current        = sortArray(
                        self.current, 
                        isFunction(sortBy) ? {fn: sortBy} : getterFn, 
                        self.sortDir
                    );
                }

                self.trigger("update", self);
            },


            /**
             * Filter store using a custom filter. This will change store contents
             * and length and you might have to use <code>unfiltered</code> flag
             * in some of the methods later. 
             * @method
             * @param {object|string|regexp|function|boolean} by
             * @param {string|boolean} opt
             * @code metaphorjs-shared/src-docs/examples/filterArray.js
             */
            filter: function(by, opt) {

                var self    = this;

                self.filtered       = true;
                self.filterBy       = by;
                self.filterOpt      = opt;

                self.update();
            },

            /**
             * Clear filter
             * @method
             */
            clearFilter: function() {

                var self    = this;

                if (!self.filtered) {
                    return;
                }

                self.filterBy = null;
                self.filterOpt = null;

                self.update();
            },

            /**
             * Sort array
             * @method
             * @param {string|function} by {
             *  Either a field name to sort by, or a function 
             *  @param {model_Record|object} a
             *  @param {model_Record|object} b 
             *  @returns {int} -1|0|1
             * }
             * @param {string} dir asc|desc
             */
            sort: function(by, dir) {
                var self = this;
                self.sorted = true;
                self.sortBy = by;
                self.sortDir = dir;
                self.update();
            },

            /**
             * Clear sorting
             * @method
             */
            clearSorting: function() {
                var self = this;
                self.sorted = false;
                self.sortBy = null;
                self.sortDir = null;
                self.update();
            },


            onDestroy: function() {

                var self    = this;

                delete allStores[self.id];

                if (self.sourceStore) {
                    self.initSourceStore(self.sourceStore, "un");
                }

                self.clear();

                self.trigger("destroy", self);

                self.$super();
            }

        },

        {
            /**
             * Find store
             * @static
             * @method
             * @param {string} id
             * @returns MetaphorJs.model.Store|null
             */
            lookupStore: function(id) {
                return allStores[id] || null;
            },

            /**
             * Iterate over registered stores
             * @static
             * @method
             * @param {function} fn {
             *  @param {MetaphorJs.model.Store} store
             *  @returns {boolean} return false to stop
             * }
             * @param {object} fnScope
             */
            eachStore: function(fn, fnScope) {

                var id;

                for (id in allStores) {
                    if (fn.call(fnScope, allStores[id]) === false) {
                        break;
                    }
                }
            }
        }
    );
}();







Directive.getDirective("attr", "each")
    .registerType(model_Store, app_StoreRenderer);





Directive.registerTag("transclude", function(scope, node) {
    return dom_transclude(node, true);
});





/**
 * @filter collect
 * @param {array} input Array of objects
 * @param {string} field Field name to collect from objects
 * @returns {array}
 */
MetaphorJs.filter.collect = function(input, scope, prop) {

    var res = [],
        i, l, val;

    if (!input) {
        return res;
    }

    for (i = 0, l = input.length; i < l; i++) {
        val = input[i][prop];
        if (val != undf) {
            res.push(val);
        }
    }

    return res;
};





/**
 * @filter filter
 * See <code>filterArray</code> function
 * @param {array} input
 * @param {string|boolean|regexp|function} by
 * @param {string|boolean|null} opt true | false | "strict"
 * @returns {array}
 */
MetaphorJs.filter.filter = function(val, scope, by, opt) {
    return filterArray(val, by, opt);
};






/**
 * @filter get
 * @param {object} input
 * @param {string} prop {   
 *  Property name or path to property ("a.b.c")
 * }
 * @returns {*}
 */
MetaphorJs.filter.get = function(val, scope, prop) {
    var tmp = (""+prop).split("."),
        key;

    while (key = tmp.shift()) {
        val = val[key];
        if (val === undf) {
            return undf;
        }
    }

    return val;
};








/**
 * @filter join
 * @param {array} input
 * @param {string} separator
 * @returns {string}
 */
MetaphorJs.filter.join = function(input, scope, separator) {

    separator = separator || ", ";

    if (input && input.length) {
        if (!isArray(input)){
            input = toArray(input);
        }
        return input.join(separator);
    }

    return "";
};





/**
 * @filter l
 * @param {string} input Get text value from MetaphorJs.lib.LocalText
 * @returns {string}
 */
MetaphorJs.filter.l = function(key, scope) {
    return scope.$app.lang.get(key);
};






/**
 * @filter limitTo
 * Limit array size or string length
 * @param {array|string} input
 * @param {int} limit
 * @return {array|string}
 */
MetaphorJs.filter.limitTo = function(input, scope, limit) {

    var isS = isString(input);

    if (!isArray(input) && !isS) {
        return input;
    }

    if (Math.abs(Number(limit)) === Infinity) {
        limit = Number(limit);
    } else {
        limit = parseInt(limit, 10);
    }

    if (isS) {
        //NaN check on limit
        if (limit) {
            return limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length);
        } else {
            return "";
        }
    }

    var out = [],
        i, n;

    // if abs(limit) exceeds maximum length, trim it
    if (limit > input.length)
        limit = input.length;
    else if (limit < -input.length)
        limit = -input.length;

    if (limit > 0) {
        i = 0;
        n = limit;
    } else {
        i = input.length + limit;
        n = input.length;
    }

    for (; i<n; i++) {
        out.push(input[i]);
    }

    return out;
};






/**
 * @filter linkify
 * Transform text links into html links
 * @param {string} input Text
 * @param {string} target Optional target parameter
 * @returns {string}
 */
MetaphorJs.filter.linkify = function(input, scope, target){
    target = target ? ' target="'+target+'"' : "";
    if (input) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return input.replace(exp, '<a href="$1"'+target+'>$1</a>');
    }
    return "";
};






/**
 * @filter lowercase
 * Transform to lower case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.lowercase = function(val){
    return (""+val).toLowerCase();
};






/**
 * @filter map
 * @param {array} input
 * @param {string} fnName {
 *  Either a namespace entry, or global function name or 
 *  expression to try against current scope. In any case
 *  it must resolve into a function that accepts 
 *  mapped item as first argument.
 *  @param {*} item
 *  @returns {*}
 * }
 * @returns {array} new array
 */
MetaphorJs.filter.map = function(array, scope, fnName) {

    var i, l,
        res = [],
        fn = ns.get(fnName, true) ||
                window[fnName] ||
                lib_Expression.get(fnName, scope);
    array = array || [];

    if (fn) {
        for (i = 0, l = array.length; i < l; i++) {
            res.push(fn(array[i]));
        }
    }

    return res;
};





/**
 * @filter moment
 * Pass given input value through moment.js lib
 * @param {string|int|Date} input date value
 * @param {string} format date format
 * @returns {string}
 */
MetaphorJs.filter.moment = function(val, scope, format) {
    return val ? moment(val).format(
        lib_Cache.global().get(format, format)
    ) : "";
};






/**
 * @filter moment
 * Pass given input value through numeral.js lib
 * @param {string|int} input 
 * @param {string} format number format
 * @returns {string}
 */
MetaphorJs.filter.numeral = function(val, scope, format) {
    return numeral(val).format(
        lib_Cache.global().get(format, format)
    );
};





/**
 * @filter offset
 * Get slice of array or string starting from offset
 * @param {array|string} input
 * @param {int} offset
 * @returns {array|string}
 */
MetaphorJs.filter.offset = function(input, scope, offset) {

    var isS = isString(input);

    if (!isArray(input) && !isS) {
        return input;
    }

    if (Math.abs(Number(offset)) === Infinity) {
        offset = Number(offset);
    } else {
        offset = parseInt(offset, 10);
    }

    if (isS) {
        return input.substr(offset);
    }
    else {
        return input.slice(offset);
    }
};





/**
 * @filter p 
 * Get plural text form from LocalText lib
 * @param {string} input Lang key
 * @param {int} number Number to find text form for
 * @returns {string}
 */
MetaphorJs.filter.p = function(key, scope, number) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
};






/**
 * @filter p 
 * Get plural text form from LocalText lib
 * @param {int} input Number to find text form for
 * @param {string} key Lang key
 * @returns {string}
 */
MetaphorJs.filter.pl = function(number, scope, key) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
};






(function(){

    /**
     * @filter preloaded
     * Will return true once image is loaded. It will trigger scope check 
     * automatically once the image is loaded.
     * @param {string} input Image url
     * @returns {boolean} 
     */
    var preloaded = MetaphorJs.filter.preloaded = function(val, scope) {

        if (!val) {
            return false;
        }

        var promise = dom_preloadImage.check(val);

        if (promise === true || !promise) {
            return !!promise;
        }

        if (isThenable(promise)) {
            promise.always(function(){
                scope.$check();
            });
            return false;
        }
        else {
            return true;
        }
    };

    preloaded.$undeterministic = true;

    return preloaded;
}());




/**
 * @filter r
 * @param {string} input Render text recursively
 * @returns {string}
 */
MetaphorJs.filter.r = function(input, scope) {
    return scope.$app.lang.get(key);
};






/**
 * @filter sortBy
 * Sort array of objects by object field
 * @param {array} input
 * @param {function|string|object} field {
 *  See <code>sortArray()</code> function
 * }
 * @param {string} dir
 * @returns {array}
 */
MetaphorJs.filter.sortBy = function(val, scope, field, dir) {
    return sortArray(val, field, dir);
};






/**
 * @filter split
 * Split string into parts
 * @param {string} input
 * @param {string|RegExp} separator {
 *  Can also pass "/regexp/" as a string 
 * }
 * @param {int} limit
 * @returns {array}
 */
MetaphorJs.filter.split = function(input, scope, sep, limit) {

    limit       = limit || undf;
    sep         = sep || "/\\n|,/";

    if (!input) {
        return [];
    }

    input       = "" + input;

    if (sep.substr(0,1) === '/' && sep.substr(sep.length - 1) === "/") {
        sep = getRegExp(sep.substring(1, sep.length-1));
    }

    var list = input.split(sep, limit),
        i, l;

    for (i = -1, l = list.length; ++i < l; list[i] = list[i].trim()){}

    return list;
};







/**
 * @filter toArray
 * @code src-docs/code/filter/toArray.js
 * @param {*} input
 * @returns {array}
 */
MetaphorJs.filter.toArray = function(input) {

    if (isPlainObject(input)) {
        var list = [],
            k;
        for (k in input) {
            if (input.hasOwnProperty(k)) {
                list.push({key: k, value: input[k]});
            }
        }
        return list;
    }

    return toArray(input);
};





/**
 * @filter ucfirst
 * Transform first character to upper case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.ucfirst = function(val){
    return val.substr(0, 1).toUpperCase() + val.substr(1);
};






/**
 * @filter uppercase
 * Transform to upper case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.uppercase = function(val){
    return (""+val).toUpperCase();
};









var app_init = MetaphorJs.app.init = function app_init(node, cls, data, autorun) {

    var attrDirs = MetaphorJs.directive.attr;

    var attrs = dom_getAttrSet(node, function(name) {
        return !!attrDirs[name];
    });

    var cfg = attrs.directive.app ? attrs.directive.app.config : {},
        i, l;

    if (attrs.names['app']) {
        for (i = 0, l = attrs.names['app'].length; i < l; i++) {
            dom_removeAttr(node, attrs.names[i]);
        }
    }

    try {
        var p = app_resolve(
                    cls || "MetaphorJs.app.App", 
                    extend({}, cfg), 
                    data, 
                    node, 
                    [node, data]
                );

        if (autorun !== false) {
            return p.done(function(app){
                app.run();
            });
        }
        else {
            return p;
        }
    }
    catch (thrownError) {
        error(thrownError);
        return lib_Promise.reject(thrownError);
    }
};







/**
 * Execute callback when window is ready
 * @function MetaphorJs.dom.onReady
 * @param {function} fn {
 *  @param {Window} win
 * }
 * @param {Window} w optional window object
 */
var dom_onReady = MetaphorJs.dom.onReady = function dom_onReady(fn, w) {

    var done    = false,
        top     = true,
        win     = w || window,
        root, doc,

        init    = function(e) {
            if (e.type == 'readystatechange' && doc.readyState != 'complete') {
                return;
            }

            dom_removeListener(e.type == 'load' ? win : doc, e.type, init);

            if (!done && (done = true)) {
                fn.call(win, e.type || e);
            }
        },

        poll = function() {
            try {
                root.doScroll('left');
            } 
            catch(thrownError) {
                setTimeout(poll, 50);
                return;
            }

            init('poll');
        };

    doc     = win.document;
    root    = doc.documentElement;

    if (doc.readyState == 'complete') {
        fn.call(win, 'lazy');
    }
    else {
        if (doc.createEventObject && root.doScroll) {
            try {
                top = !win.frameElement;
            } 
            catch(thrownError) {}

            top && poll();
        }
        dom_addListener(doc, 'DOMContentLoaded', init);
        dom_addListener(doc, 'readystatechange', init);
        dom_addListener(win, 'load', init);
    }
};









/**
 * Run application
 * @function MetaphorJs.app.run
 * @param {Window} win
 * @param {object} appData
 */
var run = MetaphorJs.app.run = function app_run(w, appData) {

    var win = w || window;

    if (!win) {
        throw new Error("Window object neither defined nor provided");
    }

    dom_onReady(function() {

        var appNodes    = select("[mjs-app]", win.document),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i];
            app_init(
                el,
                dom_getAttr(el, "mjs-app"),
                appData,
                true
            );
        }
    }, win);

};




run();





// add namespace manually
MetaphorJs.validator = MetaphorJs.validator || {};




/**
 * @var {object} MetaphorJs.validator.messages {
 *  Validator error messages. _validator_: "_message_".
 * }
 */
var validator_messages = MetaphorJs.validator.messages = {
    required: 		"This field is required.",
    remote:	 		"Please fix this field.",
    email: 			"Please enter a valid email address.",
    url: 			"Please enter a valid URL.",
    date: 			"Please enter a valid date.",
    dateISO: 		"Please enter a valid date (ISO).",
    number: 		"Please enter a valid number.",
    digits: 		"Please enter only digits.",
    creditcard: 	"Please enter a valid credit card number.",
    equalTo: 		"Please enter the same value again.",
    accept: 		"Please enter a value with a valid extension.",
    maxlength: 		"Please enter no more than {0} characters.",
    minlength: 		"Please enter at least {0} characters.",
    rangelength: 	"Please enter a value between {0} and {1} characters long.",
    range: 			"Please enter a value between {0} and {1}.",
    max: 			"Please enter a value less than or equal to {0}.",
    min: 			"Please enter a value greater than or equal to {0}."
};




var validator_checkable = MetaphorJs.validator.checkable = function(elem) {
    return /radio|checkbox/i.test(elem.type);
};



/**
 * Walk dom tree
 * @function MetaphorJs.dom.eachNode
 * @param {DomNode} el
 * @param {function} fn {
 *  @param {DomNode} el
 * }
 * @param {object} context fn's context
 */
var eachNode = MetaphorJs.dom.eachNode = function dom_eachNode(el, fn, context) {
    var i, len,
        children = el.childNodes;

    if (fn.call(context, el) !== false) {
        for(i =- 1, len = children.length>>>0;
            ++i !== len;
            dom_eachNode(children[i], fn, context)){}
    }
};







// from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
var validator_getLength = MetaphorJs.validator.getLength = function(value, el) {
    var l = 0;
    switch( el.nodeName.toLowerCase() ) {
        case 'select':
            eachNode(el, function(node){
                if (node.selected) {
                    l++;
                }
            });
            return l;
        case 'input':
            if (validator_checkable(el)) {
                if (el.form) {
                    eachNode(el.form, function (node) {
                        if (node.type == el.type && node.name == el.name && 
                            node.checked) {
                            l++;
                        }
                    });
                }
                else {
                    var parent,
                        inputs,
                        i, len;

                    if (isAttached(el)) {
                        parent  = el.ownerDocument;
                    }
                    else {
                        parent = el;
                        while (parent.parentNode) {
                            parent = parent.parentNode;
                        }
                    }

                    inputs  = select("input[name="+ el.name +"]", parent);
                    for (i = 0, len = inputs.length; i < len; i++) {
                        if (inputs[i].checked) {
                            l++;
                        }
                    }
                }
                return l;
            }
    }
    return value.length;
};








// from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
var validator_empty = MetaphorJs.validator.empty = function(value, element) {

    if (!element) {
        return value == undf || value === '';
    }

    switch(element.nodeName.toLowerCase()) {
        case 'select':{
            // could be an array for select-multiple or a string, both are fine this way
            var val = dom_getInputValue(element);
            return !val || val.length == 0;
        }
        case 'input':{
            if (validator_checkable(element))
                return validator_getLength(value, element) == 0;
            break;
        }
    }

    return value.trim().length == 0;
};


///^((https?|ftp):\/\/|)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)|\/|\?)*)?$/i;

// https://gist.github.com/dperini/729294
var regexp_url = MetaphorJs.regexp.url = new RegExp(
    "^" +
        // protocol identifier
    "(?:(?:https?|ftp)://)" +
        // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
        // IP address exclusion
        // private & local networks
    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broacast addresses
        // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
        // host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
        // domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
        // TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    ")" +
        // port number
    "(?::\\d{2,5})?" +
        // resource path
    "(?:/\\S*)?" +
    "$", "i"
);



var regexp_email = MetaphorJs.regexp.email = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;










(function(){

    var empty = validator_empty,
        getLength = validator_getLength;

    // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
    // i've changed most of the functions, but the result is the same.
    // this === field's api.

    return MetaphorJs.validator.methods = {

        /**
         * Checks that field value is not empty
         * @validator required
         * @param {boolean} param 
         */
        required: function(value, element, param) {
            if (param === false) {
                return true;
            }
            return !empty(value, element);
        },

        /**
         * Test field's value using this regular expression. 
         * Empty value passes as success.
         * @validator regexp
         * @param {string|Regexp} param 
         */
        regexp: function(value, element, param) {
            var reg = param instanceof RegExp ? param : new RegExp(param);
            return empty(value, element) || reg.test(value);
        },

        /**
         * Same as validator.regexp but with the opposite result.
         * Empty value passes as success.
         * @validator notregexp
         * @param {string|Regexp} param 
         */
        notregexp: function(value, element, param) {
            var reg = param instanceof RegExp ? param : new RegExp(param);
            return empty(value, element) || !reg.test(value);
        },

        /**
         * Check if field's value length more than param. 
         * Empty value passes as success.
         * @validator minlength
         * @param {string|int} param 
         */
        minlength: function(value, element, param) {
            return empty(value, element) ||
                   (
                       element ?
                       getLength(value.trim(), element) >= param :
                       value.toString().length >= param
                   );
        },

        /**
         * Check if field's value length less than param.
         * Empty value passes as success.
         * @validator maxlength
         * @param {string|int} param 
         */
        maxlength: function(value, element, param) {
            return empty(value, element) ||
                   (
                       element ?
                       getLength(value.trim(), element) <= param:
                       value.toString().length <= param
                   );
        },

        /**
         * Check if field's value length between given range.
         * Empty value passes as success.
         * @validator rangelength
         * @param {array} param [min, max]
         */
        rangelength: function(value, element, param) {
            var length = element ? getLength(value.trim(), element) : value.toString().length;
            return empty(value, element) || ( length >= param[0] && length <= param[1] );
        },

        /**
         * Check if field's value is greater than given number.
         * Empty value passes as success.
         * @validator min
         * @param {int} param 
         */
        min: function(value, element, param) {
            return empty(value, element) || parseInt(value, 10) >= param;
        },

        /**
         * Check if field's value is lesser than given number.
         * Empty value passes as success.
         * @validator max
         * @param {int} param 
         */
        max: function(value, element, param) {
            return empty(value, element) || parseInt(value, 10) <= param;
        },

        /**
         * Check if field's value is between given range.
         * Empty value passes as success.
         * @validator range
         * @param {array} param [min, max]
         */
        range: function(value, element, param) {
            value = parseInt(value, 10);
            return empty(value, element) || ( value >= param[0] && value <= param[1] );
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/email
        /**
         * Check is field's value matches email regexp. 
         * Empty value passes as success.
         * @validator email
         */
        email: function(value, element) {
            // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
            return empty(value, element) || regexp_email.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/url
        /**
         * Check is field's value matches url regexp. 
         * Empty value passes as success.
         * @validator email
         */
        url: function(value, element) {
            // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
            return empty(value, element) || regexp_url.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/date
        /**
         * Check if field's value can be parsed as a date.
         * Empty value passes as success.
         * @validator date
         */
        date: function(value, element) {
            return empty(value, element) || !/Invalid|NaN/.test(new Date(value));
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
        /**
         * Check if field's value can be parsed as a yyyy-mm-dd date.
         * Empty value passes as success.
         * @validator dateiso
         */
        dateiso: function(value, element) {
            return empty(value, element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/number
        /**
         * Check if field's value is a number. Empty value passes as success.
         * @validator number
         */
        number: function(value, element) {
            return empty(value, element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/digits
        /**
         * Check if field's value only consists of digits. Empty value passes as success.
         * @validator digits
         */
        digits: function(value, element) {
            return empty(value, element) || /^\d+$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/creditcard
        // based on http://en.wikipedia.org/wiki/Luhn
        /**
         * Check if field's value passes for credit card number. Empty value passes as success.
         * @validator creditcard
         */
        creditcard: function(value, element) {

            if (empty(value, element)) {
                return true; 
            }

            // accept only digits and dashes
            if (/[^0-9-]+/.test(value)) {
                return false;
            }

            var nCheck 	= 0,
                bEven 	= false,
                nDigit,
                cDigit;

            value = value.replace(/\D/g, "");

            for (var n = value.length - 1; n >= 0; n--) {

                cDigit = value.charAt(n);
                nDigit = parseInt(cDigit, 10);

                if (bEven) {
                    if ((nDigit *= 2) > 9) {
                        nDigit -= 9;
                    }
                }

                nCheck 	+= nDigit;
                bEven 	= !bEven;
            }

            return (nCheck % 10) == 0;
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/accept
        /**
         * Makes a file upload accept only specified mime-types. 
         * Empty value passes as success.
         * @param {string} param mime type string
         */
        accept: function(value, element, param) {
            param = isString(param) ? param.replace(/,/g, '|') : "png|jpe?g|gif";
            return empty(value, element) || value.match(new RegExp(".(" + param + ")$", "i"));
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/equalTo
        /**
         * Check if field's value equals to another field's value
         * @validator equalto
         * @param {*} param Another field's name or id
         */
        equalto: function(value, element, param, api) {
            // bind to the blur event of the target in order to revalidate 
            // whenever the target field is updated

            var f       = api.getValidator().getField(param),
                target  = f ? f.getElem() : param;

            return value == dom_getInputValue(target);
        },

        /**
         * Check if field's value does not equal another field's value
         * @validator notequalto
         * @param {*} param Another field's name or id
         */
        notequalto: function(value, element, param, api) {

            var f       = api.getValidator().getField(param),
                target  = f ? f.getElem() : param;

            return value != dom_getInputValue(target);
        },

        /**
         * Password strength estimator. Expects zxcvbn() 
         * func to be available globally. 
         * @param {*} param 
         */
        zxcvbn: function(value, element, param) {
            return zxcvbn(value).score >= parseInt(param);
        }
    };


}());





var validator_format = MetaphorJs.validator.format = function(str, params) {

    if (isFunction(params)) {
        return str;
    }

    if (!isArray(params)) {
        params = [params];
    }

    var i, l = params.length;

    for (i = -1; ++i < l;
         str = str.replace(new RegExp("\\{" + i + "\\}", "g"), params[i])){}

    return str;
};




















var validator_Field = MetaphorJs.validator.Field = (function(){

    /* ***************************** FIELD ****************************************** */


    /**
     * @object MetaphorJs.validator.Field.defaults
     */
    var defaults = {

        /**
         * @property {boolean} allowSubmit call form.submit() on field's ENTER keyup
         */
        allowSubmit:		true,

        /**
         * @property {boolean} alwaysCheck run tests even the field is proven 
         * valid and hasn't changed since last check
         */
        alwaysCheck:		false,

        /**
         * @property {boolean} alwaysDisplayState 
         */
        alwaysDisplayState:	false,

        /**
         * @property {*} data User data to store with the field
         */
        data:				null,

        /**
         * @property {boolean} ignore put ignore:true to field config to ignore the field completely
         */
        ignore:				null,

        /**
         * @property {boolean} disabled make validator disabled for this field initially
         */
        disabled:			false,

        /**
         * @object cls
         */
        cls: {
            /**
             * @property {string} valid css class for a valid state
             */
            valid: 			'',
            /**
             * @property {string} error css class for an error state
             */
            error:			'',
            /**
             * @property {string} ajax css class for the field with it is being checked remotely
             */
            ajax:			''

            /**
             * @end-object
             */
        },

        // if string is provided, considered errorBox: {tag: '...'}
        /**
         * @object errorBox error box config
         */
        errorBox: {
            /**
             * @property {string} cls error box css class
             */
            cls: 			'',
            /**
             * @property {function} fn {
             *  Must return dom node (cancels auto creation)
             *  @param {MetaphorJs.validator.Field} f
             *  @returns {DomNode}
             * }
             */
            fn:				null,
            /**
             * @property {string} tag Auto-create element with this tag
             */
            tag:			'',
            /**
             * @property {string} position {
             *  before|after|appendParent where to put newly created element
             *  @default after
             * }
             */
            position:		'after',
            /**
             * @property {string|DomNode} elem {
             *  Use this element as error box. (Dom node or selector)
             * }
             */
            elem:			null,
            /**
             * @property {boolean} enabled {
             *  Enable or disable error box
             *  @default true
             * }
             */
            enabled:		true

            /**
             * @end-object
             */
        },

        // callbacks are case insensitive
        // you can use camel case if you like.
        /**
         * @object callback
         */
        callback: {
            /**
             * @property {object} scope all callback's context
             */
            scope:			null,

            /**
             * @property {function} * {
             *  eventName: function(f); See class's events
             *  @param {MetaphorJs.validator.Field} f
             * }
             */

            destroy:		null,			// called when field's validator is being destroyed. fn(api)
            statechange:	null,			// when field's state has been changed. fn(api, (boolean) state)
            errorchange:	null,			// fn(api, error)
            submit:			null,			// when enter key was pressed. fn(api, event). return false to prevent submitting even
            // if the form is valid
            check:          null,           // called after each check (may not be relevant, if there is a ajax check) fn(api, valid)
            beforeAjax:		null,			// when ajax check is about to be executed. fn(api, requestData)
            afterAjax:		null,			// when ajax check ended. fn(api)

            displaystate:	null			// use this to display custom field state: fn(api, valid, error)
            /**
             * @end-object
             */
        },

        /**
         * @property {object} rules {
         *  Keys of this object are validators from 
         *  <code>MetaphorJs.validator.methods</code>, values
         *  of this object are validator params.<br>
         *  Rule can also be a function (custom validator):
         *  fn(fieldValue, dom, ruleValue, field)<br>
         *  The function must return error message, false or true.
         * }
         */
        rules: 				{},

        /**
         * @property {object} messages {
         *  <code>rule: message</code>, error messages 
         * }
         */
        messages: 			{}

        /**
         * @end-object
         */
    };


    var fixFieldShorthands = function(options) {

        if (!options) {
            return {};
        }

        var fix = function(level1, level2, type) {
            var value   = options[level1],
                yes     = false;

            if (value === undf) {
                return;
            }

            switch (type) {
                case "string": {
                    yes     = isString(value);
                    break;
                }
                case "function": {
                    yes     = isFunction(value);
                    break;
                }
                case "boolean": {
                    yes = isBool(value);
                    break;
                }
            }
            if (yes) {
                options[level1] = {};
                options[level1][level2] = value;
            }
        };

        fix("errorBox", "enabled", "boolean");
        fix("errorBox", "tag", "string");
        fix("errorBox", "fn", "function");

        return options;
    };


    var messages = validator_messages,
        methods = MetaphorJs.validator.methods,
        empty = validator_empty,
        format = validator_format;


    /**
     * @class MetaphorJs.validator.Field
     * @mixes mixin_Observable
     */
    return cls({

        /**
         * @event check {
         *  @param {MetaphorJs.validator.Field} f
         *  @param {boolean} valid
         * }
         */
        /**
         * @event display-state {
         *  @param {MetaphorJs.validator.Field} f
         *  @param {boolean} valid
         *  @param {string} error
         * }
         */
        /**
         * @event state-change {
         *  @param {MetaphorJs.validator.Field} f
         *  @param {boolean} valid
         * }
         */
        /**
         * @event error-change {
         *  @param {MetaphorJs.validator.Field} f
         *  @param {string} error 
         *  @param {string} rule
         * }
         */
        /**
         * @event submit {
         *  @param {MetaphorJs.validator.Field} f
         *  @param {MetaphorJs.lib.DomEvent} event
         *  @returns {boolean} return false to cancel
         * }
         */
        /**
         * @event before-ajax {
         *  @param {MetaphorJs.validator.Field} f
         *  @param {object} ajaxCfg
         * }
         */
        /**
         * @event after-ajax {
         *  @param {MetaphorJs.validator.Field} f
         * }
         */
        
        $mixins: [mixin_Observable],

        vldr:           null,
        elem:           null,
        rules:          null,
        cfg:            null,

        input:          null,

        enabled:		true,
        valid:			null,			// the field has been checked and is valid (null - not checked yet)
        dirty:			false,			// the field's value changed, hasn't been rechecked yet
        id:				null,
        prev:			'',
        error:			null,
        errorRule:      null,
        pending: 		null,
        rulesNum:		0,
        displayState:	false,
        data:			null,
        checking:		false,
        checkTmt:		null,
        errorBox:       null,
        customError:    false,

        /**
         * @constructor
         * @method
         * @param {Element} elem 
         * @param {object} options See <code>MetaphorJs.validator.Field.defaults</code>
         * @param {MetaphorJs.validator.Validator} vldr 
         */
        $init: function(elem, options, vldr) {
            options             = options || {};

            var self            = this,
                cfg;

            self.cfg            = cfg = extend({}, defaults,
                fixFieldShorthands(MetaphorJs.validator.Field.defaults),
                fixFieldShorthands(options),
                true, true
            );

            self.input          = lib_Input.get(elem);
            self.input.onChange(self.onInputChange, self);
            self.input.onKey(13, self.onInputSubmit, self);

            self.elem           = elem;
            self.vldr           = vldr;
            self.enabled        = !elem.disabled;
            self.id             = dom_getAttr(elem, 'name') || 
                                    dom_getAttr(elem, 'id');
            self.data           = options.data;
            self.rules			= {};

            cfg.messages        = extend({}, messages, cfg.messages, true, true);

            dom_setAttr(elem, "data-validator", vldr.getVldId());

            if (self.input.radio) {
                self.initRadio();
            }

            if (cfg.rules) {
                self.setRules(cfg.rules, false);
            }

            self.readRules();

            self.prev 	= self.input.getValue();

            if (cfg.disabled) {
                self.disable();
            }
        },

        /**
         * @method
         * @returns {MetaphorJs.validator.Validator}
         */
        getValidator: function() {
            return this.vldr;
        },

        initRadio: function() {

            var self    = this,
                radios  = self.input.radio,
                vldId   = self.vldr.getVldId(),
                i,l;

            for(i = 0, l = radios.length; i < l; i++) {
                dom_setAttr(radios[i], "data-validator", vldId);
            }
        },

        /**
         * Set/add field rules
         * @method
         * @param {object} list {
         *  name: value set of rules. See 
         *  <code>MetaphorJs.validator.Field.defaults.rules</code> 
         * }
         * @param {boolean} check {
         *  Re-check field's validity
         *  @default false
         * }
         */
        setRules: function(list, check) {

            var self    = this;

            check = check == undf ? true : check;

            for (var i in list) {
                self.setRule(i, list[i], false);
            }

            if (check) {
                self.check(false);
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Set/add field rule
         * @method
         * @param {string} rule Validator name
         * @param {*|function} value
         * @param {boolean} check {
         *  Re-check field's validity
         *  @default false
         * }
         */
        setRule: function(rule, value, check) {

            var self    = this,
                rules   = self.rules;

            check = check == undf ? true : check;

            if (value === null) {
                if (rules[rule]) {
                    self.rulesNum--;
                }
                delete rules[rule];
            }
            else {
                if (!rules[rule]) {
                    self.rulesNum++;
                }
                rules[rule] = value;
                if (self.valid !== null) {
                    self.setValidState(false);
                }
            }

            if (check) {
                self.check(false);
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Set rule message
         * @method
         * @param {string} rule
         * @param {string} message
         */
        setMessage: function(rule, message) {
            this.cfg.messages[rule] = message;
            return this;
        },

        /**
         * Set rule messages
         * @method
         * @param {object} messages {
         *  rule: message 
         * }
         */
        setMessages: function(messages) {

            var self = this;

            for (var i in messages) {
                self.setMessage(i, messages[i]);
            }
            return self;
        },

        /**
         * Get rule messages
         * @method 
         * @returns {object}
         */
        getMessages: function() {
            return extend({}, this.cfg.messages);
        },

        /**
         * @ignore
         * Read rules from attributes and classes
         * (this happens on init)
         */
        readRules: function() {

            var self        = this,
                elem        = self.elem,
                cls 		= elem.className,
                found		= {},
                val, i, name, len;

            for (i in methods) {

                if (methods.hasOwnProperty(i)) {

                    val = dom_getAttr(elem, i) || 
                            dom_getAttr(elem, "data-validate-" + i);

                    if (val == undf || val === false) {
                        continue;
                    }
                    if ((i === 'minlength' || i === 'maxlength') && 
                        (val = parseInt(val, 10)) === -1) {
                        continue;
                    }

                    found[i] = val;

                    val = dom_getAttr(elem, "data-message-" + i);
                    val && self.setMessage(i, val);
                }
            }

            if ((val = dom_getAttr(elem, 'remote'))) {
                found['remote'] = val;
            }

            if (cls) {
                cls = cls.split(" ");
                for (i = 0, len = cls.length; i < len; i++) {

                    name = cls[i].trim();

                    if (methods[name] || name === 'remote') {
                        found[name] = true;
                    }
                }
            }

            for (i in found) {
                self.setRule(i, found[i], false);
            }
        },

        setConfigRules: function(config) {
            var self    = this,
                elem    = self.elem,
                val, i;

            for (i in methods) {

                if (methods.hasOwnProperty(i)) {

                    if (config.hasProperty(i)) {
                        config.setDefaultMode(i, lib_Config.MODE_STATIC);
                        config.setDefaultMode(i+".msg", lib_Config.MODE_STATIC);
                    }

                    val = config.get(i);

                    if (val == undf || val === false) {
                        continue;
                    }
                    if ((i === 'minlength' || i === 'maxlength') && 
                        (val = parseInt(val, 10)) === -1) {
                        continue;
                    }

                    self.setRule(i, val, false);

                    val = (config ? config.get(i + ".msg") : null) ||
                            dom_getAttr(elem, "data-message-" + i);
                    val && self.setMessage(i, val);
                }
            }
        },

        /**
         * Get field rules
         * @method
         * @returns {object}
         */
        getRules: function() {
            return this.rules;
        },

        /**
         * @method
         * @param {string} name
         * @return {boolean}
         */
        hasRule: function(name) {
            return this.rules[name] ? true : false;
        },

        /**
         * Get field value
         * @method
         * @returns {string}
         */
        getValue: function() {
            return this.input.getValue();
        },

        /**
         * Get user data
         * @method
         * @returns {*}
         */
        getUserData: function() {
            return this.data;
        },

        /**
         * Set user data
         * @method
         * @param {*} data
         */
        setUserData: function(data) {
            var self    = this,
                old     = self.data;
            self.data = data;
            return old;
        },

        /**
         * Is the field currently empty
         * @method
         * @returns {boolean}
         */
        isEmpty: function() {
            var self = this;
            return empty(self.getValue(), self.elem);
        },

        /**
         * Enable field validation
         * @method
         */
        enable: function() {
            var self = this;
            self.enabled = true;
            self.vldr.reset();
            return self;
        },

        /**
         * Disable field validation
         * @method
         */
        disable: function() {
            var self = this;
            self.enabled = false;

            if (self.valid === false) {
                self.setValidState(true);
                self.doDisplayState();
            }
            return self;
        },

        /**
         * @method
         */
        enableDisplayState:	function() {
            this.displayState = true;
        },

        /**
         * @method
         */
        disableDisplayState:	function() {
            this.displayState = false;
        },

        /**
         * @method
         * @returns {boolean}
         */
        isDisplayStateEnabled: function() {
            return this.displayState;
        },

        /**
         * @method
         * @param {boolean} state 
         */
        toggleErrorBox: function(state) {

            var self    = this,
                cfg     = self.cfg,
                prev    = cfg.errorBox.enabled;

            cfg.errorBox.enabled = state;

            if (!prev && state && state.displayState && self.valid() === false) {
                self.doDisplayState();
            }
        },

        /**
         * @method
         * @returns {boolean}
         */
        isEnabled: function() {
            return this.enabled;
        },

        /**
         * Get field's dom node
         * @method
         * @returns {DomNode}
         */
        getElem: function() {
            return this.elem;
        },

        /**
         * @method
         * @returns {string}
         */
        getName: function() {
            return this.id;
        },

        /**
         * Get current error
         * @method
         * @returns {string|null}
         */
        getError: function() {
            return this.error;
        },

        /**
         * Get the name of last validator that invalidated the field
         * @method
         * @returns {string|null}
         */
        getErrorRule: function() {
            return this.errorRule;
        },

        /**
         * @method
         * @returns {boolean}
         */
        isValid: function() {

            var self = this;

            if (!self.isEnabled()) {
                return true;
            }
            if (self.customError) {
                return false;
            }

            return (self.valid === true && !self.pending) || 
                    self.rulesNum === 0;
        },

        getExactValidState: function() {
            return this.valid;
        },

        /**
         * Set custom error
         * @method
         * @param {string} error 
         * @param {string} rule 
         */
        setCustomError:	function(error, rule) {
            var self = this;
            self.customError = error ? true : false;
            self.setValidState(error ? false : true);
            self.setError(error === true ? null : error, rule);
            self.doDisplayState();
        },

        /**
         * Reset field to untouched state
         * @method
         */
        reset: function() {

            var self = this;

            self.abort();
            self.dirty 	= false;
            self.prev 	= '';

            self.setValidState(null);
            self.setError(null);
            self.doDisplayState();

            return self;
        },

        /**
         * Abort ajax check
         * @method
         */
        abort: function() {
            var self = this;
            if (self.pending) {
                self.pending.abort();
                self.pending = null;
            }
            return self;
        },

        /**
         * Check if field is valid
         * @method
         * @param {boolean} force Check even if field's value haven't changed
         * @returns {boolean}
         */
        check: function(force) {

            var self = this,
                rules = self.rules,
                cfg = self.cfg,
                elem = self.elem;

            // disabled field validator always returns true
            if (!self.isEnabled()) {
                return true;
            }

            if (self.customError) {
                return false;
            }

            // if there are no rules, we return true
            if (self.rulesNum == 0 && self.valid !== false) {
                return true;
            }

            if (self.checking) {
                if (!self.checkTmt) {
                    self.checkTmt	= setTimeout(bind(self.checkTimeout, self), 100);
                }
                return self.valid === true;
            }

            self.checking = true;

            // nothing changed since last check
            // we need to find a way to indicate that (if) this field depends on others
            // and state.dirty doesn't really work in this case
            if (force !== true &&
                !rules.equalTo && !rules.notEqualTo &&
                !self.dirty && self.valid !== null &&
                !cfg.alwaysCheck) {

                if (!self.pending) {
                    self.doDisplayState();
                }

                self.checking = false;
                return self.valid === true;
            }

            var valid 			= true,
                remote 			= false,
                val				= self.getValue(),
                msg;

            for (var i in rules) {

                // we always call remote check after all others
                if (i === 'remote') {
                    if (self.dirty || cfg.alwaysCheck || 
                        self.valid === null || force === true) {
                        if (val || rules[i].checkEmpty) {
                            remote = true;
                        }
                    }
                    continue;
                }

                var fn = isFunction(rules[i]) ? rules[i] : methods[i];

                if ((msg = fn.call(self.$$callbackContext, val, elem, rules[i], self)) !== true) {
                    valid = false;
                    self.setError(format(msg || cfg.messages[i] || "", rules[i]), i);
                    break;
                }
            }

            remote	= remote && valid;

            if (valid) {
                self.setError(null);
            }

            if (!remote) {
                self.setValidState(valid);
                self.doDisplayState();
            }
            else {
                self.ajaxCheck();
            }

            self.dirty = false;
            self.checking = false;

            self.trigger("check", self, self.valid);

            return self.valid === true && !remote;
        },

        doDisplayState: function() {

            var self        = this,
                cfg         = self.cfg,
                valid 		= self.isValid(),
                errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid,
                elem        = self.elem;

            if (!self.displayState && !cfg.alwaysDisplayState) {
                valid	= null;
            }

            if (self.valid === null) {
                valid 	= null;
            }

            if (errorCls) {
                valid === false ? dom_addClass(elem, errorCls) : 
                                    dom_removeClass(elem, errorCls);
            }
            if (validCls) {
                valid === true ? dom_addClass(elem, validCls) : 
                                    dom_removeClass(elem, validCls);
            }

            var box 	= self.getErrorBox(),
                error 	= self.error;

            if (box) {
                if (valid === false && error) {
                    box.innerHTML = state.error;
                }
                box.style.display = valid !== false || !error || !cfg.errorBox.enabled ? 'none' : 'block';
            }

            self.trigger('display-state', self, valid, self.error);
        },

        /**
         * @method
         * @returns {DomNode}
         */
        getErrorBox: function() {

            var self        = this,
                cfg         = self.cfg,
                eb			= cfg.errorBox;

            if (eb.tag || eb.fn || eb.selector) {
                if (!self.errorBox && eb.enabled) {
                    self.createErrorBox();
                }
                return self.errorBox;
            }
            else {
                return null;
            }
        },


        onDestroy: function() {

            var self = this;

            dom_removeAttr(self.elem, "data-validator");

            if (self.errorBox) {
                self.errorBox.parentNode.removeChild(self.errorBox);
            }

            self.input.$destroy();
        },


        /**
         * Is this field still running remote check
         * @method
         * @returns {boolean}
         */
        isPending: function() {
            return this.pending !== null;
        },

        setValidState: function(valid) {

            var self = this;

            if (self.valid !== valid) {
                self.valid = valid;
                self.trigger('state-change', self, valid);
            }
        },


        setError:		function(error, rule) {

            var self = this;

            if (self.error != error || self.errorRule != rule) {
                self.error = error;
                self.errorRule = rule;
                self.trigger('error-change', self, error, rule);
            }
        },


        checkTimeout: function() {

            var self = this;

            self.checkTmt = null;
            if (self.checking) {
                return;
            }
            self.check(false);
        },

        onInputChange: function(val) {

            var self    = this,
                prev    = self.prev;

            if (prev !== val) {
                self.dirty = true;
                self.customError = false;
                self.abort();
                if (!self.pending) {
                    self.check(false);
                }

                self.prev = self.input.getValue();
            }
        },

        onInputSubmit: function(e) {

            e = dom_normalizeEvent(e);

            if (!e.isDefaultPrevented || !e.isDefaultPrevented()) {
                var res = this.trigger("submit", this, e);
                if (res === false) {
                    e.preventDefault();
                    return false;
                }
            }
        },

        createErrorBox: function() {

            var self    = this,
                cfg     = self.cfg,
                eb		= cfg.errorBox,
                tag 	= eb.tag,
                cls		= eb.cls,
                fn		= eb.fn,
                pos		= eb.position,
                dom		= eb.elem;

            if (fn) {
                self.errorBox = fn.call(self.$$callbackContext, self);
            }
            else if(dom) {
                self.errorBox = dom;
            }
            else {
                self.errorBox = window.document.createElement(tag);
                self.errorBox.className = cls;

                var r = self.input.radio,
                    f = r ?
                        r[r - 1] :
                        self.elem;

                if (pos == 'appendParent') {
                    f.parentNode.appendChild(self.errorBox);
                }
                else if (pos == "before") {
                    f.parentNode.insertBefore(self.errorBox, f);
                }
                else {
                    f.parentNode.insertBefore(self.errorBox, f.nextSibling);
                }
            }
        },

        ajaxCheck: function() {

            var self    = this,
                rules   = self.rules,
                elem    = self.elem,
                rm		= rules['remote'],
                val 	= self.getValue(),
                cfg     = self.cfg;

            var acfg 	= extend({}, isString(rm) ? {url: rm} : rm, true);

            //ajax.success 	= self.onAjaxSuccess;
            //ajax.error 		= self.onAjaxError;
            acfg.data 		= acfg.data || {};
            acfg.data[acfg.paramName || dom_getAttr(elem, 'name') || 
                                        dom_getAttr(elem, 'id')] = val;

            if (!acfg.handler) {
                acfg.dataType 	= 'text';
            }

            acfg.cache 		= false;

            if (cfg.cls.ajax) {
                dom_addClass(elem, cfg.cls.ajax);
            }

            self.trigger('before-ajax', self, acfg);

            self.pending = ajax(acfg);

            self.pending.done(bind(self.onAjaxSuccess, self));
            self.pending.fail(bind(self.onAjaxError, self));
        },

        onAjaxSuccess: function(data) {

            var self    = this,
                rules   = self.rules,
                cfg     = self.cfg;

            self.pending 	= null;
            var valid 		= true;

            if (rules['remote'].handler) {

                var res = rules['remote'].handler.call(self.$$callbackContext, self, data);

                if (res !== true) {
                    self.setError(format(res || cfg.messages['remote'] || "", rules['remote']), 'remote');
                    valid 		= false;
                }
            }
            else {
                if (data) {
                    self.setError(data, 'remote');
                    valid 		= false;
                }
                else {
                    self.setError(null);
                }
            }

            if (cfg.cls.ajax) {
                dom_removeClass(self.elem, cfg.cls.ajax);
            }

            self.setValidState(valid);
            self.doDisplayState();
            self.trigger('after-ajax', self);
        },

        onAjaxError: function(xhr, status) {

            var self        = this,
                cfg         = self.cfg,
                response    = xhr.responseData,
                rules       = self.rules;

            if (response && rules['remote'].handler) {

                var res = rules['remote'].handler.call(self.$$callbackContext, self, response);

                if (res !== true) {
                    self.setError(format(res || cfg.messages['remote'] || "", rules['remote']), 'remote');
                }
            }

            if (cfg.cls.ajax) {
                dom_removeClass(self.elem, cfg.cls.ajax);
            }

            self.pending = null;

            if (status != 'abort' && xhr != "abort") {
                self.setValidState(false);
                self.doDisplayState();
                self.trigger('after-ajax', self);
            }
        }
    }, {

        defaults: {},
        messages: {}

    });


}());












var validator_Group = MetaphorJs.validator.Group = (function(){


/* ***************************** GROUP ****************************************** */


    /**
     * @object MetaphorJs.validator.Group.defaults
     */
    var defaults	= {

        /**
         * @property {boolean} alwaysCheck run tests even the group is proven 
         * valid and hasn't changed since last check
         */
        alwaysCheck:		false,

        /**
         * @property {boolean} alwaysDisplayState 
         */
        alwaysDisplayState:	false,

        /**
         * @property {boolean} disabled Make group disabled by default
         */
        disabled:			false,

        /**
         * @property {function} value { 
         *  @param {object} values Field values - name:value
         *  @param {MetaphorJs.validator.Group} g 
         *  @returns {*} group value
         * }
         */
        value:				null,

        /**
         * @property {DomNode} elem Group's dom node. 
         */
        elem:				null,			// dom node

        /**
         * @property {string|DomNode|function} errorBox {
         *  string: either field name/id or selector<br>
         *  function: fn(MetaphorJs.validator.Group)
         * }
         */
        errorBox:			null,			

        /**
         * @property {string} errorField field's name or id - where to display group's error
         */
        errorField:			null,

        /**
         * @property {*} data User data
         */
        data:				null,

        /**
         * @object cls
         */
        cls: {
            /**
             * @property {string} valid Css class for valid state
             */
            valid: 			'',
            /**
             * @property {string} error Css class for error state
             */
            error:			''

            /**
             * @end-object
             */
        },

        /**
         * @property {array} fields Array of field names/ids
         */
        fields:				[],

        /**
         * @property {object} rules {
         *  Keys of this object are validators from 
         *  <code>MetaphorJs.validator.methods</code>, values
         *  of this object are validator params.<br>
         *  Rule can also be a function (custom validator):
         *  fn(fieldValue, dom, ruleValue, field)<br>
         *  The function must return error message, false or true.
         * }
         */
        rules:				{},

        /**
         * @property {object} messages {
         *  <code>rule: message</code>, error messages 
         * }
         */
        messages:			{},

        /**
         * @object callback
         */
        callback:		{
            /**
             * @property {object} scope all callback's context
             */
            scope:			null,

            /**
             * @property {function} * {
             *  eventName: function(f); See class's events
             *  @param {MetaphorJs.validator.Field} f
             * }
             */
            destroy:		null,
            statechange:	null,
            errorchange:	null,
            displaystate:	null

            /**
             * @end-object
             */
        }

        /**
         * @end-object
         */
    };


    var messages = validator_messages,
        methods = MetaphorJs.validator.methods,
        format = validator_format;


    /**
     * @class MetaphorJs.validator.Group
     * @mixes mixin_Observable
     */
    return cls({

        /**
         * @event error-change {
         *  @param {MetaphorJs.validator.Group} grp
         *  @param {string} error
         * }
         */
        /**
         * @event display-state {
         *  @param {MetaphorJs.validator.Group} grp
         *  @param {boolean} valid
         * }
         */
        /**
         * @event state-change {
         *  @param {MetaphorJs.validator.Group} grp
         *  @param {boolean} valid
         * }
         */
        /**
         * @event field-state-change {
         *  @param {MetaphorJs.validator.Group} grp
         *  @param {MetaphorJs.validator.Field} fld 
         *  @param {boolean} valid
         * }
         */

        $mixins: [mixin_Observable],

        fields:         null,
        rules:          null,
        cfg:            null,
        vldr:           null,
        enabled:		false,
        invalid:		null,
        valid:			null,
        displayState:	false,
        rulesNum:	    0,
        error:			null,
        data:			null,
        errorBox:		null,
        el:			    null,

        /**
         * @constructor
         * @method
         * @param {object} options See <code>MetaphorJs.validator.Group.defaults</code>
         * @param {MetaphorJs.validator.Validator} vldr 
         */
        $init: function(options, vldr) {

            options     = options || {};

            var self            = this,
                cfg;

            self._vldr          = vldr;

            self.cfg            = cfg = extend({},
                defaults,
                MetaphorJs.validator.Group.defaults,
                options,
                true, true
            );

            self.data           = options.data;
            self.el             = options.elem;
            self.fields         = {};
            self.rules		    = {};

            cfg.messages        = extend({}, messages, cfg.messages, true, true);

            var i, len;

            if (cfg.rules) {
                self.setRules(cfg.rules, false);
            }

            if (cfg.fields) {
                for (i = 0, len = options.fields.length; i < len; i++) {
                    self.add(vldr.getField(cfg.fields[i]));
                }
            }

            self.enabled = !cfg.disabled;
        },

        /**
         * Enable group (enabled by default)
         * @method
         */
        enable:		function() {
            this.enabled	= true;
            return this;
        },

        /**
         * Disable group
         * @method
         */
        disable:	function() {
            this.enabled	= false;
            return this;
        },

        /**
         * Is group enabled
         * @method
         * @return {boolean}
         */
        isEnabled:	function() {
            return this.enabled;
        },

        /**
         * Are all fields in this group valid
         * @method
         * @return {boolean}
         */
        isValid:		function() {
            var self = this;
            return !self.enabled || (self.invalid === 0 && self.valid === true);
        },

        /**
         * @method
         * @return {boolean|null}
         */
        getExactValidState: function() {
            return this.valid;
        },

        /**
         * Reset group
         * @method
         */
        reset:		function() {
            var self = this;
            self.invalid	= 0;
            self.setValidState(null);
            self.setError(null);
            self.doDisplayState();
            return self;
        },

        /**
         * Get user data specified in group config
         * @method
         * @returns {*}
         */
        getUserData: function() {
            return this.data;
        },

        /**
         * Get group name
         * @method
         * @returns {string}
         */
        getName: function() {
            return this.cfg.name;
        },

        /**
         * Set group's rules
         * @method
         * @param {object} list {rule: param}
         * @param {bool} check Re-check group
         */
        setRules: 	function(list, check) {

            var self = this;

            check = check == undf ? true : check;

            for (var i in list) {
                self.setRule(i, list[i], false);
            }

            if (check) {
                self.check();
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Add group rule
         * @method
         * @param {string} rule
         * @param {*} value
         * @param {boolean} check Re-check group
         */
        setRule:	function(rule, value, check) {

            var self = this,
                rules = self.rules;

            check = check == undf ? true : check;

            if (value === null) {
                if (rules[rule]) {
                    self.rulesNum--;
                }
                delete rules[rule];
            }
            else {
                if (!rules[rule]) {
                    self.rulesNum++;
                }
                rules[rule] = value;
                if (self.valid !== null) {
                    self.setValidState(false);
                }
            }

            if (check) {
                self.check();
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Get group rules
         * @method
         * @returns {name: value}
         */
        getRules:	function() {
            return extend({}, this.rules);
        },

        /**
         * @method
         * @param {string} name
         * @returns {boolean}
         */
        hasRule:	function(name) {
            return this.rules[name] ? true : false;
        },

        /**
         * Set group custom error
         * @method
         * @param {string} error
         */
        setError:	function(error) {

            var self = this,
                cfg = self.cfg;

            if (self.error != error) {

                if (cfg.errorField) {
                    self.vldr.getField(cfg.errorField).setError(error);
                    self.error = null;
                }
                else {
                    self.error = error;
                    self.trigger('error-change', self, error);
                }
            }
        },

        /**
         * Get current error
         * @method
         * @returns {string}
         */
        getError: function() {
            return this.error;
        },

        /**
         * @method 
         * @returns {object} 
         */
        getFields: function() {
            return this.fields;
        },

        /**
         * @method
         */
        enableDisplayState:		function() {
            this.displayState	= true;
            return this;
        },

        /**
         * @method
         */
        disableDisplayState:	function() {
            this.displayState	= false;
            return this;
        },

        /**
         * @method
         * @returns {boolean}
         */
        check: function() {

            var self    = this,
                cfg     = self.cfg,
                fields  = self.fields,
                rules   = self.rules;

            if (!self.enabled || self.rulesNum == 0) {
                self.setValidState(null);
                self.doDisplayState();
                return true;
            }

            self.countInvalid();

            if (self.invalid > 0) {
                self.setValidState(null);
                self.doDisplayState();
                return true;
            }

            var vals	= {},
                valid	= true,
                val		= null,
                msg,
                i;

            if (cfg.value) {

                for (i in fields) {
                    vals[i]	= fields[i].getValue();
                }

                val	= cfg.value.call(self.$$callbackContext, vals, self);
            }

            for (i in rules) {

                var fn = isFunction(rules[i]) ? rules[i] : methods[i];

                if ((msg = fn.call(self.$$callbackContext, val, null, rules[i], self, vals)) !== true) {

                    valid = false;

                    if (msg || cfg.messages[i]) {
                        self.setError(format(msg || cfg.messages[i] || "", rules[i]));
                    }
                    else {
                        self.setError(null);
                    }

                    break;
                }

            }

            if (valid) {
                self.setError(null);
            }

            self.setValidState(valid);
            self.doDisplayState();

            return self.valid === true;
        },

        doDisplayState:			function() {

            var self    = this,
                valid	= self.valid,
                cfg     = self.cfg;

            if (!self.displayState && !cfg.alwaysDisplayState) {
                valid	= null;
            }

            if (cfg.errorBox) {

                var ebox = self.getErrorBox();

                if (valid !== null) {

                    if (ebox) {
                        ebox.innerHTML = self.error || '';
                        ebox.style.display = self.valid === false ? 'block' : 'none';
                    }
                }
                else {
                    if (ebox) {
                        ebox.style.display = "none";
                    }
                }
            }

            var errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid;

            valid = self.valid;

            if (errorCls) {
                valid === false ? dom_addClass(self.el, errorCls) : 
                                    dom_removeClass(self.el, errorCls);
            }
            if (validCls) {
                valid === true ? dom_addClass(self.el, validCls) : 
                                    dom_removeClass(self.el, validCls);
            }

            self.trigger('display-state', self, self.valid);
        },

        /**
         * @method
         * @returns {DomNode}
         */
        getErrorBox: function() {

            var self    = this,
                cfg     = self.cfg,
                fields  = self.fields,
                eb	    = cfg.errorBox;

            if (fields[eb]) {
                return fields[eb].getErrorBox();
            }
            else if (!self.errorBox) {

                if (isFunction(cfg.errorBox)) {
                    self.errorBox	= cfg.errorBox.call(self.$$callbackContext, self);
                }
                else {
                    self.errorBox	= cfg.errorBox;
                }
            }

            return self.errorBox;
        },


        onDestroy:	function() {

            var self    = this,
                fields  = self.fields;

            for (var i in fields) {
                if (fields[i]) {
                    self.setFieldEvents(fields[i], 'un');
                }
            }

            if (self.errorBox) {
                self.errorBox.parentNode.removeChild(self.errorBox);
            }
        },

        /**
         * Add field to the group
         * @method
         * @param {MetaphorJs.validator.Field} field 
         */
        add:		function(field) {

            var self    = this,
                fields  = self.fields,
                id	    = field.getName();

            if (!fields[id]) {
                fields[id] 	= field;

                self.setFieldEvents(field, 'on');
            }
        },

        setFieldEvents:		function(f, mode) {
            var self = this;
            f[mode]('state-change', self.onFieldStateChange, self);
        },

        /**
         * Remove field from the group
         * @method
         * @param {MetaphorJs.validator.Field} field 
         */
        remove:		function(field) {

            var self    = this,
                fields  = self.fields,
                id	    = field.getName();

            if (fields[id]) {
                delete fields[id];
                self.setFieldEvents(field, 'un');
            }

            return self;
        },

        setValidState:			function(valid) {
            var self = this;
            if (self.valid !== valid) {
                self.valid = valid;
                self.trigger('state-change', self, valid);
            }
        },

        countInvalid:			function() {

            var self = this,
                fields = self.fields;

            self.invalid	= 0;
            for (var i in fields) {
                self.invalid += fields[i].isValid() ? 0 : 1;
            }
        },

        onFieldStateChange:		function(f, valid) {
            var self = this;
            self.trigger("field-state-change", self, f, valid);
            self.check();
        }
    }, {

        defaults: {}
    });

}());













    




var validator_Validator = MetaphorJs.validator.Validator = (function(){


    var validators  = {};

    var Field = validator_Field,
        Group = validator_Group;


    /**
     * @object MetaphorJs.validator.Validator.defaults
     */
    var defaults = {

        /**
         * @property {Element} form The form being validated
         */
        form:               null,

        /**
         * @property {object} all All fields properties. 
         * See <code>validator_Field.defaults</code>
         */
        all: 				{},

        /**
         * @property {object} fields {
         *  <code>name: config</code>. 
         * For config see <code>validator_Field.defaults</code>.
         * }
         */
        fields: 			{},

        /**
         * @property {object} rules {
         *  <code>field: []</code> set of rules. 
         *  See <code>validator_Field.defaults</code> for rules description.
         * }
         */
        rules: 				{},				// {field: rules}

        /**
         * Css classes to apply to the form
         * @object cls
         */
        cls: {
            /**
             * @property {string} valid Form is valid
             */
            valid: 			'',	
            /**
             * @property {string} valid Form has an error
             */	
            error:			'',			
            /**
             * @property {string} valid Form is being checked (async check)
             */
            checking:		''

            /**
             * @end-object
             */
        },

        /**
         * @property {object} groups {
         *  <code>name: cfg</code> set of options. 
         * See <code>validator_Group.defaults</code>.
         * }
         */
        groups: 			{},				// see groupDefaults. {name: cfg}

        // callbacks are case insensitive
        // you can use camel case if you like.
        /**
         * @object callback
         */
        callback: {
            /**
             * @property {object} scope all callback's context
             */
            scope:			null,

            /**
             * @property {function} * {
             *  eventName: function(v); See class's events
             *  @param {MetaphorJs.validator.Validator} v
             * }
             */

            destroy:		null,			// when validator is being destroyed. fn(api)
            reset:			null,			// when the form was resetted. fn(api)
            beforesubmit:	null,			// when form is about to be submitted: valid and non-valid. fn(api)
            submit:			null,			// when form is about to be submitted: only valid. fn(api).
            // return false to prevent submitting
            statechange:	null,			// when form's state has been changed. fn(api, state)
            check:			null,			// fn(api) performe some additional out-of-form checks
            // if false is returned, form becomes invalid

            displaystate:	null,			// fn(api, valid)
            displaystatechange:	null		// fn(api, state)

            /**
             * @end-object
             */
        }
        /**
         * @end-object
         */
    };


    /**
     * @class MetaphorJs.validator.Validator
     * @mixes mixin_Observable
     */
    var Validator = cls({

        /**
         * @event display-state-change {
         *  When displayState has been enabled or disabled
         *  @param {MetaphorJs.validator.Validator} v
         *  @param {boolean} state
         * }
         */
        /**
         * @event check {
         *  When form is being checked
         *  @param {MetaphorJs.validator.Validator} v
         *  @returns {boolean} return false to cancel check
         * }
         */
        /**
         * @event state-change {
         *  After form check, if it changed its state
         *  @param {MetaphorJs.validator.Validator} v
         *  @param {boolean} valid 
         * }
         */
        /**
         * @event reset {
         *  @param {MetaphorJs.validator.Validator} v
         * }
         */
        /**
         * @event before-submit {
         *  @param {MetaphorJs.validator.Validator} v
         *  @returns {boolean} return false to cancel submitting
         * }
         */
        /**
         * @event submit {
         *  @param {MetaphorJs.validator.Validator} v
         *  @returns {boolean} return false to cancel submitting
         * }
         */
        /**
         * @event failed-submit {
         *  @param {MetaphorJs.validator.Validator} v
         * }
         */
        /**
         * @event field-error-change {
         *  @param {MetaphorJs.validator.Validator} v
         *  @param {validator_Field} f 
         *  @param {string} error
         * }
         */
        /**
         * @event field-state-change {
         *  @param {MetaphorJs.validator.Validator} v
         *  @param {validator_Field} f 
         *  @param {boolean} valid
         * }
         */
        /**
         * @event display-state {
         *  @param {MetaphorJs.validator.Validator} v
         *  @param {boolean} valid
         * }
         */

        $mixins: [mixin_Observable],

        id:             null,
        el:             null,
        cfg:            null,
        enabled: 		false,
        invalid:		null,					// array of invalid fields
        pending: 		0,						// number of pending requests
        grps:			0,						// number of invalid groups
        outside:		true,					// true - outside check passed or not present
        submitted:		false,
        displayState:	false,
        isForm: 		false,
        isField: 		false,
        submitButton: 	null,
        hidden:			null,

        preventFormSubmit: false,

        fields:         null,
        groups:         null,


        /**
         * @constructor
         * @method
         * @param {Element} el 
         * @param {object} options See <code>MetaphorJs.validator.Validator.defaults</code>
         */

        /**
         * @constructor
         * @method
         * @param {Element} el 
         * @param {string} preset Preset name to take options from. 
         * (Preset options will be overriden by <code>options</code>)
         * @param {object} options See <code>MetaphorJs.validator.Validator.defaults</code>
         */
        $init: function(el, preset, options) {

            var self    = this,
                tag     = el.nodeName.toLowerCase(),
                cfg;

            self.id     = nextUid();
            validators[self.id] = self;

            dom_setAttr(el, "data-validator", self.id);

            self.el     = el;

            if (preset && !isString(preset)) {
                options         = preset;
                preset          = null;
            }

            self.cfg            = cfg = extend({}, defaults, Validator.defaults, Validator[preset], options, true, true);

            self.$initObservable(cfg);

            self.isForm         = tag === 'form';
            self.isField        = /input|select|textarea/.test(tag);

            self.fields         = {};
            self.groups         = {};

            self.$$observable.createEvent("submit", false);
            self.$$observable.createEvent("beforesubmit", false);

            self.onRealSubmitClickDelegate  = bind(self.onRealSubmitClick, self);
            self.resetDelegate = bind(self.reset, self);
            self.onSubmitClickDelegate = bind(self.onSubmitClick, self);
            self.onFormSubmitDelegate = bind(self.onFormSubmit, self);

            var i;

            self.initFields();

            var fields  = self.fields;

            for (i in cfg.rules) {
                if (!fields[i]) {
                    continue;
                }
                fields[i].setRules(cfg.rules[i], false);
            }

            cfg.rules	= null;

            for (i in cfg.groups) {
                self.addGroup(i, cfg.groups[i]);
            }

            self.initForm('bind');

            delete cfg.rules;
            delete cfg.fields;
            delete cfg.groups;

            self.enabled = true;
        },

        /**
         * Get validator id
         * @method
         * @returns {string}
         */
        getVldId:       function() {
            return this.id;
        },

        /**
         * Get form element
         * @method
         * @returns {Element}
         */
        getElem:        function() {
            return this.el;
        },

        /**
         * Get group by its name
         * @method
         * @param {string} name
         * @returns {validator_Group}
         */
        getGroup: function(name) {
            return this.groups[name] || null;
        },

        /**
         * Get field by name or id
         * @method
         * @param {string} id
         * @return {validator_Field}
         */
        getField:	function(id) {
            return this.fields[id] || null;
        },

        /**
         * Enable validator (enabled by default)
         * @method
         */
        enable: function() {
            this.enabled = true;
            return this;
        },

        /**
         * Disable validator
         * @method
         */
        disable: function() {
            this.enabled = false;
            return this;
        },

        /**
         * Is this validator enabled
         * @method
         * @returns {boolean}
         */
        isEnabled: function() {
            return this.enabled;
        },

        /**
         * Make validator show form errors and other messages. (Enabled by default)
         * @method
         */
        enableDisplayState:	function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups,
                i;

            if (self.displayState !== true) {

                self.displayState = true;

                for (i in fields) {
                    fields[i].enableDisplayState();
                }
                for (i in groups) {
                    groups[i].enableDisplayState();
                }

                self.trigger('display-state-change', self, true);
            }

            return self;
        },

        /**
         * Make validator not show form errors and other messages
         * @method
         */
        disableDisplayState:	function() {

            var self    = this,
                groups  = self.groups,
                fields  = self.fields,
                i;

            if (self.displayState !== false) {

                self.displayState = false;

                for (i in fields) {
                    fields[i].disableDisplayState();
                }
                for (i in groups) {
                    groups[i].disableDisplayState();
                }

                self.trigger('display-state-change', self, false);
            }

            return self;
        },

        /**
         * Check if form shows errors and messages
         * @method
         * @return {boolean}
         */
        isDisplayStateEnabled:	function() {
            return this.displayState;
        },

        /**
         * Is the form valid
         * @return {boolean}
         */
        isValid: function() {

            var self    = this;

            if (self.enabled === false) {
                return true;
            }
            return 	self.invalid === 0 &&
                      self.pending === 0 &&
                      self.grps === 0 &&
                      self.outside === true;
        },

        /**
         * Get form errors
         * @method 
         * @param {boolean} plain {
         *  If plain=true, will return array [err, err], if false (default),
         *  object: (field: err, field: err)
         * }
         * @returns {array|object}
         */
        getErrors: function(plain) {

            var self    = this,
                ers     = plain === true ? [] : {},
                err,
                i, j,
                all     = [self.fields, self.groups],
                curr;

            if (!self.isEnabled()) {
                return ers;
            }

            for (j = 0; j < 2; j++) {

                curr = all[j];

                for (i in curr) {
                    if (curr[i].getExactValidState() === null) {
                        curr[i].check();
                    }

                    if (!curr[i].isValid()) {

                        err = curr[i].getError();

                        // it can be invalid, but have no error
                        if (err) {
                            if (plain) {
                                ers.push(err);
                            }
                            else {
                                ers[i] = err;
                            }
                        }
                    }
                }
            }

            return ers;
        },


        /**
         * Check form for errors
         * @method
         * @returns {boolean} returns current form state 
         * (it may change in a second after remote checks)
         */
        check: function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups;

            // disabled field validator always returns true
            if (!self.isEnabled()) {
                return true;
            }

            var prevValid	= self.isValid(),
                nowValid,
                i;

            for (i in fields) {
                fields[i].check();
            }

            for (i in groups) {
                groups[i].check();
            }

            self.outside 	= self.trigger('check', self) !== false;
            nowValid		= self.isValid();

            if (prevValid != nowValid) {
                self.doDisplayState();
                self.trigger('state-change', self, false);
            }

            return nowValid;
        },


        /**
         * Add field
         * @method 
         * @param {Element} node
         * @param {object} fieldCfg See <code>validator_Field.defaults</code>
         * @returns {MetaphorJs.validator.Validator}
         */
        add: function(node, fieldCfg) {

            var self    = this;

            if (!dom_isField(node)) {
                return self;
            }
            if (dom_getAttr(node, "data-no-validate") !== null) {
                return self;
            }
            if (dom_getAttr(node, "data-validator") !== null) {
                return self;
            }

            var id 			= dom_getAttr(node, 'name') || 
                                dom_getAttr(node, 'id'),
                cfg         = self.cfg,
                fields      = self.fields,
                fcfg,
                f;

            if (!id) {
                return self;
            }

            fcfg 	= cfg.fields && cfg.fields[id] ? cfg.fields[id] : (fieldCfg || {});

            if (isString(fcfg)) {
                fcfg 	= {rules: [fcfg]};
            }

            fcfg 	= extend({}, cfg.all || {}, fcfg, true, true);

            if (fcfg.ignore) {
                return self;
            }

            if (!fcfg.callback) {
                fcfg.callback = {
                    context:	self.$$callbackContext
                };
            }

            f       = new Field(node, fcfg, self);
            fcfg    = null;
            id      = f.getName();

            if (fields[id]) {
                return self; // already added
            }

            fields[id] = f;

            self.setFieldEvents(f, 'on');

            if (self.displayState) {
                f.enableDisplayState();
            }

            if (self.isEnabled() && self.invalid !== null) {
                f.check();
            }

            return self;
        },

        /**
         * Add group of fields
         * @method
         * @param {string} name
         * @param {object} cfg See <code>validator_Group.defaults</code>
         * @returns {MetaphorJs.validator.Validator}
         */
        addGroup:		function(name, cfg) {

            var self    = this,
                groups  = self.groups;

            if (!groups[name]) {

                cfg.name		= name;

                groups[name]	= new Group(cfg, self);
                self.setGroupEvents(groups[name], 'on');

                if (self.isEnabled() && self.invalid !== null) {
                    groups[name].check();
                }
            }

            return self;
        },


        /**
         * Focus first invalid field
         * @method
         */
        focusInvalid: function() {
            var fields  = this.fields;
            for (var i in fields) {
                if (!fields[i].isValid()) {
                    fields[i].getElem().focus();
                    return;
                }
            }
        },


        /**
         * Reset validator: reset all groups and fields to untouched state.
         * @method
         */
        reset: function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups,
                i;

            self.submitted 	= false;

            self.disableDisplayState();

            for (i in groups) {
                groups[i].reset();
            }

            for (i in fields) {
                fields[i].reset();
            }

            self.pending 		= 0;
            self.invalid 		= null;
            self.grps			= 0;
            self.outside		= false;

            self.doDisplayState();
            self.trigger('reset', self);

            return self;
        },


        /**
         * Submit form or display errors
         * @method
         */
        submit: function() {

            var self    = this,
                el      = self.el;

            if (!self.isForm) {
                self.onSubmit();
                return;
            }

            if (isFunction(el.submit)) {

                if (self.trigger('before-submit', self) !== false &&
                    self.trigger('submit', self) !== false) {
                    el.submit();
                }
            }
            else {
                self.onSubmit();
            }
        },

        setFieldEvents: function(v, mode) {
            var self    = this;
            v[mode]('state-change', self.onFieldStateChange, self);
            v[mode]('before-ajax', self.onBeforeAjax, self);
            v[mode]('after-ajax', self.onAfterAjax, self);
            v[mode]('submit', self.onFieldSubmit, self);
            v[mode]('destroy', self.onFieldDestroy, self);
            v[mode]('error-change', self.onFieldErrorChange, self);
        },

        setGroupEvents:	function(g, mode) {
            g[mode]('state-change', this.onGroupStateChange, this);
        },


        initFields: function() {

            var self    = this,
                el      = self.el,
                els, i, l;

            if (self.isField) {
                self.add(el);
                return self;
            }

            els = select("input, textarea, select", el);

            for (i = -1, l = els.length; ++i < l; self.add(els[i])){}

            return self;
        },

        initForm: function(mode) {

            var self    = this,
                el      = self.el,
                nodes   = el.getElementsByTagName("input"),
                submits = select(".submit", el),
                resets  = select(".reset", el),
                fn      = mode === "bind" ? dom_addListener : 
                                            dom_removeListener,
                i, l,
                type,
                node;

            for (i = 0, l = nodes.length; i < l; i++) {
                node = nodes[i];
                type = node.type;
                if (type === "submit") {
                    fn(node, "click", self.onRealSubmitClickDelegate);
                }
                else if (type === "reset") {
                    fn(node, "click", self.resetDelegate);
                }
            }

            for (i = -1, l = submits.length; ++i < l;){
                if (submits[i].type !== "submit" || 
                    submits[i].tagName.toLowerCase() === "button")  {
                    fn(submits[i], "click", self.onSubmitClickDelegate);
                }
            }

            for (i = -1, l = resets.length;
                 ++i < l;
                 resets[i].type !== "reset" && fn(resets[i], "click", self.resetDelegate)
            ){}

            if (self.isForm) {
                fn(el, "submit", self.onFormSubmitDelegate);
            }
        },

        onRealSubmitClick: function(e) {
            e = dom_normalizeEvent(e || window.event);
            this.submitButton  = e.target || e.srcElement;
            this.preventFormSubmit = false;
            return this.onSubmit(e);
        },

        onSubmitClick: function(e) {
            this.preventFormSubmit = false;
            return this.onSubmit(dom_normalizeEvent(e || window.event));
        },

        onFormSubmit: function(e) {
            e = dom_normalizeEvent(e);
            if (!this.isValid() || this.preventFormSubmit) {
                e.preventDefault();
                return false;
            }

        },

        onFieldSubmit: function(fapi, e) {
            var self    = this;
            self.preventFormSubmit = false;
            self.enableDisplayState();
            self.submitted = true;

            return self.onSubmit(e);
        },

        onSubmit: function(e) {
            var self    = this;

            self.enableDisplayState();

            if (!self.isForm) {
                e && e.preventDefault();
                e && e.stopPropagation();
            }

            if (self.pending) {
                e && e.preventDefault();
                return false;
            }

            var buttonClicked = !!self.submitButton;

            if (self.isForm) {

                if (self.hidden) {
                    self.el.removeChild(self.hidden);
                    self.hidden = null;
                }

                // submit button's value is only being sent with the form if you click the button.
                // since there can be a delay due to ajax checks and the form will be submitted later
                // automatically, we need to create a hidden field
                if (self.submitButton && /input|button/.test(self.submitButton.nodeName)) {
                    self.hidden = window.document.createElement("input");
                    self.hidden.type = "hidden";
                    dom_setAttr(self.hidden, "name", self.submitButton.name);
                    self.hidden.value = self.submitButton.value;
                    self.el.appendChild(self.hidden);
                }
            }

            self.submitButton = null;

            if (!self.isValid()) {
                self.check();
                self.onFieldStateChange();

                if (self.pending) {
                    // TODO: find out why this flag is not being set in all onSubmit handlers
                    self.submitted = true;
                    e && e.preventDefault();
                    return false;
                }
            }

            if (self.trigger('before-submit', self) === false || !self.isValid()) {

                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if (!self.pending) {
                    self.focusInvalid();
                    self.submitted = false;
                }

                self.trigger('failed-submit', self, buttonClicked);
                return false;
            }

            if (!self.pending) {
                self.submitted = false;
            }

            var res = self.trigger('submit', self);
            self.preventFormSubmit = res === false;
            return !self.isForm ? false : res;
        },

        onFieldDestroy: function(f) {

            var elem 	= f.getElem(),
                id		= dom_getAttr(elem, 'name') || 
                            dom_getAttr(elem, 'id');

            delete this.fields[id];
        },

        onFieldErrorChange: function(f, error) {
            this.trigger("field-error-change", this, f, error);
        },

        onFieldStateChange: function(f, valid) {

            var self        = this,
                num 		= self.invalid,
                fields      = self.fields;

            self.invalid 	= 0;

            for (var i in fields) {
                self.invalid += fields[i].isValid() ? 0 : 1;
            }

            if (f) {
                self.trigger('field-state-change', self, f, valid);
            }

            if (num === null || (num !== null && self.invalid !== num)) {
                self.doDisplayState();
                self.trigger('state-change', self, self.isValid());
            }
        },

        onGroupStateChange:	function() {

            var self        = this,
                groups      = self.groups,
                num 		= self.grps;

            self.grps 	= 0;

            for (var i in groups) {
                self.grps += groups[i].isValid() ? 0 : 1;
            }

            if (num === null || (num !== null && self.grps !== num)) {
                self.doDisplayState();
                self.trigger('state-change', self, self.isValid());
            }
        },

        doDisplayState: function() {

            var self        = this,
                cfg         = self.cfg,
                valid 		= self.isValid(),
                errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid,
                el          = self.el;

            if (self.isField || !self.displayState) {
                valid		= null;
            }

            if (self.invalid === null) {
                valid = null;
            }

            if (errorCls) {
                valid === false ? dom_addClass(el, errorCls) : 
                                dom_removeClass(el, errorCls);
            }
            if (validCls) {
                valid === true ? dom_addClass(el, validCls) : 
                                dom_removeClass(el, validCls);
            }

            self.trigger('display-state', self, valid);
        },

        onBeforeAjax: function() {
            var self = this;
            self.pending++;
            if (self.cfg.cls.ajax) {
                dom_addClass(self.el, self.cfg.cls.ajax);
            }
        },

        onAfterAjax: function() {

            var self    = this,
                fields  = self.fields,
                cfg     = self.cfg;

            self.pending = 0;

            for (var i in fields) {
                self.pending += fields[i].isPending() ? 1 : 0;
            }

            self.doDisplayState();

            if (cfg.cls.ajax) {
                dom_removeClass(self.el, cfg.cls.ajax);
            }

            if (self.submitted && self.pending == 0) {
                self.submitted = false;

                if (self.isValid()) {
                    self.submit();
                }
                else {
                    self.focusInvalid();
                }
            }
        },


        onDestroy: function() {

            var self    = this,
                groups  = self.groups,
                fields  = self.fields,
                i;

            self.reset();
            //self.trigger('destroy', self);

            delete validators[self.id];

            for (i in groups) {
                if (groups.hasOwnProperty(i) && groups[i]) {
                    self.setGroupEvents(groups[i], 'un');
                    groups[i].$destroy();
                }
            }

            for (i in fields) {
                if (fields.hasOwnProperty(i) && fields[i]) {
                    self.setFieldEvents(fields[i], 'un');
                    fields[i].$destroy();
                }
            }

            self.initForm('unbind');

            self.fields = null;
            self.groups = null;
            self.el = null;
            self.cfg = null;
        }

    }, {

        defaults:   {},

        /**
         * Add validator
         * @static
         * @method
         * @param {string} name 
         * @param {function} fn {
         *  @param {string} value
         *  @param {Element} node
         *  @param {string|*} param {
         *      Validator's attribute value. <br>
         *      <pre><input minlength="10"></pre><br>
         *      param=10
         *  }
         *  @returns {boolean} Return false to invalidate field
         * }
         * @param {string} message Error message to display if the field is invalid
         */
        addMethod:  function(name, fn, message) {
            var methods = ns.get("MetaphorJs.validator.methods");
            if (!methods[name]) {
                methods[name] = fn;
                if (message) {
                    Validator.messages[name] = message;
                }
            }
        },

        /**
         * Check if dom element already has validator initialized
         * @static
         * @method
         * @param {Element} el 
         * @returns {MetaphorJs.validator.Validator|null}
         */
        getValidator: function(el) {
            var vldId = dom_getAttr(el, "data-validator");
            return validators[vldId] || null;
        }
    });



    return Validator;

}());








Directive.registerAttribute("field", 200, function(scope, node, config) { 

    var id = dom_getAttr(node, "name") ||
                dom_getAttr(node, "id"),
        v = validator_Validator.getValidator(node),
        f = v ? v.getField(id) : null;

    if (f) {
        f.setConfigRules(config);
    }

    config.clear();
});













var validator_Component = MetaphorJs.validator.Component = cls({

    node: null,
    scope: null,
    validator: null,
    scopeState: null,
    fields: null,
    formName: null,
    nodeCfg: null,

    $init: function(node, scope, renderer, nodeCfg) {

        var self        = this;

        nodeCfg.setDefaultMode("ref", lib_Config.MODE_STATIC);

        self.node       = node;
        self.scope      = scope;
        self.scopeState = {};
        self.fields     = [];
        self.nodeCfg    = nodeCfg;
        self.validator  = self.createValidator();
        self.formName   = nodeCfg.get("ref") ||
                            dom_getAttr(node, 'name') || 
                            dom_getAttr(node, 'id') || 
                            '$form';

        self.initScope();
        self.initScopeState();
        self.initValidatorEvents();

        // wait for the renderer to finish
        // before making judgements :)
        renderer.on("rendered", self.validator.check, self.validator, {
            once: true
        });
        renderer.on("destroy", self.$destroy, self);
        scope.$on("destroy", self.$destroy, self);
    },

    createValidator: function() {
        var self    = this,
            node    = self.node,
            cfg     = {},
            ncfg    = self.nodeCfg,
            submit;

        if ((submit = ncfg.get("submit"))) {
            cfg.callback = cfg.callback || {};
            cfg.callback.submit = function(fn, scope){
                return function() {
                    try {
                        return fn(scope);
                    }
                    catch(thrownError) {
                        error(thrownError);
                    }
                }
            }(submit, self.scope);
        }

        return new validator_Validator(node, cfg);
    },

    initValidatorEvents: function() {

        var self    = this,
            v       = self.validator;

        v.on('field-state-change', self.onFieldStateChange, self);
        v.on('state-change', self.onFormStateChange, self);
        v.on('display-state-change', self.onDisplayStateChange, self);
        v.on('field-error-change', self.onFieldErrorChange, self);
        v.on('reset', self.onFormReset, self);
    },

    initScope: function() {

        var self    = this,
            scope   = self.scope,
            name    = self.formName;

        scope[name] = self.scopeState;
    },


    initScopeState: function() {

        var self    = this,
            node    = self.node,
            state   = self.scopeState,
            fields  = self.fields,
            els, el,
            i, l,
            name;

        if (node.elements) {
            els     = node.elements;
        }
        else {
            els     = [];
            eachNode(node, function(el) {
                if (dom_isField(el)) {
                    els.push(el);
                }
            });
        }

        for (i = -1, l = els.length; ++i < l;) {
            el = els[i];
            name = dom_getAttr(el, "name") || 
                    dom_getAttr(el, 'id');

            if (name && !state[name]) {
                fields.push(name);
                state[name] = {
                    $error: null,
                    $invalid: null,
                    $pristine: true,
                    $errorMessage: null
                };
            }
        }

        state.$$validator = self.validator;
        state.$invalid = false;
        state.$pristine = true;
        state.$isDestroyed = bind(self.$isDestroyed, self);
        state.$submit = bind(self.validator.onSubmit, self.validator);
        state.$reset = bind(self.validator.reset, self.validator);
    },

    onDisplayStateChange: function(vld, state) {

        var self    = this;

        if (!state) {
            self.onFormReset(vld);
        }
        else {
            state   = self.scopeState;
            var i, l, f,
                fields = self.fields;

            for (i = 0, l = fields.length; i < l; i++) {
                f = state[fields[i]];
                if (f.$real) {
                    state[fields[i]] = f.$real;
                }
            }

            state.$invalid = !vld.isValid();
            state.$pristine = false;

            self.scope.$check();
        }

    },

    onFieldErrorChange: function(vld, field, error) {
        this.onFieldStateChange(vld, field, field.isValid());
    },

    onFormReset: function(vld) {

        var self    = this,
            state   = self.scopeState,
            i, l, f,
            fields = self.fields;

        for (i = 0, l = fields.length; i < l; i++) {
            f = state[fields[i]];
            f.$error = null;
            f.$errorMessage = null;
            f.$invalid = null;
            f.$pristine = true;
        }

        state.$invalid = false;
        state.$pristine = true;

        self.scope.$check();
    },

    onFormStateChange: function(vld, valid) {

        var self    = this,
            state   = self.scopeState;

        state.$invalid = valid === false && vld.isDisplayStateEnabled();
        state.$pristine = false;

        self.scope.$check();
    },

    onFieldStateChange: function(vld, field, valid) {

        var self    = this,
            state   = self.scopeState,
            name    = field.getName(),
            ds      = vld.isDisplayStateEnabled(),
            fstate  = {
                $error: field.getErrorRule(),
                $errorMessage: field.getError(),
                $invalid: valid === false,
                $pristine: field.getExactValidState() === null
            };

        if (ds) {
            state[name] = fstate;
        }
        else {
            state[name].$real = fstate;
        }

        self.scope.$check();
    },


    onDestroy: function() {
        var self = this;

        self.validator.$destroy();

        if (self.scope) {
            delete self.scope[self.formName];
        }
    }

});









Directive.registerAttribute("validate", 250,
    function(scope, node, config, renderer, attrSet) {

    config.setProperty("value", {
        mode: lib_Config.MODE_STATIC,
        type: "string",
        defaultValue: "MetaphorJs.validator.Component"
    });
    config.setMode("submit", lib_Config.MODE_FUNC);

    

    var cls     = config.get("value"),
        constr  = ns.get(cls);


    if (!constr) {
        error(new Error("Class '"+cls+"' not found"));
    }
    else {
        return new constr(node, scope, renderer, config);
    }
});









(function(){


    var methods = {
        getNodePositions: function(tmp, rs, oldrs) {

            var nodes = [],
                i, l, el, r,
                tmpNode,
                positions = {};

            while(tmp.firstChild) {
                tmp.removeChild(tmp.firstChild);
            }
            for (i = 0, l = rs.length; i < l; i++) {
                if (oldrs && oldrs[i]) {
                    tmpNode = oldrs[i].el.cloneNode(true);
                    tmp.appendChild(tmpNode);
                }
                tmpNode = rs[i].el.cloneNode(true);
                tmp.appendChild(tmpNode);
                nodes.push(tmpNode);
            }
            for (i = 0, l = nodes.length; i < l; i++) {
                el = nodes[i];
                r = rs[i].renderer;
                if (r) {
                    positions[r.id] = {left: el.offsetLeft, top: el.offsetTop};
                }
            }


            return positions;
        },

        calculateTranslates: function(newRenderers, origRenderers, withDeletes) {

            var self        = this,
                parent      = self.parentEl,
                pp          = parent.parentNode,
                tmp         = parent.cloneNode(true),
                ofsW        = parent.offsetWidth,
                translates  = [],
                fl          = 0,
                ft          = 0,
                oldPositions,
                insertPositions,
                newPositions,
                r, i, len, id,
                style,
                el;

            style = tmp.style;
            style.position = "absolute";
            style.left = "-10000px";
            style.visibility = "hidden";
            style.width = ofsW + 'px';

            pp.insertBefore(tmp, parent);
            // correct width to compensate for padding and stuff
            style.width = ofsW - (tmp.offsetWidth - ofsW) + "px";

            // positions before change
            oldPositions = self.getNodePositions(tmp, origRenderers);
            // positions when items reordered but deleted items are still in place
            insertPositions = self.getNodePositions(tmp, newRenderers, withDeletes);
            // positions after old items removed from dom
            newPositions = self.getNodePositions(tmp, newRenderers);

            pp.removeChild(tmp);
            tmp = null;

            for (i = 0, len = newRenderers.length; i < len; i++) {
                el = newRenderers[i].el;
                r = newRenderers[i].renderer;
                id = r.id;

                if (i === 0) {
                    fl = el.offsetLeft;
                    ft = el.offsetTop;
                }

                translates.push([
                    // to
                    {
                        left: (newPositions[id].left - fl) - (insertPositions[id].left - fl),
                        top: (newPositions[id].top - ft) - (insertPositions[id].top - ft)
                    },
                    // from
                    oldPositions[id] ? //insertPositions[id] &&
                    {
                        left: (oldPositions[id].left - fl) - (insertPositions[id].left - fl),
                        top: (oldPositions[id].top - ft) - (insertPositions[id].top - ft)
                    } : null
                ]);
            }

            return translates;
        },

        moveAnimation: function(el, to, from, startCallback, applyFrom) {

            var style = el.style;

            applyFrom.done(function(){
                if (from) {
                    var prefixes = animate_getPrefixes();
                    style[prefixes.transform] = "translateX("+from.left+"px) translateY("+from.top+"px)";
                }
            });

            return animate_animate(
                el,
                "move",
                startCallback,
                function(el, position, stage){
                    if (position === 0 && stage !== "start" && to) {
                        var prefixes = animate_getPrefixes();
                        style[prefixes.transform] = "translateX("+to.left+"px) translateY("+to.top+"px)";
                    }
                });
        },

        reflectChanges: function(vars) {

            var self            = this,
                oldRenderers    = vars.oldRenderers,
                newRenderers    = vars.newRenderers,
                translates,
                i, len, r;

            self.doUpdate(vars.updateStart, null, "enter");

            if (vars.doesMove) {
                translates = self.calculateTranslates(vars.newRenderers, vars.origRenderers, vars.oldRenderers);
            }

            var animPromises    = [],
                startAnimation  = new lib_Promise,
                applyFrom       = new lib_Promise,
                donePromise     = new lib_Promise,
                animReady       = lib_Promise.counter(newRenderers.length),
                startCallback   = function(){
                    animReady.countdown();
                    return startAnimation;
                };

            // destroy old renderers and remove old elements
            for (i = 0, len = oldRenderers.length; i < len; i++) {
                r = oldRenderers[i];
                if (r) {
                    r.scope.$destroy();

                    animate_stop(r.el);
                    animPromises.push(animate_animate(r.el, "leave")
                        .done(function(el){
                            el.style.visibility = "hidden";
                        }));
                }
            }

            for (i = 0, len = newRenderers.length; i < len; i++) {
                r = newRenderers[i];
                animate_stop(r.el);

                r.action === "enter" ?
                animPromises.push(animate_animate(r.el, "enter", startCallback)) :
                animPromises.push(
                    self.moveAnimation(
                        r.el,
                        vars.doesMove ? translates[i][0] : null,
                        vars.doesMove ? translates[i][1] : null,
                        startCallback,
                        applyFrom
                    )
                );
            }

            animReady.done(function(){
                raf(function(){
                    applyFrom.resolve();
                    self.applyDomPositions(oldRenderers);
                    if (!vars.doesMove) {
                        self.doUpdate(vars.updateStart, null, "move");
                    }
                    raf(function(){
                        startAnimation.resolve();
                    });
                    self.trigger("change", self);
                });
            });

            lib_Promise.all(animPromises).always(function(){
                raf(function(){
                    var prefixes = animate_getPrefixes();
                    self.doUpdate(vars.updateStart || 0);
                    self.removeOldElements(oldRenderers);
                    if (vars.doesMove) {
                        self.doUpdate(vars.updateStart, null, "move");
                        for (i = 0, len = newRenderers.length; i < len; i++) {
                            r = newRenderers[i];
                            r.el.style[prefixes.transform] = null;
                            r.el.style[prefixes.transform] = "";
                        }
                    }
                    donePromise.resolve();
                });
            });

            return donePromise;

        }
    };



    return cls({

        $class: "MetaphorJs.plugin.ListAnimated",

        $init: function(list) {

            list.$implement(methods);
        }

    });


}());






/**
 * Get element's scrolling parent
 * @function MetaphorJs.dom.getScrollParent
 * @param {DomNode} node
 * @returns {DomNode}
 */
var dom_getScrollParent = MetaphorJs.dom.getScrollParent = function() {

    var rOvf        = /(auto|scroll)/,
        body,

        overflow    = function (node) {
            var style = getStyle(node);
            return style ? style["overflow"] + style["overflowY"] + style["overflowY"] : "";
        },

        scroll      = function (node) {
            return rOvf.test(overflow(node));
        };

    return function dom_getScrollParent(node) {

        if (!body) {
            body = window.document.body;
        }

        var parent = node;

        while (parent) {
            if (parent === body) {
                return window;
            }
            if (scroll(parent)) {
                return parent;
            }
            parent = parent.parentNode;
        }

        return window;
    };
}();






/**
 * Get element's offset parent
 * @function MetaphorJs.dom.getOffsetParent
 * @param {DomNode} node 
 * @returns {DomNode}
 */
var dom_getOffsetParent = MetaphorJs.dom.getOffsetParent = function dom_getOffsetParent(node) {

    var html = window.document.documentElement,
        offsetParent = node.offsetParent || html;

    while (offsetParent && 
            (offsetParent != html &&
                dom_getStyle(offsetParent, "position") === "static")) {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || html;
};









/**
 * Get element's offset
 * @function MetaphorJs.dom.getOffet
 * @param {DomNode} node
 * @returns {object} {
 *  @type {int} top
 *  @type {int} left
 * }
 */
var dom_getOffset = MetaphorJs.dom.getOffset = function dom_getOffset(node) {

    var box = {top: 0, left: 0},
        html = window.document.documentElement;

    // Make sure it's not a disconnected DOM node
    if (!isAttached(node) || node === window) {
        return box;
    }

    // Support: BlackBerry 5, iOS 3 (original iPhone)
    // If we don't have gBCR, just use 0,0 rather than error
    if (node.getBoundingClientRect ) {
        box = node.getBoundingClientRect();
    }

    return {
        top: box.top + dom_getScrollTop() - html.clientTop,
        left: box.left + dom_getScrollLeft() - html.clientLeft
    };
};








/**
 * Get node position relative to offset parent or specific node
 * @function MetaphorJs.dom.getPosition
 * @param {DomNode} node 
 * @param {DomNode} to 
 * @return {object} {
 *  @type {int} top
 *  @type {int} left
 * }
 */
var dom_getPosition = MetaphorJs.dom.getPosition = function dom_getPosition(node, to) {

    var offsetParent, offset,
        parentOffset = {top: 0, left: 0},
        html = window.document.documentElement;

    if (node === window || node === html) {
        return parentOffset;
    }

    // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
    // because it is its only offset parent
    if (dom_getStyle(node, "position" ) == "fixed") {
        // Assume getBoundingClientRect is there when computed position is fixed
        offset = node.getBoundingClientRect();
    }
    else if (to) {
        var thisOffset = dom_getOffset(node),
            toOffset = dom_getOffset(to),
            position = {
                left: thisOffset.left - toOffset.left,
                top: thisOffset.top - toOffset.top
            };

        if (position.left < 0) {
            position.left = 0;
        }
        if (position.top < 0) {
            position.top = 0;
        }
        return position;
    }
    else {
        // Get *real* offsetParent
        offsetParent = dom_getOffsetParent(node);

        // Get correct offsets
        offset = dom_getOffset(node);

        if (offsetParent !== html) {
            parentOffset = dom_getOffset(offsetParent);
        }

        // Add offsetParent borders
        parentOffset.top += dom_getStyle(offsetParent, "borderTopWidth", true);
        parentOffset.left += dom_getStyle(offsetParent, "borderLeftWidth", true);
    }

    // Subtract parent offsets and element margins
    return {
        top: offset.top - parentOffset.top - dom_getStyle(node, "marginTop", true),
        left: offset.left - parentOffset.left - dom_getStyle(node, "marginLeft", true)
    };
};











cls({

    $class: "MetaphorJs.plugin.ListBuffered",

    list: null,
    enabled: true,

    itemSize: null,
    itemsOffsite: 5,
    bufferState: null,
    scrollOffset: 0,
    horizontal: false,
    dynamicOffset: false,
    bufferEventDelegate: null,
    topStub: null,
    botStub: null,

    $init: function(list) {

        var self    = this;

        self.list = list;

        list.$intercept("afterInit", this.afterInit, this, "before");
        list.$intercept("doRender", this.doRender, this, "instead");

        list.$implement({

            scrollTo: self.$bind(self.scrollTo),

            reflectChanges: function(vars) {

                if (!self.enabled) {
                    self.$super(vars);
                }
                else {
                    self.getScrollOffset();
                    list.removeOldElements(vars.oldRenderers);
                    list.queue.append(self.updateScrollBuffer, self, [true]);
                    list.trigger("change", list);
                }
            }
        });
    },

    afterInit: function() {

        var self    = this,
            attr    = self.list.attr,
            cfg     = attr ? attr.config : {};

        self.itemSize       = cfg.itemSize;
        self.itemsOffsite   = parseInt(cfg.itemsOffsite || 5, 10);
        self.horizontal     = cfg.horizontal || false;
        self.dynamicOffset  = cfg.dynamicOffset || false;

        self.initScrollParent(cfg);
        self.initScrollStubs(cfg);

        self.bufferEventDelegate = bind(self.bufferUpdateEvent, self);

        self.up();

        self.list.scope.$on("freeze", self.down, self);
        self.list.scope.$on("unfreeze", self.up, self);
    },

    doRender: function() {
        this.getScrollOffset();
        this.updateScrollBuffer();
    },

    up: function() {
        var self = this;
        dom_addListener(self.scrollEl, "scroll", self.bufferEventDelegate);
        dom_addListener(window, "resize", self.bufferEventDelegate);
    },

    down: function() {
        var self = this;
        dom_removeListener(self.scrollEl, "scroll", self.bufferEventDelegate);
        dom_removeListener(window, "resize", self.bufferEventDelegate);
    },

    initScrollParent: function(cfg) {
        var self = this;
        self.scrollEl = dom_getScrollParent(self.list.parentEl);
    },

    initScrollStubs: function(cfg) {

        var self    = this,
            list    = self.list,
            parent  = list.parentEl,
            prev    = list.prevEl,
            ofsTop,
            ofsBot,
            i,
            style = {
                fontSize: 0,
                lineHeight: 0,
                padding: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingBottom: 0,
                paddingRight: 0,
                margin: 0,
                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0
            };

        self.topStub       = ofsTop = window.document.createElement(cfg.stub || "div");
        self.botStub       = ofsBot = window.document.createElement(cfg.stub || "div");

        dom_addClass(ofsTop, "mjs-buffer-top");
        dom_addClass(ofsBot, "mjs-buffer-bottom");
        for (i in style) {
            ofsTop.style[i] = style[i];
            ofsBot.style[i] = style[i];
        }

        parent.insertBefore(ofsTop, prev ? prev.nextSibling : parent.firstChild);
        parent.insertBefore(ofsBot, list.nextEl);

        list.prevEl     = ofsTop;
        list.nextEl     = ofsBot;
    },

    getItemsPerRow: function() {
        return 1;
    },

    getRowHeight: function() {
        return this.itemSize;
    },

    getScrollOffset: function() {

        var self        = this,
            position    = dom_getPosition(self.topStub, self.scrollEl),
            ofs         = self.horizontal ? position.left : position.top;

        return self.scrollOffset = ofs;
    },

    getBufferState: function(updateScrollOffset) {

        var self        = this,
            scrollEl    = self.scrollEl,
            hor         = self.horizontal,
            html        = window.document.documentElement,
            size        = scrollEl === window ?
                          (window[hor ? "innerWidth" : "innerHeight"] ||
                           html[hor ? "clientWidth" : "clientHeight"]):
                          scrollEl[hor ? "offsetWidth" : "offsetHeight"],
            scroll      = hor ? dom_getScrollLeft(scrollEl) : 
                                dom_getScrollTop(scrollEl),
            sh          = scrollEl.scrollHeight,
            perRow      = self.getItemsPerRow(),
            isize       = self.getRowHeight(),
            off         = self.itemsOffsite,
            offset      = updateScrollOffset ? self.getScrollOffset() : self.scrollOffset,
            cnt         = Math.ceil(self.list.renderers.length / perRow),
            viewFirst,
            viewLast,
            first,
            last;

        //scroll  = Math.max(0, scroll - offset);
        first   = Math.ceil((scroll - offset) / isize);

        if (first < 0) {
            first = 0;
        }

        viewFirst = first;

        last    = viewLast = first + Math.ceil(size / isize);
        first   = first > off ? first - off : 0;
        last   += off;

        if (last > cnt - 1) {
            last = cnt - 1;
        }

        if (sh && scroll + size >= sh && self.bufferState) {
            if (self.bufferState.last == last * perRow) {
                last += off;
            }
        }

        if (first > last) {
            return self.bufferState;
        }

        return self.bufferState = {
            first: first * perRow,
            viewFirst: viewFirst * perRow,
            last: last * perRow,
            viewLast: viewLast * perRow,
            ot: first * isize,
            ob: (cnt - last - 1) * isize
        };
    },

    updateStubs: function(bs) {
        var self        = this,
            hor         = self.horizontal;

        self.topStub.style[hor ? "width" : "height"] = bs.ot + "px";
        self.botStub.style[hor ? "width" : "height"] = bs.ob + "px";
    },

    bufferUpdateEvent: function() {
        var self = this;
        self.list.queue.add(self.updateScrollBuffer, self);
    },


    updateScrollBuffer: function(reset) {

        var self        = this,
            list        = self.list,
            prev        = self.bufferState,
            parent      = list.parentEl,
            rs          = list.renderers,
            bot         = self.botStub,
            bs          = self.getBufferState(self.dynamicOffset),
            promise     = new lib_Promise,
            doc         = window.document,
            fragment,
            i, x, r;

        if (!bs) {
            return null;
        }

        if (!prev || bs.first != prev.first || bs.last != prev.last) {
            list.trigger("buffer-change", self, bs, prev);
        }

        raf(function(){

            if (self.$isDestroyed()) {
                return;
            }

            //TODO: account for tag mode

            if (reset || !prev || bs.last < prev.first || bs.first > prev.last){

                //remove old and append new
                if (prev) {
                    for (i = prev.first, x = prev.last; i <= x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
                fragment = doc.createDocumentFragment();
                for (i = bs.first, x = bs.last; i <= x; i++) {
                    r = rs[i];
                    if (r) {
                        if (!r.rendered) {
                            list.renderItem(i);
                        }
                        fragment.appendChild(r.el);
                        r.attached = true;
                    }
                }

                parent.insertBefore(fragment, bot);

            }
            else {

                if (prev.first < bs.first) {
                    for (i = prev.first, x = bs.first; i < x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
                else if (prev.first > bs.first) {
                    fragment = doc.createDocumentFragment();
                    for (i = bs.first, x = prev.first; i < x; i++) {
                        r = rs[i];
                        if (r) {
                            if (!r.rendered) {
                                list.renderItem(i);
                            }
                            fragment.appendChild(r.el);
                            r.attached = true;
                        }
                    }
                    parent.insertBefore(fragment, rs[prev.first].el);
                }

                if (prev.last < bs.last) {
                    fragment = doc.createDocumentFragment();
                    for (i = prev.last + 1, x = bs.last; i <= x; i++) {
                        r = rs[i];
                        if (r) {
                            if (!r.rendered) {
                                list.renderItem(i);
                            }
                            fragment.appendChild(r.el);
                            r.attached = true;
                        }
                    }
                    parent.insertBefore(fragment, bot);
                }
                else if (prev.last > bs.last) {
                    for (i = bs.last + 1, x = prev.last; i <= x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
            }

            self.updateStubs(bs);
            list.trigger("buffer-update", self);
            self.onBufferStateChange(bs, prev);

            promise.resolve();
        });

        return promise;
    },

    // not finished: todo unbuffered and animation
    scrollTo: function(index) {

        var self    = this,
            list    = self.list,
            isize   = self.itemSize,
            sp      = self.scrollEl || dom_getScrollParent(list.parentEl),
            hor     = self.horizontal,
            prop    = hor ? "scrollLeft" : "scrollTop",
            promise = new lib_Promise,
            pos;


        list.queue.append(function(){

            raf(function(){
                pos     = isize * index;
                if (sp === window) {
                    window.scrollTo(
                        hor ? pos : dom_getScrollLeft(),
                        !hor ? pos : dom_getScrollTop()
                    );
                }
                else {
                    sp[prop] = pos;
                }
                promise.resolve();
            });
            return promise;
        });


        return promise;
    },

    onBufferStateChange: function(bs, prev) {},


    $beforeHostDestroy: function() {

        var self = this,
            parent = self.list.parentEl;

        parent.removeChild(self.topStub);
        parent.removeChild(self.botStub);
        self.down();
    }
});





MetaphorJs.plugin.ListBuffered.$extend({

    $class: "MetaphorJs.plugin.ListPullNext",
    buffered: false,

    $init: function(list, args) {

        var attr = list.attr,
            cfg = attr ? attr.config : {};

        if (cfg.bufferedPullNext) {
            this.buffered = cfg.bufferedPullNext;
            list.buffered = true;
        }

        this.$super(list, args);
    },

    afterInit: function() {

        this.$super();
        this.getScrollOffset();
    },

    updateScrollBuffer: function(reset) {

        var self = this;

        if (self.buffered) {
            return self.$super(reset);
        }
        else {
            var prev    = self.bufferState,
                bs      = self.getBufferState(self.dynamicOffset);

            if (!prev || bs.first != prev.first || bs.last != prev.last) {
                self.list.trigger("buffer-change", self, bs, prev);
                self.onBufferStateChange(bs, prev);
            }
        }
    },

    onBufferStateChange: function(bs, prev) {

        var self = this,
            list = self.list,
            cnt = list.store.getLength();

        self.$super(bs, prev);

        if (cnt - bs.last < (bs.last - bs.first) / 3 && !list.store.loading && !list.store.$destroyed) {
            list.store.addNextPage();
            list.trigger("pull", self);
        }
    }


});












cls({

    $class: "MetaphorJs.plugin.SrcDeferred",

    directive: null,

    queue: null,
    scrollEl: null,
    scrollDelegate: null,
    resizeDelegate: null,
    position: null,
    sw: null,
    sh: null,
    checkVisibility: true,

    $init: function(directive) {

        var self = this;
        self.directive = directive;
        directive.$intercept("onChange", self.onChange, self, "instead");
        self.queue = 
            directive.queue || 
            new lib_Queue({auto: true, async: true, 
                            mode: lib_Queue.REPLACE, thenable: true});
    },

    $beforeHostInit: function(scope, node) {

        var self = this;

        self.scrollEl = dom_getScrollParent(node);
        self.scrollDelegate = bind(self.onScroll, self);
        self.resizeDelegate = bind(self.onResize, self);

        dom_addListener(self.scrollEl, "scroll", self.scrollDelegate);
        dom_addListener(window, "resize", self.resizeDelegate);
    },

    isVisible: function() {

        if (!this.checkVisibility) {
            return true;
        }

        var self = this,
            sEl = self.scrollEl,
            st = dom_getScrollTop(sEl),
            sl = dom_getScrollLeft(sEl),
            w = self.sw,
            h = self.sh,
            t,l;

        if (!self.position) {
            self.position = dom_getPosition(self.directive.node, sEl);
        }
        if (!w) {
            w = self.sw = dom_getWidth(sEl);
            h = self.sh = dom_getHeight(sEl);
        }

        t = self.position.top;
        l = self.position.left;

        return (t > st && t < (st + h)) &&
               (l > sl && l < (sl + w));
    },

    onScroll: function() {
        var self = this;
        self.directive.queue.add(self.changeIfVisible, self);
    },

    onResize: function() {
        var self = this;
        self.position = null;
        self.sw = null;
        self.directive.queue.add(self.changeIfVisible, self);
    },

    onChange: function() {
        var self = this;
        self.directive.queue.add(self.changeIfVisible, self);
    },

    changeIfVisible: function() {
        var self    = this;

        if (self.isVisible()) {
            self.stopWatching();
            return self.directive.doChange();
        }
    },

    stopWatching: function() {
        var self = this;
        if (self.scrollEl) {
            dom_removeListener(self.scrollEl, "scroll", self.scrollDelegate);
            dom_removeListener(window, "resize", self.resizeDelegate);
            self.scrollEl = null;
            self.checkVisibility = false;
        }
    },

    $beforeHostDestroy: function(){
        this.stopWatching();
        this.queue.$destroy();
    }

});







cls({

    $class: "MetaphorJs.plugin.SrcSize",
    directive: null,

    width: null,
    height: null,

    origOnChange: null,

    $init: function(directive) {

        var self = this;
        self.directive = directive;

        self.origOnChange = directive.$intercept("onSrcChanged", self.onSrcChanged, self, "after");
    },

    $afterHostInit: function(scope, node) {

        var attr    = self.directive.attr,
            cfg     = attr ? attr.config : {},
            size    = cfg.preloadSize,
            style   = node.style;

        if (size !== "attr") {
            size    = lib_Expression.parse(size)(scope);
        }

        var width   = size === "attr" ? parseInt(dom_getAttr(node, "width"), 10) : size.width,
            height  = size === "attr" ? parseInt(dom_getAttr(node, "height"), 10) : size.height;

        if (width || height) {
            style.display = "block";
        }

        if (width) {
            style.width = width + "px";
        }
        if (height) {
            style.height = height + "px";
        }
    },

    onSrcChanged: function() {

        var self        = this,
            directive   = self.directive,
            node        = directive.node;

        directive.onSrcChanged = self.origOnChange;

        dom_removeStyle(node, "width");
        dom_removeStyle(node, "height");
        dom_removeStyle(node, "display");

        self.$destroy();
    }

});



Directive.registerAttribute("break-if", 500, function(scope, node, config) {

    config.setType("value", "bool");

    var res = config.get("value");

    if (res) {
        node.parentNode.removeChild(node);
    }

    return !res;
});





Directive.registerAttribute("cfg", 200, function(scope, node, config) { 
    dom_data(node, "config", config);
});





Directive.registerAttribute("ignore", 0, returnFalse);




Directive.registerAttribute("include-file", 900, function(scope, node, config){

    var r = require,
        fs = r("fs"),
        filePath = config.get("value");

    node.innerHTML = fs.readFileSync(filePath).toString();
});







Directive.registerTag("bind-html", function(scope, node) {

    var expr    = dom_getAttr(node, "value"),
        text    = lib_Expression.get(expr, scope),
        frg     = dom_toFragment(text),
        nodes   = toArray(frg.childNodes);

    node.parentNode.insertBefore(frg, node);
    node.parentNode.removeChild(node);

    return nodes;
});






Directive.registerTag("bind", function(scope, node) {

    var expr    = dom_getAttr(node, "value"),
        text    = lib_Expression.get(expr, scope),
        frg     = window.document.createTextNode(text);

    node.parentNode.insertBefore(frg, node);
    node.parentNode.removeChild(node);

    return [frg];
});








Directive.registerTag("if", Directive.attr.If.$extend({
    $class: "MetaphorJs.app.Directive.tag.If",
    autoOnChange: false,
    children: null,
    childrenFrag: null,

    $init: function(scope, node, config, renderer, attrSet) {

        var self    = this;

        self.children = toArray(node.childNodes);
        self.childrenFrag = dom_toFragment(self.children);

        config.setType("once", "bool", lib_Config.MODE_STATIC);
        config.setProperty("value", {
            expression: dom_getAttr(node, "value"),
            type: "bool"
        });

        self.createCommentWrap();
        self.$super(scope, node, config, renderer, attrSet);   

        if (node.parentNode) {
            node.parentNode.removeChild(node); 
        }

        var val = config.get("value");
        self.onChange(val || false, undf);
    },

    getChildren: function() {
        return this.children;
    },

    onChange: function() {
        var self    = this,
            val     = self.config.get("value"),
            prev    = self.wrapperOpen,
            next    = self.wrapperClose,
            parent  = prev.parentNode;

        if (val) {
            parent.insertBefore(self.childrenFrag, next);
        }
        else if (!self.initial) {
            var children = [],
                sib;

            self.childrenFrag = window.document.createDocumentFragment();
            while (prev.nextSibling && prev.nextSibling !== next) {
                sib = prev.nextSibling;
                parent.removeChild(sib);
                children.push(sib);
                self.childrenFrag.appendChild(sib);
            }
            self.children = children;
        }

        if (self.initial) {
            self.initial = false;
        }
        else {
            if (self.config.get("once")) {
                self.$destroy();
            }
        }
    },

    onDestroy: function() {
        this.children = null;
        this.childrenFrag = null;
        this.$super();
    }
}));







Directive.registerTag("include", function(scope, node, config, parentRenderer) {

    config.setType("asis", "bool", lib_Config.MODE_STATIC);

    var tpl = new app_Template({
        scope: scope,
        node: node,
        config: config,
        parentRenderer: parentRenderer,
        replace: true,
        ownRenderer: !config.get("asis") // if asis, do not render stuff
    });

    parentRenderer.on("destroy", function(){
        tpl.$destroy();
        tpl = null;
    });

    return false; // stop renderer
});








Directive.registerTag("tag", function directive_tag_tag(scope, node) {

    var expr = getAttr(node, "value"),
        tag = lib_Expression.get(expr, scope),
        i, l, a;

    if (!tag) {
        node.parentNode.removeChild(node);
        return false;
    }
    else {
        var el = window.document.createElement(tag),
            next = node.nextSibling,
            attrs = node.attributes;

        while (node.firstChild) {
            el.appendChild(node.firstChild);
        }

        for (i = 0, l = attrs.length; i < l; i++) {
            a = attrs[i];
            if (a.name !== "value") {
                dom_setAttr(el, a.name, a.value);
            }
        }

        node.parentNode.insertBefore(el, next);
        node.parentNode.removeChild(node);

        return [el];
    }

});


MetaphorJs.dialog = MetaphorJs.dialog || {pointer: {}, position: {}};

/**
 * Change first character to upper case
 * @function ucfirst
 * @param {string} str 
 * @returns {string}
 */
function ucfirst(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
};



/**
 * Set element's style
 * @function MetaphorJs.dom.setStyle
 * @param {DomNode} el
 * @param {string} name
 * @param {*} value
 */
var dom_setStyle = MetaphorJs.dom.setStyle = function dom_setStyle(el, name, value) {

    if (!el || !el.style) {
        return;
    }

    var props,
        style = el.style,
        k;

    if (typeof name === "string") {
        props = {};
        props[name] = value;
    }
    else {
        props = name;
    }

    for (k in props) {
        style[k] = props[k];
    }
};




/**
 * Is element visible on the page
 * @function MetaphorJs.dom.isVisible
 * @param {DomNode} el
 * @returns {boolean}
 */
var dom_isVisible = MetaphorJs.dom.isVisible = function dom_isVisible(el) {
    return el && !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};






/**
 * Check if given element matches selector
 * @function MetaphorJs.dom.is
 * @param {Element} el
 * @param {string} selector
 * @returns {boolean}
 */
var dom_is = MetaphorJs.dom.is = function(el, selector) {

    var els = select(selector, el.parentNode),
        i, l;

    for (i = -1, l = els.length; ++i < l;) {
        if (els[i] === el) {
            return true;
        }
    }
    return false;
};




/**
 * Get element outer width
 * @function MetaphorJs.dom.getOuterWidth
 * @param {DomNode} el
 * @returns {int}
 */
var dom_getOuterWidth = MetaphorJs.dom.getOuterWidth = _dom_getDimensions("outer", "Width");




/**
 * Get element outer height
 * @function MetaphorJs.dom.getOuterHeight
 * @param {DomNode} el
 * @returns {int}
 */
var dom_getOuterHeight = MetaphorJs.dom.getOuterHeight = _dom_getDimensions("outer", "Height");









/**
 * Delegate dom event
 * @function MetaphorJs.dom.delegate
 * @param {DomNode} el Dom node to add event listener to
 * @param {string} selector Event target selector
 * @param {string} event Event name
 * @param {function} fn {
 *  Event handler
 *  @param {object} event
 * }
 */
var dom_delegate = MetaphorJs.dom.delegate = function dom_delegate(el, selector, event, fn) {

    var delegates = lib_Cache.global().get("dom/delegates", []);

    var key = selector + "-" + event,
        listener    = function(e) {
            e = dom_normalizeEvent(e);
            var trg = e.target;
            while (trg) {
                if (dom_is(trg, selector)) {
                    return fn(e);
                }
                trg = trg.parentNode;
            }
            return null;
        };

    if (!delegates[key]) {
        delegates[key] = [];
    }

    delegates[key].push({el: el, ls: listener, fn: fn});

    dom_addListener(el, event, listener);
};






function undelegate(el, selector, event, fn) {

    var key = selector + "-" + event,
        i, l,
        ds,
        delegates = lib_Cache.global().get("dom/delegates", []);

    if (ds = delegates[key]) {
        for (i = -1, l = ds.length; ++i < l;) {
            if (ds[i].el === el && ds[i].fn === fn) {
                dom_removeListener(el, event, ds[i].ls);
            }
        }
    }
};
















var dialog_position_Abstract = MetaphorJs.dialog.position.Abstract = cls({

    dialog: null,
    positionBase: null,
    correct: "solid",

    $init: function(dialog) {
        var self = this;
        self.dialog = dialog;
        extend(self, dialog.getCfg().position, true, false);

        self.onWindowResizeDelegate = bind(self.onWindowResize, self);
        self.onWindowScrollDelegate = bind(self.onWindowScroll, self);

        var pt = self.preferredType || self.type;
        if (typeof pt == "string") {
            var pts = self.getAllPositions(),
                inx;
            if ((inx = pts.indexOf(pt)) != -1) {
                pts.splice(inx, 1);
                pts.unshift(pt);
            }
            self.preferredType = pts;
        }
        else if (!pt) {
            self.preferredType = self.getAllPositions();
        }

        dialog.on("reposition", self.onReposition, self);
        dialog.on("show-after-delay", self.onShowAfterDelay, self);
        dialog.on("hide-after-delay", self.onHideAfterDelay, self);

        if (dialog.isVisible()) {
            self.onShowAfterDelay();
        }

    },


    getPositionBase: function() {

        var self = this,
            dlg = self.dialog;

        if (self.positionBase) {
            return self.positionBase;
        }
        var b;
        if (b = dlg.getCfg().position.base) {
            if (typeof b == "string") {
                self.positionBase = select(b).shift();
            }
            else {
                self.positionBase = b;
            }
            return self.positionBase;
        }
        return null;
    },

    getBoundary: function() {

        var self    = this,
            base    = self.getPositionBase(),
            sx      = self.screenX || 0,
            sy      = self.screenY || 0,
            w, h,
            st, sl,
            ofs;

        if (base) {
            ofs = MetaphorJs.dom.getOffset(base);
            w = dom_getOuterWidth(base);
            h = dom_getOuterHeight(base);
            return {
                x: ofs.left + sx,
                y: ofs.top + sy,
                x1: ofs.left + w - sx,
                y1: ofs.top + h - sy,
                w: w,
                h: h
            };
        }
        else {
            w = dom_getWidth(window);
            h = dom_getHeight(window);
            st = dom_getScrollTop(window);
            sl = dom_getScrollLeft(window);
            return {
                x: sl + sx,
                y: st + sy,
                x1: sl + w - sx,
                y1: st + h - sy,
                w: w,
                h: h
            };
        }
    },


    getPrimaryPosition: function(pos) {
        return false;
    },
    getSecondaryPosition: function(pos) {
        return false;
    },

    getAllPositions: function() {
        return [];
    },

    correctPosition: function(e) {

        var self        = this,
            pri         = self.getPrimaryPosition(),
            strategy    = self.correct;

        if (!pri || !strategy) {
            return;
        }

        var dlg         = self.dialog,
            boundary    = self.getBoundary(),
            size        = dlg.getDialogSize(),
            pts         = self.preferredType,
            pt          = pts[0],
            i, l;

        if (strategy && strategy != "solid") {
            if (self.type != pt && self.checkIfFits(e, pt, boundary, size, false)) {
                self.changeType(pt);
                return self.fitToBoundary(self.getCoords(e), boundary, size);
            }

            if (self.checkIfFits(e, self.type, boundary, size, false)) {
                return self.fitToBoundary(self.getCoords(e), boundary, size);
            }
        }
        if (strategy && strategy != "position-only") {
            for (i = 0, l = pts.length; i < l; i++) {
                if (self.checkIfFits(e, pts[i], boundary, size, true)) {
                    self.changeType(pts[i]);
                    return self.getCoords(e);
                }
            }
        }

        return self.getCoords(e);
    },

    checkIfFits: function(e, position, boundary, size, fully) {

        var self    = this,
            coords  = self.getCoords(e, position, true);

        // leave only basic positions here
        if (!fully && self.getSecondaryPosition(position)) {
            return false;
        }

        if (fully) {
            return !(coords.x < boundary.x ||
                     coords.y < boundary.y ||
                     coords.x + size.width > boundary.x1 ||
                     coords.y + size.height > boundary.y1);
        }
        else {
            var pri = self.getPrimaryPosition(position);
            switch (pri) {
                case "t":
                    return coords.y >= boundary.y;
                case "r":
                    return coords.x + size.width <= boundary.x1;
                case "b":
                    return coords.y + size.height <= boundary.y1;
                case "l":
                    return coords.x >= boundary.x;
            }
        }
    },

    fitToBoundary: function(coords, boundary, size) {

        var self = this,
            base = self.getPositionBase(),
            x = base ? 0 : boundary.x,
            y = base ? 0 : boundary.y,
            x1 = base ? boundary.w : boundary.x1,
            y1 = base ? boundary.h : boundary.y1,
            xDiff = 0,
            yDiff = 0,
            pointer = self.dialog.getPointer();

        if (coords.x < x) {
            xDiff = coords.x - x;
            coords.x = x;
        }
        if (coords.y < y) {
            yDiff = coords.y - y;
            coords.y = y;
        }
        if (coords.x + size.width > x1) {
            xDiff = (coords.x + size.width) - x1;
            coords.x -= xDiff;
        }
        if (coords.y + size.height > y1) {
            yDiff = (coords.y + size.height) - y1;
            coords.y -= yDiff;
        }

        pointer.setCorrectionOffset(xDiff, yDiff);
        pointer.reposition();

        return coords;
    },

    changeType: function(type) {
        var self = this,
            dlg = self.dialog,
            pointer = dlg.getPointer();

        self.type = type;
        pointer.setType(null, null);
    },

    onReposition: function(dlg, e) {

        var self    = this,
            coords;

        if (self.screenX !== false || self.screenY !== false) {
            coords  = self.correctPosition(e);
        }
        else {
            coords  = self.getCoords(e);
        }

        self.apply(coords);
    },

    getCoords: function(e){
        return {
            left: 0,
            top: 0
        }
    },

    apply: function(coords) {

        if (!coords) {
            return;
        }

        if (isNaN(coords.x) || isNaN(coords.y)) {
            return;
        }

        var self    = this,
            dlg     = self.dialog,
            axis    = dlg.getCfg().position.axis,
            pos     = {};

        axis != "y" && (pos.left = coords.x + "px");
        axis != "x" && (pos.top = coords.y + "px");

        dom_setStyle(dlg.getElem(), pos);
    },

    onWindowResize: function(e) {
        this.dialog.reposition(dom_normalizeEvent(e));
    },

    onWindowScroll: function(e) {
        this.dialog.reposition(dom_normalizeEvent(e));
    },

    onShowAfterDelay: function() {
        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            dom_addListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            dom_addListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    onHideAfterDelay: function() {

        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            dom_removeListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            dom_removeListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    onDestroy: function() {

        var self = this,
            dlg = self.dialog;

        dom_removeListener(window, "resize", self.onWindowResizeDelegate);
        dom_removeListener(dlg.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);

        dlg.un("reposition", self.onReposition, self);
        dlg.un("show-after-delay", self.onShowAfterDelay, self);
        dlg.un("hide-after-delay", self.onHideAfterDelay, self);

        if (dlg.isVisible()) {
            self.onHideAfterDelay();
        }
    }



});









var dialog_position_Target = MetaphorJs.dialog.position.Target = 
                dialog_position_Abstract.$extend({

    getCoords: function(e, type, absolute) {

        var self    = this,
            dlg     = self.dialog,
            cfg     = dlg.getCfg(),
            target  = dlg.getTarget();

        if (!target) {
            return null;
        }

        type    = type || self.type;

        var pBase   = self.getPositionBase(),
            size    = dlg.getDialogSize(),
            offset  = pBase && !absolute ?
                        dom_getPosition(target, pBase) :
                        dom_getOffset(target),
            tsize   = dlg.getTargetSize(),
            pos     = {},
            pri     = type.substr(0, 1),
            sec     = type.substr(1),
            offsetX = cfg.position.offsetX,
            offsetY = cfg.position.offsetY,
            pntOfs  = dlg.pointer.getDialogPositionOffset(type);

        switch (pri) {
            case "t": {
                pos.y   = offset.top - size.height - offsetY;
                break;
            }
            case "r": {
                pos.x   = offset.left + tsize.width + offsetX;
                break;
            }
            case "b": {
                pos.y   = offset.top + tsize.height + offsetY;
                break;
            }
            case "l": {
                pos.x   = offset.left - size.width - offsetX;
                break;
            }
        }

        switch (sec) {
            case "t": {
                pos.y   = offset.top + offsetY;
                break;
            }
            case "r": {
                pos.x   = offset.left + tsize.width - size.width - offsetX;
                break;
            }
            case "b": {
                pos.y   = offset.top + tsize.height - size.height - offsetY;
                break;
            }
            case "l": {
                pos.x   = offset.left + offsetX;
                break;
            }
            case "rc": {
                pos.x   = offset.left + tsize.width + offsetX;
                break;
            }
            case "lc": {
                pos.x   = offset.left - size.width - offsetX;
                break;
            }
            case "": {
                switch (pri) {
                    case "t":
                    case "b": {
                        pos.x   = offset.left + (tsize.width / 2) -
                                    (size.width / 2);
                        break;
                    }
                    case "r":
                    case "l": {
                        pos.y   = offset.top + (tsize.height / 2) -
                                    (size.height / 2);
                        break;
                    }
                }
                break;
            }
        }

        if (pntOfs) {
            pos.x += pntOfs.x;
            pos.y += pntOfs.y;
        }

        return pos;
    },

    getPrimaryPosition: function(pos) {
        return (pos || this.type).substr(0, 1);
    },

    getSecondaryPosition: function(pos) {
        return (pos || this.type).substr(1);
    },

    getAllPositions: function() {
        return ["t", "r", "b", "l", "tl", "tr", "rt", "rb",
                "br", "bl", "lb", "lt", "tlc", "trc", "brc", "blc"];
    }

});














var dialog_position_Mouse = MetaphorJs.dialog.position.Mouse = dialog_position_Target.$extend({

    correct: "position",

    $init: function(dialog) {

        var self = this;

        self.onMouseMoveDelegate = bind(self.onMouseMove, self);
        self.$super(dialog);
    },

    getCoords: function(e, type, absolute) {

        if (!e) {
            return null;
        }

        var self    = this,
            origType= type || self.type,
            dlg     = self.dialog,
            cfg     = dlg.getCfg(),
            size    = dlg.getDialogSize(),
            base    = self.getPositionBase(),
            pos     = {},
            type    = (type || self.type).substr(1),
            offsetX = cfg.position.offsetX,
            offsetY = cfg.position.offsetY,
            axis    = cfg.position.axis,
            pntOfs  = dlg.getPointer().getDialogPositionOffset(origType),
            absOfs  = {x: 0, y: 0};

        if (!absolute && base) {
            var baseOfs = dom_getOffset(base);
            absOfs.x = baseOfs.left;
            absOfs.y = baseOfs.top;
        }

        switch (type) {
            case "": {
                pos     = self.get.call(dlg.$$callbackContext, dlg, e, type, absolute);
                break;
            }
            case "c": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "t": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "r": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "b": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "l": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
            case "rt": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "rb": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "lt": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
            case "lb": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
        }

        if (pntOfs) {
            pos.x += pntOfs.x;
            pos.y += pntOfs.y;
        }

        if (axis) {
            var tp = self.$super(e, type);
            if (tp) {
                if (axis == "x") {
                    pos.y = tp.y;
                }
                else {
                    pos.x = tp.x;
                }
            }
        }

        return pos;
    },

    onShowAfterDelay: function() {
        var self = this;
        self.$super();
        dom_addListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onHideAfterDelay: function() {
        var self = this;
        self.$super();
        dom_removeListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onMouseMove: function(e) {
        this.dialog.reposition(dom_normalizeEvent(e));
    },

    getPrimaryPosition: function(pos) {
        return (pos || this.type).substr(1, 1);
    },

    getSecondaryPosition: function(pos) {
        return (pos || this.type).substr(2);
    },

    getAllPositions: function() {
        return ["mt", "mr", "mb", "ml", "mrt", "mrb", "mlb", "mlt"];
    }
});












var dialog_position_Window = MetaphorJs.dialog.position.Window = dialog_position_Abstract.$extend({

    getCoords: function(e, type) {

        var self    = this,
            dlg     = self.dialog,
            pBase   = self.getPositionBase() || window,
            size    = dlg.getDialogSize(),
            pos     = {},
            type    = (type || self.type).substr(1),
            offsetX = self.offsetX,
            offsetY = self.offsetY,
            st      = dom_getScrollTop(pBase),
            sl      = dom_getScrollLeft(pBase),
            ww      = dom_getOuterWidth(pBase),
            wh      = dom_getOuterHeight(pBase);

        switch (type) {
            case "c": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "t": {
                pos.y   = st + offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "r": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "b": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = (ww / 2) - (size.width / 2) + sl;
                break;
            }
            case "l": {
                pos.y   = (wh / 2) - (size.height / 2) + st;
                pos.x   = sl + offsetX;
                break;
            }
            case "rt": {
                pos.y   = st + offsetY;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "rb": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = ww - size.width + sl - offsetX;
                break;
            }
            case "lt": {
                pos.y   = st + offsetY;
                pos.x   = sl + offsetX;
                break;
            }
            case "lb": {
                pos.y   = wh - size.height + st - offsetY;
                pos.x   = sl + offsetX;
                break;
            }
        }

        return pos;
    },

    getPrimaryPosition: function(type) {
        return (type || this.type).substr(1, 1);
    },

    getSecondaryPosition: function(type) {
        return (type || this.type).substr(2);
    },


    getAllPositions: function() {
        return ["wt", "wr", "wb", "wl", "wrt", "wrb", "wlb", "wlt", "wc"];
    },

    correctPosition: function(e) {
        return this.getCoords(e);
    }

});








var dialog_position_Custom = MetaphorJs.dialog.position.Custom = 
                    dialog_position_Abstract.$extend({

    getCoords: function(e) {
        var dlg = this.dialog;
        return this.get.call(dlg.$$callbackContext, dlg, e);
    }
});






var dialog_pointer_Abstract = MetaphorJs.dialog.pointer.Abstract = cls({

    enabled: null,
    node: null,
    correctX: 0,
    correctY: 0,

    $init: function(dialog, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.origCfg    = cfg;
        self.dialog     = dialog;
        self.opposite   = {t: "b", r: "l", b: "t", l: "r"};
        self.names      = {t: 'top', r: 'right', b: 'bottom', l: 'left'};
        self.sides      = {t: ['l','r'], r: ['t','b'], b: ['r','l'], l: ['b','t']};

        if (self.enabled !== false && cfg.size) {
            self.enabled = true;
        }
        else {
            self.enabled = false;
        }
    },

    enable: function() {
        var self = this;
        if (!self.enabled) {
            self.enabled = true;
            self.render();
            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        }
    },

    disable: function() {
        var self = this;
        if (self.enabled) {
            self.remove();
            self.enabled = false;
            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        }
    },

    getElem: function() {
        return this.node;
    },

    getSize: function() {
        return this.enabled ? this.size : 0;
    },

    setCorrectionOffset: function(x, y) {
        this.correctX = x;
        this.correctY = y;
    },

    getCorrectionValue: function(type, value, position) {

        if (!value) {
            return 0;
        }

        var self    = this,
            pri     = position.substr(0,1),
            sec     = position.substr(1,1),
            tsize   = self.dialog.getDialogSize(),
            width   = self.width,
            sprop   = pri == "t" || pri == "b" ? "width" : "height",
            min,
            max;

        switch (sec) {
            case "":
                max = (tsize[sprop] / 2) - (width / 2);
                min = -max;
                break;
            case "l":
                min = 0;
                max = tsize[sprop] - (width / 2);
                break;
            case "r":
                min = -(tsize[sprop] - (width / 2));
                max = 0;
                break;
        }

        value = value < 0 ? Math.max(min, value) : Math.min(max, value);

        if ((pri == "t" || pri == "b") && type == "x") {
            return value;
        }
        if ((pri == "l" || pri == "r") && type == "y") {
            return value;
        }

        return 0;
    },

    getDialogPositionOffset: function(position) {
        var self    = this,
            pp      = (self.detectPointerPosition(position) || "").substr(0,1),
            dp      = self.dialog.getPosition().getPrimaryPosition(position),
            ofs     = {x: 0, y: 0};

        if (!self.enabled) {
            return ofs;
        }

        if (pp == self.opposite[dp]) {
            ofs[pp == "t" || pp == "b" ? "y" : "x"] =
                pp == "b" || pp == "r" ? -self.size : self.size;
        }

        return ofs;
    },

    detectPointerPosition: function(dialogPosition) {

        var self = this,
            pri, sec, thr;

        if (self.position && !dialogPosition) {
            if (isFunction(self.position)) {
                return self.position.call(self.dialog.$$callbackContext, self.dialog, self.origCfg);
            }
            return self.position;
        }

        pri = self.dialog.getPosition().getPrimaryPosition(dialogPosition);
        sec = self.dialog.getPosition().getSecondaryPosition(dialogPosition);
        thr = sec.substr(1, 1);

        if (!pri) {
            return null;
        }

        var position = self.opposite[pri];

        if (sec) {
            sec = sec.substr(0, 1);
            if (thr == "c") {
                position += self.opposite[sec];
            }
            else {
                position += sec;
            }
        }

        return position;
    },

    detectPointerDirection: function(position) {

        var self = this;

        if (self.direction) {
            if (isFunction(self.direction)) {
                return self.direction.call(self.dialog.$$callbackContext, self.dialog, position, self.origCfg);
            }
            return self.direction;
        }
        return position;
    },

    update: function(){
        var self = this;
        self.remove();
        self.render();
        self.append();
        if (self.dialog.isVisible()) {
            self.dialog.reposition();
        }
    },



    setType: function(position, direction) {
        var self = this;
        self.position = position;
        self.direction = direction;
        self.update();
        self.reposition();
    },


    render: function() {},

    onDestroy: function() {
        var self = this;
        self.remove();
    },

    reposition: function() {

    },

    append: function() {

        var self = this;
        if (!self.enabled) {
            return;
        }
        if (!self.node) {
            self.render();
        }
        if (!self.node) {
            return;
        }

        self.reposition();

        var parent = self.dialog.getElem();
        if (parent) {
            parent.appendChild(self.node);
        }
    },

    remove: function(){

        var self = this,
            node = self.node;

        if (node) {

            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }

            self.node = null;
        }
    }
});








MetaphorJs.dialog.pointer.Html = (function(){

    var ie6             = null,
        defaultProps    = {
            backgroundColor: 'transparent',
            width: 			'0px',
            height: 		'0px',
            position: 		'absolute',
            fontSize: 	    '0px', // ie6
            lineHeight:     '0px' // ie6
        };

    return dialog_pointer_Abstract.$extend({

        node: null,
        sub: null,

        $init: function(dialog, cfg) {

            if (ie6 === null) {
                ie6 = window.document.all && !window.XMLHttpRequest
            }

            var self = this;

            self.$super(dialog, cfg);

            self.width = self.width || self.size * 2;

            if (self.inner) {
                self.enabled = true;
            }
        },



        createInner: function() {
            var self        = this,
                newcfg 		= extend({}, self.origCfg);

            newcfg.size 	= self.size - (self.border * 2);
            newcfg.width	= self.width - (self.border * 4);

            newcfg.border = 0;
            newcfg.borderColor = null;
            newcfg.borderCls = null;
            newcfg.offset = 0;
            newcfg.inner = self.border;

            self.sub = new MetaphorJs.dialog.pointer.Html(self.dialog, newcfg);
        },


        getBorders: function(position, direction, color) {

            var self        = this,
                borders 	= {},
                pri 		= position.substr(0,1),
                dpri        = direction.substr(0,1),
                dsec        = direction.substr(1),
                style       = ie6 ? "dotted" : "solid",
                names       = self.names,
                sides       = self.sides,
                opposite    = self.opposite;

            // in ie6 "solid" wouldn't make transparency :(

            // this is always height : border which is opposite to direction
            borders['border'+ucfirst(names[opposite[pri]])] = self.size + "px solid "+color;
            // border which is similar to direction is always 0
            borders['border'+ucfirst(names[pri])] = "0 "+style+" transparent";

            if (!dsec) {
                // if pointer's direction matches pointer primary position (p: l|lt|lb, d: l)
                // then we set both side borders to a half of the width;
                var side = Math.floor(self.width / 2);
                borders['border' + ucfirst(names[sides[dpri][0]])] = side + "px "+style+" transparent";
                borders['border' + ucfirst(names[sides[dpri][1]])] = side + "px "+style+" transparent";
            }
            else {
                // if pointer's direction doesn't match with primary position (p: l|lt|lb, d: t|b)
                // we set the border opposite to direction to the full width;
                borders['border'+ucfirst(names[dsec])] = "0 solid transparent";
                borders['border'+ucfirst(names[opposite[dsec]])] = self.width + "px "+style+" transparent";
            }

            return borders;
        },

        getOffsets: function(position, direction) {

            var self    = this,
                offsets = {},
                names   = self.names,
                opposite= self.opposite,
                pri		= position.substr(0,1),
                auto 	= (pri == 't' || pri == 'b') ? "r" : "b";

            offsets[names[pri]] = self.inner ? 'auto' : -self.size+"px";
            offsets[names[auto]] = "auto";

            if (!self.inner) {

                var margin;

                switch (position) {
                    case 't': case 'r': case 'b': case 'l':
                        if (direction != position) {
                            if (direction == 'l' || direction == 't') {
                                margin = self.offset;
                            }
                            else {
                                margin = -self.width + self.offset;
                            }
                        }
                        else {
                            margin = -self.width/2 + self.offset;
                        }
                        break;

                    case 'bl': case 'tl': case 'lt': case 'rt':
                        margin = self.offset;
                        break;

                    default:
                        margin = -self.width - self.offset;
                        break;
                }

                offsets['margin' + ucfirst(names[opposite[auto]])] = margin + "px";

                var positionOffset;

                switch (position) {
                    case 't': case 'r': case 'b': case 'l':
                        positionOffset = '50%';
                        break;

                    case 'tr': case 'rb': case 'br': case 'lb':
                        positionOffset = '100%';
                        break;

                    default:
                        positionOffset = 0;
                        break;
                }

                offsets[names[opposite[auto]]]  = positionOffset;

                var pfxs = animate_getPrefixes(),
                    transformPfx = pfxs.transform,
                    transform = "",
                    cx = self.correctX,
                    cy = self.correctY;

                if (transformPfx) {

                    if (cx) {
                        transform += " translateX(" + self.getCorrectionValue("x", cx, position) + "px)";
                    }
                    if (cy) {
                        transform += " translateY(" + self.getCorrectionValue("y", cy, position) + "px)";
                    }

                    offsets[transformPfx] = transform;
                }
            }
            else {

                var innerOffset,
                    dpri    = direction.substr(0, 1),
                    dsec    = direction.substr(1);

                if (dsec) {
                    if (dsec == 'l' || dsec == 't') {
                        innerOffset = self.inner + 'px';
                    }
                    else {
                        innerOffset = -self.width - self.inner + 'px';
                    }
                }
                else {
                    innerOffset = Math.floor(-self.width / 2) + 'px';
                }

                offsets[names[opposite[auto]]]  = innerOffset;
                offsets[names[opposite[dpri]]] = -(self.size + (self.inner * 2)) + 'px';
            }


            return offsets;
        },

        render: function() {

            var self = this;

            if (!self.enabled) {
                return;
            }

            if (self.node) {
                return;
            }

            var position    = self.detectPointerPosition();
            if (!position) {
                return;
            }

            if (self.border && !self.sub) {
                self.createInner();
            }

            self.node   = window.document.createElement('div');
            var cmt     = window.document.createComment(" ");

            self.node.appendChild(cmt);

            setStyle(self.node, defaultProps);
            dom_addClass(self.node, self.borderCls || self.cls);

            if (self.sub) {
                self.sub.render();
                self.node.appendChild(self.sub.getElem());
            }
        },

        reposition: function() {

            var self        = this,
                position    = self.detectPointerPosition(),
                direction   = self.detectPointerDirection(position);

            if (!self.node) {
                return;
            }

            dom_setStyle(self.node, 
                self.getBorders(position, direction, self.borderColor || self.color));
            dom_setStyle(self.node, 
                self.getOffsets(position, direction));

            if (self.sub) {
                self.sub.reposition();
            }
        },

        update: function() {
            var self = this;
            if (self.sub) {
                self.sub.$destroy();
                self.sub = null;
            }
            self.remove();
            self.node = null;
            self.render();
            self.append();

            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        },

        onDestroy: function() {

            var self = this;

            if (self.sub) {
                self.sub.$destroy();
                self.sub = null;
            }

            self.$super();
        },

        remove: function() {

            var self = this;

            if (self.sub) {
                self.sub.remove();
            }

            self.$super();
        }
    });
}());













var dialog_Overlay = MetaphorJs.dialog.Overlay = cls({

    dialog:         null,
    enabled:		false,
    color:			'#000',
    opacity:		.5,
    cls:			null,
    animateShow:	false,
    animateHide:	false,

    $mixins:        [mixin_Observable],

    $init: function(dialog) {

        var self = this;

        self.dialog = dialog;
        self.onClickDelegate = bind(self.onClick, self);
        extend(self, dialog.getCfg().overlay, true, false);

        self.$$observable.createEvent("click", false);

        if (self.enabled) {
            self.enabled = false;
            self.enable();
        }
    },

    getElem: function() {
        var self = this;
        if (self.enabled && !self.node) {
            self.render();
        }
        return self.node;
    },

    enable: function() {
        var self = this;
        if (!self.enabled) {
            self.enabled = true;
        }
    },

    disable: function() {
        var self = this;
        if (self.enabled) {
            self.remove();
            self.enabled = false;
        }
    },

    show: function(e) {
        var self = this;

        if (!self.enabled) {
            return;
        }

        if (self.animateShow) {
            self.animate("show", e);
        }
        else {
            self.node.style.display = "block";
        }
    },

    hide: function(e) {
        var self = this;
        if (self.node) {
            if (self.animateHide) {
                self.animate("hide", e);
            }
            else {
                self.node.style.display = "none";
            }
        }
    },

    render: function() {

        var self = this;

        if (!self.enabled) {
            return;
        }

        var node = window.document.createElement("div"),
            cfg = self.dialog.getCfg();

        dom_setStyle(node, {
            display:            "none",
            position: 			"fixed",
            left:				0,
            top:				0,
            right:              0,
            bottom:             0,
            opacity:			self.opacity,
            backgroundColor: 	self.color
        });

        dom_addListener(node, "click", self.onClickDelegate);

        if (cfg.render.zIndex) {
            dom_setStyle(node, "zIndex", cfg.render.zIndex);
        }
        if (self.cls) {
            MetaphorJs.dom.addClass(node, self.cls);
        }

        self.node = node;
    },

    remove: function() {
        var self = this,
            node = self.node;

        if (node) {
            raf(function() {
                //if (!dialog.isVisible() && node.parentNode) {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            });
        }
    },

    append: function() {
        var self = this,
            cfg = self.dialog.getCfg(),
            to = cfg.render.appendTo || window.document.body;

        if (!self.enabled) {
            return;
        }

        if (!self.node) {
            self.render();
        }

        to.appendChild(self.node);
    },

    animate: function(type, e) {
        var self = this,
            node = self.node,
            a;

        a = type == "show" ? self.animateShow : self.animateHide;

        if (isFunction(a)) {
            a   = a(self, e);
        }

        if (isBool(a)) {
            a = type;
        }
        else if (isString(a)) {
            a = [a];
        }

        return animate_animate(node, a, function(){
            if (type == "show") {
                return new lib_Promise(function(resolve, reject){
                    raf(function(){
                        node.style.display = "";
                        resolve();
                    });
                });
            }
        }, false);
    },

    onClick: function(e) {

        var self = this;

        var res = self.trigger("click", self.dialog, self, e);

        if (res === false) {
            return null;
        }

        if (self.modal) {
            e = dom_normalizeEvent(e);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return null;
    },

    onDestroy: function() {

        var self = this;
        self.remove();

    }
});




var dialog_Manager = MetaphorJs.dialog.Manager = cls({

    all: null,
    groups: null,

    $init: function() {
        this.all = {};
        this.groups = {};
    },

    register: function(dialog) {

        var id      = dialog.getInstanceId(),
            grps    = dialog.getGroup(),
            self    = this,
            all     = self.all,
            groups  = self.groups,
            i, len,
            g;

        all[id]     = dialog;

        for (i = 0, len = grps.length; i < len; i++) {
            g   = grps[i];
            if (!groups[g]) {
                groups[g]   = {};
            }
            groups[g][id] = true;
        }

        dialog.on("destroy", this.unregister, this);
    },

    unregister: function(dialog) {

        var id  = dialog.getInstanceId();
        delete this.all[id];
    },

    hideAll: function(dialog) {

        var id      = dialog.getInstanceId(),
            grps    = dialog.getGroup(),
            self    = this,
            all     = self.all,
            groups  = self.groups,
            i, len, gid,
            ds, did;

        for (i = 0, len = grps.length; i < len; i++) {
            gid     = grps[i];
            ds      = groups[gid];
            for (did in ds) {
                if (!all[did]) {
                    delete ds[did];
                }
                else if (did != id && !all[did].isHideAllIgnored()) {
                    all[did].hide(null, true, true);
                }
            }
        }
    }

});









































var dialog_Dialog = MetaphorJs.dialog.Dialog = (function(){

    var manager = new dialog_Manager;

    var defaultEventProcessor = function(dlg, e, type, returnMode){
        if (type === "show" || !returnMode) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    var getEventConfig = function(e, action, dlgEl) {

        var type    = e.type,
            trg     = e.target,
            cfg     = null,
            data;

        while (trg && trg !== dlgEl) {

            data    = dom_getAttr(trg, "data-" + action + "-" + type);

            if (data) {
                cfg = lib_Expression.parse(data)({});
                break;
            }

            trg     = trg.parentNode;
        }

        return cfg;
    };

    /*
     * Shorthands
     */

    var fixShorthand = function(options, level1, level2, type) {
        var value   = options[level1],
            yes     = false;

        if (value === undf) {
            return;
        }

        switch (type) {
            case "string": {
                yes     = isString(value);
                break;
            }
            case "function": {
                yes     = isFunction(value);
                break;
            }
            case "number": {
                yes     = isNumber(value) || value == parseInt(value);
                break;
            }
            case "dom": {
                yes     = value && (value.tagName || value.nodeName) ? true : false;
                break;
            }
            case "jquery": {
                yes     = value && value.jquery ? true : false;
                if (yes) {
                    value = value.get(0);
                }
                break;
            }
            case "boolean": {
                if (value === true || value === false) {
                    yes = true;
                }
                break;
            }
            default: {
                if (type === true && value === true) {
                    yes = true;
                }
                if (type === false && value === false) {
                    yes = true;
                }
            }
        }
        if (yes) {
            options[level1] = {};
            options[level1][level2] = value;
        }
    };

    var fixShorthands   = function(options) {

        if (!options) {
            return {};
        }

        fixShorthand(options, "content", "value", "string");
        fixShorthand(options, "content", "value", "boolean");
        fixShorthand(options, "content", "fn", "function");
        fixShorthand(options, "ajax", "url", "string");
        fixShorthand(options, "cls", "dialog", "string");
        fixShorthand(options, "render", "tpl", "string");
        fixShorthand(options, "render", "fn", "function");
        fixShorthand(options, "render", "el", "dom");
        fixShorthand(options, "render", "el", "jquery");
        fixShorthand(options, "show", "events", false);
        fixShorthand(options, "show", "events", "string");
        fixShorthand(options, "hide", "events", false);
        fixShorthand(options, "hide", "events", "string");
        fixShorthand(options, "toggle", "events", false);
        fixShorthand(options, "toggle", "events", "string");
        fixShorthand(options, "position", "type", "string");
        fixShorthand(options, "position", "type", false);
        fixShorthand(options, "position", "get", "function");
        fixShorthand(options, "overlay", "enabled", "boolean");
        fixShorthand(options, "pointer", "position", "string");
        fixShorthand(options, "pointer", "size", "number");

        return options;
    };


    /**
     * @object MetaphorJs.dialog.Dialog.defaults
     */
    var defaults    = {

        /**
         * Target element(s) which trigger dialog's show and hide.<br>
         * If {Element}: will be used as a single target,<br>
         * if selector: will be used as dynamic target.<br>
         * Dynamic targets work like this:<br>
         * you provide delegates: {someElem: {click: someClass}} -- see "show" function<br>
         * when show() is called, target will be determined from the event using
         * the selector.
         * @property {string|Element} target
         */
        target:         null,

        /**
         * One or more group names.
         * @property {string|array} group
         */
        group:          null,

        /**
         * If dialog is modal, overlay will be forcefully enabled.
         * @property {bool} modal
         */
        modal:			false,

        /**
         * Use link's href attribute as ajax.url or as render.el
         * @property {bool} useHref
         */
        useHref:        false,


        /**
         * If neither content value nor ajax url are provided,
         * plugin will try to read target's attribute values: 'tooltip', 'title' and 'alt'.
         * (unless attr is specified).<br>
         * <em>shorthand</em>: string -> content.value<br>
         * <em>shorthand</em>: false -> content.value<br>
         * <em>shorthand</em>: function -> content.fn<br>
         * @object content
         */
        content: {

            /**
             * Dialog's text content. Has priority before readContent/loadContent.
             * If set to false, no content will be automatically set whether via fn() or attributes.
             * @property {string|boolean} value
             */
            value: 			'',

            /**
             * Must return content value
             * @property {function} fn
             * @param {Element} target
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @returns {string}
             */
            fn:				null,

            /**
             * This function receives new content and returns string value (processed content).
             * @property {function} prepare
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {string} mode
             *      empty string - content has come from content.value or setContent()<br>
             *      'attribute' - content has been read from target attributes<br>
             *      'ajax' - data returned by ajax request
             *      @default '' | 'attribute' | 'ajax'
             *
             * @param {string} content
             * @returns {string}
             */
            prepare:		null,

            /**
             * Get content from this attribute (belongs to target)
             * @property {string} attr
             */
            attr:           null

            /**
             * @end-object
             */
        },


        /**
         * All these options are passed to $.ajax().
         * You can provide more options in this section
         * but 'success' will be overriden (use content.prepare for data processing).<br>
         * <em>shorthand</em>: string -> ajax.url
         * @object ajax
         */
        ajax: {

            /**
             * Url to load content from.
             * @property {string} url
             */
            url: 			null,

            /**
             * Pass this data along with xhr.
             * @property {object} data
             */
            data: 			null,

            /**
             * @property {string} dataType
             */
            dataType: 		'text',

            /**
             * @property {string} method
             */
            method: 		'GET'

            /**
             * @end-object
             */
        },

        /**
         * Classes to apply to the dialog.
         * <em>shorthand</em>: string -> cls.dialog
         * @object cls
         */
        cls: {
            /**
             * Base class.
             * @property {string} dialog
             */
            dialog:         null,
            /**
             * Only applied when dialog is visible.
             * @property {string} visible
             */
            visible:        null,
            /**
             * Only applied when dialog is hidden.
             * @property {string} hidden
             */
            hidden:         null,
            /**
             * Only applied when dialog is performing ajax request.
             * @property {string} loading
             */
            loading:        null

            /**
             * @end-object
             */
        },

        /**
         * <p>Selector is used when dialog has inner structure and you
         * want to change its content.</p>
         * <pre><code class="language-javascript">
         * {
         *      render: {
         *          tpl: '&lt;div&gt;&lt;div class=&quot;content&quot;&gt;&lt;/div&gt;&lt;/div&gt;'
         *      },
         *      selector: {
         *          content: '.content'
         *      }
         * }
         * </code></pre>
         * <p>If no selector provided, setContent will replace all inner html.
         * Another thing relates to structurally complex content:</p>
         *
         * <pre><code class="language-javascript">
         * setContent({title: "...", body: "..."});
         * selector: {
         *      title:  ".title",
         *      body:   ".body"
         * }
         * </code></pre>
         * @object selector
         */
        selector:           {
            /**
             * Dialog's content selector.
             * @property {string} content
             */
            content:        null

            /**
             * @end-object
             */
        },

        /**
         * Object {buttonId: selector}
         * @property {object|null} buttons
         */
        buttons: null,


        /**
         * <p><em>shorthand</em>: string -> render.tpl<br>
         * <em>shorthand</em>: function -> render.fn<br>
         * <em>shorthand</em>: dom element -> render.el<br>
         * @object render
         */
        render: {
            /**
             * Dialog's template 
             * @property {string} tpl
             */
            tpl: 			'<div></div>',

            /**
             * Call this function to get dialog's template.
             * @property {function} fn
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @returns {string|Element}
             */
            fn: 			null,

            /**
             * Selector or existing element instead of template.
             * @property {string|Element} el
             */
            el: 			null,

            /**
             * Apply this zIndex.
             * @property {number} zIndex
             */
            zIndex:			null,

            /**
             * false - render immediately, true - wait for the first event.
             * @property {bool} lazy
             */
            lazy: 			true,

            /**
             * Object to pass to elem.css()
             * @property {object} style
             */
            style:          null,

            /**
             * If set, the element will be appended to specified container.<br>
             * If set to false, element will not be appended anywhere (works with "el").
             * @property {string|Element|bool} appendTo
             */
            appendTo:		null,

            /**
             * Dialog's id attribute.
             * @property {string} id
             */
            id:				null,

            /**
             * If set to true, element's show() and hide() will never be called. Use
             * "visible" and "hidden" classes instead.
             * @property {boolean} keepVisible
             */
            keepVisible:    false,

            /**
             * When destroying dialog's elem, keep it in DOM.
             * Useful when you return it in fn() on every show()
             * and have lifetime = 0.
             * @property {boolean} keepInDOM
             */
            keepInDOM:      false,

            /**
             * Number of ms for the rendered object to live
             * after its been hidden. 0 to destroy elem immediately.
             * @property {number} lifetime
             */
            lifetime:       null

            /**
             * @end-object
             */
        },

        /**
         * Event actions.
         * @object events
         */
        events: {

            /**
             * @object show
             */
            show: {

                /**
                 * You can also add any event you use to show/hide dialog 
                 * (mouseup, mousedown, etc)
                 * @object * 
                 */
                "*": {

                    /**
                     * @property {boolean} preventDefault
                     */
                    preventDefault: false,

                    /**
                     * @property {boolean} stopPropagation
                     */
                    stopPropagation: false,

                    /**
                     * @property {boolean} returnValue
                     */
                    returnValue: null,

                    /**
                     * @property {function} process
                     * @param {Dialog} dialog
                     * @param {Event} event
                     * @param {string} type show|hide
                     * @param {string} returnMode
                     */
                    process: defaultEventProcessor

                    /**
                     * @end-object
                     */
                }

                /**
                 * @end-object
                 */
            },

            /**
             * @object hide
             */
            hide: {

                /**
                 * You can also add any event you use to show/hide dialog.
                 * @object *
                 */
                "*": {

                    /**
                     * @property {boolean} preventDefault
                     */
                    preventDefault: false,

                    /**
                     * @property {boolean} stopPropagation
                     */
                    stopPropagation: false,

                    /**
                     * @property {boolean} returnValue
                     */
                    returnValue: null,

                    /**
                     * Must return "returnValue" which will be in its turn
                     * returned from event handler. If you provide this function
                     * preventDefault and stopPropagation options are ignored.
                     * @property {function}
                     * @param {Dialog} dialog
                     * @param {Event} event
                     * @param {string} type show|hide
                     * @param {string} returnMode
                     */
                    process: defaultEventProcessor

                    /**
                     * @end-object
                     */
                }

                /**
                 * @end-object
                 */
            }

            /**
             * @end-object
             */
        },

        /**
         * <p><em>shorthand</em>: false -> show.events<br>
         * <em>shorthand</em>: string -> show.events._target</p>
         * @object show
         */
        show: {
            /**
             * Delay dialog's appearance. Milliseconds.
             * @property {number} delay
             */
            delay: 			null,

            /**
             * True to hide all other tooltips.
             * If "group" specified, will hide only
             * those dialogs that belong to that group.
             * @property {bool} single
             */
            single:			false,

            /**
             * Works for show, hide and toggle
             * <pre><code class="language-javascript">
             * events: false // disable all
             *
             * events: eventName || [eventName, eventName, ...]
             * // same as events: {"_target": ...}
             *
             * events: {
             *  "body":         eventName || [eventName, eventName, ...],
             *  "_self":        same, // dialog itself
             *  "_target":      same, // target element
             *  "_document":    same,
             *  "_window":      same,
             *  "_html":        same,
             *  "_overlay":     same, // overlay element (works with hiding)
             *  ">.selector":   same // selector inside dialog
             * }
             *
             * events: {
             *  "(body|_self|_target|...)": {
             *      eventName: ".selector"
             *  }
             *  // $("body|_self|_target|...").delegate(".selector", eventName)
             *  // this one is for dynamic targets
             * }
             * </code></pre>
             * @property {string|bool|object} events
             */
            events:			null,

            /**
             * <p>true -- ["mjs-show"] or ["mjs-hide"]<br>
             * string -- class name -> [class]<br>
             * array -- [{properties before}, {properties after}]<br>
             * array -- [class, class]<br>
             * object --
             * .fn -- string: "fadeIn", "fadeOut", etc. (optional) requires jQuery<br>
             * .fn -- function(Element, completeCallback)
             * .stages -- [class, class] (optional)
             * .before -- {} apply css properties before animation (optional)
             * .after -- {} animate these properties (optional) requires jQuery
             * .options - {} jQuery's .animate() options
             * .context -- fn's this object
             * .duration -- used when .fn is string
             * .skipDisplayChange -- do not set style.display = "" on start
             * function(){}<br>
             * function must return any of the above:</p>
             * <pre><code class="language-javascript">
             * animate: function(dlg, e) {
             *      return {
             *          before: {
             *             width: '200px'
             *          },
             *          after: {
             *              width: '400px'
             *          },
             *          options: {
             *             step: function() {
             *               dlg.reposition();
             *             }
             *          }
             *      };
             * }
             * </code></pre>
             * @property {bool|string|array|function} animate
             */
            animate:		false,

            /**
             * Ignore {show: {single: true}} on other dialogs.
             * @property {bool} ignoreHideAll
             */
            ignoreHideAll:	false,

            /**
             * true - automatically set focus on input fields on buttons;
             * string - selector
             * @property {bool|string} focus
             */
            focus:          false,

            /**
             * Prevent scrolling on given element
             * true = "body"
             * @property {bool|string|Element} preventScroll
             */
            preventScroll:  false,

            /**
             * When showing, set css display to this value
             * @property {string} display
             */
            display: "block"

            /**
             * @end-object
             */
        },


        /**
         * <p><em>shorthand</em>: false -> hide.events<br>
         * <em>shorthand</em>: string -> hide.events._target</p>
         * @object hide
         */
        hide: {
            /**
             * Milliseconds. Delay hiding for this amount of time.
             * @property {number} delay
             */
            delay:			null,

            /**
             * Milliseconds. Dialog will be shown no longer than for that time.
             * @property {number} timeout
             */
            timeout: 		null,

            /**
             * See show.events
             * @property {string|bool|object} events
             */
            events: 		null,

            /**
             * Destroy dialog after hide.
             * @property {bool} destroy
             */
            destroy:        false,

            /**
             * Remove element from DOM after hide
             * @property {bool} remove
             */
            remove:         false,

            /**
             * See show.animate
             * @property {bool|string|array|function} animate
             */
            animate:		false,

            /**
             * true: hide anyway even if showing is delayed,<br>
             * false: ignore hide events until tooltip is shown.
             * @property {bool} cancelShowDelay
             */
            cancelShowDelay:true

            /**
             * @end-object
             */
        },

        /**
         * This option is required when you want to show and hide on the same event.<br>
         * <em>shorthand</em>: false -> toggle.events<br>
         * <em>shorthand</em>: string -> toggle.events._target
         * @object toggle
         */
        toggle: {
            /**
             * See show.events
             * @property {string|bool|object} events
             */
            events: 		null

            /**
             * @end-object
             */
        },

        /**
         * <p><em>shorthand</em>: false -> position.type<br>
         * <em>shorthand</em>: string -> position.type<br>
         * <em>shorthand</em>: function -> position.get
         * @object position
         */
        position: {

            /**
             * false -- do not apply position<br>
             * function(api) - must return one of the following:<br>
             * "auto" - detect position automatically<br>
             *
             * <b>relative to target:</b><br>
             * t | r | b | l -- simple positions aligned by center<br>
             * tr | rt | rb | br | bl | lb | lt | tl -- aligned by side<br>
             * trc | brc | blc | tlc -- corner positions<br>
             *
             * <b>relative to mouse:</b><br>
             * m -- works only with get(). get() function will be called on mousemove<br>
             * mt | mr | mb | ml -- following the mouse, aligned by center<br>
             * mrt | mrb | mlb | mlt -- following the mouse, corner positions<br>
             *
             * <b>window positions:</b><br>
             * wc | wt | wr | wb | wl<br>
             * wrt | wrb | wlt | wlb
             *
             * Defaults to 't'
             * @property {bool|string} type
             */
            type:			't',

            /**
             * @property {string} preferredType
             */
            preferredType:  null,

            /**
             * Add this offset to dialog's x position
             * @property {number} offsetX
             */
            offsetX: 		0,

            /**
             * Add this offset to dialog's y position
             * @property {number} offsetY
             */
            offsetY:		0,

            /**
             * Follow the mouse only by this axis;
             * second coordinate will be relative to target
             * @property {string} axis
             */
            axis: 			null,

            /**
             * Overrides position.type<br>
             * If this function is provided, offsets are not applied.
             * @property {function} get
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             * @returns {object} {
             *      @type {number} x If object contains only one coordinate - x or y -
             *                       the other one will not be updated.
             *      @type {number} y
             *      @type {number} top If object does not contain x and y, it will be applied
             *                          as is.
             *      @type {number} right
             *      @type {number} bottom
             *      @type {number} left
             * }
             */
            get:			null,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @property {number|bool} screenX
             */
            screenX:		false,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @property {number|bool} screenY
             */
            screenY:		false,

            /**
             * Calculate position relative to this element (defaults to window)
             * @property {string|Element} base
             */
            base:           null,

            /**
             * Monitor window/selector/element scroll and reposition on scroll.
             * @property {bool|string|Element} scroll
             */
            scroll:         false,

            /**
             * Monitor window resize and reposition on resize
             * @property {bool} resize
             */
            resize:         true

            /**
             * @end-object
             */
        },

        /**
         * Pointer will only work if size > 0 or el is not null<br>
         * <em>shorthand</em>: string -> pointer.position<br>
         * <em>shorthand</em>: number -> pointer.size
         * @object pointer
         */
        pointer: {

            /**
             * t / r / b / l<br>
             * tr / lt / lb / br / bl / lb / lt<br>
             * null - opposite to dialog's position
             * @property {string} position
             */
            position: 		null,

            /**
             * t / r / b / l<br>
             * null - opposite to primary position
             * @property {string} direction
             */
            direction: 		null,

            /**
             * Number of pixels (triangle's height)
             * @property {number} size
             */
            size: 			0,

            /**
             * Number of pixels (triangle's width), by default equals to size.
             * @property {number} width
             */
            width:			null,

            /**
             * '#xxxxxx'
             * @property {string} color
             */
            color: 			null,

            /**
             * Shift pointer's position by this number of pixels.
             * Shift direction will depend on position:<br>
             * t / tl / b / bl - right shift<br>
             * tr / br - left shift<br>
             * r / l / rt / lt - top shift<br>
             * rb / lb - bottom shift
             * @property {number} offset
             */
            offset: 		0,

            /**
             * Number of pixels.
             * @property {number} border
             */
            border:			0,

            /**
             * '#xxxxxx'
             * @property {string} borderColor
             */
            borderColor:	null,

            /**
             * Custom pointer.<br>
             * If you provide custom pointer el,
             * border, direction and color will not be applied.<br>
             * pointer.cls will be applied.
             * @property {string|Element} el
             */
            el:             null,

            /**
             * Apply this class to pointer.
             * @property {string} cls
             */
            cls:            null,

            /**
             * Apply this class to pointerBorder element.
             * @property {string} borderCls
             */
            borderCls:      null

            /**
             * @end-object
             */
        },

        /**
         * <p><em>shorthand</em>: boolean -> overlay.enabled<br></p>
         * @object overlay
         */
        overlay:			{

            /**
             * Enable overlay.
             * @property {bool} enabled
             */
            enabled:		false,

            /**
             * @property {string} color
             */
            color:			'#000',

            /**
             * @property {number} opacity
             */
            opacity:		.5,

            /**
             * @property {string} cls
             */
            cls:			null,

            /**
             * Same animation rules as in show.animate.
             * @property {bool} animateShow
             */
            animateShow:	false,

            /**
             * Same animation rules as in show.animate.
             * @property {bool} animateHide
             */
            animateHide:	false

            /**
             * @end-object
             */
        },

        /**
         * Callbacks are case insensitive.<br>
         * You can use camel case if you like.
         * @object callback
         */
        callback: {

            /**
             * 'this' object for all callbacks, including render.fn, position.get, etc.
             * @property {object} context
             */
            context:			null,

            /**
             * When content has changed.
             * @property {function} contentChange
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {string} content
             */
            "content-change": 	null,

            /**
             * Before dialog appeared.<br>
             * Return false to cancel showing.
             * @property {function} beforeShow
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             */
            "before-show": 		null,

            /**
             * Immediately after dialog appeared.
             * @property {function} show
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             */
            show: 				null,

            /**
             * Before dialog disappears.<br>
             * Return false to cancel hiding.
             * @property {function} beforeHide
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             */
            "before-hide": 		null,

            /**
             * Immediately after dialog has been hidden.
             * @property {function} hide
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Event} event
             */
            hide: 				null,

            /**
             * After dialog has been rendered.
             * @property {function} render
             * @param {MetaphorJs.dialog.Dialog} dialog
             */
            render: 			null,

            /**
             * After dialog's html element has been removed.
             * @property {function} lifetime
             * @param {MetaphorJs.dialog.Dialog} dialog
             */
            lifetime:           null,

            /**
             * Called when dynamic target changes (on hide it always changes to null).
             * Also called from setTarget().
             * @property {function} targetChange
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {Element} newTarget
             * @param {Element|null} prevTarget
             */
            "target-change":       null,

            /**
             * One handler for all configured buttons. Called on click, enter and space.
             * @property {function} button
             * @param {MetaphorJs.dialog.Dialog} dialog
             * @param {string} buttonId
             * @param {Event} event
             */
            button:             null

            /**
             * @end-object
             */
        }

        /**
         * @end-object
         */
    };




    /**
     * @class MetaphorJs.dialog.Dialog
     * @mixes mixin_Observable
     */
    var Dialog = cls({

        $mixins:            [mixin_Observable],

        id:                 null,
        node:               null,
        overlay:            null,
        pointer:            null,
        cfg:                null,
        position:           null,

        target:             null,
        dynamicTarget:      false,
        dynamicTargetEl:    null,

        visible:            false,
        enabled:            true,
        frozen:             false,
        rendered:           false,

        bindSelfOnRender:   false,

        hideTimeout:        null,
        hideDelay:          null,
        showDelay:          null,
        destroyDelay:       null,

        images:             0,

        positionGetType:    null,
        positionClass:      null,
        positionAttempt:    0,

        $constructor: function() {

            this.$$events = {
                "before-show": {
                    returnResult: false
                },
                "before-hide": {
                    returnResult: false
                }
            };

            this.$super.apply(this, arguments);

        },

        /**
         * @method
         * @constructor
         * @param {object} cfg See MetaphorJs.dialog.Dialog.defaults
         */
        $init: function(cfg) {

            cfg = cfg || {};
            var preset  = cfg.preset,
                self    = this;

            cfg.preset  = null;
            cfg         = extend({}, defaults,
                                fixShorthands(Dialog.defaults),
                                fixShorthands(Dialog[preset]),
                                fixShorthands(cfg),
                                    true, true);

            self.cfg    = cfg;
            self.id     = nextUid();

            self.onPreventScrollDelegate = bind(self.onPreventScroll, self);
            self.onButtonClickDelegate = bind(self.onButtonClick, self);
            self.onButtonKeyupDelegate = bind(self.onButtonKeyup, self);
            self.showDelegate = bind(self.show, self);
            self.hideDelegate = bind(self.hide, self);
            self.toggleDelegate = bind(self.toggle, self);
            self.onImageLoadDelegate = bind(self.onImageLoad, self);

            manager.register(self);

            if (cfg.modal) {
                cfg.overlay.enabled = true;
            }
            self.overlay    = new dialog_Overlay(self);

            var pointerCls = ucfirst(cfg.pointer.$class || "Html");
            self.pointer    = cls.factory(
                                "MetaphorJs.dialog.pointer." + pointerCls, 
                                self, cfg.pointer);

            if (isFunction(cfg.position.type)) {
                self.positionGetType = cfg.position.type;
            }

            self.setTarget(cfg.target);

            if (cfg.target && cfg.useHref) {
                var href = dom_getAttr(self.getTarget(), "href");
                if (href.substr(0, 1) === "#") {
                    cfg.render.el = href;
                }
                else {
                    cfg.ajax.url = href;
                }
            }

            if (!cfg.render.lazy) {
                self.render();
            }

            self.trigger("init", self);
            self.setHandlers("bind");
        },


        /* **** General api **** */


        /**
         * @method
         * @returns {Element}
         */
        getElem: function() {
            return this.node;
        },

        /**
         * @method
         * @returns {string}
         */
        getInstanceId: function() {
            return this.id;
        },

        /**
         * Get dialog's config.
         * @method
         * 
         * @return {object}
         */
        getCfg: function() {
            return this.cfg;
        },

        /**
         * Get dialog's pointer object
         * @method
         * @returns {MetaphorJs.dialog.pointer.*}
         */
        getPointer: function() {
            return this.pointer;
        },


        /**
         * Get dialog's overlay object
         * @method
         * @returns {dialog_Overlay}
         */
        getOverlay: function() {
            return this.overlay;
        },


        /**
         * @method
         * 
         * @return {boolean}
         */
        isEnabled: function() {
            return this.enabled;
        },

        /**
         * @method
         * 
         * @return {boolean}
         */
        isVisible: function() {
            return this.visible;
        },

        /**
         * @method
         * 
         * @returns {boolean}
         */
        isHideAllIgnored: function() {
            return this.cfg.show.ignoreHideAll;
        },

        /**
         * @method
         * 
         * @return {boolean}
         */
        isFrozen: function() {
            return this.frozen;
        },

        /**
         * @method
         * @returns {boolean}
         */
        isRendered: function() {
            return this.rendered;
        },

        /**
         * Enable dialog (enabled by default)
         * @method
         * 
         */
        enable: function() {
            this.enabled = true;
        },

        /**
         * Disable dialog
         * 
         * @method
         */
        disable: function() {
            this.hide();
            this.enabled = false;
        },

        /**
         * The difference between freeze and disable is that
         * disable always hides dialog and freeze makes current
         * state permanent (if it was shown, it will stay shown
         * until unfreeze() is called).
         * 
         * @method
         */
        freeze: function() {
            this.frozen   = true;
        },

        /**
         * Unfreeze dialog
         * @method
         * 
         */
        unfreeze: function() {
            this.frozen   = false;
        },

        /**
         * Get groups.
         * @method
         * 
         * @return {[]}
         */
        getGroup: function() {
            var cfg = this.cfg;
            if (!cfg.group) {
                return [""];
            }
            else {
                return isString(cfg.group) ?
                       [cfg.group] : cfg.group;
            }
        },

        /**
         * Show/hide
         * @method
         * 
         * @param {Event} e Optional
         * @param {bool} immediately Optional
         */
        toggle: function(e, immediately) {

            var self = this;

            // if switching between dynamic targets
            // we need not to hide tooltip
            if (e && e.stopPropagation && self.dynamicTarget) {

                if (self.visible && self.isDynamicTargetChanged(e)) {
                    return self.show(e);
                }
            }

            return self[self.visible ? 'hide' : 'show'](e, immediately);
        },


        /* **** Events **** */

        resetHandlers: function(fn, context) {

            var self = this;
            self.setHandlers("unbind");
            self.bindSelfOnRender = false;

            if (fn) {
                fn.call(context, self, self.getCfg());
            }

            self.setHandlers("bind");
        },

        setHandlers: function(mode, only) {

            var self    = this,
                cfg     = self.cfg,
                fns     = ["show", "hide", "toggle"],
                lfn     = mode === "bind" ? dom_addListener : 
                                            dom_removeListener,
                dfn     = mode === "bind" ? dom_delegate :
                                            MetaphorJs.dom.undelegate,
                fn,
                fnCfg,
                selector,
                e, i, len,
                evs, el,
                j, jl;

            while (fn = fns.shift()) {

                fnCfg   = cfg[fn].events;

                if (fnCfg === false) {
                    continue;
                }

                if (isString(fnCfg) || isArray(fnCfg)) {
                    if (self.dynamicTarget) {
                        var tmp     = {};
                        tmp[fnCfg]  = cfg.target;
                        fnCfg       = {
                            "_html": tmp
                        }
                    }
                    else {
                        fnCfg   = {"_target": fnCfg};
                    }
                }

                for (selector in fnCfg) {

                    if (only) {
                        if (only === '_self') {
                            if (selector !== '_self' &&
                                selector !== "_overlay" &&
                                selector.substr(0,1) !== '>') {
                                continue;
                            }
                        }
                        else if (selector !== only) {
                            continue;
                        }
                    }

                    if ((selector === '_self' ||
                            selector === '_overlay' ||
                            selector.substr(0,1) === '>')
                        && !self.node) {

                        self.bindSelfOnRender = true;
                        continue;
                    }

                    evs         = fnCfg[selector];

                    if (!evs) {
                        continue;
                    }

                    switch (selector) {
                        case "_target":
                            el  = [self.getTarget()];
                            break;

                        case "_self":
                            el  = [self.node];
                            break;

                        case "_window":
                            el  = [window];
                            break;

                        case "_document":
                            el  = [window.document];
                            break;

                        case "_html":
                            el  = [window.document.documentElement];
                            break;

                        case "_overlay":
                            el  = [self.overlay.getElem()];
                            break;

                        default:
                            el  = selector.substr(0,1) === '>' ?
                                    select(selector.substr(1), self.node) :
                                    select(selector);

                    }

                    if (!el || !el.length) {
                        continue;
                    }

                    if (isString(evs)) {
                        evs     = [evs];
                    }

                    if (isArray(evs)) {
                        for (i = 0, len = evs.length; i < len; i++) {
                            for (j = -1, jl = el.length; ++j < jl; lfn(el[j], evs[i], self[fn+"Delegate"])){}
                        }
                    }
                    else {
                        for (e in evs) {
                            for (j = -1, jl = el.length; ++j < jl; dfn(el[j], evs[e], e, self[fn+"Delegate"])){}
                        }
                    }
                }
            }
        },




        onPreventScroll: function(e) {
            dom_normalizeEvent(e).preventDefault();
        },

        onButtonClick: function(e) {

            var target  = dom_normalizeEvent(e).target,
                btnId   = dom_data(target, "metaphorjsTooltip-button-id");

            if (btnId) {
                this.trigger("button", this, btnId, e);
            }
        },

        onButtonKeyup: function(e) {
            if (e.keyCode === 13 || e.keyCode === 32) {
                var target  = e.target,
                    btnId   = dom_data(target, "metaphorjsTooltip-button-id");

                if (btnId) {
                    this.trigger("button", this, btnId, dom_normalizeEvent(e));
                }
            }
        },

        getEventConfig: function(e, action) {

            var self    = this,
                ecfg    = getEventConfig(e, action, self.node),
                cfg     = self.cfg;

            if (!ecfg && cfg.events[action]) {
                ecfg   = cfg.events[action][e.type] || cfg.events[action]['*'];
            }

            return ecfg;
        },


        /* **** Show **** */

        /**
         * Show dialog
         * @method
         * 
         * @param {Event} e Optional. True to skip delay.
         * @param {bool} immediately Optional
         */
        show: function(e, immediately) {

            // if called as an event handler, we do not return api
            var self        = this,
                cfg         = self.cfg,
                returnValue	= null,
                scfg        = cfg.show,
                returnMode  = null;

            if (e) {
                e = dom_normalizeEvent(e);
            }

            // if tooltip is disabled, we do not stop propagation and do not return false.s
            if (!self.isEnabled()) {
                returnMode = "disabled";
            }

            // if tooltip is already shown
            // and hide timeout was set.
            // we need to restart timer
            if (!returnMode && self.visible && self.hideTimeout) {

                window.clearTimeout(self.hideTimeout);
                self.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);

                returnMode = "hidetimeout";
            }

            // if tooltip was delayed to hide
            // we cancel it.
            if (!returnMode && self.hideDelay) {

                window.clearTimeout(self.hideDelay);
                self.hideDelay     = null;
                self.visible       = true;

                returnMode = "hidedelay";
            }


            // various checks: tooltip should be enabled,
            // should not be already shown, it should
            // have some content, or empty content is allowed.
            // also if beforeShow() returns false, we can't proceed
            // if tooltip was frozen, we do not show or hide
            if (!returnMode && self.frozen) {
                returnMode = "frozen";
            }

            // cancel delayed destroy
            // so that we don't have to re-render dialog
            if (self.destroyDelay) {
                window.clearTimeout(self.destroyDelay);
                self.destroyDelay = null;
            }


            var dtChanged   = false;

            // if we have a dynamicTarget
            if (e && self.dynamicTarget) {
                dtChanged = self.changeDynamicTarget(e);
            }

            if (self.visible) {
                if (!dtChanged) {
                    returnMode = returnMode || "visible";
                }
                else {
                    self.reposition(e);
                    returnMode = "reposition";
                }
            }

            if (!returnMode || dtChanged) {
                // if tooltip is not rendered yet we render it
                if (!self.node) {
                    self.render();
                }
                else if (dtChanged) {
                    self.changeDynamicContent();
                }
            }


            // if beforeShow callback returns false we stop.
            if (!returnMode && self.trigger('before-show', self, e) === false) {
                returnMode = "beforeshow";
            }

            var ecfg;

            if (e && (ecfg = self.getEventConfig(e, "show"))) {

                if (ecfg.process) {
                    returnValue	= ecfg.process(self, e, "show", returnMode);
                }
                else {
                    ecfg.stopPropagation && e.stopPropagation();
                    ecfg.preventDefault && e.preventDefault();
                    returnValue = ecfg.returnValue;
                }
            }

            if (returnMode) {
                return returnValue;
            }

            // first, we stop all current animations
            animate_stop(self.node);

            // as of this moment we mark dialog as visible so that hide() were able
            // to work. also, all next steps should check for this state
            // in case if tooltip case hidden back during the process
            self.visible = true;

            if (scfg.single) {
                manager.hideAll(self);
            }

            self.toggleTitleAttribute(false);

            if (scfg.delay && !immediately) {
                self.showDelay = async(self.showAfterDelay, self, [e], scfg.delay);
            }
            else {
                self.showAfterDelay(e, immediately);
            }

            return returnValue;
        },


        showAfterDelay: function(e, immediately) {

            var self = this,
                cfg = self.cfg;

            self.showDelay = null;

            // if tooltip was already hidden, we can't proceed
            if (!self.visible) {
                return;
            }

            self.trigger('show-after-delay', self, e);

            if (cfg.hide.remove) {
                self.appendElem();
            }

            self.reposition(e);


            if (cfg.show.preventScroll) {
                var ps = cfg.show.preventScroll,
                    i, l;
                if (ps === true) {
                    ps = "body";
                }
                ps = select(ps);
                for (i = -1, l = ps.length; ++i < l;
                    dom_addListener(ps[i], "mousewheel", self.onPreventScrollDelegate) &&
                    dom_addListener(ps[i], "touchmove", self.onPreventScrollDelegate)
                ){}
            }

            self.overlay.show();

            if (cfg.show.animate && !immediately) {
                self.animate("show").done(function() {
                    self.showAfterAnimation(e);
                });
            }
            else {
                raf(function(){
                    self.showAfterAnimation(e);
                });
            }
        },

        showAfterAnimation: function(e) {

            var self = this,
                cfg = self.cfg,
                node = self.node;

            // if tooltip was already hidden, we can't proceed
            if (!self.visible) {
                return;
            }

            // now we can finally show the dialog (if it wasn't shown already
            // during the animation
            dom_removeClass(node, cfg.cls.hidden);
            dom_addClass(node, cfg.cls.visible);

            if (!cfg.render.keepVisible) {
                node.style.display = cfg.show.display || "block";
            }


            // if it has to be shown only for a limited amount of time,
            // we set timeout.
            if (cfg.hide.timeout) {
                self.hideTimeout = async(self.hide, self, null, cfg.hide.timeout);
            }

            if (cfg.show.focus) {
                async(self.setFocus, self, null, 20);
            }

            self.trigger('show', self, e);
        },





        /* **** Hide **** */


        /**
         * Hide dialog
         * @method
         * 
         * @param {Event} e Optional.
         * @param {bool} immediately Optional. True to skip delay.
         * @param {bool} cancelShowDelay Optional. If showing already started but was delayed -
         * cancel that delay.
         */
        hide: function(e, immediately, cancelShowDelay) {

            var self            = this,
                returnValue	    = null,
                returnMode      = null,
                cfg             = self.cfg;

            self.hideTimeout    = null;

            // if the timer was set to hide the tooltip
            // but then we needed to close tooltip immediately
            if (!self.visible && self.hideDelay && immediately) {
                window.clearTimeout(self.hideDelay);
                self.hideDelay     = null;
                self.visible       = true;
            }

            // various checks
            if (!self.node || !self.visible || !self.isEnabled()) {
                returnMode = !self.node ? "noelem" : (!self.visible ? "hidden" : "disabled");
            }

            // if tooltip is still waiting to be shown after delay timeout,
            // we cancel this timeout and return.
            if (self.showDelay && !returnMode) {

                if (cfg.hide.cancelShowDelay || cancelShowDelay) {
                    window.clearTimeout(self.showDelay);
                    self.showDelay     = null;
                    self.visible       = false;

                    returnMode = "cancel";
                }
                else {
                    returnMode = "delay";
                }
            }

            // if tooltip was frozen, we do not show or hide
            if (self.frozen && !returnMode) {
                returnMode = "frozen";
            }

            // lets see what the callback will tell us
            if (!returnMode && self.trigger('before-hide', self, e) === false) {
                returnMode = "beforehide";
            }

            var ecfg;
            if (e && e.stopPropagation && (ecfg = self.getEventConfig(e, "hide"))) {

                if (ecfg.process) {
                    returnValue = ecfg.process(self, e, "hide", returnMode);
                }
                else {
                    if (ecfg.stopPropagation) e.stopPropagation();
                    if (ecfg.preventDefault) e.preventDefault();
                    returnValue = ecfg.returnValue;
                }
            }

            if (returnMode) {
                return returnValue;
            }

            // now we can stop all current animations
            animate_stop(self.node);

            // and change the state
            self.visible = false;

            self.toggleTitleAttribute(true);

            if (self.dynamicTarget) {
                self.resetDynamicTarget();
            }

            if (cfg.hide.delay && !immediately) {
                self.hideDelay = async(self.hideAfterDelay, self, [e], cfg.hide.delay);
            }
            else {
                self.hideAfterDelay(e, immediately);
            }

            return returnValue;
        },


        hideAfterDelay: function(e, immediately) {

            var self = this,
                cfg = self.cfg;

            self.hideDelay = null;

            if (self.visible) {
                return;
            }

            self.trigger('hide-after-delay', self, e);


            if (cfg.show.preventScroll) {
                var ps = cfg.show.preventScroll,
                    i, l;
                if (ps === true) {
                    ps = "body";
                }
                ps = select(ps);
                for (i = -1, l = ps.length; ++i < l;
                    dom_removeListener(ps[i], "mousewheel", self.onPreventScrollDelegate) &&
                    dom_removeListener(ps[i], "touchmove", self.onPreventScrollDelegate)
                ){}
            }

            self.overlay.hide();

            if (cfg.hide.animate && !immediately) {
                self.animate("hide").done(function() {
                    self.hideAfterAnimation(e);
                });
            }
            else {
                raf(function(){
                    self.hideAfterAnimation(e);
                });
            }
        },

        hideAfterAnimation: function(e) {

            var self = this,
                cfg = self.cfg,
                node = self.node;

            // we need to check if the tooltip was returned to visible state
            // while hiding animation
            if (self.visible) {
                return;
            }

            dom_removeClass(node, cfg.cls.visible);
            dom_addClass(node, cfg.cls.hidden);

            if (!cfg.render.keepVisible) {
                node.style.display = "none";
            }

            self.trigger('hide', self, e);

            var lt = cfg.render.lifetime;

            if (lt !== null) {
                if (lt === 0) {
                    self.destroyElem();
                }
                else {
                    self.destroyDelay = async(self.destroyElem, self, null, lt);
                }
            }

            if (node && cfg.hide.destroy) {
                raf(function(){
                    dom_data(node, cfg.instanceName, null);
                    self.$destroy();
                });
            }
            else if (node && cfg.hide.remove) {
                raf(function(){
                    self.removeElem();
                });
            }
        },



        /* **** Render **** */




        render: function() {

            var self = this,
                cfg = self.cfg,
                elem;

            // if already rendered, we return
            if (self.node) {
                return;
            }


            var rnd	    = cfg.render,
                cls     = cfg.cls;


            // custom rendering function
            if (rnd.fn) {
                var res = rnd.fn.call(self.$$callbackContext, self);
                rnd[isString(res) ? 'tpl' : 'el'] = res;
            }


            if (rnd.el) {
                if (isString(rnd.el)) {
                    elem = select(rnd.el).shift();
                    rnd.keepInDOM = true;
                }
                else {
                    elem = rnd.el;
                }
            }
            else {
                var tmp = window.document.createElement("div");
                tmp.innerHTML = rnd.tpl;
                elem = tmp.firstChild;
            }


            if (!elem) {
                elem = window.document.createElement("div");
            }

            self.node = elem;

            if (rnd.id) {
                dom_setAttr(elem, 'id', rnd.id);
            }

            if (!cfg.render.keepVisible) {
                elem.style.display = "none";
            }

            dom_addClass(elem, cls.dialog);
            dom_addClass(elem, cls.hidden);

            if (rnd.style) {
                dom_setStyle(elem, rnd.style);
            }


            self.overlay.render();


            if (!cfg.hide.remove) {
                self.appendElem();
            }
            else {
                if (elem.parentNode) {
                    elem.parentNode.removeChild(elem);
                }
            }

            if (rnd.zIndex) {
                dom_setStyle(elem, {zIndex: rnd.zIndex});
            }

            var cnt = cfg.content;

            if (cnt.value !== false) {
                if (cnt.value) {
                    self.setContent(cnt.value);
                }
                else {
                    if (cnt.fn) {
                        self.setContent(cnt.fn.call(self.$$callbackContext, self));
                    }
                    else {
                        self[cfg.ajax.url ? 'loadContent' : 'readContent']();
                    }
                }
            }

            self.pointer.render();
            self.pointer.append();

            if (cfg.buttons) {
                var btnId, btn;
                for (btnId in cfg.buttons) {
                    btn = select(cfg.buttons[btnId], elem).shift();
                    if (btn) {
                        dom_data(btn, "metaphorjsTooltip-button-id", btnId);
                        dom_addListener(btn, "click", self.onButtonClickDelegate);
                        dom_addListener(btn, "keyup", self.onButtonKeyupDelegate);
                    }
                }
            }

            if (self.bindSelfOnRender) {
                self.setHandlers('bind', '_self');
                self.bindSelfOnRender = false;
            }

            self.rendered = true;

            self.trigger('render', self);
        },








        /* **** Position **** */

        setPositionType: function(type) {
            var self    = this,
                positionCls     = self.getPositionClass(type);

            self.cfg.position.type = type;

            if (self.positionClass !== positionCls || !self.position) {
                if (self.position) {
                    self.position.$destroy();
                    self.position = null;
                }
                if (positionCls) {
                    self.position = cls.factory(positionCls, self);
                }
            }
            else {
                self.position.type = type;
            }

            if (self.isVisible()) {
                self.reposition();
            }
        },

        getPosition: function(e) {

            var self = this,
                cfgPos = self.cfg.position;

            if (!self.position) {

                if (!self.positionGetType && cfgPos.type !== "custom") {
                    if (isFunction(cfgPos.get) && cfgPos.type !== "m") {
                        cfgPos.type = "custom";
                    }
                }

                var type    = self.positionGetType ?
                                self.positionGetType.call(self.$$callbackContext, self, e) :
                                cfgPos.type,
                    positionCls = self.getPositionClass(type);

                cfgPos.type     = type;

                if (positionCls === false) {
                    return;
                }

                if (self.positionClass !== positionCls) {
                    self.position   = cls.factory(positionCls, self);
                }
                else {
                    self.position.type = type;
                }
            }

            return self.position;
        },

        getPositionClass: function(type) {

            if (!type) {
                return false;
            }

            if (isFunction(type) || type === "custom") {
                return "MetaphorJs.dialog.position.Custom";
            }

            var fc = type.substr(0, 1);

            if (!fc) {
                return false;
            }
            else if (fc === "w") {
                return "MetaphorJs.dialog.position.Window";
            }
            else if (fc === "m") {
                return "MetaphorJs.dialog.position.Mouse";
            }
            else {
                return "MetaphorJs.dialog.position.Target";
            }
        },


        /**
         * Usually called internally from show().
         * @method
         * 
         * @param {Event} e Optional.
         */
        reposition: function(e) {
            var self = this;

            if (self.repositioning) {
                return;
            }

            self.repositioning = true;

            e && (e = dom_normalizeEvent(e));

            self.getPosition(e);
            self.trigger("before-reposition", self, e);
            self.getPosition(e);
            self.trigger("reposition", self, e);

            self.repositioning = false;
        },



        /* **** Target **** */

        /**
         * Get dialog's target.
         * @method
         * 
         * @return {Element}
         */
        getTarget: function() {
            return this.dynamicTarget ? this.dynamicTargetEl : this.target;
        },


        /**
         * Set new dialog's target.
         * @method
         * 
         * @param {string|Element} newTarget Selector or dom node
         */
        setTarget: function(newTarget) {

            if (!newTarget) {
                return;
            }

            var self    = this,
                change  = false,
                prev    = self.target;

            if (self.target) {
                self.setHandlers('unbind', '_target');
                change = true;
            }
            else if (self.dynamicTarget) {
                change = true;
            }

            var isStr = isString(newTarget);

            if (isStr && newTarget.substr(0,1) !== "#") {
                self.dynamicTarget = true;
                self.target        = null;
            }
            else {
                if (isStr) {
                    newTarget       = select(newTarget).shift();
                }
                self.dynamicTarget = false;
                self.target        = newTarget;
            }

            if (change) {
                self.setHandlers('bind', '_target');
                self.trigger("target-change", self, newTarget, prev);
            }
        },


        resetDynamicTarget: function() {
            var self = this,
                curr = self.dynamicTargetEl;
            if (curr) {
                self.setHandlers("unbind", "_target");
                self.trigger("target-change", self, null, curr);
            }
        },

        isDynamicTargetChanged: function(e) {

            var self    = this,
                cfg     = self.cfg,
                dt	    = cfg.target,
                t	    = e.target,
                curr    = self.dynamicTargetEl;

            while (t && !dom_is(t, dt)) {
                t   = t.parentNode;
            }

            if (!t) {
                return false;
            }

            return !curr || curr !== t;
        },

        changeDynamicTarget: function(e) {

            var self    = this,
                cfg     = self.cfg,
                dt	    = cfg.target,
                t	    = e.target,
                curr    = self.dynamicTargetEl;

            while (t && !dom_is(t, dt)) {
                t   = t.parentNode;
            }

            if (!t) {
                return false;
            }

            if (!curr || curr !== t) {

                if (curr) {
                    self.setHandlers("unbind", "_target");
                }

                self.dynamicTargetEl = t;

                self.setHandlers("bind", "_target");
                self.trigger("target-change", self, t, curr);
                return true;
            }
            else {
                return false;
            }
        },









        /* **** Content **** */

        /**
         * @method
         * 
         * @return {Element}
         */
        getContentElem: function() {
            var self = this,
                node = self.node;

            if (!node) {
                return null;
            }

            if (self.cfg.selector.content) {
                var el = select(self.cfg.selector.content, node).shift();
                return el || node;
            }
            else {
                return node;
            }
        },


        /**
         * Set new content.
         * @method
         * 
         * @param {string|object} content {
             *      See "selector" option
             *      @required
         * }
         * @param {string} mode "", "attribute", "ajax" -- optional (used internally). See
         * content.prepare option.
         */
        setContent: function(content, mode) {

            mode = mode || '';

            var self    = this,
                node    = self.node,
                cfg     = self.cfg,
                pnt     = self.pointer;

            if (!node) {
                cfg.content.value = content;
                return self;
            }

            if (cfg.content.prepare) {
                content = cfg.content.prepare.call(self.$$callbackContext, self, mode, content);
            }

            var contentElem = self.getContentElem(),
                fixPointer  = self.rendered && !cfg.selector.content && pnt,
                pntEl       = fixPointer && pnt.getElem();

            if (fixPointer && pntEl) {
                try {
                    node.removeChild(pntEl);
                }
                catch (thrownError) {
                    error(thrownError);
                }
            }

            if (!isString(content)) {
                for (var i in content) {
                    var sel     = cfg.selector[i];
                    if (sel) {
                        var cel = select(sel, contentElem).shift();
                        if (cel) {
                            cel.innerHTML = content[i];
                        }
                    }
                }
            }
            else {
                contentElem.innerHTML = content;
            }

            // if there a pointer, and this is not initial content set,
            // and there is no selector for content
            // we must restore pointer after dialog's inner html
            // has been replaced with new content
            if (fixPointer && pntEl) {
                try {
                    node.appendChild(pntEl);
                }
                catch (thrownError) {
                    error(thrownError);
                }
            }

            var imgs = select("img", contentElem),
                l;

            self.images = imgs.length;

            for (i = -1, l = imgs.length; ++i < l; 
                dom_addListener(imgs[i], "load", self.onImageLoadDelegate)){}

            self.trigger('content-change', self, content, mode);
            self.onContentChange();
        },

        /**
         * Force dialog to re-read content from attributes.
         * @method
         * 
         */
        readContent: function() {

            var self        = this,
                cfg         = self.cfg,
                el 			= self.getTarget(),
                content;

            if (el) {
                if (cfg.content.attr) {
                    content = dom_getAttr(el, cfg.content.attr);
                }
                else {
                    content = dom_getAttr(el, 'tooltip') ||
                            dom_getAttr(el, 'title') ||
                            dom_getAttr(el, 'alt');
                }
            }

            if (content) {
                self.setContent(content, 'attribute');
            }
        },

        /**
         * Load content via ajax.
         * @method
         * @param {object} options Merged with cfg.ajax
         */
        loadContent: function(options) {

            var self = this,
                cfg = self.cfg;

            dom_addClass(self.node, cfg.cls.loading);
            var opt = extend({}, cfg.ajax, options, true, true);
            self.trigger('before-ajax', self, opt);
            return ajax(opt).done(self.onAjaxLoad, self);
        },

        onAjaxLoad: function(data) {
            var self = this;
            dom_removeClass(self.node, self.cfg.cls.loading);
            self.setContent(data, 'ajax');
        },

        onImageLoad: function() {
            this.images--;
            this.onContentChange();
        },

        onContentChange: function() {
            if (this.visible) {
                this.reposition();
            }
        },

        changeDynamicContent: function() {
            var self = this,
                cfg = self.cfg;
            if (cfg.content.fn) {
                self.setContent(cfg.content.fn.call(self.$$callbackContext, self));
            }
            else if (cfg.content.attr) {
                self.readContent();
            }
        },

        toggleTitleAttribute: function(state) {

            var self = this,
                trg = self.getTarget(),
                title;

            if (trg) {
                if (state === false) {
                    dom_data(trg, "tmp-title", dom_getAttr(trg, "title"));
                    dom_removeAttr(trg, 'title');
                }
                else if (title = dom_data(trg, "tmp-title")) {
                    dom_setAttr(trg, "title", title);
                }
            }
        },

        /* **** Dimension **** */


        getDialogSize: function() {

            var self    = this;

            if (!self.rendered) {
                self.render();
            }

            var cfg     = self.cfg,
                node    = self.node,
                hidden  = cfg.cls.hidden ? dom_hasClass(node, cfg.cls.hidden) : 
                                            !dom_isVisible(node),
                size,
                left    = node.style.left;

            if (hidden) {
                dom_setStyle(node, {left: "-1000px"});
                node.style.display = cfg.show.display;
            }

            size    = {
                width:      dom_getOuterWidth(node),
                height:     dom_getOuterHeight(node)
            };

            if (hidden) {
                dom_setStyle(node, {left: left});
                node.style.display = "none";
            }

            return size;
        },

        getTargetSize: function() {

            var self    = this,
                target  = self.getTarget();

            if (!target) {
                return null;
            }

            return {
                width:      dom_getOuterWidth(target),
                height:     dom_getOuterHeight(target)
            };
        },


        /* **** Misc **** */


        /**
         * Set focus based on focus setting.
         * @method
         */
        setFocus: function() {

            var self    = this,
                cfg     = self.cfg,
                af      = cfg.show.focus,
                node    = self.node,
                i,
                input;

            if (af === true) {
                input   = select("input", node).concat(
                            select("textarea", node));
                if (input.length > 0) {
                    input[0].focus();
                }
                else if (cfg.buttons) {
                    for (i in cfg.buttons) {
                        var btn = select(cfg.buttons[i], node).shift();
                        btn && btn.focus();
                        break;
                    }
                }
            }
            else {
                var el = select(af, node).shift();
                el && el.focus();
            }
        },

        getScrollEl: function(cfgScroll) {
            if (cfgScroll === true || cfgScroll === false) {
                return window;
            }
            else if (typeof cfgScroll === "string") {
                return select(cfgScroll).shift();
            }
            else {
                return cfgScroll;
            }
        },


        animate: function(section, e) {

            var self = this,
                cfg = self.cfg,
                node = self.node,
                a,
                skipDisplay;

            a 	= cfg[section].animate;

            if (isFunction(a)) {
                a   = a(self, e);
            }

            skipDisplay = a.skipDisplayChange || false;

            if (isBool(a)) {
                a = section;
            }
            else if (isString(a)) {
                a = [a];
            }

            return animate_animate(node, a, function(){
                if (section === "show" && !skipDisplay) {
                    return new lib_Promise(function(resolve, reject){
                        raf(function(){ 
                            node.style.display = cfg.show.display || "block";
                            resolve();
                        });
                    });
                }
            }, false);
        },

        removeElem: function() {

            var self = this,
                node = self.node;

            self.overlay.remove();

            if (node && node.parentNode) {
                raf(function(){
                    if (!self.visible) {
                        node.parentNode.removeChild(node);
                    }
                });
            }
        },

        appendElem: function() {



            var self    = this,
                cfg     = self.cfg,
                body    = window.document.body,
                rnd	    = cfg.render,
                to      = rnd.appendTo || body;

            self.overlay.append();

            if (self.node && cfg.render.appendTo !== false) {
                to.appendChild(self.node);
            }
        },


        /* **** Destroy **** */

        destroyElem: function() {

            var self = this,
                node = self.node;

            self.setHandlers("unbind", "_self");
            self.bindSelfOnRender = true;

            self.pointer.remove();
            self.overlay.remove();

            if (node) {
                if (!self.cfg.render.keepInDOM) {
                    node.parentNode && node.parentNode.removeChild(node);
                }
                self.node = null;
            }

            self.trigger("lifetime", self);
        },

        onDestroy: function() {

            var self = this;

            self.setHandlers("unbind");

            self.trigger("destroy", self);
            self.destroyElem();


            self.overlay && self.overlay.$destroy();
            self.pointer && self.pointer.$destroy();
            self.position && self.position.$destroy();
        }

    }, {
        defaults: null
    });



    return Dialog;

}());








var dialog_Component = MetaphorJs.dialog.Component = app_Component.$extend({

    dialog: null,
    dialogPreset: null,
    dialogCfg: null,

    dialogNode: null,

    hidden: true,

    target: null,
    isTooltip: false,

    $init: function(cfg) {

        var self = this;

        if (self.isTooltip) {
            self.target = cfg.node;
            cfg.node = null;
        }

        self.$super(cfg);
    },

    initComponent: function() {

        var self    = this;

        self.$super();
        self._createDialog();
    },

    _getDialogCfg: function() {

        var self    = this;

        return extend({}, self.dialogCfg, {
            preset: self.dialogPreset,
            render: {
                el: self.dialogNode || self.node,
                keepInDOM: true
            }
        }, true, true);
    },

    _createDialog: function() {

        var self    = this;
        self.dialog = new dialog_Dialog(self._getDialogCfg());
        self.dialog.on("show", self.onDialogShow, self);
        self.dialog.on("hide", self.onDialogHide, self);
        self.dialog.on("before-show", self.onBeforeDialogShow, self);
        self.dialog.on("before-hide", self.onBeforeDialogHide, self);
        self.dialog.on("destroy", self.onDialogDestroy, self);
    },

    getDialog: function() {
        return this.dialog;
    },

    // skips the append part
    _onRenderingFinished: function() {
        var self = this;
        self.rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);
    },

    show: function(e) {
        if (e && !(e instanceof lib_DomEvent)) {
            e = null;
        }

        this.dialog.show(e);
    },

    hide: function(e) {

        if (e && !(e instanceof lib_DomEvent)) {
            e = null;
        }

        this.dialog.hide(e);
    },

    onBeforeDialogShow: function() {

        var self = this;
        if (!self.rendered) {
            self.render();
        }

        self.template.config.set("animate", true);
        self.hidden = false;
    },

    onDialogShow: function() {
        var self = this;
        //self.onShow();
        self.trigger("show", self);
    },

    onBeforeDialogHide: function() {},

    onDialogHide: function() {
        var self = this;
        if (!self.$destroyed) {
            self.template.config.set("animate", false);
            //self.template.setAnimation(false);
            self.hidden = true;
            //self.onHide();
            self.trigger("hide", self);
        }
    },

    onDialogDestroy: function() {
        var self    = this;

        if (!self.$destroying) {
            self.dialog = null;
            self.$destroy();
        }
    },

    onDestroy: function() {

        var self    = this;

        if (self.dialog) {
            self.dialog.$destroy();
        }

        self.$super();

    }

});

var index = (function(){
















var Test = {};

ns.register("Test", Test);

cls({

    $class: "Test.MyApp2",
    $extends: "MetaphorJs.app.App",

    initApp: function(node, scope, someValue) {

        var self    = this;
        var level2Inx = 0;
        var level2  = [
            '(level 3 value: {{.b}})',
            '(level 3 value: {{.c}})'
        ];

        self.scope.resolved = someValue;

        self.scope.level1   = '[ and here comes level 2: {{.level2}} ]';
        self.scope.level2   = level2[level2Inx];

        self.scope.b        = 1;
        self.scope.c        = "variable c";

        self.scope.changeLevel2 = function(inx) {
            level2Inx = level2Inx == 0 ? 1 : 0;
            self.scope.level2 = level2[level2Inx];
        };

        self.scope.increaseB = function() {
            self.scope.b++;
        };

        self.scope.people = 0;

        self.lang.setLocale("ru");
        self.lang.set("key", "text value");
        self.lang.set("plr", ["котик", "котика", "котиков"]);
        self.lang.set("subkey1", 'subkey: {{\'subkey2\' | l}}');
        self.lang.set('subkey2', 'text value');

        self.lang.set("viewing", {
            '0': 'Nobody is viewing',
            '1': 'One person is viewing',
            '2': 'Two people are viewing',
            other: '{{.people}} people are viewing',
            negative: ""
        });
    }

}, {
    inject: ['$node', '$scope', 'someValue'],
    resolve: {
        someValue: function() {
            var p = new lib_Promise;
            setTimeout(function(){
                p.resolve((new Date).getTime());
            }, 100);
            return p;
        }
    }
});



cls({

    $class: "Test.MyView",
    $extends: "MetaphorJs.app.view.Router",
    route: [
        {
            template: 'test-template.html',
            "default": true
        },
        {
            regexp: /^\/1$/,
            cmp: "Test.MyComponent"
        },
        {
            regexp: /^\/2\/(\d+)$/,
            params: ["param"],
            cmp: "Test.MyComponent2"
        },
        {
            regexp: /^\/2$/,
            cmp: "Test.MyComponent2"
        },
        {
            regexp: /^\/3$/,
            template: "a+b.html"
        }
    ]
});

cls({
    $class: "Test.MyRecord",
    $extends: "MetaphorJs.model.Record"
});

cls({

    $class: "Test.MyComponent",
    $extends: "MetaphorJs.app.Component",

        initComponent: function() {

            var self    = this;

            self.scope.title = "My Component" + (new Date).getTime();

            var model   = new model_Model({
                type: "Test.MyRecord",
                id: "id",
                root: "record",
                total: "total",
                store: {
                    load: "data.json"
                }
            });

            self.scope.store = new model_Store({
                model: model
            });

            self.scope.deferred = self.deferred;
        },

        afterRender: function() {
            if (this.para && window.console && window.console.log) {
                console.log("got child property 'para': ", this.para);
            }
        },

        reverse: function() {
            var title   = this.scope.title;
            this.scope.title    = title.split("").reverse().join('');
        },

        createNew: function() {
            var node    = document.getElementById("newComponent");
            app_resolve("Test.DynamicComponent", {autoRender: true}, this.scope, node);
        },

        createRender: function() {
            var to  = document.getElementById("renderToComponent");
            app_resolve("Test.DynamicComponent", 
                {renderTo: to, autoRender: true}, this.scope);
        },

        createDialog: function() {

            var dialog = new dialog_Component({
                dialogCfg: {
                    cls: {
                        dialog: "dialog"
                    },
                    position: "wc",
                    show: {
                        animate: true
                    },
                    hide: {
                        destroy: true
                    }
                },
                config: {
                    as: "dlg",
                },
                scope: this.scope,
                template: {
                    html: '<p>This is a dialog. <a href="#" (click)="this.dlg.hide()">close</a></p>'
                }
            });
            dialog.show();
        },

        loadStore: function() {
            this.scope.store.load()
                .done(function(){this.scope.$check();}, this)
                .fail(function(reason){
                    console.log('failed', reason)
                });
        }
    }, {
        template: "cmp1-template.html",
        resolve: {
            deferred: ['$node', '$scope', 'test', function(node, scope, test) {
                return new lib_Promise(function(resolve, reject){
                    setTimeout(function(){
                        resolve((new Date).getTime());
                    }, 1000);
                });
            }]
        }
    });

cls({

    $class: "Test.MyComponent2",
    $extends: "MetaphorJs.app.Component",

    template: 'cmp1-template.html',

    initComponent: function(cfg, param) {
        var self    = this;

        if (cfg.param) {
            alert("received param: " + cfg.param);
        }
        self.scope.title = "My Component2 " + (new Date).getTime();
    }
});

cls({

    $class: "Test.TplComponent",
    $extends: "MetaphorJs.app.Component",

    initComponent: function() {

        var self    = this;

        self.scope.title= "Tpl Component";
        self.scope.tpl  = "a+b.html";

        self.scope.$app.onAvailable("myComponent1").done(function(cmp){
            if (window.console && window.console.log) {
                console.log("on available myComponent1");
            }
        });
    }
});

cls({
    $class: "Test.StringTemplate",
    $extends: "MetaphorJs.app.Component"
    }, {
    template: {
        html: '<p>This template is inlined in components definition ({{this.$root.a}})</p>'
    }
});

cls({
    $class: "Test.DynamicComponent",
    $extends: "MetaphorJs.app.Component"
    }, {
    template: {
        html: '<p>This component was created dynamically</p><div {transclude}></div>'
    }
});

cls({

    $class: "Test.ChangeTemplate",
    $extends: "MetaphorJs.app.Component",
    template: {
        htmlExpression: 'this.tpl'
    },

    initComponent: function() {

        var scope = this.scope;

        scope.tpl1 = '<p>Template 1</p><div {transclude}></div>';
        scope.tpl2 = '<p>Template 2</p><div {transclude}></div>';

        scope.tpl = scope.tpl1;
    }
});

cls({
    $class: "Test.ViewComponent1",
    $extends: "MetaphorJs.app.Component",
    template: {
        html: '<p>View template 1</p><div {transclude}></div>'
    }
});

cls({
    $class: "Test.ViewComponent2",
    $extends: "MetaphorJs.app.Component",
    template: {
        html: '<p>View template 2</p><div {transclude}></div>'
    }
});


cls({
    $class: "Test.TagComponent",
    $extends: "MetaphorJs.app.Component",
    $alias: "MetaphorJs.directive.component.tagc",
    template: "tagc.html"
});



dom_onReady(function(){
    var dataObj     = {
        linkified: 'Linkified text aaa http://www.kuindji.com bbb',
        newItem: "",
        date: new Date,
        num: 10000,
        list: [
            {bool: true, txt: "item 1"},
            {bool: false, txt: "item 2"},
            {bool: false, txt: "item 3"}
        ]
    };
    var start  = (new Date).getTime();
    var el = document.getElementById("render");

    if (el) {

        //console.profile();
        app_init(el, null, dataObj, false)
            .done(function (app) {
                app.value("test", "123");
                app.run();
                window.mainApp = app;
                window.MetaphorJs = MetaphorJs;
            });
        //console.profileEnd();

        var end = (new Date).getTime();

        if (window.console) {
            console.log("render time: ", end - start);
        }
    }

});





window.MetaphorJs = MetaphorJs;
}());
}());/* BUNDLE END 004 */