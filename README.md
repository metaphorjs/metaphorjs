#MetaphorJs

v.1.0beta 
(actually, while in beta, it's been successully used in production for the last 5 years)

An app framework similar to AngularJs (directives, scopes, dependency injection, etc) and ExtJs (class system, event system, data model).

```javascript
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
    <p>
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