export class Optimizer {
    constructor(scopeHandler) {
        this.scopeHandler = scopeHandler;
    }

    deadCodeElimination = (node) => {
        if (node.parts) {
            let newParts = [];
            for (let child of node.parts) {
                newParts.push(child);
                if (child.type === "returnStmt")
                    return;
            }
            node.parts = newParts
        }
    }

    optimize = (node) => {
        this.deadCodeElimination(node);
    }
}