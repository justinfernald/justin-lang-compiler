export class ScopeHandler {
    scope = {
        name: "global",
        symbols: [
            { type: "int", name: "input", function: true, scope: { symbols: [] } },
            { type: "void", name: "output", function: true, scope: { symbols: [{ type: "int", name: "x" }] } },
        ],
        scopes: [],
    };

    scopePath = [this.scope];

    currentScope = () => console.log(this.scopePath) || this.scopePath[this.scopePath.length - 1];

    findSymbol = (id, scopes = this.scopePath) => scopes.length ? scopes[scopes.length - 1].symbols.find(symbol => symbol.name === id) || this.findSymbol(id, scopes.slice(0, -1)) : undefined;

    findScopeFromSymbol = (id, scopes = this.scopePath) => scopes.length ? scopes[scopes.length - 1].symbols.find(symbol => symbol.name === id) ? scopes[scopes.length - 1] : this.findScopeFromSymbol(id, scopes.slice(0, -1)) : undefined;

    findFunctionSymbol = (scopes = this.scopePath) => scopes.length ? scopes[scopes.length - 1].symbols.find(symbol => symbol.function) || this.findFunctionSymbol(scopes.slice(0, -1)) : undefined;
}