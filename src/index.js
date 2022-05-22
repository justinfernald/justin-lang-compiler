// created by Justin Fernald
const { ASMGenerator } = require("./asm-gen");
const { buildAST } = require("./build-ast");
const { CodeGenerator } = require("./code-gen");
const { Optimizer } = require("./optimizer");
const { ScopeHandler } = require("./scope-handler");
const { Semantic } = require("./semantic");
const { addASTIndex } = require("./utils");

let loaded = false;
let w;
wabt().then((x) => {
    w = x;
    if (loaded) {
        runCompilation();
    }
});

let irOutput = "";
let watOutput = "";
let binaryOutput = "";

let debug = true;

let exports;

window.addEventListener("load", () => {
    loaded = true;
    if (w) {
        setTimeout(() => {
            runCompilation();
        }, 0);
    }

    document.getElementById("run-button").onclick = () => {
        if (!debug)
            console.clear()
        document.getElementById("output").innerHTML = "";
        setTimeout(() => {
            console.time("RUN");
            exports.main()
            console.timeEnd("RUN");
        });
    };

    document.getElementById("ir-button").onclick = () => {
        document.getElementById("code-output").innerText = irOutput;
    };

    document.getElementById("wat-button").onclick = () => {
        document.getElementById("code-output").innerText = watOutput;
    };

    document.getElementById("binary-button").onclick = () => {
        document.getElementById("code-output").innerText = binaryOutput;
    };

    document.getElementById("input").value =
        localStorage.getItem("code") || "void main() {\n\n}";

    document.getElementById("input").addEventListener("change", (e) => {
        localStorage.setItem("code", e.target.value);
        runCompilation();
    });
});

const runCompilation = () => {
    try {
        console.time("COMPILE");
        compile();
        console.timeEnd("COMPILE");
    } catch (e) {
        document.getElementById("code-output").innerText = e;
        irOutput = e;
        watOutput = e;
        binaryOutput = e;
        if (!debug)
            console.clear();
        console.error(e);
    }
}


// runs the whole compilation process.
const compile = () => {
    if (!w) return;
    const input = document.getElementById("input").value;

    const ast = buildAST(input);

    if (debug)
        console.log("build:", ast);
    addASTIndex(ast);

    // inits a scope handler
    let scopeHandler = new ScopeHandler();
    let { scope, scopePath } = scopeHandler;

    if (debug)
        console.log("scope:", scope);

    // inits a semantic analyzer
    let semantic = new Semantic(scopeHandler);

    // inits an optimizer
    let optimizer = new Optimizer(scopeHandler);

    // inits an code generator
    let codeGenerator = new CodeGenerator(scopeHandler);

    semantic.run(ast);
    if (debug)
        console.log("post-semantic:", ast);
    optimizer.optimize(ast);
    if (debug)
        console.log("post-optimize:", ast);

    if (scopePath.length !== 1) throw Error("Scope Path not right");

    // creates code tree from ast
    const codeTree = codeGenerator.codeGenDFS(ast, scope);

    // gets code output from code tree
    const codeOutput = codeGenerator.codeTreeToString(codeTree);

    irOutput = codeOutput;
    if (debug)
        console.log(codeOutput);
    window.codeOutput = codeOutput;

    document.getElementById("code-output").innerText = codeOutput;

    // builds out the assembly
    const asmGenerator = new ASMGenerator(w);
    ({ watOutput, binaryOutput } = asmGenerator.build(
        codeOutput,
        (e) => (exports = e)
    ));
};
