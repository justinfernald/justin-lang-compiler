let exports;

const imports = {
    console: {
        log: (x) => {
            console.log(x);
            document.getElementById("output").innerHTML += x + '<br>';
        }
    },
    window: { prompt: () => Number.parseInt(window.prompt()) },
    js: {
        mem: new WebAssembly.Memory({ initial: 1028 })
    }
};

WebAssembly.instantiateStreaming(fetch('output.wasm'), imports)
    .then((obj) => {
        const instance = obj.instance;
        console.log(instance)
        exports = instance.exports;
    });

window.addEventListener("load", () => {
    document.getElementById("run-button").onclick = () => {
        console.clear()
        document.getElementById("output").innerHTML = "";
        exports.main();
    };
})



