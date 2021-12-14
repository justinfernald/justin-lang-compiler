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

let exports;

window.addEventListener("load", () => {
    loaded = true;
    if (w) {
        setTimeout(() => {
            runCompilation();
        }, 0);
    }

    document.getElementById("run-button").onclick = () => {
        console.clear()
        document.getElementById("output").innerHTML = "";
        setTimeout(exports.main);
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
        compile();
    } catch (e) {
        document.getElementById("code-output").innerText = e;
        irOutput = e;
        watOutput = e;
        binaryOutput = e;
        // console.clear();
        console.error(e);
    }
}

const compile = () => {
    if (!w) return;
    const input = document.getElementById("input").value;

    const ast = buildAST(input);

    addASTIndex(ast);

    let scopeHandler = new ScopeHandler();
    let { scope, scopePath } = scopeHandler;

    let semantic = new Semantic(scopeHandler);
    let optimizer = new Optimizer(scopeHandler);
    let codeGenerator = new CodeGenerator(scopeHandler);

    semantic.run(ast);
    optimizer.optimize(ast);

    if (scopePath.length !== 1) throw Error("Scope Path not right");

    const codeTree = codeGenerator.codeGenDFS(ast, scope);
    const codeOutput = codeGenerator.codeTreeToString(codeTree);

    irOutput = codeOutput;

    document.getElementById("code-output").innerText = codeOutput;

    const asmGenerator = new ASMGenerator(w);
    ({ watOutput, binaryOutput } = asmGenerator.build(
        codeOutput,
        (e) => (exports = e)
    ));
};
