const fs = require("fs");
const ast = require("../output/ast.json");

console.full = (...args) => console.dir(...args, { depth: null });

const scope = {
    name: "global",
    symbols: [
        { type: "int", name: "input", function: true, scope: { symbols: [] } },
        { type: "void", name: "output", function: true, scope: { symbols: [{ type: "int", name: "x" }] } },
    ],
    scopes: [],
};

const scopePath = [scope];
const currentScope = () => scopePath[scopePath.length - 1];

const findSymbol = (id, scopes = scopePath) => scopes.length ? scopes[scopes.length - 1].symbols.find(symbol => symbol.name === id) || findSymbol(id, scopes.slice(0, -1)) : undefined;

const findFunctionSymbol = (scopes = scopePath) => scopes.length ? scopes[scopes.length - 1].symbols.find(symbol => symbol.function) || findFunctionSymbol(scopes.slice(0, -1)) : undefined;

const indexer = (node, ...indices) =>
    indices.length === 0 ? node : indexer(node.parts[indices[0]], ...indices.slice(1));

const findTerminal = (node) => {
    if (node.value) return node;
    return findTerminal(node.parts[0]);
}

const findLastTerminal = (node) => {
    if (node.value) return node;
    return findLastTerminal(node.parts[node.parts.length - 1]);
}

const getContext = (node) => {
    const startTerminal = findTerminal(node);
    const endTerminal = findLastTerminal(node);

    return "\n" + JSON.stringify({
        start: startTerminal.start || { line: startTerminal.line, col: startTerminal.col },
        end: endTerminal.end || { line: endTerminal.line, col: endTerminal.col },
        preview: node.value || node.values.join(" ")
    }, null, 4)
}

