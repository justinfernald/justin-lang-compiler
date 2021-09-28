// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "program", "symbols": ["declList"]},
    {"name": "declList", "symbols": ["declList", "decl"]},
    {"name": "declList", "symbols": ["decl"]},
    {"name": "decl", "symbols": ["varDecl"]},
    {"name": "decl", "symbols": ["funcDecl"]},
    {"name": "varDecl", "symbols": ["typeSpec", "varDeclList", (lexer.has("scolon") ? {type: "scolon"} : scolon)]},
    {"name": "scopedVarDecl", "symbols": ["typeSpec", "varDeclList", (lexer.has("scolon") ? {type: "scolon"} : scolon)]},
    {"name": "varDeclList", "symbols": ["varDeclList", (lexer.has("comma") ? {type: "comma"} : comma), "varDeclInit"]},
    {"name": "varDeclList", "symbols": ["varDeclInit"]},
    {"name": "varDeclInit", "symbols": ["varDeclId"]},
    {"name": "varDeclInit", "symbols": ["varDeclId", (lexer.has("assignment") ? {type: "assignment"} : assignment), "simpleExp"]},
    {"name": "varDeclId", "symbols": ["identifier"]},
    {"name": "varDeclId", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "number", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)]},
    {"name": "typeSpec", "symbols": [(lexer.has("int") ? {type: "int"} : int)]},
    {"name": "typeSpec", "symbols": [(lexer.has("char") ? {type: "char"} : char)]},
    {"name": "typeSpec", "symbols": [(lexer.has("bool") ? {type: "bool"} : bool)]},
    {"name": "funcDecl", "symbols": ["typeSpec", "identifier", (lexer.has("lparan") ? {type: "lparan"} : lparan), "parms", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt"]},
    {"name": "funcDecl", "symbols": ["identifier", (lexer.has("lparan") ? {type: "lparan"} : lparan), "parms", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt"]},
    {"name": "parms", "symbols": ["parmList"]},
    {"name": "parms", "symbols": []},
    {"name": "parmList", "symbols": ["parmList", (lexer.has("comma") ? {type: "comma"} : comma), "parmTypeList"]},
    {"name": "parmList", "symbols": ["parmTypeList"]},
    {"name": "parmTypeList", "symbols": ["typeSpec", "parmIdList"]},
    {"name": "parmIdList", "symbols": ["parmIdList", (lexer.has("comma") ? {type: "comma"} : comma), "parmId"]},
    {"name": "parmIdList", "symbols": ["parmId"]},
    {"name": "parmId", "symbols": ["identifier"]},
    {"name": "parmId", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "number", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)]},
    {"name": "stmt", "symbols": ["expStmt"]},
    {"name": "stmt", "symbols": ["compoundStmt"]},
    {"name": "stmt", "symbols": ["selectStmt"]},
    {"name": "stmt", "symbols": ["iterStmt"]},
    {"name": "stmt", "symbols": ["returnStmt"]},
    {"name": "expStmt", "symbols": ["exp", (lexer.has("scolon") ? {type: "scolon"} : scolon)]},
    {"name": "expStmt", "symbols": [(lexer.has("scolon") ? {type: "scolon"} : scolon)]},
    {"name": "compoundStmt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "localDecls", "stmtList", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)]},
    {"name": "localDecls", "symbols": ["localDecls", "scopedVarDecl"]},
    {"name": "localDecls", "symbols": []},
    {"name": "stmtList", "symbols": ["stmtList", "stmt"]},
    {"name": "stmtList", "symbols": []},
    {"name": "selectStmt", "symbols": [(lexer.has("iff") ? {type: "iff"} : iff), "simpleExp", (lexer.has("then") ? {type: "then"} : then), "stmt"]},
    {"name": "selectStmt", "symbols": [(lexer.has("iff") ? {type: "iff"} : iff), "simpleExp", (lexer.has("then") ? {type: "then"} : then), "stmt", (lexer.has("elsee") ? {type: "elsee"} : elsee), "stmt"]},
    {"name": "iterStmt", "symbols": [(lexer.has("whilee") ? {type: "whilee"} : whilee), (lexer.has("lparan") ? {type: "lparan"} : lparan), "simpleExp", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt"]},
    {"name": "returnStmt", "symbols": [(lexer.has("returnn") ? {type: "returnn"} : returnn), (lexer.has("scolon") ? {type: "scolon"} : scolon)]},
    {"name": "returnStmt", "symbols": [(lexer.has("returnn") ? {type: "returnn"} : returnn), "exp", (lexer.has("scolon") ? {type: "scolon"} : scolon)]},
    {"name": "breakStmt", "symbols": [(lexer.has("breakk") ? {type: "breakk"} : breakk), (lexer.has("scolon") ? {type: "scolon"} : scolon)]},
    {"name": "exp", "symbols": ["mutable", (lexer.has("assignment") ? {type: "assignment"} : assignment), "exp"]},
    {"name": "exp", "symbols": ["simpleExp"]},
    {"name": "simpleExp", "symbols": ["simpleExp", (lexer.has("or") ? {type: "or"} : or), "andExp"]},
    {"name": "simpleExp", "symbols": ["andExp"]},
    {"name": "andExp", "symbols": ["andExp", (lexer.has("and") ? {type: "and"} : and), "unaryRelExp"]},
    {"name": "andExp", "symbols": ["unaryRelExp"]},
    {"name": "unaryRelExp", "symbols": [(lexer.has("not") ? {type: "not"} : not), "unaryRelExp"]},
    {"name": "unaryRelExp", "symbols": ["relExp"]},
    {"name": "relExp", "symbols": ["sumExp", (lexer.has("relOp") ? {type: "relOp"} : relOp), "sumExp"]},
    {"name": "relExp", "symbols": ["sumExp"]},
    {"name": "relop", "symbols": [(lexer.has("lte") ? {type: "lte"} : lte)]},
    {"name": "relop", "symbols": [(lexer.has("lt") ? {type: "lt"} : lt)]},
    {"name": "relop", "symbols": [(lexer.has("gte") ? {type: "gte"} : gte)]},
    {"name": "relop", "symbols": [(lexer.has("gt") ? {type: "gt"} : gt)]},
    {"name": "relop", "symbols": [(lexer.has("eq") ? {type: "eq"} : eq)]},
    {"name": "relop", "symbols": [(lexer.has("neq") ? {type: "neq"} : neq)]},
    {"name": "sumExp", "symbols": ["sumExp", "sumop", "mulExp"]},
    {"name": "sumExp", "symbols": ["mulExp"]},
    {"name": "sumop", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus)]},
    {"name": "sumop", "symbols": [(lexer.has("minus") ? {type: "minus"} : minus)]},
    {"name": "mulExp", "symbols": ["mulExp", "mulop", "unaryExp"]},
    {"name": "mulExp", "symbols": ["unaryExp"]},
    {"name": "mulop", "symbols": [(lexer.has("multiply") ? {type: "multiply"} : multiply)]},
    {"name": "mulop", "symbols": [(lexer.has("divide") ? {type: "divide"} : divide)]},
    {"name": "unaryExp", "symbols": ["unaryop", "unaryExp"]},
    {"name": "unaryExp", "symbols": ["factor"]},
    {"name": "unaryop", "symbols": [(lexer.has("minus") ? {type: "minus"} : minus)]},
    {"name": "unaryop", "symbols": [(lexer.has("multiply") ? {type: "multiply"} : multiply)]},
    {"name": "factor", "symbols": ["immutable"]},
    {"name": "factor", "symbols": ["mutable"]},
    {"name": "mutable", "symbols": ["identifier"]},
    {"name": "mutable", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "number", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)]},
    {"name": "immutable", "symbols": [(lexer.has("lparan") ? {type: "lparan"} : lparan), "exp", (lexer.has("rparan") ? {type: "rparan"} : rparan)]},
    {"name": "immutable", "symbols": ["call"]},
    {"name": "immutable", "symbols": ["constant"]},
    {"name": "call", "symbols": ["identifier", (lexer.has("lparan") ? {type: "lparan"} : lparan), "args", (lexer.has("rparan") ? {type: "rparan"} : rparan)]},
    {"name": "args", "symbols": ["argList"]},
    {"name": "args", "symbols": []},
    {"name": "argList", "symbols": ["argList", (lexer.has("comma") ? {type: "comma"} : comma), "exp"]},
    {"name": "argList", "symbols": ["exp"]},
    {"name": "constant", "symbols": ["number"]},
    {"name": "constant", "symbols": [(lexer.has("true") ? {type: "true"} : true)]},
    {"name": "constant", "symbols": [(lexer.has("false") ? {type: "false"} : false)]},
    {"name": "line_comment", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": convertTokenId},
    {"name": "number", "symbols": [(lexer.has("number_literal") ? {type: "number_literal"} : number_literal)], "postprocess": convertTokenId},
    {"name": "identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": convertTokenId},
    {"name": "__$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": () => "bruh"},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => "bruh"}
]
  , ParserStart: "program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
