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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "program", "symbols": ["declList"], "postprocess": (data) => ({type: "program", rule: 0, ...ast(data)})},
    {"name": "declList", "symbols": ["declList", "decl"], "postprocess": (data) => ({type: "declList", rule: 0, ...ast(data)})},
    {"name": "declList", "symbols": ["decl"], "postprocess": (data) => ({type: "declList", rule: 1, ...ast(data)})},
    {"name": "decl", "symbols": ["varDecl"], "postprocess": (data) => ({type: "decl", rule: 0, ...ast(data)})},
    {"name": "decl", "symbols": ["funcDecl"], "postprocess": (data) => ({type: "decl", rule: 1, ...ast(data)})},
    {"name": "varDecl", "symbols": ["typeSpec", "varDeclInit", (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "varDecl", rule: 0, ...ast(data), symbol: symbol(data[0], data[1], ...data)})},
    {"name": "scopedVarDecl", "symbols": ["typeSpec", "varDeclInit", (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "scopedVarDecl", rule: 0, ...ast(data)})},
    {"name": "varDeclInit", "symbols": ["varDeclId"], "postprocess": (data) => ({type: "varDeclInit", rule: 0, ...ast(data), symbol: symbol(data[0])})},
    {"name": "varDeclInit", "symbols": ["varDeclId", (lexer.has("assignment") ? {type: "assignment"} : assignment), "simpleExp"], "postprocess": (data) => ({type: "varDeclInit", rule: 1, ...ast(data), symbol: symbol(data[0])})},
    {"name": "varDeclId", "symbols": ["identifier"], "postprocess": (data) => ({type: "varDeclId", rule: 0, ...ast(data), symbol: symbol(data[0])})},
    {"name": "varDeclId", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "number", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (data) => ({type: "varDeclId", rule: 1, ...ast(data), symbol: symbol(data[0])})},
    {"name": "typeSpec", "symbols": [(lexer.has("int") ? {type: "int"} : int)], "postprocess": (data) => ({type: "typeSpec", rule: 0, ...ast(data)})},
    {"name": "typeSpec", "symbols": [(lexer.has("char") ? {type: "char"} : char)], "postprocess": (data) => ({type: "typeSpec", rule: 1, ...ast(data)})},
    {"name": "typeSpec", "symbols": [(lexer.has("bool") ? {type: "bool"} : bool)], "postprocess": (data) => ({type: "typeSpec", rule: 2, ...ast(data)})},
    {"name": "typeSpec", "symbols": [(lexer.has("voidd") ? {type: "voidd"} : voidd)], "postprocess": (data) => ({type: "typeSpec", rule: 3, ...ast(data)})},
    {"name": "funcDecl", "symbols": ["typeSpec", "identifier", (lexer.has("lparan") ? {type: "lparan"} : lparan), "parms", (lexer.has("rparan") ? {type: "rparan"} : rparan), "compoundStmt"], "postprocess": (data) => ({type: "funcDecl", rule: 0, ...ast(data, true, "function")})},
    {"name": "parms", "symbols": ["parmList"], "postprocess": (data) => ({type: "parms", rule: 0, ...ast(data)})},
    {"name": "parms", "symbols": [], "postprocess": (data) => ({type: "parms", rule: 1, ...ast(data)})},
    {"name": "parmList", "symbols": ["parmList", (lexer.has("comma") ? {type: "comma"} : comma), "parmTypeList"], "postprocess": (data) => ({type: "parmList", rule: 0, ...ast(data)})},
    {"name": "parmList", "symbols": ["parmTypeList"], "postprocess": (data) => ({type: "parmList", rule: 1, ...ast(data)})},
    {"name": "parmTypeList", "symbols": ["typeSpec", "parmId"], "postprocess": (data) => ({type: "parmTypeList", rule: 0, ...ast(data)})},
    {"name": "parmIdList", "symbols": ["parmIdList", (lexer.has("comma") ? {type: "comma"} : comma), "parmId"], "postprocess": (data) => ({type: "parmIdList", rule: 0, ...ast(data)})},
    {"name": "parmIdList", "symbols": ["parmId"], "postprocess": (data) => ({type: "parmIdList", rule: 1, ...ast(data)})},
    {"name": "parmId", "symbols": ["identifier"], "postprocess": (data) => ({type: "parmId", rule: 0, ...ast(data)})},
    {"name": "parmId", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (data) => ({type: "parmId", rule: 1, ...ast(data)})},
    {"name": "stmt", "symbols": ["expStmt"], "postprocess": (data) => ({type: "stmt", rule: 0, ...ast(data)})},
    {"name": "stmt", "symbols": ["compoundStmt"], "postprocess": (data) => ({type: "stmt", rule: 1, ...ast(data)})},
    {"name": "stmt", "symbols": ["selectStmt"], "postprocess": (data) => ({type: "stmt", rule: 2, ...ast(data)})},
    {"name": "stmt", "symbols": ["iterStmt"], "postprocess": (data) => ({type: "stmt", rule: 3, ...ast(data)})},
    {"name": "stmt", "symbols": ["returnStmt"], "postprocess": (data) => ({type: "stmt", rule: 4, ...ast(data)})},
    {"name": "stmt", "symbols": ["breakStmt"], "postprocess": (data) => ({type: "stmt", rule: 5, ...ast(data)})},
    {"name": "stmt", "symbols": ["scopedVarDecl"], "postprocess": (data) => ({type: "stmt", rule: 6, ...ast(data)})},
    {"name": "expStmt", "symbols": ["exp", (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "expStmt", rule: 0, ...ast(data)})},
    {"name": "expStmt", "symbols": [(lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "expStmt", rule: 1, ...ast(data)})},
    {"name": "compoundStmt", "symbols": [(lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "stmtList", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": (data) => ({type: "compoundStmt", rule: 0, ...ast(data, true, "compound")})},
    {"name": "stmtList", "symbols": ["stmtList", "stmt"], "postprocess": (data) => ({type: "stmtList", rule: 0, ...ast(data)})},
    {"name": "stmtList", "symbols": [], "postprocess": (data) => ({type: "stmtList", rule: 1, ...ast(data)})},
    {"name": "selectStmt", "symbols": [(lexer.has("iff") ? {type: "iff"} : iff), (lexer.has("lparan") ? {type: "lparan"} : lparan), "simpleExp", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt"], "postprocess": (data) => ({type: "selectStmt", rule: 0, ...ast(data, true, "select")})},
    {"name": "selectStmt", "symbols": [(lexer.has("iff") ? {type: "iff"} : iff), (lexer.has("lparan") ? {type: "lparan"} : lparan), "simpleExp", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt", (lexer.has("elsee") ? {type: "elsee"} : elsee), "stmt"], "postprocess": (data) => ({type: "selectStmt", rule: 1, ...ast(data, true, "select")})},
    {"name": "iterStmt", "symbols": [(lexer.has("whilee") ? {type: "whilee"} : whilee), (lexer.has("lparan") ? {type: "lparan"} : lparan), "simpleExp", (lexer.has("rparan") ? {type: "rparan"} : rparan), "stmt"], "postprocess": (data) => ({type: "iterStmt", rule: 0, ...ast(data, true, "while")})},
    {"name": "returnStmt", "symbols": [(lexer.has("returnn") ? {type: "returnn"} : returnn), (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "returnStmt", rule: 0, ...ast(data)})},
    {"name": "returnStmt", "symbols": [(lexer.has("returnn") ? {type: "returnn"} : returnn), "simpleExp", (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "returnStmt", rule: 1, ...ast(data)})},
    {"name": "breakStmt", "symbols": [(lexer.has("breakk") ? {type: "breakk"} : breakk), (lexer.has("scolon") ? {type: "scolon"} : scolon)], "postprocess": (data) => ({type: "breakStmt", rule: 0, ...ast(data)})},
    {"name": "exp", "symbols": ["mutable", (lexer.has("assignment") ? {type: "assignment"} : assignment), "exp"], "postprocess": (data) => ({type: "exp", rule: 0, ...ast(data)})},
    {"name": "exp", "symbols": ["simpleExp"], "postprocess": (data) => ({type: "exp", rule: 1, ...ast(data)})},
    {"name": "simpleExp", "symbols": ["simpleExp", (lexer.has("or") ? {type: "or"} : or), "andExp"], "postprocess": (data) => ({type: "simpleExp", rule: 0, ...ast(data)})},
    {"name": "simpleExp", "symbols": ["andExp"], "postprocess": (data) => ({type: "simpleExp", rule: 1, ...ast(data)})},
    {"name": "andExp", "symbols": ["andExp", (lexer.has("and") ? {type: "and"} : and), "unaryRelExp"], "postprocess": (data) => ({type: "andExp", rule: 0, ...ast(data)})},
    {"name": "andExp", "symbols": ["unaryRelExp"], "postprocess": (data) => ({type: "andExp", rule: 1, ...ast(data)})},
    {"name": "unaryRelExp", "symbols": [(lexer.has("not") ? {type: "not"} : not), "unaryRelExp"], "postprocess": (data) => ({type: "unaryRelExp", rule: 0, ...ast(data)})},
    {"name": "unaryRelExp", "symbols": ["relExp"], "postprocess": (data) => ({type: "unaryRelExp", rule: 1, ...ast(data)})},
    {"name": "relExp", "symbols": ["sumExp", "relOp", "sumExp"], "postprocess": (data) => ({type: "relExp", rule: 0, ...ast(data)})},
    {"name": "relExp", "symbols": ["sumExp"], "postprocess": (data) => ({type: "relExp", rule: 1, ...ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("lte") ? {type: "lte"} : lte)], "postprocess": (data) => ({type: "relOp", rule: 0, ...ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("lt") ? {type: "lt"} : lt)], "postprocess": (data) => ({type: "relOp", rule: 1, ...ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("gte") ? {type: "gte"} : gte)], "postprocess": (data) => ({type: "relOp", rule: 2, ...ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("gt") ? {type: "gt"} : gt)], "postprocess": (data) => ({type: "relOp", rule: 3, ...ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("eq") ? {type: "eq"} : eq)], "postprocess": (data) => ({type: "relOp", rule: 4, ...ast(data)})},
    {"name": "relOp", "symbols": [(lexer.has("neq") ? {type: "neq"} : neq)], "postprocess": (data) => ({type: "relOp", rule: 5, ...ast(data)})},
    {"name": "sumExp", "symbols": ["sumExp", "sumop", "mulExp"], "postprocess": (data) => ({type: "sumExp", rule: 0, ...ast(data)})},
    {"name": "sumExp", "symbols": ["mulExp"], "postprocess": (data) => ({type: "sumExp", rule: 1, ...ast(data)})},
    {"name": "sumop", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus)], "postprocess": (data) => ({type: "sumop", rule: 0, ...ast(data)})},
    {"name": "sumop", "symbols": [(lexer.has("minus") ? {type: "minus"} : minus)], "postprocess": (data) => ({type: "sumop", rule: 1, ...ast(data)})},
    {"name": "mulExp", "symbols": ["mulExp", "mulop", "unaryExp"], "postprocess": (data) => ({type: "mulExp", rule: 0, ...ast(data)})},
    {"name": "mulExp", "symbols": ["unaryExp"], "postprocess": (data) => ({type: "mulExp", rule: 1, ...ast(data)})},
    {"name": "mulop", "symbols": [(lexer.has("multiply") ? {type: "multiply"} : multiply)], "postprocess": (data) => ({type: "mulop", rule: 0, ...ast(data)})},
    {"name": "mulop", "symbols": [(lexer.has("divide") ? {type: "divide"} : divide)], "postprocess": (data) => ({type: "mulop", rule: 1, ...ast(data)})},
    {"name": "unaryExp", "symbols": ["unaryop", "unaryExp"], "postprocess": (data) => ({type: "unaryExp", rule: 0, ...ast(data)})},
    {"name": "unaryExp", "symbols": ["factor"], "postprocess": (data) => ({type: "unaryExp", rule: 1, ...ast(data)})},
    {"name": "unaryop", "symbols": [(lexer.has("minus") ? {type: "minus"} : minus)], "postprocess": (data) => ({type: "unaryop", rule: 0, ...ast(data)})},
    {"name": "factor", "symbols": ["immutable"], "postprocess": (data) => ({type: "factor", rule: 0, ...ast(data)})},
    {"name": "factor", "symbols": ["mutable"], "postprocess": (data) => ({type: "factor", rule: 1, ...ast(data)})},
    {"name": "mutable", "symbols": ["identifier"], "postprocess": (data) => ({type: "mutable", rule: 0, ...ast(data)})},
    {"name": "mutable", "symbols": ["identifier", (lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "exp", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (data) => ({type: "mutable", rule: 1, ...ast(data)})},
    {"name": "immutable", "symbols": [(lexer.has("lparan") ? {type: "lparan"} : lparan), "exp", (lexer.has("rparan") ? {type: "rparan"} : rparan)], "postprocess": (data) => ({type: "immutable", rule: 0, ...ast(data)})},
    {"name": "immutable", "symbols": ["call"], "postprocess": (data) => ({type: "immutable", rule: 1, ...ast(data)})},
    {"name": "immutable", "symbols": ["constant"], "postprocess": (data) => ({type: "immutable", rule: 2, ...ast(data)})},
    {"name": "call", "symbols": ["identifier", (lexer.has("lparan") ? {type: "lparan"} : lparan), "args", (lexer.has("rparan") ? {type: "rparan"} : rparan)], "postprocess": (data) => ({type: "call", rule: 0, ...ast(data)})},
    {"name": "args", "symbols": ["argList"], "postprocess": (data) => ({type: "args", rule: 0, ...ast(data)})},
    {"name": "args", "symbols": [], "postprocess": (data) => ({type: "args", rule: 1, ...ast(data)})},
    {"name": "argList", "symbols": ["argList", (lexer.has("comma") ? {type: "comma"} : comma), "exp"], "postprocess": (data) => ({type: "argList", rule: 0, ...ast(data)})},
    {"name": "argList", "symbols": ["exp"], "postprocess": (data) => ({type: "argList", rule: 1, ...ast(data)})},
    {"name": "constant", "symbols": ["number"], "postprocess": (data) => ({type: "constant", rule: 0, ...ast(data)})},
    {"name": "constant", "symbols": ["charc"], "postprocess": (data) => ({type: "constant", rule: 1, ...ast(data)})},
    {"name": "constant", "symbols": ["boolv"], "postprocess": (data) => ({type: "constant", rule: 2, ...ast(data)})},
    {"name": "line_comment", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": convertTokenId},
    {"name": "number", "symbols": [(lexer.has("number_literal") ? {type: "number_literal"} : number_literal)], "postprocess": convertTokenId},
    {"name": "boolv", "symbols": [(lexer.has("true") ? {type: "true"} : true)], "postprocess": convertTokenId},
    {"name": "boolv", "symbols": [(lexer.has("false") ? {type: "false"} : false)], "postprocess": convertTokenId},
    {"name": "charc", "symbols": [(lexer.has("charc") ? {type: "charc"} : charc)], "postprocess": convertTokenId},
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
