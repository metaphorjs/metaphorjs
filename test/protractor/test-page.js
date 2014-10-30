
// webdriver-manager start

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

browser.ignoreSynchronization = true;
browser.get('http://127.0.0.1:4000/metaphorjs/dev-test/index.html');

describe('Bindings (read only) #1', function() {

    it("shoud set #inline-binding to 'inline4'", function(){
        expect(element(by.id("inline-binding")).getText()).to.eventually.equal("inline4");
    });
    it("shoud set #binding to 'New Text'", function(){
        expect(element(by.id("binding")).getText()).to.eventually.equal("New Text");
    });
    it("shoud set #html-binding to 'New Text'", function(){
        expect(element(by.id("html-binding")).getText()).to.eventually.equal("html text");
    });
    it("shoud set #attr-binding-href's href to 'http://inline4.com'", function(){
        expect(element(by.id("attr-binding-href")).getAttribute("href")).to.eventually.equal("http://inline4.com/");
    });
});

describe('Bindings (read only) #2', function() {

    it("shoud set #binding-input-value to '1'", function(){
        expect(element(by.id("binding-input-value")).getAttribute("value")).to.eventually.equal("1");
    });

    it("shoud set #binding-input-bind to '1'", function(){
        expect(element(by.id("binding-input-bind")).getAttribute("value")).to.eventually.equal("1");
    });

    it("shoud set #binding-checkbox to 'on'", function(){
        expect(element(by.id("binding-checkbox")).isSelected()).to.eventually.equal(true);
    });

    it("shoud set #radio-bind-1 to unselected", function(){
        expect(element(by.id("radio-bind-1")).isSelected()).to.eventually.equal(false);
    });

    it("shoud not change #radio-bind-1 value", function(){
        element(by.id("radio-bind-1")).click();
        expect(element(by.id("radio-bind-1")).isSelected()).to.eventually.equal(false);
    });

    it("shoud not change #binding-input-bind value", function(){
        element(by.id("binding-input-bind")).sendKeys("2");
        expect(element(by.id("binding-input-bind")).getAttribute("value")).to.eventually.equal("1");
    });
});


describe('Bindings (read only) #3', function() {

    it("shoud set #select-bind to '1'", function(){
        expect(element(by.id("select-bind")).getAttribute("value")).to.eventually.equal("1");
    });

    it("shoud set #textarea-bind-attr to 'inline4'", function(){
        expect(element(by.id("textarea-bind-attr")).getAttribute("value")).to.eventually.equal("inline4");
    });

    it("shoud set #textarea-bind-inline to 'inline4'", function(){
        expect(element(by.id("textarea-bind-inline")).getAttribute("value")).to.eventually.equal("inline4");
    });

});


describe('Bindings (read only) #4', function() {

    it("shoud set #multiple-inline-binding to ...", function(){
        expect(element(by.id("multiple-inline-binding")).getText()).to.eventually.equal("inline4 New Text <p>html text</p>");
    });
});



describe('Filters #1', function() {

    it("shoud set #filter-uppercase-binding to ...", function(){
        expect(element(by.id("filter-uppercase-binding")).getText())
            .to.eventually.equal("NEW TEXT");
    });

    it("shoud set #filter-uppercase-inline to ...", function(){
        expect(element(by.id("filter-uppercase-inline")).getText())
            .to.eventually.equal("NEW TEXT");
    });

    it("shoud set #filter-lowercase-inline to ...", function(){
        expect(element(by.id("filter-lowercase-inline")).getText())
            .to.eventually.equal("new text");
    });

    it("shoud set #filter-limit-string to ...", function(){
        expect(element(by.id("filter-limit-string")).getText())
            .to.eventually.equal("N");
    });
});


describe('Filters #2', function() {

    it("shoud create links in #filter-linkify", function(){
        expect($('#filter-linkify a').isPresent())
            .to.eventually.equal(true);
    });
});

describe('Expressions', function() {

    it("shoud set .a + .b to 3", function(){
        expect(element(by.id("expr-a-plus-b")).getText())
            .to.eventually.equal("3");
    });

    it("shoud set .bool ? 'true' : 'false' to true", function(){
        expect(element(by.id("expr-bool")).getText())
            .to.eventually.equal("true");
    });
});

describe('Model (read) #1', function() {

    it("shoud set #model-input-a to '1'", function(){
        expect(element(by.id("model-input-a")).getAttribute("value"))
            .to.eventually.equal("1");
    });

    it("shoud set #model-checkbox-bool to '1'", function(){
        expect(element(by.id("model-checkbox-bool")).isSelected())
            .to.eventually.equal(true);
    });

    it("shoud set #model-radio-1 to unselected", function(){
        expect(element(by.id("model-radio-1")).isSelected())
            .to.eventually.equal(false);
    });

    it("shoud set #model-select-a to '1'", function(){
        expect(element(by.id("model-select-a")).getAttribute("value"))
            .to.eventually.equal("1");
    });
});

