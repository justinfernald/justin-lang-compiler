import { Semantic } from "./semantic";

const { indexer, getLocalDecls } = require("./utils");

// this object is the code generator
export class CodeGenerator {
    constructor(scopeHandler) {
        this.scopeHandler = scopeHandler;
    }

    memPointer = 0;

    // using dfs this will generate the code
    codeGenDFS = (node, scope) => {
        let { currentScope, scopePath, findSymbol, findScopeFromSymbol, findFunctionScope } =
            this.scopeHandler;

        // this defines what actions should be take for each type of rule in the ast
        // the format is setup for either pre post or order.
        // pre post will set the starting and ending and the children will go in typical order from the ast
        // order allows you to swap around the typical order however you would like
        const terminals = {
            program: { // this is to handle the node from the ast of program
                pre: () => {
                    const globalArrays = scope.symbols.filter((x) => x.array);
                    let globalArrayOutput = "";
                    for (const globalArray of globalArrays) {
                        globalArrayOutput +=
                            "\n    " +
                            `(global $${globalArray.name} (mut i32) (i32.const ${this.memPointer}))`;
                        this.memPointer += globalArray.length;
                    }
                    return `(module\n  (import "output" "int" (func $output_int (param i32)))\n  (import "output" "float" (func $output_float (param f32)))\n  (import "output" "char" (func $output_char (param i32)))\n  (import "input" "int" (func $input (result i32)))\n  (import "input" "char" (func $input_char (result i32)))\n  (memory (import "js" "mem") 1)\n  (global $mem_pointer (mut i32) (i32.const ${this.memPointer}))${globalArrayOutput}\n  (func $output_string (param $x i32) (param $n i32) (local $function_output i32) (local $i i32) (block $function_block (local.set $i (i32.const 0)) (block $block_00105110 (loop $loop_00105110 (if (i32.lt_s (local.get $i) (local.get $n)) (then (call $output_char (i32.load (i32.add (local.get $x) (i32.mul (i32.const 4) (local.get $i))))) (local.set $i (i32.add (local.get $i) (i32.const 1)))br $loop_00105110 ))))) (global.set $mem_pointer (i32.sub (global.get $mem_pointer) (i32.const 0))))(export "output_string" (func $output_string))`;
                },
                post: () => ")",
            },
            declList: { // this is to handle the node from the ast of declList
                pre: () => "",
                post: () => "",
            },
            decl: { // this is to handle the node from the ast of decl
                pre: () => "",
                post: () => "",
            },
            varDecl: { // this is to handle the node from the ast of varDecl
                pre: (node) => {
                    return findSymbol(indexer(node, 1, 0).value).array
                        ? ""
                        : `(global $${indexer(node, 1, 0).value
                        } (mut ${indexer(node, 0, 0).value === "float" ? 'f' : 'i'}32) (${indexer(node, 0, 0).value === "float" ? 'f' : 'i'}32.const 0))`
                },
                post: () => "",
            },
            scopedVarDecl: { // this is to handle the node from the ast of scopedVarDecl
                pre: () => "",
                post: () => "",
            },
            varDeclList: { // this is to handle the node from the ast of varDeclList
                pre: () => "",
                post: () => "",
            },
            varDeclInit: { // this is to handle the node from the ast of varDeclInit
                pre: [
                    () => "",
                    (node) => {
                        const symbol = findSymbol(indexer(node, 0, 0).value);

                        if (symbol.array) {
                            if (node.rule === 1) {
                                // this is a bad way for doing this
                                const string = indexer(node, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0).value;
                                const chars = string.substring(1, string.length - 1).split("");
                                const newChars = [];
                                let isEscaped = false;
                                for (const char of chars) {
                                    if (isEscaped) {
                                        newChars.push("\\" + char);
                                        isEscaped = false;
                                    } else if (char === "\\") {
                                        isEscaped = true;
                                    } else {
                                        newChars.push(char);
                                    }
                                }

                                let output = "";
                                for (let [i, char] of Object.entries(newChars)) {
                                    const convertChar = (char) => {
                                        if (char.length === 1) {
                                            return char.charCodeAt(0)
                                        } else {
                                            const specials = {
                                                t: 9,
                                                n: 10,
                                                f: 12,
                                                r: 13,
                                                "\\": 92,
                                            }
                                            if (specials[char.charAt(1)]) {
                                                return specials[char.charAt(1)];
                                            }
                                            return v.charCodeAt(1)
                                        }
                                    }
                                    console.log(symbol.type)

                                    output += `(i32.store (i32.add (local.get $${symbol.name}) (i32.mul (i32.const 4) (i32.const ${i}))) (i32.const ${convertChar(char)}))`;
                                }
                                return output;
                            }
                            return ""
                        }
                        const type = indexer(node, 2);

                        if (symbol.type === "int" && type.semanticType === "float") {
                            type.convertToInt = true;
                        }

                        if (symbol.type === "float" && type.semanticType === "int") {
                            type.convertToFloat = true;
                        }

                        return `(local.set $${indexer(node, 0, 0).value}`
                    },
                ],
                post: [() => "", () => {
                    const symbol = findSymbol(indexer(node, 0, 0).value);

                    if (symbol.array) {
                        return ""
                    }

                    return `)`
                }],
            },
            varDeclId: { // this is to handle the node from the ast of varDeclId
                pre: () => "",
                post: () => "",
            },
            typeSpec: { // this is to handle the node from the ast of typeSpec
                pre: () => "",
                post: () => "",
            },
            funcDecl: { // this is to handle the node from the ast of funcDecl
                order: (node) => [
                    (node) => `(func $${indexer(node, 1).value}`,
                    3,
                    (node) =>
                        indexer(node, 0, 0).value === "void"
                            ? ""
                            : `(result ${indexer(node, 0, 0).value === "float" ? 'f' : 'i'}32)`,
                    (node) => {
                        const localDecls = getLocalDecls(
                            findSymbol(indexer(node, 1).value).scope,
                            true
                        );
                        let localDeclOutput = `(local $function_output ${indexer(node, 0, 0).value === "float" ? 'f' : 'i'}32)`;
                        let localDeclArrayOutput = "";
                        for (const decl of localDecls) {
                            localDeclOutput += `(local $${decl.name} ${(decl.type === "float" && !decl.array) ? 'f' : 'i'}32)`;
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
            parms: { // this is to handle the node from the ast of parms
                pre: () => "",
                post: () => "",
            },
            parmList: { // this is to handle the node from the ast of parmList
                pre: () => "",
                post: () => "",
            },
            parmTypeList: { // this is to handle the node from the ast of parmTypeList
                pre: (node) => `(param $${indexer(node, 1, 0).value} ${findSymbol(indexer(node, 1, 0).value).type === "float" ? 'f' : 'i'}32)`,
                post: () => "",
            },
            parmIdList: { // this is to handle the node from the ast of parmIdList
                pre: () => "",
                post: () => "",
            },
            parmId: { // this is to handle the node from the ast of parmId
                pre: () => "",
                post: () => "",
            },
            stmt: { // this is to handle the node from the ast of stmt
                pre: () => "",
                post: () => "",
            },
            expStmt: { // this is to handle the node from the ast of expStmt
                pre: () => "",
                post: () => "",
            },
            compoundStmt: { // this is to handle the node from the ast of compoundStmt
                pre: () => "",
                post: () => "",
            },
            localDecls: { // this is to handle the node from the ast of localDecls
                pre: () => "",
                post: () => "",
            },
            stmtList: { // this is to handle the node from the ast of stmtList
                pre: () => "",
                post: () => "",
            },
            selectStmt: { // this is to handle the node from the ast of selectStmt
                order: { // this is to handle the node from the ast of order
                    0: ["(if", 2, "(then", 4, "))"],
                    1: ["(if", 2, "(then", 4, ")(else", 6, "))"],
                },
            },
            iterStmt: { // this is to handle the node from the ast of iterStmt
                order: { // this is to handle the node from the ast of order
                    0: [
                        (node) =>
                            `(block $block_${node.index.join("")} (loop $loop_${node.index.join("")}`,
                        "(if",
                        2,
                        "(then",
                        4,
                        (node) => `br $loop_${node.index.join("")}`,
                        "))))",
                    ],
                    1: [
                        (node) =>
                            `(block $block_${node.index.join("")}`,
                        2,
                        (node) =>
                            `(loop $loop_${node.index.join("")}`,
                        "(if",
                        3,
                        "(then",
                        7,
                        5,
                        (node) => `br $loop_${node.index.join("")}`,
                        "))))",
                    ]
                },
            },
            returnStmt: { // this is to handle the node from the ast of returnStmt
                pre: (node) => {
                    const type = indexer(node, 1);
                    if (node.semanticType === "int" && type.semanticType === "float") {
                        type.convertToInt = true;
                    }
                    if (node.semanticType === "float" && type.semanticType === "int") {
                        type.convertToFloat = true;
                    }
                    return findFunctionScope(scopePath).type === "void" ? "" : "(local.set $function_output "
                },
                post: () => (findFunctionScope(scopePath).type === "void" ? "" : ")") + "(br $function_block)",
            },
            breakStmt: { // this is to handle the node from the ast of breakStmt
                pre: () => "(br 0)",
                post: () => "",
            },
            exp: { // this is to handle the node from the ast of exp
                pre: [
                    (node) => {
                        const symbol = findSymbol(indexer(node, 0, 0).value);
                        const scope = findScopeFromSymbol(symbol.name);

                        const type = indexer(node, 2);

                        if (symbol.type === "int" && type.semanticType === "float") {
                            type.convertToInt = true;
                        }

                        if (symbol.type === "float" && type.semanticType === "int") {
                            type.convertToFloat = true;
                        }

                        if (symbol.type === "int[]" && type.semanticType === "float") {
                            type.convertToInt = true;
                        }

                        if (symbol.type === "float[]" && type.semanticType === "int") {
                            type.convertToFloat = true;
                        }

                        if (symbol.array) {
                            const isString = (node) => {
                                if (node.type === "string") return node.value;
                                if (node.parts && node.parts.length === 1)
                                    return isString(node.parts[0]);
                                return false;
                            }

                            const string = isString(indexer(node, 2));
                            if (string) {
                                // this is a bad way for doing this
                                const chars = string.substring(1, string.length - 1).split("");
                                const newChars = [];
                                let isEscaped = false;
                                for (const char of chars) {
                                    if (isEscaped) {
                                        newChars.push("\\" + char);
                                        isEscaped = false;
                                    } else if (char === "\\") {
                                        isEscaped = true;
                                    } else {
                                        newChars.push(char);
                                    }
                                }
                                let output = "";
                                for (let [i, char] of Object.entries(newChars)) {
                                    const convertChar = (char) => {
                                        if (char.length === 1) {
                                            return char.charCodeAt(0)
                                        } else {
                                            const specials = {
                                                t: 9,
                                                n: 10,
                                                f: 12,
                                                r: 13,
                                                "\\": 92,
                                            }
                                            if (specials[char.charAt(1)]) {
                                                return specials[char.charAt(1)];
                                            }
                                            return v.charCodeAt(1)
                                        }
                                    }

                                    output += `(i32.store (i32.add (${scope.name === "global" ? "global" : "local"}.get $${symbol.name}) (i32.mul (i32.const 4) (i32.const ${i}))) (i32.const ${convertChar(char)}))`;
                                }
                                node.ignoreClose = true;
                                return output;
                            }

                            const indexValue = this.codeTreeToString(
                                this.codeGenDFS(indexer(node, 0, 2)),
                                0,
                                false
                            );

                            return `(${symbol.type === "float[]" ? 'f' : 'i'}32.store (i32.add (${scope.name === "global" ? "global" : "local"
                                }.get $${symbol.name
                                }) (i32.mul (i32.const 4) ${indexValue}))`;
                        }

                        return `(${scope.name === "global" ? "global" : "local"
                            }.set $${symbol.name}`;
                    },
                    () => "",
                ],
                post: [(node) => node.ignoreClose ? "" : ")", () => ""],
            },
            simpleExp: { // this is to handle the node from the ast of simpleExp
                order: { 0: ["(i32.or ", 0, 2, ")"] },
            },
            andExp: { // this is to handle the node from the ast of andExp
                order: { 0: ["(i32.and ", 0, 2, ")"] },
            },
            unaryRelExp: { // this is to handle the node from the ast of unaryRelExp
                order: { 0: ["(i32.xor ", 1, "    (i32.const 1))"] },
            },
            relExp: { // this is to handle the node from the ast of relExp
                order: {
                    0: ["(", (node) => {
                        const type1 = indexer(node, 0)
                        const type2 = indexer(node, 2)

                        let isFloat = false;
                        if (type1.semanticType === "float" || type2.semanticType === "float") {
                            isFloat = true;
                            if (type1.semanticType === "int") {
                                type1.convertToFloat = true;
                            }
                            if (type2.semanticType === "int") {
                                type2.convertToFloat = true;
                            }
                        }

                        const op = [{
                            lte: "le_s",
                            lt: "lt_s",
                            gte: "ge_s",
                            gt: "gt_s",
                            eq: "eq",
                            neq: "ne",
                        }, {
                            lte: "le",
                            lt: "lt",
                            gte: "ge",
                            gt: "gt",
                            eq: "eq",
                            neq: "ne",
                        }][+isFloat][indexer(node, 1, 0).type];
                        return `${isFloat ? 'f' : 'i'}32.${op}`;
                    }, 0, 2, ")"]
                },
            },
            relOp: { // this is to handle the node from the ast of relOp
                pre: () => "",
                post: () => "",
            },
            sumExp: { // this is to handle the node from the ast of sumExp
                pre: [
                    (node) => {
                        const type1 = indexer(node, 0)
                        const type2 = indexer(node, 2)

                        let isFloat = false;
                        if (type1.semanticType === "float" || type2.semanticType === "float") {
                            isFloat = true;
                            if (type1.semanticType === "int") {
                                type1.convertToFloat = true;
                            }
                            if (type2.semanticType === "int") {
                                type2.convertToFloat = true;
                            }
                        }
                        return `(${isFloat ? 'f' : 'i'}32.${indexer(node, 1, 0).type === "plus" ? "add" : "sub"} `
                    },
                    () => "",
                ],
                post: [() => ")", () => ""],
            },
            sumop: { // this is to handle the node from the ast of sumop
                pre: () => "",
                post: () => "",
            },
            mulExp: { // this is to handle the node from the ast of mulExp
                pre: [
                    (node) => {
                        const type1 = indexer(node, 0)
                        const type2 = indexer(node, 2)

                        let isFloat = false;
                        if (type1.semanticType === "float" || type2.semanticType === "float") {
                            isFloat = true;
                            if (type1.semanticType === "int") {
                                type1.convertToFloat = true;
                            }
                            if (type2.semanticType === "int") {
                                type2.convertToFloat = true;
                            }
                        }

                        return `(${isFloat ? 'f' : 'i'}32.${indexer(node, 1, 0).type === "multiply"
                            ? "mul"
                            : (isFloat ? "div" : "div_s")
                            }`
                    },
                    () => "",
                ],
                post: [() => ")", () => ""],
            },
            mulop: { // this is to handle the node from the ast of mulop
                pre: () => "",
                post: () => "",
            },
            unaryExp: { // this is to handle the node from the ast of unaryExp
                pre: [() => {
                    const type = indexer(node, 1)

                    let isFloat = false;
                    if (type.semanticType === "float") {
                        isFloat = true;
                    }

                    return `(${isFloat ? 'f' : 'i'}32.sub (${isFloat ? 'f' : 'i'}32.const 0)`
                }, () => ""],
                post: [() => ")", () => ""],
            },
            unaryop: { // this is to handle the node from the ast of unaryop
                pre: () => "",
                post: () => "",
            },
            factor: { // this is to handle the node from the ast of factor
                pre: [
                    () => "",
                    (node) => {
                        const symbol = findSymbol(indexer(node, 0, 0).value);
                        const scope = findScopeFromSymbol(symbol.name);

                        const type = indexer(node, 0);

                        if (symbol.array && indexer(node, 0).rule === 1) {

                            const indexValue = this.codeTreeToString(
                                this.codeGenDFS(indexer(node, 0, 2)),
                                0,
                                false
                            );
                            return `(${type.semanticType === "float" ? 'f' : 'i'}32.load(i32.add(${scope.name === "global" ? "global" : "local"
                                }.get $${symbol.name
                                })(i32.mul(i32.const 4) ${indexValue})))`;
                        }
                        return `(${scope.name === "global" ? "global" : "local"
                            }.get $${symbol.name})`;
                    },
                ],
                post: [() => "", () => ""],
            },
            mutable: { // this is to handle the node from the ast of mutable
                order: ["", ""],
            },
            immutable: { // this is to handle the node from the ast of immutable
                pre: () => "",
                post: () => "",
            },
            call: { // this is to handle the node from the ast of call
                pre: (node) => {
                    const symbol = findSymbol(indexer(node, 0).value);

                    const getArgs = (node) => {
                        if (node.type === "args") {
                            if (node.rule === 0) {
                                const argsTree = indexer(node, 0);
                                return getArgs(argsTree);
                            } else {
                                return [];
                            }
                        }
                        if (node.rule === 0) {
                            const argsTree = indexer(node, 0);
                            const arg = indexer(node, 2);
                            return [...getArgs(argsTree), arg];
                        } else if (node.rule === 1) {
                            const arg = indexer(node, 0);
                            return [arg];
                        }
                    };

                    const args = getArgs(indexer(node, 2));
                    if (symbol.name === "output") {
                        if (args.length === 1) {
                            const type = args[0].semanticType;
                            return `(call $output_${type}`;
                        } else if (args.length === 2) {
                            return `(call $output_string`;
                        }
                    }

                    const params = symbol.scope.symbols;

                    for (let i = 0; i < params.length; i++) {
                        if (params[i].type === "int" && args[i].semanticType === "float") {
                            args[i].convertToInt = true;
                        }
                        if (params[i].type === "float" && args[i].semanticType === "int") {
                            args[i].convertToFloat = true;
                        }
                    }


                    return `(call $${indexer(node, 0).value}`
                },
                post: () => ")",
            },
            args: { // this is to handle the node from the ast of args
                pre: () => "",
                post: () => "",
            },
            argList: { // this is to handle the node from the ast of argList
                pre: () => "",
                post: () => "",
            },
            constant: { // this is to handle the node from the ast of constant
                pre: (node) => [
                    `(${node.parts[0].type === "integer_literal" ? 'i' : 'f'}32.const ${indexer(node, 0).value
                    })`,
                    `(i32.const ${(() => {
                        const v = indexer(node, 0).value;
                        if (v.length === 3) {
                            return v.charCodeAt(1)
                        } else {
                            const specials = {
                                t: 9,
                                n: 10,
                                f: 12,
                                r: 13,
                                "\\": 92,
                            }
                            if (specials[v.charAt(2)]) {
                                return specials[v.charAt(2)];
                            }
                            return v.charCodeAt(2)
                        }
                    })()})`,
                    `(i32.const ${indexer(node, 0).value === "true" ? 1 : 0})`,
                    ``,
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
                                    throw new Error(`No part at index ${part} `);
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
                                    throw new Error(`No part at index ${part} `);
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
                                throw new Error(`No part at index ${part} `);
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
                                throw new Error(`No part at index ${part} `);
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

        if (node.convertToFloat) {
            output.pre = "(f32.convert_s/i32 " + output.pre;
            output.post = output.post + ")";
        }
        if (node.convertToInt) {
            output.pre = "(i32.trunc_s/f32 " + output.pre;
            output.post = output.post + ")";
        }
        return output;
    };

    // reduces the code tree such that nesting is reduced by flattening
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

    // converts the code tree to a string by traversing it then adding prettier indentation
    codeTreeToString = (node, level = 0, spacing = true) => {
        node = this.reduceCodeTree(node);
        if (Array.isArray(node))
            node =
                node.length === 1
                    ? node[0]
                    : { pre: "", children: node, post: "" };

        let output = "";
        let spaces = "";
        if (spacing) for (let i = 0; i < level; i++) spaces += "  ";

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
