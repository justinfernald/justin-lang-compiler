// created by Justin Fernald
const { ASMGenerator } = require("./asm-gen");
const { buildAST } = require("./build-ast");
const { CodeGenerator } = require("./code-gen");
const { ScopeHandler } = require("./scope-handler");
const { Semantic } = require("./semantic");
const { getLocalDecls, addIndex, addASTIndex, indexer, findTerminal, findLastTerminal, getContext } = require("./utils");

let loaded = false;
let w;
wabt().then((x) => {
    w = x;
    if (loaded) {
        try {
            compile()
        } catch (e) {
            document.getElementById("code-output").innerText = e;
            irOutput = e;
            watOutput = e;
            binaryOutput = e;
            console.clear();
            console.error(e);
        }
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
            try {
                compile()
            } catch (e) {
                document.getElementById("code-output").innerText = e;
                irOutput = e;
                watOutput = e;
                binaryOutput = e;
                console.clear();
                console.error(e);
            }
        }, 0);
    }
    document.getElementById("run-button").onclick = () => {
        console.clear()
        document.getElementById("output").innerHTML = "";
        exports.main();
    };

    document.getElementById("ir-button").onclick = () => {
        document.getElementById("code-output").innerText = irOutput
    }

    document.getElementById("wat-button").onclick = () => {
        document.getElementById("code-output").innerText = watOutput
    }

    document.getElementById("binary-button").onclick = () => {
        document.getElementById("code-output").innerText = binaryOutput
    }

    document.getElementById("input").value = localStorage.getItem("code") || "void main() {\n\n}"

    document.getElementById("input").addEventListener("change", (e) => {
        localStorage.setItem("code", e.target.value);
        try {
            compile()
        } catch (e) {
            document.getElementById("code-output").innerText = e;
            irOutput = e;
            watOutput = e;
            binaryOutput = e;
            console.clear();
            console.error(e);
        }
    })
})

const compile = () => {
    if (!w) return;
    const input = document.getElementById("input").value;

    const ast = buildAST(input)

    addASTIndex(ast);


    let scopeHandler = new ScopeHandler();
    let { scope, scopePath } = scopeHandler;

    let semantic = new Semantic(scopeHandler);
    let { semanticCheckDFS } = semantic;


    let codeGenerator = new CodeGenerator(scopeHandler);
    let { codeGenDFS, codeTreeToString } = codeGenerator;

    semanticCheckDFS(ast);
    addIndex(scope);

    if (scopePath.length !== 1) throw Error("Scope Path not right")

    const codeTree = codeGenDFS(ast, scope);
    const codeOutput = codeTreeToString(codeTree);

    irOutput = codeOutput;

    document.getElementById("code-output").innerText = codeOutput;

    const asmGenerator = new ASMGenerator(w);
    ({ watOutput, binaryOutput } = asmGenerator.build(codeOutput, (e) => exports = e));
}