@{%
// grammar modified and inspired from: http://marvin.cs.uidaho.edu/Teaching/CS445/c-Grammar.pdf
// created by Justin Fernald

const moo = require("moo");

// list out all terminal tokens
const lexer = moo.compile({
    ws: {match: /\s+/, lineBreaks: true},
    lte: "<=",
    lt: "<",
    gte: ">=",
    gt: ">",
    neq: "!=",
    eq: "==",
    lparan: "(",
    rparan: ")",
    comma: ",",
    lbracket: "[",
    rbracket: "]",
    lbrace: "{",
    rbrace: "}",
    assignment: "=",
    plus: "+",
    minus: "-",
    multiply: "*",
    divide: "/",
    scolon: ";",
    int: "int",
    char: "char",
    bool: "bool",
    voidd: "void",
    whilee: "while",
    elsee: "else",
    iff: "if",
    breakk: "break",
    returnn: "return",
    and: "&&",
    or: "||",
    true: "true",
    false: "false",
    // input: "input()",
    // output: "output",
    charc: /'[^']'/,
    // string: /"[^"]*"/,
    comment: { // find all comments and removes them
        match: /#[^\n]*/,
        // value: s => s.substring(1)
        value: s => s.substring(1)
    },
    number_literal: { // finds all number tokens
        match: /[0-9]+(?:\.[0-9]+)?/,
        // value: s => Number(s)
    },
    identifier: { // finds all identifiers for variables and functions
        match: /[a-zA-Z_][a-zA-Z_0-9]*/
    }
});

// custom edited lexer from moo for next such that it ignores all white space
lexer.next = (next => () => {
    let token;
    while ((token = next.call(lexer)) && (token.type === "ws" || token.type === "comment")) {}
    return token;
})(lexer.next);

function hash(string) {      
    var hash = 0;
        
    if (string.length == 0) return hash;
        
    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
        
    return Math.abs(hash);
}

// function to propogate ast data throughout the program
function ast(part, scopeHead = false, title = "default") {
    const grammarData = parts => {
        if (!Array.isArray(parts)){
            if (!parts) return [];
            parts = [parts];
        }

        return parts.map(x => ({terms: x.type, value: x.value, parts: grammarData(x.parts) || []}));            
    };

    const build = parts => { 
        const output = [];

        for (let part of parts) {
            if (part.value) {
                output.push({terms: [part.terms], value: part.value});
            } else {
                let sub = build(part.parts);
                for (let subPart of sub) {
                    subPart.terms = [part.terms, ...subPart.terms];
                    output.push(subPart);
                }
            }
        }
        
        return output;
    }

    const context = build(grammarData(part));
    const values = context.map(x => x.value);
    const startTypes = context.map(x => x.terms[0]);
    const endTypes = context.map(x => x.terms[x.terms.length - 1]);
    if (!scopeHead) title = undefined;
    // return { scopeHead, title, parts: part};  
    return { scopeHead, title, values, context, parts: part};  
}

function symbol(type, name, scope) {
    return {
        type: type,
        name: name,
        scope: scope
    }
}

// gets start of tokens
function tokenStart(token) {
    return {
        line: token.line,
        col: token.col - 1
    };
}

// gets end of tokens
function tokenEnd(token) {
    const lastNewLine = token.text.lastIndexOf("\n");
    if (lastNewLine !== -1) {
        throw new Error("Unsupported case: token with line breaks");
    }
    return {
        line: token.line,
        col: token.col + token.text.length - 1
    };
}

// converts tokens to ast data
function convertToken(token) {
    return {
        type: token.type,
        value: token.value,
        start: tokenStart(token),
        end: tokenEnd(token)
    };
}

// gets token id
function convertTokenId(data) {
    return convertToken(data[0]);
}

%}

@lexer lexer

# program which is starting symbol
program -> declList {% (data) => ({type: "program", rule: 0, ...ast(data)}) %}

# list of declarations
declList -> declList decl  {% (data) => ({type: "declList", rule: 0, ...ast(data)}) %}
    | decl  {% (data) => ({type: "declList", rule: 1, ...ast(data)}) %}

# declaration
decl -> varDecl {% (data) => ({type: "decl", rule: 0, ...ast(data)}) %}
    | funcDecl {% (data) => ({type: "decl", rule: 1, ...ast(data)}) %}

# variable declaration
varDecl -> typeSpec varDeclInit %scolon {% (data) => ({type: "varDecl", rule: 0, ...ast(data), symbol: symbol(data[0], data[1], ...data)}) %}

# scoped variable declaration
scopedVarDecl -> typeSpec varDeclInit %scolon {% (data) => ({type: "scopedVarDecl", rule: 0, ...ast(data)}) %}

# # variable declaration list
# varDeclList -> varDeclList %comma varDeclInit {% (data) => ({type: "varDeclList", rule: 0, ...ast(data)}) %}
#     | varDeclInit {% (data) => ({type: "varDeclList", rule: 0, ...ast(data)}) %}