describe('Model (read) #2', function() {

    it("shoud set #model-textarea to 'New Text'", function(){
        expect(element(by.id("model-textarea")).getAttribute("value"))
            .to.eventually.equal("New Text");
    });

    it("shoud set #model-input to 'New Text'", function(){
        expect(element(by.id("model-input")).getAttribute("value"))
            .to.eventually.equal("New Text");
    });
});

describe('mjs-class', function() {

    it("shoud set #class-object class to 'bool'", function(){
        expect(element(by.id("class-object")).getAttribute("class"))
            .to.eventually.string("bool");
    });
});

describe('mjs-if, mjs-show, mjs-hide', function() {

    it("shoud set show #if-bool", function(){
        expect(element(by.id("if-bool")).isPresent())
            .to.eventually.equal(true);
    });

    it("shoud set show #show-bool", function(){
        expect(element(by.id("show-bool")).getCssValue("display"))
            .to.not.eventually.equal("none");
    });

    it("shoud set hide #hide-bool", function(){
        expect(element(by.id("hide-bool")).getCssValue("display"))
            .to.eventually.equal("none");
    });
});

describe('Change value of .a', function() {

    it("should change scope .a", function(){
        element(by.id('model-input-a')).sendKeys(protractor.Key.BACK_SPACE, '2');
        expect(browser.driver.executeScript("return window.mainApp.scope.a"))
            .to.eventually.equal(2);
    });

    it("shoud set #binding-input-value to '2'", function(){
        expect(element(by.id("binding-input-value")).getAttribute("value")).to.eventually.equal("2");
    });

    it("shoud set #binding-input-bind to '2'", function(){
        expect(element(by.id("binding-input-bind")).getAttribute("value")).to.eventually.equal("2");
    });

    it("shoud set #select-bind to '2'", function(){
        expect(element(by.id("select-bind")).getAttribute("value")).to.eventually.equal("2");
    });

    it("shoud set #filter-limit-string to ...", function(){
        expect(element(by.id("filter-limit-string")).getText())
            .to.eventually.equal("Ne");
    });

    it("shoud set .a + .b to 4", function(){
        expect(element(by.id("expr-a-plus-b")).getText())
            .to.eventually.equal("4");
    });
});

describe('Change value of .bool', function() {

    it("should change scope .bool", function(){
        element(by.id('model-checkbox-bool')).click();
        expect(browser.driver.executeScript("return window.mainApp.scope.bool"))
            .to.eventually.equal(false);
    });

    it("shoud set #binding-checkbox to 'off'", function(){
        expect(element(by.id("binding-checkbox")).isSelected()).to.eventually.equal(false);
    });

    it("shoud set .bool ? 'true' : 'false' to false", function(){
        expect(element(by.id("expr-bool")).getText())
            .to.eventually.equal("false");
    });

    it("shoud remove #class-object class 'bool'", function(){
        expect(element(by.id("class-object")).getAttribute("class"))
            .to.not.eventually.string("bool");
    });


    it("shoud set hide #if-bool", function(){
        expect(element(by.id("if-bool")).isPresent())
            .to.eventually.equal(false);
    });

    it("shoud set hide #show-bool", function(){
        expect(element(by.id("show-bool")).getCssValue("display"))
            .to.eventually.equal("none");
    });

    it("shoud set show #hide-bool", function(){
        expect(element(by.id("hide-bool")).getCssValue("display"))
            .to.not.eventually.equal("none");
    });

});

describe('Change value of .inline', function() {

    it("should change scope .inline", function(){
        element(by.id('model-radio-1')).click();
        expect(browser.driver.executeScript("return window.mainApp.scope.inline"))
            .to.eventually.equal("inline1");
    });

    it("shoud set #inline-binding to 'inline1'", function(){
        expect(element(by.id("inline-binding")).getText())
            .to.eventually.equal("inline1");
    });

    it("shoud set #radio-bind-1 to selected", function(){
        expect(element(by.id("radio-bind-1")).isSelected()).to.eventually.equal(true);
    });

    it("shoud set #class-inline class to 'inline1'", function(){
        expect(element(by.id("class-inline")).getAttribute("class"))
            .to.eventually.string("inline1");
    });

    it("shoud set #class-string class to 'inline1'", function(){
        expect(element(by.id("class-string")).getAttribute("class"))
            .to.eventually.string("inline1");
    });

});

describe('Change value of .a via select', function() {

    it("should change scope .inline", function(){
        element(by.id('model-select-a')).click();
        $$("#model-select-a option").first().click();

        expect(browser.driver.executeScript("return window.mainApp.scope.a"))
            .to.eventually.equal(1);
    });

});

describe('Change value of .text via textarea', function() {

    it("should change scope .text", function(){
        element(by.id('model-textarea')).sendKeys("1");

        expect(browser.driver.executeScript("return window.mainApp.scope.text"))
            .to.eventually.equal("New Text1");

        //element(by.id("model-input")).getAttribute("value").then(function(val){
        //    console.log("got value", val)
        //})

        expect(element(by.id("model-input")).getAttribute("value"))
            .to.eventually.equal("New Text1");
    });


});