const checkType = (node) => {
    switch (node.type) {
        case "exp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));
                if (type1 !== type2) {
                    throw new Error(`Type mismatch: ${type1} and ${type2}` + getContext(node));
                }
                return type1;
            }
            else if (node.rule === 1) {
                return checkType(indexer(node, 0));
            }
        }
        case "simpleExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "bool" || type2 !== "bool")
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be bool` + getContext(node));

                return "bool";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "andExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "bool" || type2 !== "bool")
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be bool` + getContext(node));

                return "bool";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "unaryRelExp": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 1));
                if (type !== "bool")
                    throw new Error(`Type mismatch: ${type} | Should be bool` + getContext(node));

                return "bool";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "relExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "int" || type2 !== "int")
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be int` + getContext(node));

                return "bool";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "sumExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "int" || type2 !== "int") {
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be int` + getContext(node));
                }

                return "int";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "mulExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "int" || type2 !== "int")
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be int` + getContext(node));

                return "int";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "unaryExp": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 1));
                if (type !== "int")
                    throw new Error(`Type mismatch: ${type} | Should be int` + getContext(node));

                return "int";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "factor": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 0));
                return type;
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "mutable": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 0));
                return type;
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "immutable": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 1));
                return type;
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            } else if (node.rule === 2) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "identifier": {
            const symbol = findSymbol(node.value);
            if (!symbol) {
                throw new Error(`Symbol ${node.value} not found` + getContext(node));
            }
            return symbol.type;
        }

        case "call": {
            const symbol = findSymbol(indexer(node, 0).value);
            if (!symbol) {
                throw new Error(`Symbol ${node.value} not found` + getContext(node));
            }
            if (!symbol.function) {
                throw new Error(`Type mismatch: ${symbol} | Should be function` + getContext(node));
            }

            const argsTree = indexer(node, 2);
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
            }
            const args = getArgs(argsTree);
            const params = symbol.scope.symbols;

            if (args.length !== params.length) {
                throw new Error(`Arguments length mismatch: should be ${params.length} arguments and got ${args.length}` + getContext(node));
            }

            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                const param = params[i];
                if (checkType(arg) !== param.type) {
                    throw new Error(`Type mismatch: ${arg.type} and ${param.type} | Should be ${param.type}` + getContext(node));
                }
            }
            return symbol.type;
        }

        case "constant": {
            if (node.rule === 0) {
                return "int";
            }
            else if (node.rule === 1) {
                return "char";
            }
            else if (node.rule === 2) {
                return "bool";
            }
        }


        case "selectStmt": {
            const type = checkType(indexer(node, 2));
            if (type !== "bool") {
                throw new Error(`Type mismatch: ${type} | Should be bool` + getContext(node));
            }
            break;
        }

        case "iterStmt": {
            const type = checkType(indexer(node, 2));
            if (type !== "bool") {
                throw new Error(`Type mismatch: ${type} | Should be bool` + getContext(node));
            }
            break;
        }

        case "returnStmt": {
            let type;
            if (node.rule === 0) {
                type = "void";
            } else if (node.rule === 1) {
                type = checkType(indexer(node, 1));
            }

            const symbol = currentFunction;
            if (symbol.type !== type) {
                throw new Error(`Type mismatch: ${type} | Should be ${symbol.type}` + getContext(node));
            }
            break;
        }
    }
}

let currentFunction = null;

const semanticCheckDFS = (node) => {
    // TODO: need to make sure non-void function finish with return statement

    let isFunctionDeclaration = false;

    switch (node.type) {
        case "varDecl": {
            currentScope().symbols.push({ type: indexer(node, 0, 0).value, name: indexer(node, 1, 0, 0).value })
            break;
        }
        case "funcDecl": {
            currentScope().symbols.push({ type: indexer(node, 0, 0).value, function: true, name: indexer(node, 1).value })
            isFunctionDeclaration = true;
            currentFunction = currentScope().symbols[currentScope().symbols.length - 1];
            break;
        }
        case "scopedVarDecl": {
            currentScope().symbols.push({ type: indexer(node, 0, 0).value, name: indexer(node, 1, 0, 0).value })
            break;
        }
        case "parmTypeList": {
            currentScope().symbols.push({ type: indexer(node, 0, 0).value, name: indexer(node, 1, 0).value })
            break;
        }
    }

    checkType(node)

    if (node.scopeHead) {
        const scope = {
            name: node.title,
            symbols: [],
            scopes: [],
        }

        if (isFunctionDeclaration)
            currentScope().symbols[currentScope().symbols.length - 1].scope = scope;


        currentScope().scopes.push(scope);
        scopePath.push(scope);
    }

    if (node.parts)
        for (const part of node.parts)
            semanticCheckDFS(part);

    if (node.scopeHead)
        scopePath.pop();
}

const codeGenDFS = (node, scope) => {
    const terminals = {
        "program": {
            pre: (node) => `(module\n    (import "console" "log" (func $output (param i32)))`,
            post: (node) => `)`
        },
        "declList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "decl": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "varDecl": {
            pre: (node) => `(global $${indexer(node, 1, 0, 0).value} i32)`,
            post: (node) => ``
        },
        "scopedVarDecl": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "varDeclList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "varDeclInit": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "varDeclId": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "typeSpec": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "funcDecl": {
            order: (node) => [(node) => `(func $${indexer(node, 1).value}`,
                3,
            (node) => indexer(node, 0, 0).value === "void" ? '' : `(result i32)`,
            (node) => {
                const getLocalDecls = (scope, skip = false) => {
                    const output = skip ? [] : scope.symbols.map(symbol => ({ type: symbol.type, name: symbol.name/* + "_" + scope.index.join('') */ }));
                    for (const child of scope.scopes) {
                        output.push(...getLocalDecls(child));
                    }
                    return output;
                }

                const localDecls = getLocalDecls(findSymbol(indexer(node, 1).value).scope, true);
                let output = "";
                for (const decl of localDecls) {
                    output += `(local $${decl.name} i32)`
                }
                return output;
            },
                5,
            `)(export "${indexer(node, 1).value}" (func $${indexer(node, 1).value}))\n`]
        },
        "parms": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "parmList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "parmTypeList": {
            pre: (node) => `(param $${indexer(node, 1, 0).value} i32)`,
            post: (node) => ``
        },
        "parmIdList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "parmId": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "stmt": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "expStmt": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "compoundStmt": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "localDecls": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "stmtList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "selectStmt": {
            order: {
                0: [(node) => `;; start if`, 2, `(if (then`, 4, `))`],
                1: [(node) => `;; start if`, 2, `(if (then`, 4, `)(else`, 6, '))']
            }
        },
        "iterStmt": {
            order: [(node) => `(loop $loop_${node.index.join("")}`, 2, `(if (then`, 4, (node) => `br $loop_${node.index.join("")}`, `)))`]
        },
        "returnStmt": {
            pre: (node) => `;; returning`,
            post: (node) => `return`
        },
        "breakStmt": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "exp": {
            pre: [(node) => `(local.set $${indexer(node, 0, 0).value}`, (node) => ``],
            post: [(node) => `)`, (node) => ``]
        },
        "simpleExp": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "andExp": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "unaryRelExp": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "relExp": {
            order: { 0: ['(', 1, 0, 2, ')'] }
        },
        "relOp": {
            pre: (node) => 'i32.' + {
                lte: 'le_s',
                lt: 'lt_s',
                gte: 'ge_s',
                gt: 'gt_s',
                eq: 'eq',
                neq: 'ne',
            }[indexer(node, 0).type],
            post: (node) => ``
        },
        "sumExp": {
            pre: [(node) => `(i32.${indexer(node, 1, 0).type === "plus" ? "add" : "sub"}`, (node) => ``],
            post: [(node) => `)`, (node) => ``]
        },
        "sumop": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "mulExp": {
            pre: [(node) => `(i32.${indexer(node, 1, 0).type === "multiply" ? "mul" : "div_s"}`, (node) => ``],
            post: [(node) => `)`, (node) => ``]
        },
        "mulop": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "unaryExp": {
            pre: [(node) => `(i32.sub (i32.const 0)`, (node) => ``],
            post: [(node) => `)`, (node) => ``]
        },
        "unaryop": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "factor": {
            pre: [(node) => ``, (node) => `(local.get $${indexer(node, 0, 0).value})`],
            post: [(node) => ``, (node) => ``]
        },
        "mutable": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "immutable": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "call": {
            pre: (node) => `(call $${indexer(node, 0).value}`,
            post: (node) => `)`
        },
        "args": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "argList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "constant": {
            pre: (node) => [`(i32.const ${indexer(node, 0).value})`, indexer(node, 0).value, `(i32.const ${indexer(node, 0).value === "true" ? 1 : 0})`][node.rule],
            post: (node) => ``
        }
    }


    const output = { type: node.type, pre: null, children: [], post: null };

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
                                const outputPart = codeGenDFS(node.parts[part], scope);
                                orderOutput.push(outputPart);
                            } else {
                                throw new Error(`No part at index ${part}`);
                            }
                        } else {
                            orderOutput.push(part);
                        }
                    }
                } else if (!orderRule) {
                    orderOutput = ['', ''];
                } else {
                    for (const part of orderRule) {
                        if (typeof part === "function") {
                            orderOutput.push(part(node));
                        } else if (typeof part === "number") {
                            if (node?.parts?.[part]) {
                                const outputPart = codeGenDFS(node.parts[part], scope);
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
                            const outputPart = codeGenDFS(node.parts[part], scope);
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
                            const outputPart = codeGenDFS(node.parts[part], scope);
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

            output.pre = orderOutput.length === 0 ? '' : orderOutput[0];
            output.post = orderOutput.length === 1 ? '' : orderOutput[orderOutput.length - 1];
            output.children = orderOutput.slice(1, orderOutput.length - 1);
        } else {
            if (terminal.pre) {
                if (Array.isArray(terminal.pre)) {
                    if (terminal.pre[node.rule]) {
                        if (typeof terminal.pre[node.rule] === "string") {
                            output.pre = terminal.pre[node.rule];
                        } else {
                            output.pre = terminal.pre[node.rule]?.(node) || '';
                        }
                    } else {
                        output.pre = '';
                    }
                } else if (typeof terminal.pre === "string") {
                    output.pre = terminal.pre;
                } else {
                    output.pre = terminal?.pre?.(node) || '';
                }
            } else {
                output.pre = '';
            }

            if (node.parts) {
                for (const part of node.parts) {
                    const outputPart = codeGenDFS(part, scope);
                    output.children.push(outputPart);
                }
            }

            if (terminal.post) {
                if (Array.isArray(terminal.post)) {
                    if (terminal.post[node.rule]) {
                        if (typeof terminal.post[node.rule] === "string") {
                            output.post = terminal.post[node.rule];
                        } else {
                            output.post = terminal.post[node.rule]?.(node) || '';
                        }
                    } else {
                        output.post = '';
                    }
                } else if (typeof terminal.post === "string") {
                    output.post = terminal.post;
                } else {
                    output.post = terminal?.post?.(node) || '';
                }
            } else {
                output.post = '';
            }
        }
    } else {
        if (!node.value)
            throw new Error(`No value for node ${node.type}`);
    }

    return output;
}

const reduceCodeTree = (tree) => {
    if (tree?.pre?.length > 0 || tree?.post?.length > 0) return { pre: tree.pre, children: (Array.isArray(tree.children) ? (tree.children.map(reduceCodeTree).flat()) : (tree.children)), post: tree.post };
    if (tree.children) return Array.isArray(tree.children) ? tree.children.map(reduceCodeTree).flat() : tree.children;
    return tree
}

const codeTreeToString = (node, level = 0) => {
    node = reduceCodeTree(node);

    let output = "";
    let spaces = "";
    for (let i = 0; i < level; i++)
        spaces += "    ";

    if (node.pre)
        output += spaces + node.pre + "\n";

    if (node.children) {
        for (const child of node.children) {
            output += codeTreeToString(child, level + 1);
        }
    } else {
        output += spaces + node + "\n";
    }

    if (node.post)
        output += spaces + node.post + "\n";

    return output;
}

semanticCheckDFS(ast);

const addIndex = (node, index = [0]) => {
    node.index = index;
    if (node.scopes) {
        for (let i = 0; i < node.scopes.length; i++) {
            addIndex(node.scopes[i], [...index, i]);
        }
    }
}

addIndex(scope);

const codeTree = codeGenDFS(ast, scope);
const codeOutput = codeTreeToString(codeTree);
// console.log(codeOutput);

// write code to file
fs.writeFileSync('./output/output.wat', codeOutput);
