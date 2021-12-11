const nearley = require("nearley");
const grammar = require("../output/grammar");

export function buildAST(input) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(input);
    return parser.results[0];
}