// gets local decls in a scope
export const getLocalDecls = (scope, skip = false) => {
    const output = skip
        ? []
        : scope.symbols.map((symbol) => ({
            type: symbol.type,
            name: symbol.name,
            array: symbol.array,
            size: symbol.size,
            length: symbol.length /* + "_" + scope.index.join('') */,
        }));
    for (const child of scope.scopes) {
        output.push(...getLocalDecls(child));
    }
    return output;
};


// adds indices to scope
export const addIndex = (node, index = [0]) => {
    node.index = index;
    if (node.scopes) {
        for (let i = 0; i < node.scopes.length; i++) {
            addIndex(node.scopes[i], [...index, i]);
        }
    }
};


// adds indices to ast
export const addASTIndex = (node, index = [0]) => {
    node.index = index;
    if (node.parts) {
        for (let i = 0; i < node.parts.length; i++) {
            addASTIndex(node.parts[i], [...index, i]);
        }
    }
};

// easier way to index through a node's children
export const indexer = (node, ...indices) =>
    indices.length === 0
        ? node
        : indexer(node.parts[indices[0]], ...indices.slice(1));

// find terminal for a node
export const findTerminal = (node) => {
    if (node.value) return node;
    return findTerminal(node.parts[0]);
};


// get the last terminal for a node
export const findLastTerminal = (node) => {
    if (node.value) return node;
    return findLastTerminal(node.parts[node.parts.length - 1]);
};

// get the context of a node
export const getContext = (node) => {
    const startTerminal = findTerminal(node);
    const endTerminal = findLastTerminal(node);

    return (
        "\n" +
        JSON.stringify(
            {
                start: startTerminal.start || {
                    line: startTerminal.line,
                    col: startTerminal.col,
                },
                end: endTerminal.end || {
                    line: endTerminal.line,
                    col: endTerminal.col,
                },
                preview: node.value || node.values?.join(" ") || node,
            },
            null,
            4
        )
    );
};

// unused
export const getStatementType = (node) => {

} 