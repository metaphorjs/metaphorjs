
// webdriver-manager start

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

browser.ignoreSynchronization = true;
browser.get('http://127.0.0.1:3000/metaphorjs/dev-test/index.html');

describe('MetaphorJs test page', function() {
    it('should change #p1 after #inputA is changed', function() {
        element(by.css("#inputA")).sendKeys(protractor.Key.BACK_SPACE, "2");
        expect(element(by.css("#p1")).getText()).to.eventually.equal("4");
    });
});