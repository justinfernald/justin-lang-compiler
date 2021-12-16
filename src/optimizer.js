import { indexer } from "./utils";

export class Optimizer {
    constructor(scopeHandler) {
        this.scopeHandler = scopeHandler;
    }

    removeDeadCode(node, init = false) {
        // issue in nested return will remove everything after it even if not in same scope
        if (!init && node.type === "compoundStmt") return false;
        if (["returnStmt", "breakStmt"].includes(node.type)) return true;
        // selectStmt
        // iterStmt

        if (node.parts) {
            let newParts = [];
            if (node.type === "selectStmt") {
                for (let child of node.parts) {
                    newParts.push(child);
                    if (child.type === "stmt" && child.parts[0].type === "compoundStmt") {
                        if (this.removeDeadCode(child)) {
                            node.parts = newParts;
                            return true;
                        }
                    }
                }

            } else {
                for (let child of node.parts) {
                    newParts.push(child);
                    if (this.removeDeadCode(child)) {
                        node.parts = newParts;
                        return true;
                    }
                }
            }
            node.parts = newParts;
        }
        return false;
    }

    deadCodeElimination = (node) => {
        if (node.type === 'compoundStmt')
            this.removeDeadCode(node, true);
    };

    containsUsefulStatement(node) {
        const usefulStatements = [
            { type: "exp", rule: [0] },
            { type: "call", rule: [0] },
        ];
        for (let usefulStatement of usefulStatements)
            if (
                node.type === usefulStatement.type &&
                usefulStatement.rule.includes(node.rule)
            )
                return true;

        if (node.parts)
            for (let child of node.parts)
                if (this.containsUsefulStatement(child)) return true;

        return false;
    }

    uselessCodeElimination = (node) => {
        if (node.parts)
            node.parts = node.parts.filter(
                (part) =>
                    part.type !== "expStmt" ||
                    this.containsUsefulStatement(part)
            );
    };

