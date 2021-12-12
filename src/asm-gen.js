export class ASMGenerator {
    constructor(w) {
        this.w = w;
    }

    build = (codeOutput, callback) => {
        console.log(codeOutput)
        const module = this.w.parseWat("", codeOutput, {
            exceptions: false,
            multi_value: true,
        });
        module.validate();
        let watOutput = module.toText({ foldExprs: false });
        const binary = module.toBinary({ log: true });
        let binaryOutput = binary.log;

        const imports = {
            output: {
                int: (x) => {
                    console.log(x);
                    setTimeout(() => document.getElementById("output").innerHTML += x + "<br>", 0);
                },
                char: (x) => {
                    console.log(x);
                    setTimeout(() => document.getElementById("output").innerHTML += x + "<br>");
                },
            },
            input: {
                int: () => Number.parseInt(window.prompt()),
                char: () => window.prompt(),
            },
            js: {
                mem: new WebAssembly.Memory({ initial: 1028 }),
            },
        };

        WebAssembly.instantiate(binary.buffer, imports).then(({ instance }) => {
            window.exports = instance.exports;
            callback(instance.exports);
        });

        return { watOutput, binaryOutput };
    };
}
