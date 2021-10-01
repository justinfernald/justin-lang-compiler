# Project 1 (AST)

CST-405

By Justin Fernald

# Setup

Be on latest version of NPM

`npm install`

`npm run build`

`node src/index.js [file name]`

### Example:

`node src/index.js test.gcupl`

or

`node src/index.js testProg.gcupl`

# Main files:

located in src folder
`grammar.ne` and `index.js`

The `grammar.ne` has the code for the AST and lexer and grammar definition

`index.js` is the main runner of the grammar

# CFG parser

This is a context free grammar such that you can define grammars and then pass inputs to test to see if a input is in the grammar. This is done using the Earley algorithm.

Feature not fully implemented in handling of epsilons as it works for some scenarios.

Currently using Nearley library to do more CFG
