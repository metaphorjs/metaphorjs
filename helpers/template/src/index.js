import App from "./app/App.js"
import MetaphorJs from "metaphorjs-shared/src/MetaphorJs.js"
import "metaphorjs/src/func/dom/onReady.js"

MetaphorJs.dom.onReady(() => {
    const app = new App(document.getElementById("main"));
    app.run();
});

