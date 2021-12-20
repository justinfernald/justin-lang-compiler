// this is for assembly generation
export class ASMGenerator {
    constructor(w) {
        this.w = w;
    }

    // this will build of the assembly from code output
    build = (codeOutput, callback) => {
        const module = this.w.parseWat("", codeOutput, {
            exceptions: false,
            multi_value: true,
        });
        module.validate();
        let watOutput = module.toText({ foldExprs: false });
        const binary = module.toBinary({ log: true });
        let binaryOutput = binary.log;

        // theses are the javascript binding for webassembly such that it can call these functions to either output for get input from the user
        const imports = {
            output: {
                // print ints
                int: (x) => {
                    console.log(x);
                    document.getElementById("output").innerHTML += x + "<br>";
                },

                // prints floats
                float: (x) => {
                    console.log(Math.round(x * 1e8) / 1e8);
                    document.getElementById("output").innerHTML += Math.round(x * 1e5) / 1e5 + "<br>";
                },

                // prints chars
                char: (x) => {
                    let c = String.fromCharCode(x);
                    console.log(c);
                    if (c === "\n")
                        document.getElementById("output").innerHTML += "<br>";
                    else
                        document.getElementById("output").innerHTML += c;
                },
            },
            input: {
                // gets int
                int: () => Number.parseInt(window.prompt()),
                // gets float
                float: () => Number.parseFloat(window.prompt()),
                // gets char also does encoding
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

        // this will init the webassembly into the javascript run time such that is accessable in the browser.
        WebAssembly.instantiate(binary.buffer, imports).then(({ instance }) => {
            window.exports = instance.exports;
            callback(instance.exports);
        });

        return { watOutput, binaryOutput };
    };
}
