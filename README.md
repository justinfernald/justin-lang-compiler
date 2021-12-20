# Compiler Project

CST-405

By Justin Fernald

View demo at: https://justinfernald.github.io/compiler-build/
There you can input the code from the test-files folder with the files with that names with mod at the end.
Also recommended to have DevTools console open. Hit F12 with browser open and click console.

# Setup

Be on latest version of NPM

`npm install`

`npm run start`

# Documentation

### Purpose

The purpose of this assignment was to start to enforce rules on how the tokens were layed out. With the first layer of checking being the lexical analyzer we understand were tokens could be wrong, after this step we can understand the locations of tokens that are wrong. Along with that, with a grammar being implemented, you can also start to build a tree as with a CFG you are nesting different rules and these rules can be expanded out into trees. This tree can be set to a format of a abstract syntax tree and this is very useful for the next step in compiling which is semantic checking.

### Grammar Rules Done

Most of the grammar rules were done for the "C--" language. The rules that are incomplete are arrays and also for loops, which might be disregarded depending on time. The grammar rules have a lot of safety built in, like enforcing non-left recursion and non-ambiguity, along with no stmts with operations outside of functions.

### Key Part of Code

Key part 1 (Lexical analysis):

One main part of the code which is inside `grammar.ne` is the lexical analysis where all the tokens are defined, and along with that regular expressions were written to detect numbers and identifiers which are used for variable and function names. The lexical analysis also takes care of white space tokens and remove them.

Key part 2 (Abstract syntax tree):

This part of code was simple to write, but with the amount of grammar rules defined in this language so far, it is a lot of work to write a custom ast function for each rule. However, this part is very crucial in labeling the operations, and branching out for each rules' nested rules such that it makes a tree.

### Tricky parts solution

Tricky part 1:

When this was first written, the program was able to run, but with longer program files to parse, it would not be able to since it would run out of memory. This was due to a naive way of parsing, since I was previously removing the lexical analyzer and had it build into the grammar rules, but it was very slow and for each white space it would take up many rules. The solution to this was to add in the lexical analyzer and then remove the white space. Along with this I still keep track of the character and line numbers for errors.

Tricky part 2:

Another issue I ran into with creating my grammar was parts where I had tokens conflicting with JavaScript built in tokens. This issue would not arise in Bison, but with JavaScript when ever a keyword was used it would throw many errors, this was a simple fix and the keywords were changed to something similar but slightly different.

### AST implementation

For the AST implementation part, it was a fairly straight forward task, but since there was a high number of grammar rules set in the programming language, it is a lot of work to write a custom ast node / function for all of the rules. My approach for this part was just to take all the rules and split them up into multiple nodes such that is was a binary tree. Each node will haves its operation name then the child nodes which would have the same information, so it is recursive like a tree.

### Error messages

Error messages do so the errors location, which is the line and character location. It also show which token is the problem, and possible fixed using the CFG's next expected symbols.

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

# Semantic

Semantic analyses is a very important step for compilers as it is similar to another check in the grammar as it enforces correct usage of operations on types along with type alignment. This is done by recursive steps by finding the types in expressions and traversing children to make sure types match. Along with that definitions will be added to make sure some values to allow auto changing like floats and ints and still be added together while not the same type. Features noted below.

# Code generator

The code generator is the most important compilation step as without it, you have nothing. This shouldn't take away from the other parts as many are still needed. The code generator will use the data from the semantic analyzer / the symbol table and the ast and interate through the ast and generate corresponding code. Features noted below.

# Optimization

Optimization is the least needed part in compilation to have it work, but it great as it will increase performance by many factors. Take for example the recursive fibonacci sequence. Without optimization, that process is complexity, O(2^n). That means without optimization, doing fib of (100) is practically impossible. But with optimization such as pure function memoization, it can be decreased to a complexity of O(n). Optimizations are listed below.

# Features

-   types
    -   int
    -   float
    -   char
    -   bool
    -   string\*
    -   arrays - applies for every type
-   recursion
-   optimizations
    -   dead code removal
    -   useless code removal
    -   algebraic unrolling
    -   constant spreading
    -   loop unrolling
    -   pure function detection for optimization
-   while loop
-   for loop
-   if else statement
-   break statements
-   return statements
-   variables
-   type errors
-   syntax errors
-   auto casting float and ints
-   allowing for char manipulation with ints