    algebraicUnrolling = (node) => {
        const getConstantValue = (node) => {
            const terminals = [
                { type: "sumExp", rule: 1 },
                { type: "mulExp", rule: 1 },
                { type: "unaryExp", rule: 1 },
                { type: "factor", rule: 0 },
                { type: "immutable", rule: 2 },
            ];

            if (node.type === "constant") {
                if (node.rule === 0)
                    return indexer(node, 0).value;
                if (node.rule === 1) {
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
                }
            }
            if (
                terminals.find(
                    (terminal) =>
                        terminal.type === node.type &&
                        terminal.rule === node.rule
                )
            ) {
                if (node.parts)
                    for (let child of node.parts)
                        return getConstantValue(child);
            }
            return undefined;
        };

        const passExps = ["exp", "simpleExp", "andExp", "unaryRelExp", "relExp"];

        if (node?.rule === 1 && passExps.includes(node?.type)) {
            return this.algebraicUnrolling(node.parts[0])
        }

        const operations = {
            sumExp: {
                0: {
                    pull: [0, 2],
                    run: ([a, b], node) => {
                        const aUnrolled = this.algebraicUnrolling(a);
                        const bUnrolled = this.algebraicUnrolling(b);

                        const aResult = getConstantValue(aUnrolled);
                        const bResult = getConstantValue(bUnrolled);

                        if (aResult !== undefined && bResult !== undefined) {
                            const op =
                                indexer(node, 1, 0).type === "plus"
                                    ? (a, b) => a + b
                                    : (a, b) => a - b;

                            console.log(aUnrolled, bUnrolled);
                            if (aUnrolled.semanticType === "float" || bUnrolled.semanticType === "float") {
                                return {
                                    type: "constant",
                                    rule: 0,
                                    semanticType: "float",
                                    parts: [
                                        {
                                            type: "float_literal",
                                            value:
                                                "" +
                                                op(
                                                    +aResult,
                                                    +bResult
                                                ),
                                        },
                                    ],
                                };
                            } else {
                                return {
                                    type: "constant",
                                    rule: 0,
                                    semanticType: "int",
                                    parts: [
                                        {
                                            type: "integer_literal",
                                            value:
                                                "" +
                                                op(
                                                    Number.parseInt(aResult),
                                                    Number.parseInt(bResult)
                                                ),
                                        },
                                    ],
                                };
                            }
                        } else {
                            node.parts[0] = aUnrolled;
                            node.parts[2] = bUnrolled;
                            return node;
                        }
                    },
                },
            },
            mulExp: {
                0: {
                    pull: [0, 2],
                    run: ([a, b], node) => {
                        const aUnrolled = this.algebraicUnrolling(a);
                        const bUnrolled = this.algebraicUnrolling(b);

                        const aResult = getConstantValue(aUnrolled);
                        const bResult = getConstantValue(bUnrolled);

                        if (aResult !== undefined && bResult !== undefined) {
                            const op =
                                indexer(node, 1, 0).type === "multiply"
                                    ? (a, b) => a * b
                                    : (a, b) => a / b;

                            console.log(aUnrolled, bUnrolled);
                            if (aUnrolled.semanticType === "float" || bUnrolled.semanticType === "float") {
                                return {
                                    type: "constant",
                                    rule: 0,
                                    semanticType: "float",
                                    parts: [
                                        {
                                            type: "float_literal",
                                            value:
                                                "" +
                                                op(
                                                    +aResult,
                                                    +bResult
                                                ),
                                        },
                                    ],
                                };
                            } else {
                                return {
                                    type: "constant",
                                    rule: 0,
                                    semanticType: "int",
                                    parts: [
                                        {
                                            type: "integer_literal",
                                            value:
                                                "" +
                                                Number.parseInt(op(
                                                    Number.parseInt(aResult),
                                                    Number.parseInt(bResult)
                                                )),
                                        },
                                    ],
                                };
                            }
                        } else {
                            node.parts[0] = aUnrolled;
                            node.parts[2] = bUnrolled;
                            return node;
                        }
                    },
                },
            },
            unaryExp: {
                0: {
                    pull: [1],
                    run: ([a], node) => {
                        const aUnrolled = this.algebraicUnrolling(a);

                        const aResult = getConstantValue(aUnrolled);

                        if (aResult !== undefined) {
                            if (aUnrolled.semanticType === "float") {
                                return {
                                    type: "constant",
                                    rule: 0,
                                    semanticType: "float",
                                    parts: [
                                        {
                                            type: "float_literal",
                                            value: "" + -aResult,
                                        },
                                    ],
                                };
                            } else {
                                return {
                                    type: "constant",
                                    rule: 0,
                                    semanticType: "int",
                                    parts: [
                                        {
                                            type: "integer_literal",
                                            value: "" + -Number.parseInt(aResult),
                                        },
                                    ],
                                };
                            }
                        }
                        else return aUnrolled;
                    },
                },
            },
            immutable: {
                0: {
                    pull: [1],
                    run: ([a], node) => {
                        const aUnrolled = this.algebraicUnrolling(a);

                        const aResult = getConstantValue(aUnrolled);

                        if (aResult !== undefined)
                            if (aUnrolled.semanticType === "float") {
                                return {
                                    type: "constant",
                                    rule: 0,
                                    semanticType: "float",
                                    parts: [
                                        {
                                            type: "integer_literal",
                                            value: aResult,
                                        },
                                    ],
                                };
                            } else {
                                return {
                                    type: "constant",
                                    rule: 0,
                                    semanticType: "int",
                                    parts: [
                                        {
                                            type: "integer_literal",
                                            value: aResult,
                                        },
                                    ],
                                };
                            }
                        else return aUnrolled;
                    }
                }
            }
        };

        const recurse = (node) => {
            if (node.parts)
                for (let child of node.parts)
                    this.algebraicUnrolling(child);
        }

        if (operations[node.type]) {
            const operation = operations[node.type][node.rule];
            if (operation) {
                const pulled = operation.pull.map((pull) => node.parts[pull]);
                const result = operation.run(pulled, node);
                if (result !== node) {
                    // A really stupid way to do this, but a quick cheap way
                    for (const key in node) node[key] = undefined;
                    for (const [key, value] of Object.entries(result))
                        node[key] = value;
                }
            } else {
                recurse(node);
            }
        } else {
            recurse(node);
        }


        return node;
    };

    optimize = (node) => {
        this.deadCodeElimination(node);
        this.uselessCodeElimination(node);
        if (node.type === "simpleExp")
            this.algebraicUnrolling(node);

        if (node.parts)
            for (let child of node.parts) {
                this.optimize(child);
            }
    };
}
