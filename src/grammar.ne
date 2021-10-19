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
    comment: { // find all comments and removes them
        match: /#[^\n]*/,
        value: s => s.substring(1)
    },
    number_literal: { // finds all number tokens
        match: /[0-9]+(?:\.[0-9]+)?/,
        value: s => Number(s)
    },
    identifier: { // finds all identifiers for variables and functions
        match: /[a-zA-Z_][a-zA-Z_0-9]*/
    }
});

// custom edited lexer from moo for next such that it ignores all white space
lexer.next = (next => () => {
    let token;
    while ((token = next.call(lexer)) && token.type === "ws") {}
    return token;
})(lexer.next);

// function to propogate ast data throughout the program
function ast(part, debug = false) {
    // if (debug)
    //    console.log(part);
    const valueList = parts => {
        if (Array.isArray(parts)){
            return parts.flatMap(x => x.value || x.parts.map(valueList))
        } else {
            return parts.value || parts.parts.flatMap(valueList)
        }
    };
    // if (part.filter(x => x.value).length > 0)   
    //console.log({fullText: valueList(part)});
    const fullText = valueList(part);
    return part.map(x => ({...x, fullText, dataText: fullText.flat(Infinity).join(" ")}));;
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
program -> declList {% (data) => ({type: "program", parts: ast(data, true)}) %}

#  list of declarations
declList -> declList decl  {% (data) => ({type: "declList", parts: ast(data)}) %}
    | decl  {% (data) => ({type: "declList", parts: ast(data)}) %}

#  declaration
decl -> varDecl {% (data) => ({type: "decl", parts: ast(data)}) %}
    | funcDecl {% (data) => ({type: "decl", parts: ast(data)}) %}

#  variable declaration
varDecl -> typeSpec varDeclList %scolon {% (data) => ({type: "varDecl", parts: ast(data), symbol: symbol(data[0], data[1], ...data)}) %}

#  scoped variable declaration
scopedVarDecl -> typeSpec varDeclList %scolon {% (data) => ({type: "scopedVarDecl", parts: ast(data)}) %}

#  variable declaration list
varDeclList -> varDeclList %comma varDeclInit {% (data) => ({type: "varDeclList", parts: ast(data)}) %}
    | varDeclInit {% (data) => ({type: "varDeclList", parts: ast(data)}) %}

# variable declaration init
varDeclInit -> varDeclId {% (data) => ({type: "varDeclInit", parts: ast(data), symbol: symbol(data[0])}) %}
    | varDeclId %assignment simpleExp {% (data) => ({type: "varDeclInit", parts: ast(data), symbol: symbol(data[0])}) %}

# variable declaration id
varDeclId -> identifier {% (data) => ({type: "varDeclId", parts: ast(data), symbol: symbol(data[0])}) %}
    | identifier %lbracket number %rbracket {% (data) => ({type: "varDeclId", parts: ast(data), symbol: symbol(data[0])}) %}

# type specifier
typeSpec -> %int {% (data) => ({type: "typeSpec", parts: ast(data)}) %}
    | %char {% (data) => ({type: "typeSpec", parts: ast(data)}) %}
    | %bool {% (data) => ({type: "typeSpec", parts: ast(data)}) %}
    | %voidd {% (data) => ({type: "typeSpec", parts: ast(data)}) %}

# function declaration
funcDecl -> typeSpec identifier %lparan parms %rparan stmt {% (data) => ({type: "funcDecl", parts: ast(data)}) %}
    | identifier %lparan parms %rparan stmt {% (data) => ({type: "funcDecl", parts: ast(data)}) %}

# function parameters
parms -> parmList {% (data) => ({type: "parms", parts: ast(data)}) %}
    | null {% (data) => ({type: "parms", parts: ast(data)}) %}

# function parameter list
parmList -> parmList %comma parmTypeList {% (data) => ({type: "parmList", parts: ast(data)}) %}
    | parmTypeList {% (data) => ({type: "parmList", parts: ast(data)}) %}

#  function parameter type list
parmTypeList -> typeSpec parmIdList {% (data) => ({type: "parmTypeList", parts: ast(data)}) %}

# function parameter id list
parmIdList -> parmIdList %comma parmId {% (data) => ({type: "parmIdList", parts: ast(data)}) %}
    | parmId {% (data) => ({type: "parmIdList", parts: ast(data)}) %}

# function parameter id
parmId -> identifier {% (data) => ({type: "parmId", parts: ast(data)}) %}
    | identifier %lbracket number %rbracket {% (data) => ({type: "parmId", parts: ast(data)}) %}

# statement
stmt -> expStmt {% (data) => ({type: "stmt", parts: ast(data)}) %}
    | compoundStmt {% (data) => ({type: "stmt", parts: ast(data)}) %}
    | selectStmt {% (data) => ({type: "stmt", parts: ast(data)}) %}
    | iterStmt {% (data) => ({type: "stmt", parts: ast(data)}) %}
    | returnStmt {% (data) => ({type: "stmt", parts: ast(data)}) %}

# expression statement
expStmt -> exp %scolon {% (data) => ({type: "expStmt", parts: ast(data)}) %}
    | %scolon {% (data) => ({type: "expStmt", parts: ast(data)}) %}

# compound statement
compoundStmt -> %lbrace localDecls stmtList %rbrace {% (data) => ({type: "compoundStmt", parts: ast(data)}) %}

# local declarations
localDecls -> localDecls scopedVarDecl {% (data) => ({type: "localDecls", parts: ast(data)}) %}
    | null {% (data) => ({type: "localDecls", parts: ast(data)}) %}

# statement list
stmtList -> stmtList stmt {% (data) => ({type: "stmtList", parts: ast(data)}) %}
    | null {% (data) => ({type: "stmtList", parts: ast(data)}) %}

# selection statement
selectStmt -> %iff simpleExp stmt %elsee stmt {% (data) => ({type: "selectStmt", parts: ast(data)}) %}
    | %iff simpleExp stmt %elsee stmt {% (data) => ({type: "selectStmt", parts: ast(data)}) %}

# iteration statement
iterStmt -> %whilee %lparan simpleExp %rparan stmt {% (data) => ({type: "iterStmt", parts: ast(data)}) %}

# return statement
returnStmt -> %returnn %scolon {% (data) => ({type: "returnStmt", parts: ast(data)}) %}
    | %returnn exp %scolon {% (data) => ({type: "returnStmt", parts: ast(data)}) %}

# break statement
breakStmt -> %breakk %scolon {% (data) => ({type: "breakStmt", parts: ast(data)}) %}

# expression
exp -> mutable  %assignment exp {% (data) => ({type: "exp", parts: ast(data)}) %}
    | simpleExp {% (data) => ({type: "exp", parts: ast(data)}) %}

# simple expression
simpleExp -> simpleExp %or andExp {% (data) => ({type: "simpleExp", parts: ast(data)}) %}
    | andExp {% (data) => ({type: "simpleExp", parts: ast(data)}) %}

# and expression
andExp -> andExp %and unaryRelExp {% (data) => ({type: "andExp", parts: ast(data)}) %}
    | unaryRelExp {% (data) => ({type: "andExp", parts: ast(data)}) %}

# unary relational expression
unaryRelExp -> %not unaryRelExp {% (data) => ({type: "unaryRelExp", parts: ast(data)}) %}
    | relExp {% (data) => ({type: "unaryRelExp", parts: ast(data)}) %}

# relational expression
relExp -> sumExp relOp sumExp {% (data) => ({type: "relExp", parts: ast(data)}) %}
    | sumExp {% (data) => ({type: "relExp", parts: ast(data)}) %}

# relational operator
relOp -> %lte {% (data) => ({type: "relOp", parts: ast(data)}) %}
    | %lt {% (data) => ({type: "relOp", parts: ast(data)}) %}
    | %gte {% (data) => ({type: "relOp", parts: ast(data)}) %}
    | %gt {% (data) => ({type: "relOp", parts: ast(data)}) %}
    | %eq {% (data) => ({type: "relOp", parts: ast(data)}) %}
    | %neq {% (data) => ({type: "relOp", parts: ast(data)}) %}

# sum expression
sumExp -> sumExp sumop mulExp {% (data) => ({type: "sumExp", parts: ast(data)}) %}
    | mulExp {% (data) => ({type: "sumExp", parts: ast(data)}) %}

# sum operator
sumop -> %plus {% (data) => ({type: "sumop", parts: ast(data)}) %}
    | %minus {% (data) => ({type: "sumop", parts: ast(data)}) %}

# multiplication expression
mulExp -> mulExp mulop unaryExp {% (data) => ({type: "mulExp", parts: ast(data)}) %}
    | unaryExp {% (data) => ({type: "mulExp", parts: ast(data)}) %}

# multiplication operator
mulop -> %multiply {% (data) => ({type: "mulop", parts: ast(data)}) %}
    | %divide {% (data) => ({type: "mulop", parts: ast(data)}) %}

# unary expression
unaryExp -> unaryop unaryExp {% (data) => ({type: "unaryExp", parts: ast(data)}) %}
    | factor {% (data) => ({type: "unaryExp", parts: ast(data)}) %}

# unary operator
unaryop -> %minus {% (data) => ({type: "unaryop", parts: ast(data)}) %}
    | %multiply {% (data) => ({type: "unaryop", parts: ast(data)}) %}

# factor
factor -> immutable {% (data) => ({type: "factor", parts: ast(data)}) %}
    | mutable {% (data) => ({type: "factor", parts: ast(data)}) %}

# mutable
mutable -> identifier {% (data) => ({type: "mutable", parts: ast(data)}) %}
    | identifier %lbracket number %rbracket {% (data) => ({type: "mutable", parts: ast(data)}) %}

# immutable
immutable -> %lparan exp %rparan {% (data) => ({type: "immutable", parts: ast(data)}) %}
    | call {% (data) => ({type: "immutable", parts: ast(data)}) %}
    | constant {% (data) => ({type: "immutable", parts: ast(data)}) %}

# call
call -> identifier %lparan args %rparan {% (data) => ({type: "call", parts: ast(data)}) %}

# arguments
args -> argList {% (data) => ({type: "args", parts: ast(data)}) %}
    | null {% (data) => ({type: "args", parts: ast(data)}) %}

# argument list
argList -> argList %comma exp {% (data) => ({type: "argList", parts: ast(data)}) %}
    | exp {% (data) => ({type: "argList", parts: ast(data)}) %}

# constant
constant -> number {% (data) => ({type: "constant", parts: ast(data)}) %}
    | %true {% (data) => ({type: "constant", parts: ast(data)}) %}
    | %false {% (data) => ({type: "constant", parts: ast(data)}) %}

# line comment
line_comment -> %comment {% convertTokenId %}

# number
number -> %number_literal {% convertTokenId %}

# identifier
identifier -> %identifier {% convertTokenId %}