# variable declaration init
varDeclInit -> varDeclId {% (data) => ({type: "varDeclInit", rule: 0, ...ast(data), symbol: symbol(data[0])}) %}
    | varDeclId %assignment simpleExp {% (data) => ({type: "varDeclInit", rule: 1, ...ast(data), symbol: symbol(data[0])}) %}

# variable declaration id
varDeclId -> identifier {% (data) => ({type: "varDeclId", rule: 0, ...ast(data), symbol: symbol(data[0])}) %}
    | identifier %lbracket number %rbracket {% (data) => ({type: "varDeclId", rule: 1, ...ast(data), symbol: symbol(data[0])}) %}

# type specifier
typeSpec -> %int {% (data) => ({type: "typeSpec", rule: 0, ...ast(data)}) %}
    | %char {% (data) => ({type: "typeSpec", rule: 1, ...ast(data)}) %}
    | %bool {% (data) => ({type: "typeSpec", rule: 2, ...ast(data)}) %}
    | %voidd {% (data) => ({type: "typeSpec", rule: 3, ...ast(data)}) %}

# function declaration
funcDecl -> typeSpec identifier %lparan parms %rparan compoundStmt {% (data) => ({type: "funcDecl", rule: 0, ...ast(data, true, "function")}) %}
    # | identifier %lparan parms %rparan compoundStmt {% (data) => ({type: "funcDecl", rule: 1, ...ast(data, true, "function")}) %}

# function parameters
parms -> parmList {% (data) => ({type: "parms", rule: 0, ...ast(data)}) %}
    | null {% (data) => ({type: "parms", rule: 1, ...ast(data)}) %}

# function parameter list
parmList -> parmList %comma parmTypeList {% (data) => ({type: "parmList", rule: 0, ...ast(data)}) %}
    | parmTypeList {% (data) => ({type: "parmList", rule: 1, ...ast(data)}) %}

# function parameter type list
# parmTypeList -> typeSpec parmIdList {% (data) => ({type: "parmTypeList", rule: 0, ...ast(data)}) %}
parmTypeList -> typeSpec parmId {% (data) => ({type: "parmTypeList", rule: 0, ...ast(data)}) %}

# function parameter id list
parmIdList -> parmIdList %comma parmId {% (data) => ({type: "parmIdList", rule: 0, ...ast(data)}) %}
    | parmId {% (data) => ({type: "parmIdList", rule: 1, ...ast(data)}) %}

# function parameter id
parmId -> identifier {% (data) => ({type: "parmId", rule: 0, ...ast(data)}) %}
    | identifier %lbracket %rbracket {% (data) => ({type: "parmId", rule: 1, ...ast(data)}) %}

# statement
stmt -> expStmt {% (data) => ({type: "stmt", rule: 0, ...ast(data)}) %}
    | compoundStmt {% (data) => ({type: "stmt", rule: 1, ...ast(data)}) %}
    | selectStmt {% (data) => ({type: "stmt", rule: 2, ...ast(data)}) %}
    | iterStmt {% (data) => ({type: "stmt", rule: 3, ...ast(data)}) %}
    | returnStmt {% (data) => ({type: "stmt", rule: 4, ...ast(data)}) %}
    | breakStmt {% (data) => ({type: "stmt", rule: 5, ...ast(data)}) %}
    | scopedVarDecl {% (data) => ({type: "stmt", rule: 6, ...ast(data)}) %}

# expression statement
expStmt -> exp %scolon {% (data) => ({type: "expStmt", rule: 0, ...ast(data)}) %}
    | %scolon {% (data) => ({type: "expStmt", rule: 1, ...ast(data)}) %}

# compound statement
compoundStmt -> %lbrace stmtList %rbrace {% (data) => ({type: "compoundStmt", rule: 0, ...ast(data, true, "compound")}) %}

# statement list
stmtList -> stmtList stmt {% (data) => ({type: "stmtList", rule: 0, ...ast(data)}) %}
    | null {% (data) => ({type: "stmtList", rule: 1, ...ast(data)}) %}

# selection statement
selectStmt -> %iff %lparan simpleExp %rparan stmt {% (data) => ({type: "selectStmt", rule: 0, ...ast(data, true, "select")}) %}
    | %iff %lparan simpleExp %rparan stmt %elsee stmt {% (data) => ({type: "selectStmt", rule: 1, ...ast(data, true, "select")}) %}

# iteration statement
iterStmt -> %whilee %lparan simpleExp %rparan stmt {% (data) => ({type: "iterStmt", rule: 0, ...ast(data, true, "while")}) %}

# return statement
returnStmt -> %returnn %scolon {% (data) => ({type: "returnStmt", rule: 0, ...ast(data)}) %}
    | %returnn simpleExp %scolon {% (data) => ({type: "returnStmt", rule: 1, ...ast(data)}) %}

# break statement
breakStmt -> %breakk %scolon {% (data) => ({type: "breakStmt", rule: 0, ...ast(data)}) %}

