@{%
const moo = require("moo");

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
    whilee: "while",
    elsee: "else",
    iff: "if",
    breakk: "break",
    returnn: "return",
    and: "&&",
    or: "||",
    true: "true",
    false: "false",
    comment: {
        match: /#[^\n]*/,
        value: s => s.substring(1)
    },
    number_literal: {
        match: /[0-9]+(?:\.[0-9]+)?/,
        value: s => Number(s)
    },
    identifier: {
        match: /[a-z_][a-z_0-9]*/
    }
});

lexer.next = (next => () => {
    let token;
    while ((token = next.call(lexer)) && token.type === "ws") {}
    return token;
})(lexer.next);


function tokenStart(token) {
    return {
        line: token.line,
        col: token.col - 1
    };
}

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

function convertToken(token) {
    return {
        type: token.type,
        value: token.value,
        start: tokenStart(token),
        end: tokenEnd(token)
    };
}

function convertTokenId(data) {
    return convertToken(data[0]);
}

%}

@lexer lexer

program -> declList

declList -> declList decl | decl

decl -> varDecl | funcDecl

varDecl -> typeSpec varDeclList %scolon

scopedVarDecl -> typeSpec varDeclList %scolon

varDeclList -> varDeclList %comma varDeclInit | varDeclInit

varDeclInit -> varDeclId | varDeclId %assignment simpleExp

varDeclId -> identifier | identifier %lbracket number %rbracket

typeSpec -> %int | %char | %bool

funcDecl -> typeSpec identifier %lparan parms %rparan stmt | identifier %lparan parms %rparan stmt

parms -> parmList | null

parmList -> parmList %comma parmTypeList | parmTypeList

parmTypeList -> typeSpec parmIdList

parmIdList -> parmIdList %comma parmId | parmId

parmId -> identifier | identifier %lbracket number %rbracket

stmt -> expStmt | compoundStmt | selectStmt | iterStmt | returnStmt

expStmt -> exp %scolon  | %scolon

compoundStmt -> %lbrace localDecls stmtList %rbrace

localDecls -> localDecls scopedVarDecl | null

stmtList -> stmtList stmt | null

selectStmt -> %iff simpleExp %then stmt | %iff simpleExp %then stmt %elsee stmt

iterStmt -> %whilee %lparan simpleExp %rparan stmt

returnStmt -> %returnn %scolon | %returnn exp %scolon

breakStmt -> %breakk %scolon

exp -> mutable  %assignment exp | simpleExp

simpleExp -> simpleExp %or andExp | andExp

andExp -> andExp %and unaryRelExp | unaryRelExp

unaryRelExp -> %not unaryRelExp | relExp

relExp -> sumExp %relOp sumExp | sumExp

relop -> %lte | %lt | %gte | %gt | %eq | %neq

sumExp -> sumExp sumop mulExp | mulExp

sumop -> %plus | %minus

mulExp -> mulExp mulop unaryExp | unaryExp

mulop -> %multiply | %divide

unaryExp -> unaryop unaryExp | factor

unaryop -> %minus | %multiply

factor -> immutable | mutable

mutable -> identifier | identifier %lbracket number %rbracket

immutable -> %lparan exp %rparan | call | constant

call -> identifier %lparan args %rparan

args -> argList | null

argList -> argList %comma exp | exp

constant -> number | %true | %false

line_comment -> %comment {% convertTokenId %}

number -> %number_literal {% convertTokenId %}

identifier -> %identifier {% convertTokenId %}