const { indexer, getLocalDecls } = require("./utils");

export class CodeGenerator {
    constructor(scopeHandler) {
        this.scopeHandler = scopeHandler;
    }

    memPointer = 0;

    codeGenDFS = (node, scope) => {
        let { currentScope, scopePath, findSymbol, findScopeFromSymbol, findFunctionSymbol } =
            this.scopeHandler;

        const terminals = {
            program: {
                pre: () => {
                    const globalArrays = scope.symbols.filter((x) => x.array);
                    let globalArrayOutput = "";
                    for (const globalArray of globalArrays) {
                        globalArrayOutput +=
                            "\n    " +
                            `(global $${globalArray.name} (mut i32) (i32.const ${this.memPointer}))`;
                        this.memPointer += globalArray.length;
                    }
                    return `(module\n    (import "output" "int" (func $output (param i32)))\n    (import "output" "char" (func $output_char (param i32)))\n    (import "input" "int" (func $input (result i32)))\n    (import "input" "char" (func $input_char (result i32)))\n    (memory (import "js" "mem") 1)\n    (global $mem_pointer (mut i32) (i32.const ${this.memPointer}))${globalArrayOutput}`;
                },
                post: () => ")",
            },
            declList: {
                pre: () => "",
                post: () => "",
            },
            decl: {
                pre: () => "",
                post: () => "",
            },
            varDecl: {
                pre: (node) =>
                    findSymbol(indexer(node, 1, 0, 0).value).array
                        ? ""
                        : `(global $${indexer(node, 1, 0, 0).value
                        } (mut i32) (i32.const 0))`,
                post: () => "",
            },
            scopedVarDecl: {
                pre: () => "",
                post: () => "",
            },
            varDeclList: {
                pre: () => "",
                post: () => "",
            },
            varDeclInit: {
                pre: [
                    () => "",
                    (node) => `(local.set $${indexer(node, 0, 0).value}`,
                ],
                post: [() => "", () => ")"],
            },
            varDeclId: {
                pre: () => "",
                post: () => "",
            },
            typeSpec: {
                pre: () => "",
                post: () => "",
            },
            funcDecl: {
                order: (node) => [
                    (node) => `(func $${indexer(node, 1).value}`,
                    3,
                    (node) =>
                        indexer(node, 0, 0).value === "void"
                            ? ""
                            : "(result i32)",
                    (node) => {
                        const localDecls = getLocalDecls(
                            findSymbol(indexer(node, 1).value).scope,
                            true
                        );
                        let localDeclOutput = "(local $function_output i32)";
                        let localDeclArrayOutput = "";
                        for (const decl of localDecls) {
                            localDeclOutput += `(local $${decl.name} i32)`;
                            if (decl.array) {
                                localDeclArrayOutput += `(local.set $${decl.name} (global.get $mem_pointer))(global.set $mem_pointer (i32.add (global.get $mem_pointer) (i32.const ${decl.length})))`;
                            }
                        }

                        return localDeclOutput + " " + localDeclArrayOutput;
                    },

                    "(block $function_block",
                    5,
                    ")",
                    (node) => {
                        const localDecls = getLocalDecls(
                            findSymbol(indexer(node, 1).value).scope,
                            true
                        );
                        let totalLength = 0;
                        for (const decl of localDecls) {
                            if (decl.array) {
                                totalLength += decl.length;
                            }
                        }
                        return `(global.set $mem_pointer (i32.sub (global.get $mem_pointer) (i32.const ${totalLength})))`;
                    },
                    (node) =>
                        indexer(node, 0, 0).value === "void"
                            ? ""
                            : "(return (local.get $function_output))",
                    `)(export "${indexer(node, 1).value}" (func $${indexer(node, 1).value
                    }))\n`,
                ],
            },
            parms: {
                pre: () => "",
                post: () => "",
            },
            parmList: {
                pre: () => "",
                post: () => "",
            },
            parmTypeList: {
                pre: (node) => `(param $${indexer(node, 1, 0).value} i32)`,
                post: () => "",
            },
            parmIdList: {
                pre: () => "",
                post: () => "",
            },
            parmId: {
                pre: () => "",
                post: () => "",
            },
            stmt: {
                pre: () => "",
                post: () => "",
            },
            expStmt: {
                pre: () => "",
                post: () => "",
            },
            compoundStmt: {
                pre: () => "",
                post: () => "",
            },
            localDecls: {
                pre: () => "",
                post: () => "",
            },
            stmtList: {
                pre: () => "",
                post: () => "",
            },
            selectStmt: {
                order: {
                    0: ["(if", 2, "(then", 4, "))"],
                    1: ["(if", 2, "(then", 4, ")(else", 6, "))"],
                },
            },
            iterStmt: {
                order: [
                    (node) =>
                        `(block $block_${node.index.join(
                            ""
                        )} (loop $loop_${node.index.join("")}`,
                    "(if",
                    2,
                    "(then",
                    4,
                    (node) => `br $loop_${node.index.join("")}`,
                    "))))",
                ],
            },
            returnStmt: {
                pre: () => {
                    console.log([...scopePath])
                    console.log(findFunctionSymbol(scopePath))
                    return "(local.set $function_output "
                },
                post: () => ")(br $function_block)",
            },
            breakStmt: {
                pre: () => "(br 0)",
                post: () => "",
            },
            exp: {
                pre: [
                    (node) => {
                        const symbol = findSymbol(indexer(node, 0, 0).value);
                        const scope = findScopeFromSymbol(symbol.name);

                        if (symbol.array) {
                            const indexValue = this.codeTreeToString(
                                this.codeGenDFS(indexer(node, 0, 2)),
                                0,
                                false
                            );
                            return `(i32.store (i32.add (${scope.name === "global" ? "global" : "local"
                                }.get $${symbol.name
                                }) (i32.mul (i32.const 4) ${indexValue}))`;
                        }

                        return `(${scope.name === "global" ? "global" : "local"
                            }.set $${symbol.name}`;
                    },
                    () => "",
                ],
                post: [() => ")", () => ""],
            },
            simpleExp: {
                pre: () => "",
                post: () => "",
            },
            andExp: {
                pre: () => "",
                post: () => "",
            },
            unaryRelExp: {
                pre: () => "",
                post: () => "",
            },
            relExp: {
                order: { 0: ["(", 1, 0, 2, ")"] },
            },
            relOp: {
                pre: (node) =>
                    "i32." +
                    {
                        lte: "le_s",
                        lt: "lt_s",
                        gte: "ge_s",
                        gt: "gt_s",
                        eq: "eq",
                        neq: "ne",
                    }[indexer(node, 0).type],
                post: () => "",
            },
            sumExp: {
                pre: [
                    (node) =>
                        `(i32.${indexer(node, 1, 0).type === "plus" ? "add" : "sub"
                        }`,
                    () => "",
                ],
                post: [() => ")", () => ""],
            },
            sumop: {
                pre: () => "",
                post: () => "",
            },
            mulExp: {
                pre: [
                    (node) =>
                        `(i32.${indexer(node, 1, 0).type === "multiply"
                            ? "mul"
                            : "div_s"
                        }`,
                    () => "",
                ],
                post: [() => ")", () => ""],
            },
            mulop: {
                pre: () => "",
                post: () => "",
            },
            unaryExp: {
                pre: [() => "(i32.sub (i32.const 0)", () => ""],
                post: [() => ")", () => ""],
            },
            unaryop: {
                pre: () => "",
                post: () => "",
            },
            factor: {
                pre: [
                    () => "",
                    (node) => {
                        const symbol = findSymbol(indexer(node, 0, 0).value);
                        const scope = findScopeFromSymbol(symbol.name);
                        if (symbol.array) {
                            const indexValue = this.codeTreeToString(
                                this.codeGenDFS(indexer(node, 0, 2)),
                                0,
                                false
                            );
                            return `(i32.load (i32.add (${scope.name === "global" ? "global" : "local"
                                }.get $${symbol.name
                                }) (i32.mul (i32.const 4) ${indexValue})))`;
                        }
                        return `(${scope.name === "global" ? "global" : "local"
                            }.get $${symbol.name})`;
                    },
                ],
                post: [() => "", () => ""],
            },
            mutable: {
                order: ["", ""],
            },
            immutable: {
                pre: () => "",
                post: () => "",
            },
            call: {
                pre: (node) => `(call $${indexer(node, 0).value}`,
                post: () => ")",
            },
            args: {
                pre: () => "",
                post: () => "",
            },
            argList: {
                pre: () => "",
                post: () => "",
            },
            constant: {
                pre: (node) =>
                    [
                        `(i32.const ${indexer(node, 0).value})`,
                        `(i32.const ${indexer(node, 0).value.charCodeAt(0)})`,
                        `(i32.const ${indexer(node, 0).value === "true" ? 1 : 0
                        })`,
                    ][node.rule],
                post: () => "",
            },
        };

        const output = { type: node.type, pre: null, children: [], post: null };

        if (node.scopeHead) {
            const arrayEquals = (a, b) => {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) return false;
                }
                return true;
            };
            const scope = currentScope().scopes.find((s) =>
                arrayEquals(s.nodeIndex, node.index)
            );

