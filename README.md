# MetaphorJs

v.1.0beta 
(actually, while in beta, it's been successully used in production for the last 5 years)

An app framework similar to AngularJs (directives, scopes, dependency injection, etc) and ExtJs (class system, event system, data model).

What makes it different?
Although most of the approaches utilized by MetaphorJs are not unique (and actually over time borrowed from Angular,ExtJs,React and Vue) I am trying to 
overcome everything I don't like about these frameworks and combine everything
I like about them. Every time I find something that is hard to do using a framework, or possible but ugly, I change MetaphorJs to not stand in my way but help me, so that code footprint would stay as little as possible, performance would not suffer, etc. This is why I decided to write my own rather than use existing. 

So I guess, flexibility is the main feature.


### Features

```javascript
/** MetaphorJs has its own class system that supports 
 * extending, overriding, mixing, plugins. The system is
 * similar to what ExtJs uses and works in every browser 
 * (even IE6, not that now anyone would care).
*/
var MyComponent = MetaphorJs.app.Component.$extend({
    $class: "MyNamespace.MyComponent",
    $alias: "MetaphorJs.directive.component.my-component",
    template: "my-component-template.html",
    as: "cmp",

    initComponent: function() {
        this.scope.text = this.config.get("text");
        this.scope.allowClick = false;
    },

    initConfig: function() {
        // calling parent class
        this.$super();
        this.config.setDefaultValue("title", "My Component");
        this.config.setDefaultValue("text", "Component's text");
    },

    onClick: function() {
        alert("Click on link")
    }
});
```

my-component-template.html
```html

<!-- Component doesn't have to have a single main element.
    MetaphorJs will keep track of correct node placement.
    You can also tell component to create a single main element
    automatically -->
<div ##main>
    <!-- $cfg comes from component Config -->
    <h1 {bind}="this.$cfg.title"></h1>
    <!-- "this" is the component's Scope -->
    <p>Text can be inserted via {directive} or mustaches: {{ this.text }}</p>
    <!-- events, directives and components can be configured -->
    <p><a href="#" 
          (click)="this.cmp.onClick()"
          (click.$if)="this.allowClick == true"
          (click.$stop-propagation)>click here</a></p>
    <p ##namednode>
        <label>
            <input type="checkbox" {model}="this.allowClick">
            Allow click
        </label>
    </p>

    <!-- 
        Named locations are like slots in shadow dom.
        Provided html will go inside node slots and after comment slots.
        Provided html can contain directives and other components.
    -->
    <div ##loc1></div>
    <!--##loc2-->
</div>
```

some-other-template.html
```html
<!-- first way: -->
<div {cmp}="MyNamespace.MyComponent"
     {cmp.$title}="Number 1"
     {cmp.$text}="Text 1">
    <p @loc1>First inserted part</p>
    <p @loc2>Second inserted part</p>
</div>

<!-- second way -->
<my-component $title="Number 2" $text="Text 2">
    <my-component @loc1 $title="Sub Component"></my-component>
    <p @loc2>Second inserted part</p>
</my-component>
```

some-other-javascript
```javascript
/** third way */
var cmp = new MyComponent({
    config: {
        title: "Number 3",
        text: "Text 3"
    },
    renderTo: document.body
})
```


### Other features
```html
<!-- standard directives like show,if,bind,model,class,include,etc: -->
<span {show}="this.showSpan == true"
      {show.$display}="inline"></span>
<div {if}="this.someCondition"></div>
<input {model}="this.textValue"> <!-- two way binding -->
<input {input}="this.textValue"> <!-- one way, from form to scope -->

<!-- various ways to configure router -->
<div {router}="MyNamespace.MyRouter"></div> <!-- configured in the code -->
<!-- configured directly -->
<div {router.login}="{regexp: /^\/login/, cmp: 'MyNamespace.page.Login'}"
     {router.signup}="{regexp: /^\/register/, cmp: 'MyNamespace.page.Register'}">
</div>
<!-- via variable that holds current component name -->
<div {view}="this.componentName"></div>

<!-- elements styling -->
<div {class}="this.classVariable"></div>
<div {class.my-class}="this.someCondition"></div>
<div {style.background-color}="this.colorVariable"></div>

<!-- lists -->
<ul>
    <li {each}="item in this.items" {bind}="this.item.name">
    </li>
</ul>

<!-- dynamic attributes -->
<a [href]="this.urlVariable">Click me</a>

<!-- including other templates -->
<div {include}="this.templateName"></div>
<!-- MetaphorJs also supports includes via comments. Next comment will be processed as include: -->
<!-- include some-other-template.html -->


<!-- all directive values and configs and component configs can be 
     dynamic or static: -->
<div {show}:="true"></div> <!-- static value -->
<div {show}*="this.doShow"></div> <!-- dynamic value -->
<div {show}!="this.doShow"></div> <!-- calc once value -->

<!-- filters -->
<ul {init}="this.list = 'a,b,c'">
    <li {each}="item in this.list | split:','" {bind}="this.item"><li>
</ul>
<!-- there are input and output filters -->
<!-- this input field will run sanitize() when user types and prepareOutput
     when putting value back to the field -->
<input {model}="sanitize >> this.inputValue | prepareOutput">

<!-- recursive binding will check resulting value for mustaches until there is none -->
<p {bind}="this.text" {bind.$recursive}></p>

<!-- multiple events -->
<a href="#"
    (first|click)="this.page.doSomething()"
    (second|click)="this.page.doSomethingElse()"
    (second|click.$stop-propagation)>Multiple click events</a>

```

```javascript
/** Component can switch its template dynamically*/
var MyComponent = MetaphorJs.app.Component.$extend({
    $class: "MyNamespace.MyComponent",
    template: {
        expression: "this.tpl"
    },

    initComponent: function() {
        this.scope.tpl = "my-component-template.html";
    },

    onClick: function() {
        this.scope.tpl = "other-template.html"
    }
}, {
    /** Components also support directives.
     * When you use <my-component {show}="this.showCondition">
     * it applies directive to the named element inside component
     * or to the main element.
    */
    supportsDirectives: {
        show: "namednode",
        if: true
    }
})
```

And many more features yet to be documented 
(Data stores, Dialogs, Events, ShadowDOM support, Form validation, ...).


Contact me if you want to know more
kuindji at gmail
