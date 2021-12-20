// scope handler object
export class ScopeHandler {
    // sets initial scope
    scope = {
        name: "global",
        symbols: [
            {
                type: "void",
                name: "output",
                function: true,
                scope: { symbols: [{ type: "int|float|char|char[]", name: "x" }, { type: "int", name: "n" }] },
            },
            {
                type: "int",
                name: "input_int",
                function: true,
                scope: { symbols: [] },
            },

            {
                type: "void",
                name: "output_int",
                function: true,
                scope: { symbols: [{ type: "int", name: "x" }] },
            },
            {
                type: "float",
                name: "input_float",
                function: true,
                scope: { symbols: [] },
            },

            {
                type: "void",
                name: "output_float",
                function: true,
                scope: { symbols: [{ type: "float", name: "x" }] },
            },
            {
                type: "char",
                name: "input_char",
                function: true,
                scope: { symbols: [] },
            },
            {
                type: "void",
                name: "output_char",
                function: true,
                scope: { symbols: [{ type: "char", name: "x" }] },
            },
            {
                type: "void",
                name: "output_string",
                function: true,
                scope: { symbols: [{ type: "char[]", array: true, name: "x" }, { type: "int", name: "n" }] },
            },
        ],
        scopes: [],
    };

    // set inital scope path
    scopePath = [this.scope];

    // function to get current scope
    currentScope = () => this.scopePath[this.scopePath.length - 1];


    // function to find symbol from id
    findSymbol = (id, scopes = this.scopePath) =>
        scopes.length
            ? scopes[scopes.length - 1].symbols.find(
                (symbol) => symbol.name === id
            ) || this.findSymbol(id, scopes.slice(0, -1))
            : undefined;

    // function to find scope from symbol
    findScopeFromSymbol = (id, scopes = this.scopePath) =>
        scopes.length
            ? scopes[scopes.length - 1].symbols.find(
                (symbol) => symbol.name === id
            )
                ? scopes[scopes.length - 1]
                : this.findScopeFromSymbol(id, scopes.slice(0, -1))
            : undefined;

    // function to fund function symbol closest to scope path
    findFunctionSymbol = (scopes = this.scopePath) =>
        scopes.length
            ? scopes[scopes.length - 1].symbols.find(
                (symbol) => symbol.function
            ) || this.findFunctionSymbol(scopes.slice(0, -1))
            : undefined;

    // finds a function's scope
    findFunctionScope = (scopes = this.scopePath) =>
        scopes.length
            ? scopes[scopes.length - 1].functionSymbol
            || this.findFunctionScope(scopes.slice(0, -1))
            : undefined;
}