# expression
exp -> mutable %assignment exp {% (data) => ({type: "exp", rule: 0, ...ast(data)}) %}
    | simpleExp {% (data) => ({type: "exp", rule: 1, ...ast(data)}) %}

# simple expression
simpleExp -> simpleExp %or andExp {% (data) => ({type: "simpleExp", rule: 0, ...ast(data)}) %}
    | andExp {% (data) => ({type: "simpleExp", rule: 1, ...ast(data)}) %}

# and expression
andExp -> andExp %and unaryRelExp {% (data) => ({type: "andExp", rule: 0, ...ast(data)}) %}
    | unaryRelExp {% (data) => ({type: "andExp", rule: 1, ...ast(data)}) %}

# unary relational expression
unaryRelExp -> %not unaryRelExp {% (data) => ({type: "unaryRelExp", rule: 0, ...ast(data)}) %}
    | relExp {% (data) => ({type: "unaryRelExp", rule: 1, ...ast(data)}) %}

# relational expression
relExp -> sumExp relOp sumExp {% (data) => ({type: "relExp", rule: 0, ...ast(data)}) %}
    | sumExp {% (data) => ({type: "relExp", rule: 1, ...ast(data)}) %}

# relational operator
relOp -> %lte {% (data) => ({type: "relOp", rule: 0, ...ast(data)}) %}
    | %lt {% (data) => ({type: "relOp", rule: 1, ...ast(data)}) %}
    | %gte {% (data) => ({type: "relOp", rule: 2, ...ast(data)}) %}
    | %gt {% (data) => ({type: "relOp", rule: 3, ...ast(data)}) %}
    | %eq {% (data) => ({type: "relOp", rule: 4, ...ast(data)}) %}
    | %neq {% (data) => ({type: "relOp", rule: 5, ...ast(data)}) %}

# sum expression
sumExp -> sumExp sumop mulExp {% (data) => ({type: "sumExp", rule: 0, ...ast(data)}) %}
    | mulExp {% (data) => ({type: "sumExp", rule: 1, ...ast(data)}) %}

# sum operator
sumop -> %plus {% (data) => ({type: "sumop", rule: 0, ...ast(data)}) %}
    | %minus {% (data) => ({type: "sumop", rule: 1, ...ast(data)}) %}

# multiplication expression
mulExp -> mulExp mulop unaryExp {% (data) => ({type: "mulExp", rule: 0, ...ast(data)}) %}
    | unaryExp {% (data) => ({type: "mulExp", rule: 1, ...ast(data)}) %}

# multiplication operator
mulop -> %multiply {% (data) => ({type: "mulop", rule: 0, ...ast(data)}) %}
    | %divide {% (data) => ({type: "mulop", rule: 1, ...ast(data)}) %}

# unary expression
unaryExp -> unaryop unaryExp {% (data) => ({type: "unaryExp", rule: 0, ...ast(data)}) %}
    | factor {% (data) => ({type: "unaryExp", rule: 1, ...ast(data)}) %}

# unary operator
unaryop -> %minus {% (data) => ({type: "unaryop", rule: 0, ...ast(data)}) %}
    #| %multiply {% (data) => ({type: "unaryop", rule: 1, ...ast(data)}) %}

# factor
factor -> immutable {% (data) => ({type: "factor", rule: 0, ...ast(data)}) %}
    | mutable {% (data) => ({type: "factor", rule: 1, ...ast(data)}) %}

# mutable
mutable -> identifier {% (data) => ({type: "mutable", rule: 0, ...ast(data)}) %}
    | identifier %lbracket exp %rbracket {% (data) => ({type: "mutable", rule: 1, ...ast(data)}) %}

# immutable
immutable -> %lparan exp %rparan {% (data) => ({type: "immutable", rule: 0, ...ast(data)}) %}
    | call {% (data) => ({type: "immutable", rule: 1, ...ast(data)}) %}
    | constant {% (data) => ({type: "immutable", rule: 2, ...ast(data)}) %}

# call
call -> identifier %lparan args %rparan {% (data) => ({type: "call", rule: 0, ...ast(data)}) %}

# arguments
args -> argList {% (data) => ({type: "args", rule: 0, ...ast(data)}) %}
    | null {% (data) => ({type: "args", rule: 1, ...ast(data)}) %}

# argument list
argList -> argList %comma exp {% (data) => ({type: "argList", rule: 0, ...ast(data)}) %}
    | exp {% (data) => ({type: "argList", rule: 1, ...ast(data)}) %}

# constant
constant -> number {% (data) => ({type: "constant", rule: 0, ...ast(data)}) %}
    | charc {% (data) => ({type: "constant", rule: 1, ...ast(data)}) %}
    | boolv {% (data) => ({type: "constant", rule: 2, ...ast(data)}) %}

# line comment
line_comment -> %comment {% convertTokenId %}

# number
number -> %number_literal {% convertTokenId %}

# boolean
boolv -> %true {% convertTokenId %}
    | %false {% convertTokenId %}

# charc
charc -> %charc {% convertTokenId %}

# identifier
identifier -> %identifier {% convertTokenId %}