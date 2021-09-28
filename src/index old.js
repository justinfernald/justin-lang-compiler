const nearley = require("nearley");
const grammar = require("../dist/grammar");

console.log = (...args) =>
    console.dir(args, { depth: null });

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

parser.feed(`func hello() {
    while (true) {
        hello()
        return 4 + 2 * 2
    }
}
`);

console.log(parser.results); // [[[[ "foo" ],"\n" ]]]