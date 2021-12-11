export class ASMGenerator {
    constructor(w) {
        this.w = w;
    }

    build = (codeOutput, callback) => {
        const module = this.w.parseWat("", codeOutput, { exceptions: false, multi_value: true });
        module.validate();
        let watOutput = module.toText({ foldExprs: false });
        const binary = module.toBinary({ log: true });
        let binaryOutput = binary.log;

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

        WebAssembly.instantiate(binary.buffer, imports).then(({ instance }) => {
            window.exports = instance.exports;
            callback(instance.exports);
        });

        return { watOutput, binaryOutput }
    }
}