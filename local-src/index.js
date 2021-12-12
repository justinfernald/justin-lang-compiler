// created by Justin Fernald

const nearley = require("nearley"); // importing earley cfg parser
const grammar = require("../output/grammar");
const fs = require("fs");
const YAML = require("json-to-pretty-yaml");

console.log = (...args) => console.dir(args, { depth: null });

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const input = fs.readFileSync(process.argv[2]).toString();

parser.feed(input);
// release parser output
// console.log(parser.results[0]);
const output = JSON.stringify(parser.results[0], null, 1);
fs.writeFileSync("output/ast.json", output);
const data = YAML.stringify(parser.results[0]);
fs.writeFileSync("output/ast.yaml", data);