            if (scope) {
                scopePath.push(scope);
            } else {
                throw new Error("Scope not found");
            }
        }

        if (node.type in terminals) {
            const terminal = terminals[node.type];
            if (terminal.order) {
                let orderOutput = [];

                const order = terminal.order;
                const rule = node.rule;
                if (typeof order === "object" && !Array.isArray(order)) {
                    const orderRule = order[rule];
                    if (typeof orderRule === "function") {
                        const result = orderRule(node);
                        for (const part of result) {
                            if (typeof part === "function") {
                                orderOutput.push(part(node));
                            } else if (typeof part === "number") {
                                if (node?.parts?.[part]) {
                                    const outputPart = this.codeGenDFS(
                                        node.parts[part],
                                        scope
                                    );
                                    orderOutput.push(outputPart);
                                } else {
                                    throw new Error(`No part at index ${part}`);
                                }
                            } else {
                                orderOutput.push(part);
                            }
                        }
                    } else if (!orderRule) {
                        const children = [];
                        if (node.parts) {
                            for (const part of node.parts) {
                                const outputPart = this.codeGenDFS(part, scope);
                                children.push(outputPart);
                            }
                        }
                        orderOutput = ["", ...children, ""];
                    } else {
                        for (const part of orderRule) {
                            if (typeof part === "function") {
                                orderOutput.push(part(node));
                            } else if (typeof part === "number") {
                                if (node?.parts?.[part]) {
                                    const outputPart = this.codeGenDFS(
                                        node.parts[part],
                                        scope
                                    );
                                    orderOutput.push(outputPart);
                                } else {
                                    throw new Error(`No part at index ${part}`);
                                }
                            } else {
                                orderOutput.push(part);
                            }
                        }
                    }
                } else if (Array.isArray(order)) {
                    for (const part of order) {
                        if (typeof part === "function") {
                            orderOutput.push(part(node));
                        } else if (typeof part === "number") {
                            if (node?.parts?.[part]) {
                                const outputPart = this.codeGenDFS(
                                    node.parts[part],
                                    scope
                                );
                                orderOutput.push(outputPart);
                            } else {
                                throw new Error(`No part at index ${part}`);
                            }
                        } else {
                            orderOutput.push(part);
                        }
                    }
                } else if (typeof order === "function") {
                    const orderValue = order(node);

                    for (const part of orderValue) {
                        if (typeof part === "function") {
                            orderOutput.push(part(node));
                        } else if (typeof part === "number") {
                            if (node?.parts?.[part]) {
                                const outputPart = this.codeGenDFS(
                                    node.parts[part],
                                    scope
                                );
                                orderOutput.push(outputPart);
                            } else {
                                throw new Error(`No part at index ${part}`);
                            }
                        } else {
                            orderOutput.push(part);
                        }
                    }
                } else {
                    throw new Error(`Invalid order for terminal ${node.type}`);
                }

                output.pre = orderOutput.length === 0 ? "" : orderOutput[0];
                output.post =
                    orderOutput.length === 1
                        ? ""
                        : orderOutput[orderOutput.length - 1];
                output.children = orderOutput.slice(1, orderOutput.length - 1);
            } else {
                if (terminal.pre) {
                    if (Array.isArray(terminal.pre)) {
                        if (terminal.pre[node.rule]) {
                            if (typeof terminal.pre[node.rule] === "string") {
                                output.pre = terminal.pre[node.rule];
                            } else {
                                output.pre =
                                    terminal.pre[node.rule]?.(node) || "";
                            }
                        } else {
                            output.pre = "";
                        }
                    } else if (typeof terminal.pre === "string") {
                        output.pre = terminal.pre;
                    } else {
                        output.pre = terminal?.pre?.(node) || "";
                    }
                } else {
                    output.pre = "";
                }

                if (node.parts) {
                    for (const part of node.parts) {
                        const outputPart = this.codeGenDFS(part, scope);
                        output.children.push(outputPart);
                    }
                }

                if (terminal.post) {
                    if (Array.isArray(terminal.post)) {
                        if (terminal.post[node.rule]) {
                            if (typeof terminal.post[node.rule] === "string") {
                                output.post = terminal.post[node.rule];
                            } else {
                                output.post =
                                    terminal.post[node.rule]?.(node) || "";
                            }
                        } else {
                            output.post = "";
                        }
                    } else if (typeof terminal.post === "string") {
                        output.post = terminal.post;
                    } else {
                        output.post = terminal?.post?.(node) || "";
                    }
                } else {
                    output.post = "";
                }
            }
        } else {
            if (!node.value) {
                throw new Error(`No value for node ${node.type}`);
            }
        }

        if (node.scopeHead) scopePath.pop();

        return output;
    };

    reduceCodeTree = (tree) => {
        if (tree?.pre?.length > 0 || tree?.post?.length > 0)
            return {
                pre: tree.pre,
                children: Array.isArray(tree.children)
                    ? tree.children.map(this.reduceCodeTree).flat()
                    : tree.children,
                post: tree.post,
            };
        if (tree.children)
            return Array.isArray(tree.children)
                ? tree.children.map(this.reduceCodeTree).flat()
                : tree.children;
        return tree;
    };

    codeTreeToString = (node, level = 0, spacing = true) => {
        node = this.reduceCodeTree(node);
        if (Array.isArray(node))
            node =
                node.length === 1
                    ? node[0]
                    : { pre: "", children: node, post: "" };

        let output = "";
        let spaces = "";
        if (spacing) for (let i = 0; i < level; i++) spaces += "    ";

        if (node.pre) output += spaces + node.pre + (spacing ? "\n" : "");

        if (node.children) {
            for (const child of node.children) {
                output += this.codeTreeToString(child, level + 1);
            }
        } else {
            output += spaces + node + (spacing ? "\n" : "");
        }

        if (node.post) output += spaces + node.post + (spacing ? "\n" : "");

        return output;
    };
}
