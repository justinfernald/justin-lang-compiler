export class ASMGenerator {
    constructor(w) {
        this.w = w;
    }

    build = (codeOutput, callback) => {
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
                    document.getElementById("output").innerHTML += x + "<br>";
                },
                char: (x) => {
                    console.log(x);
                    let c = String.fromCharCode(x);
                    console.log(c);
                    if (c === "\n")
                        document.getElementById("output").innerHTML += "<br>";
                    else
                        document.getElementById("output").innerHTML += c;
                },
            },
            input: {
                int: () => Number.parseInt(window.prompt()),
                char: () => {
                    const v = window.prompt();
                    if (v.length === 1) {
                        return v.charCodeAt(0)
                    } else if (v.length === 2) {
                        if (v.charAt(0) !== "\\")
                            return v.charCodeAt(0)

                        const specials = {
                            t: 9,
                            n: 10,
                            f: 12,
                            r: 13,
                            "\\": 92,
                        }

                        if (specials[v.charAt(1)]) {
                            return specials[v.charAt(1)];
                        }
                        return v.charCodeAt(1)
                    } else {
                        return v.charCodeAt(0)
                    }
                }
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
