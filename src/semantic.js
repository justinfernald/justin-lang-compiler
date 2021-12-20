import { addIndex, getContext, indexer } from "./utils";

export class Semantic {
    constructor(scopeHandler) {
        this.scopeHandler = scopeHandler;
    }

    // checks the type on a specific node to make sure children match to what build up to the node along with return node type if applicable
    checkType = (node) => {
        let { findSymbol } = this.scopeHandler;

        switch (node.type) {
            case "varDeclInit": { // this part is the handle the node of varDeclInit from the ast to do semantic check
                if (node.rule === 1) {
                    const type1 = this.checkType(indexer(node, 0, 0));
                    const type2 = this.checkType(indexer(node, 2));

                    if (type1 !== type2) {
                        if (!((type1 === "int" && type2 === "float") || (type2 === "int" && type1 === "float")))
                            if (!((type1 === "int" && type2 === "char") || (type2 === "int" && type1 === "char")))
                                throw new Error(
                                    `Type mismatch: ${type1} and ${type2}` +
                                    getContext(node)
                                );
                    }
                    return type1;
                }
                break;
            }

            case "exp": { // this part is the handle the node of exp from the ast to do semantic check
                if (node.rule === 0) {
                    const type1 = this.checkType(indexer(node, 0));
                    const type2 = this.checkType(indexer(node, 2));

                    if (type1 !== type2) {
                        if (!((type1 === "int" && type2 === "float") || (type2 === "int" && type1 === "float")))
                            if (!((type1 === "int" && type2 === "char") || (type2 === "int" && type1 === "char")))
                                throw new Error(
                                    `Type mismatch: ${type1} and ${type2}` +
                                    getContext(node)
                                );
                    }
                    return type1;
                } else if (node.rule === 1) {
                    return this.checkType(indexer(node, 0));
                }
            }
            case "simpleExp": { // this part is the handle the node of simpleExp from the ast to do semantic check
                if (node.rule === 0) {
                    const type1 = this.checkType(indexer(node, 0));
                    const type2 = this.checkType(indexer(node, 2));

                    if (type1 !== "bool" || type2 !== "bool")
                        throw new Error(
                            `Type mismatch: ${type1} and ${type2} | Should be bool` +
                            getContext(node)
                        );

                    return "bool";
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "andExp": { // this part is the handle the node of andExp from the ast to do semantic check
                if (node.rule === 0) {
                    const type1 = this.checkType(indexer(node, 0));
                    const type2 = this.checkType(indexer(node, 2));

                    if (type1 !== "bool" || type2 !== "bool")
                        throw new Error(
                            `Type mismatch: ${type1} and ${type2} | Should be bool` +
                            getContext(node)
                        );

                    return "bool";
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "unaryRelExp": { // this part is the handle the node of unaryRelExp from the ast to do semantic check
                if (node.rule === 0) {
                    const type = this.checkType(indexer(node, 1));
                    if (type !== "bool")
                        throw new Error(
                            `Type mismatch: ${type} | Should be bool` +
                            getContext(node)
                        );

                    return "bool";
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "relExp": { // this part is the handle the node of relExp from the ast to do semantic check
                if (node.rule === 0) {
                    const type1 = this.checkType(indexer(node, 0));
                    const type2 = this.checkType(indexer(node, 2));

                    if ((type1 !== "int" && type2 !== "float") && (type2 !== "int" && type1 !== "float"))
                        if ((type1 !== "int" && type2 !== "char") && (type2 !== "int" && type1 !== "char"))
                            throw new Error(
                                `Type mismatch: ${type1} and ${type2} | Should be numeric` +
                                getContext(node)
                            );

                    return "bool";
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "sumExp": { // this part is the handle the node of sumExp from the ast to do semantic check
                if (node.rule === 0) {
                    const type1 = this.checkType(indexer(node, 0));
                    const type2 = this.checkType(indexer(node, 2));

                    if ((type1 !== "int" && type2 !== "float") && (type2 !== "int" && type1 !== "float")) {
                        if ((type1 !== "int" && type2 !== "char") && (type2 !== "int" && type1 !== "char")) {
                            throw new Error(
                                `Type mismatch: ${type1} and ${type2} | Should be numeric` +
                                getContext(node)
                            );
                        }
                    }

                    return (type1 === "float" || type2 === "float") ? "float" : "int";
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "mulExp": { // this part is the handle the node of mulExp from the ast to do semantic check
                if (node.rule === 0) {
                    const type1 = this.checkType(indexer(node, 0));
                    const type2 = this.checkType(indexer(node, 2));

                    if ((type1 !== "int" && type2 !== "float") && (type2 !== "int" && type1 !== "float"))
                        if ((type1 !== "int" && type2 !== "char") && (type2 !== "int" && type1 !== "char"))
                            throw new Error(
                                `Type mismatch: ${type1} and ${type2} | Should be numeric` +
                                getContext(node)
                            );

                    return (type1 === "float" || type2 === "float") ? "float" : "int";
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "unaryExp": { // this part is the handle the node of unaryExp from the ast to do semantic check
                if (node.rule === 0) {
                    const type = this.checkType(indexer(node, 1));
                    if (type !== "int" && type !== "float" && type !== "char")
                        throw new Error(
                            `Type mismatch: ${type} | Should be numeric` +
                            getContext(node)
                        );

                    return type;
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "factor": { // this part is the handle the node of factor from the ast to do semantic check
                if (node.rule === 0) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "mutable": { // this part is the handle the node of mutable from the ast to do semantic check
                if (node.rule === 0) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                } else if (node.rule === 1) {
                    const symbol = findSymbol(indexer(node, 0).value);

                    const typeIndex = this.checkType(indexer(node, 2));
                    if (typeIndex !== "int")
                        throw new Error(
                            `Type mismatch: ${typeIndex} | Should be int` +
                            getContext(node)
                        );

                    return symbol.type.substring(0, symbol.type.length - 2);
                }
            }

            case "immutable": { // this part is the handle the node of immutable from the ast to do semantic check
                if (node.rule === 0) {
                    const type = this.checkType(indexer(node, 1));
                    return type;
                } else if (node.rule === 1) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                } else if (node.rule === 2) {
                    const type = this.checkType(indexer(node, 0));
                    return type;
                }
            }

            case "identifier": { // this part is the handle the node of identifier from the ast to do semantic check
                const symbol = findSymbol(node.value);
                if (!symbol) {
                    throw new Error(
                        `Symbol ${node.value} not found` + getContext(node)
                    );
                }
                return symbol.type// + (symbol.array ? "[]" : "");
            }

            case "call": { // this part is the handle the node of call from the ast to do semantic check
                const symbol = findSymbol(indexer(node, 0).value);
                if (!symbol) {
                    throw new Error(
                        `Symbol ${indexer(node, 0).value} not found` +
                        getContext(node)
                    );
                }
                if (!symbol.function) {
                    throw new Error(
                        `Type mismatch: ${symbol} | Should be function` +
                        getContext(node)
                    );
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
                };
                const args = getArgs(argsTree);
                const params = symbol.scope.symbols;

                if (symbol.name === "output") {
                    if (args.length === 1) {
                        if (this.checkType(args[0]) === "int") {
                            return symbol.type;
                        } else if (this.checkType(args[0]) === "float") {
                            return symbol.type;
                        } else if (this.checkType(args[0]) === "char") {
                            return symbol.type;
                        } else {
                            throw new Error(
                                `Type mismatch: ${this.checkType(args[0])} | Should be "int, float, or char"` +
                                getContext(node)
                            );
                        }
                    } else if (args.length === 2) {
                        if (this.checkType(args[0]) === "char[]" && this.checkType(args[1]) === "int") {
                            return symbol.type;
                        } else {
                            throw new Error(
                                `Arguments wrong: should be int, char, or char[] with size as int` +
                                getContext(node)
                            );
                        }
                    } else {
                        throw new Error(
                            `Arguments wrong: should be int, char, or char[] with size as int` +
                            getContext(node)
                        );
                    }
                }

                if (args.length !== params.length) {
                    throw new Error(
                        `Arguments length mismatch: should be ${params.length} arguments and got ${args.length}` +
                        getContext(node)
                    );
                }

                for (let i = 0; i < args.length; i++) {
                    const arg = args[i];
                    const param = params[i];
                    if (this.checkType(arg) !== param.type) {
                        if (!(this.checkType(arg) === "int" && param.type === "float" || this.checkType(arg) === "float" && param.type === "int")) {
                            if (!(this.checkType(arg) === "int" && param.type === "char" || this.checkType(arg) === "char" && param.type === "int")) {
                                throw new Error(
                                    `Type mismatch: ${this.checkType(arg)} and ${param.type} | Should be ${param.type}` +
                                    getContext(node)
                                );
                            }
                        }
                    }
                }
                return symbol.type;
            }

            case "constant": { // this part is the handle the node of constant from the ast to do semantic check
                if (node.rule === 0) {
                    return node.parts[0].type === "integer_literal" ? "int" : "float";
                } else if (node.rule === 1) {
                    return "char";
                } else if (node.rule === 2) {
                    return "bool";
                } else if (node.rule === 3) {
                    return "char[]";
                }
            }

            case "selectStmt": { // this part is the handle the node of selectStmt from the ast to do semantic check
                const type = this.checkType(indexer(node, 2));
                if (type !== "bool") {
                    throw new Error(
                        `Type mismatch: ${type} | Should be bool` +
                        getContext(node)
                    );
                }
                break;
            }

            case "iterStmt": { // this part is the handle the node of iterStmt from the ast to do semantic check
                if (node.rule === 0) {
                    const type = this.checkType(indexer(node, 2));
                    if (type !== "bool") {
                        throw new Error(
                            `Type mismatch: ${type} | Should be bool` +
                            getContext(node)
                        );
                    }
                } else if (node.rule === 1) {
                    this.semanticCheckFull(indexer(node, 2))
                    indexer(node, 2).ignore = true;
                    const type = this.checkType(indexer(node, 3));
                    if (type !== "bool") {
                        throw new Error(
                            `Type mismatch: ${type} | Should be bool` +
                            getContext(node)
                        );
                    }
                }
                break;
            }

            case "returnStmt": { // this part is the handle the node of returnStmt from the ast to do semantic check
                let type;
                if (node.rule === 0) {
                    type = "void";
                } else if (node.rule === 1) {
                    type = this.checkType(indexer(node, 1));
                }

                const symbol = this.currentFunction;
                if (symbol.type !== type) {
                    if (!((symbol.type === "int" && type === "float") || (symbol.type === "float" && type === "int"))) {
                        if (!((symbol.type === "int" && type === "char") || (symbol.type === "char" && type === "int"))) {
                            throw new Error(
                                `Type mismatch: ${type} | Should be ${symbol.type}` +
                                getContext(node)
                            );
                        }
                    }
                }

                return symbol.type;
            }
        }
    };

    currentFunction = null;

    // first check for global scope variables and functions
    semanticCheckInit = (node) => {
        let { currentScope, scopePath } = this.scopeHandler;

        let isFunctionDeclaration = false;

        switch (node.type) {
            case "varDecl": { // this part is the handle the node of varDecl from the ast to do semantic check
                if (currentScope().symbols.find(symbol => symbol.name === indexer(node, 1, 0).value)) {
                    throw new Error(
                        `Variable ${indexer(node, 1, 0).value} already declared` +
                        getContext(node)
                    );
                }
                if (indexer(node, 1).rule === 0) {
                    currentScope().symbols.push({
                        type: indexer(node, 0, 0).value,
                        name: indexer(node, 1, 0).value,
                        global: true
                    });
                } else {
                    const size = +indexer(node, 1, 2).value;
                    currentScope().symbols.push({
                        type: indexer(node, 0, 0).value + "[]",
                        name: indexer(node, 1, 0).value,
                        global: true,
                        array: true,
                        size,
                        length: 4 * size,
                    });
                }
                break;
            }

            case "funcDecl": { // this part is the handle the node of funcDecl from the ast to do semantic check
                if (currentScope().symbols.find(symbol => symbol.name === indexer(node, 1).value)) {
                    throw new Error(
                        `Function ${indexer(node, 1).value} already declared` +
                        getContext(node)
                    );
                }
                currentScope().symbols.push({
                    type: indexer(node, 0, 0).value,
                    function: true,
                    name: indexer(node, 1).value,
                });
                isFunctionDeclaration = true;
                this.currentFunction =
                    currentScope().symbols[currentScope().symbols.length - 1];
                break;
            }
            case "parmTypeList": { // this part is the handle the node of parmTypeList from the ast to do semantic check
                currentScope().symbols.push({
                    type: indexer(node, 0, 0).value + (indexer(node, 1).rule === 0 ? "" : "[]"),
                    name: indexer(node, 1, 0).value,
                    array: indexer(node, 1).rule === 0 ? false : true,
                });
                break;
            }
        }

        if (isFunctionDeclaration) {
            const scope = {
                name: node.title,
                nodeIndex: node.index,
                symbols: [],
                scopes: [],
                functionSymbol: this.currentFunction
            };

            this.currentFunction.scope = scope;

            currentScope().scopes.push(scope);
            scopePath.push(scope);
        }

        if (node.parts)
            for (const part of node.parts) this.semanticCheckInit(part);

        if (isFunctionDeclaration) scopePath.pop();
    };

    // full check for dfs inside functions
    semanticCheckFull = (node) => {
        let { currentScope, scopePath, findSymbol, findScopeFromSymbol } = this.scopeHandler;

        let isFunctionDeclaration = false;

        switch (node.type) {
            case "funcDecl": { // this part is the handle the node of funcDecl from the ast to do semantic check
                isFunctionDeclaration = true;
                this.currentFunction = currentScope().symbols.find(
                    (x) => x.name === indexer(node, 1).value
                );

                if (this.currentFunction.type !== "void" && !this.ensureReturn(node))
                    throw new Error("Function should return a value");
                break;
            }
            case "scopedVarDecl": { // this part is the handle the node of scopedVarDecl from the ast to do semantic check
                const symbol = findSymbol(indexer(node, 1, 0, 0).value);
                if (symbol && !symbol.global) {
                    throw new Error(
                        `Variable ${indexer(node, 1, 0, 0).value} already declared` +
                        getContext(node)
                    );
                }
                if (indexer(node, 1, 0).rule === 0) {
                    currentScope().symbols.push({
                        type: indexer(node, 0, 0).value,
                        name: indexer(node, 1, 0, 0).value,
                    });
                } else {
                    const size = +indexer(node, 1, 0, 2).value;
                    currentScope().symbols.push({
                        type: indexer(node, 0, 0).value + "[]",
                        name: indexer(node, 1, 0, 0).value,
                        array: true,
                        size,
                        length: 4 * size,
                    });
                }
                break;
            }
        }

        node.semanticType = this.checkType(node);

        if (node.scopeHead) {
            if (isFunctionDeclaration) {
                scopePath.push(this.currentFunction.scope);
            } else {
                const scope = {
                    name: node.title,
                    nodeIndex: node.index,
                    symbols: [],
                    scopes: [],
                };

                currentScope().scopes.push(scope);
                scopePath.push(scope);
            }
        }

        if (node.parts)
            for (const part of node.parts) if (!part.ignore) this.semanticCheckFull(part);

        if (node.scopeHead) scopePath.pop();
    };

    // checks to make sure function does return value
    hasDefiniteReturn = (node, hadCompound = false) => {
        if (node.type === "selectStmt" && node.rule === 1) {
            return (
                this.hasDefiniteReturn(indexer(node, 4)) &&
                this.hasDefiniteReturn(indexer(node, 6))
            );
        }

        if (node.type === "compoundStmt") {
            if (hadCompound)
                return false;
            hadCompound = true;
        }
        if (node.type === "returnStmt") return true;

        if (node.parts)
            for (let child of node.parts) {
                if (this.hasDefiniteReturn(child, hadCompound)) {
                    return true;
                }
            }
        return false;
    }

    // same as hasdefinitereturn
    ensureReturn = (node) => {
        return this.hasDefiniteReturn(node);
    }

    // runs the semantic analyzer on a node
    run = (node) => {
        this.semanticCheckInit(node);
        this.semanticCheckFull(node);
        addIndex(this.scopeHandler.scope);
    };
}
