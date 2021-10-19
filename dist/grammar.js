// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "program", "symbols": ["declList"], "postprocess": (data) => ({type: "program", parts: ast(data, true)})},
    {"name": "declList", "symbols": ["declList", "decl"], "postprocess": (data) => ({type: "declList", parts: ast(data)})},
    {"name": "declList", "symbols": ["decl"], "postprocess": (data) => ({type: "declList", parts: ast(data)})},
    {"name": "decl", "symbols": ["varDecl"], "postprocess": (data) => ({type: "decl", parts: ast(data)})},
    {"name": "decl", "symbols": ["funcDecl"], "postprocess": (data) => ({type: "decl", parts: ast(data)})},
    {"name": "varDecl", "symbols": ["typeSpec", "varDeclList", (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "varDecl", parts: ast(data), symbol: symbol(data[0], data[1], ...data)})},
    {"name": "scopedVarDecl", "symbols": ["typeSpec", "varDeclList", (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "scopedVarDecl", parts: ast(data)})},
    {"name": "varDeclList", "symbols": ["varDeclList", (lexer.has("comma") ? {type: "comma"} : comma), "varDeclInit"], "postprocess": (data) => ({type: "varDeclList", parts: ast(data)})},
    {"name": "varDeclList", "symbols": ["varDeclInit"], "postprocess": (data) => ({type: "varDeclList", parts: ast(data)})},
    {"name": "varDeclInit", "symbols": ["varDeclId"], "postprocess": (data) => ({type: "varDeclInit", parts: ast(data), symbol: symbol(data[0])})},
    {"name": "varDeclInit", "symbols": ["varDeclId", (lexer.has("assignment") ? {type: "assignment"} : assignment), "simpleExp"], "postprocess": (data) => ({type: "varDeclInit", parts: ast(data), symbol: symbol(data[0])})},
    {"name": "varDeclId", "symbols": ["identifier"], "postprocess": (data) => ({type: "varDeclId", parts: ast(data), symbol: symbol(data[0])})},
    {"name": "varDeclId", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "number", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (data) => ({type: "varDeclId", parts: ast(data), symbol: symbol(data[0])})},
    {"name": "typeSpec", "symbols": [(lexer.has("int") ? {type: "int"} : int)], "postprocess": (data) => ({type: "typeSpec", parts: ast(data)})},
    {"name": "typeSpec", "symbols": [(lexer.has("char") ? {type: "char"} : char)], "postprocess": (data) => ({type: "typeSpec", parts: ast(data)})},
    {"name": "typeSpec", "symbols": [(lexer.has("bool") ? {type: "bool"} : bool)], "postprocess": (data) => ({type: "typeSpec", parts: ast(data)})},
    {"name": "typeSpec", "symbols": [(lexer.has("voidd") ? {type: "voidd"} : voidd)], "postprocess": (data) => ({type: "typeSpec", parts: ast(data)})},
    {"name": "funcDecl", "symbols": ["typeSpec", "identifier", (lexer.has("lparan") ? {type: "lparan"} : lparan), "parms", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt"], "postprocess": (data) => ({type: "funcDecl", parts: ast(data)})},
    {"name": "funcDecl", "symbols": ["identifier", (lexer.has("lparan") ? {type: "lparan"} : lparan), "parms", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt"], "postprocess": (data) => ({type: "funcDecl", parts: ast(data)})},
    {"name": "parms", "symbols": ["parmList"], "postprocess": (data) => ({type: "parms", parts: ast(data)})},
    {"name": "parms", "symbols": [], "postprocess": (data) => ({type: "parms", parts: ast(data)})},
    {"name": "parmList", "symbols": ["parmList", (lexer.has("comma") ? {type: "comma"} : comma), "parmTypeList"], "postprocess": (data) => ({type: "parmList", parts: ast(data)})},
    {"name": "parmList", "symbols": ["parmTypeList"], "postprocess": (data) => ({type: "parmList", parts: ast(data)})},
    {"name": "parmTypeList", "symbols": ["typeSpec", "parmIdList"], "postprocess": (data) => ({type: "parmTypeList", parts: ast(data)})},
    {"name": "parmIdList", "symbols": ["parmIdList", (lexer.has("comma") ? {type: "comma"} : comma), "parmId"], "postprocess": (data) => ({type: "parmIdList", parts: ast(data)})},
    {"name": "parmIdList", "symbols": ["parmId"], "postprocess": (data) => ({type: "parmIdList", parts: ast(data)})},
    {"name": "parmId", "symbols": ["identifier"], "postprocess": (data) => ({type: "parmId", parts: ast(data)})},
    {"name": "parmId", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "number", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (data) => ({type: "parmId", parts: ast(data)})},
    {"name": "stmt", "symbols": ["expStmt"], "postprocess": (data) => ({type: "stmt", parts: ast(data)})},
    {"name": "stmt", "symbols": ["compoundStmt"], "postprocess": (data) => ({type: "stmt", parts: ast(data)})},
    {"name": "stmt", "symbols": ["selectStmt"], "postprocess": (data) => ({type: "stmt", parts: ast(data)})},
    {"name": "stmt", "symbols": ["iterStmt"], "postprocess": (data) => ({type: "stmt", parts: ast(data)})},
    {"name": "stmt", "symbols": ["returnStmt"], "postprocess": (data) => ({type: "stmt", parts: ast(data)})},
    {"name": "expStmt", "symbols": ["exp", (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "expStmt", parts: ast(data)})},
    {"name": "expStmt", "symbols": [(lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "expStmt", parts: ast(data)})},
    {"name": "compoundStmt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "localDecls", "stmtList", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": (data) => ({type: "compoundStmt", parts: ast(data)})},
    {"name": "localDecls", "symbols": ["localDecls", "scopedVarDecl"], "postprocess": (data) => ({type: "localDecls", parts: ast(data)})},
    {"name": "localDecls", "symbols": [], "postprocess": (data) => ({type: "localDecls", parts: ast(data)})},
    {"name": "stmtList", "symbols": ["stmtList", "stmt"], "postprocess": (data) => ({type: "stmtList", parts: ast(data)})},
    {"name": "stmtList", "symbols": [], "postprocess": (data) => ({type: "stmtList", parts: ast(data)})},
    {"name": "selectStmt", "symbols": [(lexer.has("iff") ? {type: "iff"} : iff), "simpleExp", "stmt", (lexer.has("elsee") ? {type: "elsee"} : elsee), "stmt"], "postprocess": (data) => ({type: "selectStmt", parts: ast(data)})},
    {"name": "selectStmt", "symbols": [(lexer.has("iff") ? {type: "iff"} : iff), "simpleExp", "stmt", (lexer.has("elsee") ? {type: "elsee"} : elsee), "stmt"], "postprocess": (data) => ({type: "selectStmt", parts: ast(data)})},
    {"name": "iterStmt", "symbols": [(lexer.has("whilee") ? {type: "whilee"} : whilee), (lexer.has("lparan") ? {type: "lparan"} : lparan), "simpleExp", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt"], "postprocess": (data) => ({type: "iterStmt", parts: ast(data)})},
    {"name": "returnStmt", "symbols": [(lexer.has("returnn") ? {type: "returnn"} : returnn), (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "returnStmt", parts: ast(data)})},
    {"name": "returnStmt", "symbols": [(lexer.has("returnn") ? {type: "returnn"} : returnn), "exp", (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "returnStmt", parts: ast(data)})},
    {"name": "breakStmt", "symbols": [(lexer.has("breakk") ? {type: "breakk"} : breakk), (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "breakStmt", parts: ast(data)})},
    {"name": "exp", "symbols": ["mutable", (lexer.has("assignment") ? {type: "assignment"} : assignment), "exp"], "postprocess": (data) => ({type: "exp", parts: ast(data)})},
    {"name": "exp", "symbols": ["simpleExp"], "postprocess": (data) => ({type: "exp", parts: ast(data)})},
    {"name": "simpleExp", "symbols": ["simpleExp", (lexer.has("or") ? {type: "or"} : or), "andExp"], "postprocess": (data) => ({type: "simpleExp", parts: ast(data)})},
    {"name": "simpleExp", "symbols": ["andExp"], "postprocess": (data) => ({type: "simpleExp", parts: ast(data)})},
    {"name": "andExp", "symbols": ["andExp", (lexer.has("and") ? {type: "and"} : and), "unaryRelExp"], "postprocess": (data) => ({type: "andExp", parts: ast(data)})},
    {"name": "andExp", "symbols": ["unaryRelExp"], "postprocess": (data) => ({type: "andExp", parts: ast(data)})},
    {"name": "unaryRelExp", "symbols": [(lexer.has("not") ? {type: "not"} : not), "unaryRelExp"], "postprocess": (data) => ({type: "unaryRelExp", parts: ast(data)})},
    {"name": "unaryRelExp", "symbols": ["relExp"], "postprocess": (data) => ({type: "unaryRelExp", parts: ast(data)})},
    {"name": "relExp", "symbols": ["sumExp", "relOp", "sumExp"], "postprocess": (data) => ({type: "relExp", parts: ast(data)})},
    {"name": "relExp", "symbols": ["sumExp"], "postprocess": (data) => ({type: "relExp", parts: ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("lte") ? {type: "lte"} : lte)], "postprocess": (data) => ({type: "relOp", parts: ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("lt") ? {type: "lt"} : lt)], "postprocess": (data) => ({type: "relOp", parts: ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("gte") ? {type: "gte"} : gte)], "postprocess": (data) => ({type: "relOp", parts: ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("gt") ? {type: "gt"} : gt)], "postprocess": (data) => ({type: "relOp", parts: ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("eq") ? {type: "eq"} : eq)], "postprocess": (data) => ({type: "relOp", parts: ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("neq") ? {type: "neq"} : neq)], "postprocess": (data) => ({type: "relOp", parts: ast(data)})},
    {"name": "sumExp", "symbols": ["sumExp", "sumop", "mulExp"], "postprocess": (data) => ({type: "sumExp", parts: ast(data)})},
    {"name": "sumExp", "symbols": ["mulExp"], "postprocess": (data) => ({type: "sumExp", parts: ast(data)})},
    {"name": "sumop", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus)], "postprocess": (data) => ({type: "sumop", parts: ast(data)})},
    {"name": "sumop", "symbols": [(lexer.has("minus") ? {type: "minus"} : minus)], "postprocess": (data) => ({type: "sumop", parts: ast(data)})},
    {"name": "mulExp", "symbols": ["mulExp", "mulop", "unaryExp"], "postprocess": (data) => ({type: "mulExp", parts: ast(data)})},
    {"name": "mulExp", "symbols": ["unaryExp"], "postprocess": (data) => ({type: "mulExp", parts: ast(data)})},
    {"name": "mulop", "symbols": [(lexer.has("multiply") ? {type: "multiply"} : multiply)], "postprocess": (data) => ({type: "mulop", parts: ast(data)})},
    {"name": "mulop", "symbols": [(lexer.has("divide") ? {type: "divide"} : divide)], "postprocess": (data) => ({type: "mulop", parts: ast(data)})},
    {"name": "unaryExp", "symbols": ["unaryop", "unaryExp"], "postprocess": (data) => ({type: "unaryExp", parts: ast(data)})},
    {"name": "unaryExp", "symbols": ["factor"], "postprocess": (data) => ({type: "unaryExp", parts: ast(data)})},
    {"name": "unaryop", "symbols": [(lexer.has("minus") ? {type: "minus"} : minus)], "postprocess": (data) => ({type: "unaryop", parts: ast(data)})},
    {"name": "unaryop", "symbols": [(lexer.has("multiply") ? {type: "multiply"} : multiply)], "postprocess": (data) => ({type: "unaryop", parts: ast(data)})},
    {"name": "factor", "symbols": ["immutable"], "postprocess": (data) => ({type: "factor", parts: ast(data)})},
    {"name": "factor", "symbols": ["mutable"], "postprocess": (data) => ({type: "factor", parts: ast(data)})},
    {"name": "mutable", "symbols": ["identifier"], "postprocess": (data) => ({type: "mutable", parts: ast(data)})},
    {"name": "mutable", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "number", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (data) => ({type: "mutable", parts: ast(data)})},
    {"name": "immutable", "symbols": [(lexer.has("lparan") ? {type: "lparan"} : lparan), "exp", (lexer.has("rparan") ? {type: "rparan"} : rparan)], "postprocess": (data) => ({type: "immutable", parts: ast(data)})},
    {"name": "immutable", "symbols": ["call"], "postprocess": (data) => ({type: "immutable", parts: ast(data)})},
    {"name": "immutable", "symbols": ["constant"], "postprocess": (data) => ({type: "immutable", parts: ast(data)})},
    {"name": "call", "symbols": ["identifier", (lexer.has("lparan") ? {type: "lparan"} : lparan), "args", (lexer.has("rparan") ? {type: "rparan"} : rparan)], "postprocess": (data) => ({type: "call", parts: ast(data)})},
    {"name": "args", "symbols": ["argList"], "postprocess": (data) => ({type: "args", parts: ast(data)})},
    {"name": "args", "symbols": [], "postprocess": (data) => ({type: "args", parts: ast(data)})},
    {"name": "argList", "symbols": ["argList", (lexer.has("comma") ? {type: "comma"} : comma), "exp"], "postprocess": (data) => ({type: "argList", parts: ast(data)})},
    {"name": "argList", "symbols": ["exp"], "postprocess": (data) => ({type: "argList", parts: ast(data)})},
    {"name": "constant", "symbols": ["number"], "postprocess": (data) => ({type: "constant", parts: ast(data)})},
    {"name": "constant", "symbols": [(lexer.has("true") ? {type: "true"} : true)], "postprocess": (data) => ({type: "constant", parts: ast(data)})},
    {"name": "constant", "symbols": [(lexer.has("false") ? {type: "false"} : false)], "postprocess": (data) => ({type: "constant", parts: ast(data)})},
    {"name": "line_comment", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": convertTokenId},
    {"name": "number", "symbols": [(lexer.has("number_literal") ? {type: "number_literal"} : number_literal)], "postprocess": convertTokenId},
    {"name": "identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": convertTokenId}
]
  , ParserStart: "program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
