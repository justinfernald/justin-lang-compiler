const nearley = require("nearley");
const grammar = require("../dist/grammar");
const fs = require("fs")

console.log = (...args) =>
    console.dir(args, { depth: null });

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const input = fs.readFileSync(process.argv[2]).toString()

parser.feed(input);

console.log(parser.results); // [[[[ "foo" ],"\n" ]]]