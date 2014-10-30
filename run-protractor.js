#!/usr/bin/env node

var cp = require("child_process"),
    cwd = process.cwd();

process.chdir("../");

console.log("starting webserver");
var server = cp.spawn("simple-server", ["4000"]);

process.chdir(cwd);

console.log("starting webdriver");
var driver = cp.spawn("webdriver-manager", ["start"]);

setTimeout(function(){

    var protractor = cp.spawn("protractor", ["protractor.conf.js"]);

    protractor.stdout.pipe(process.stdout);
    protractor.stderr.pipe(process.stderr);

    protractor.on("exit", function(code) {

        console.log("killing server and driver")
        server.kill("SIGHUP");
        driver.kill("SIGHUP");

        setTimeout(function(){

            process.exit(0);

        }, 3000);

    });


}, 3000);