/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./dist/grammar.js":
/*!*************************!*\
  !*** ./dist/grammar.js ***!
  \*************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

// grammar modified and inspired from: http://marvin.cs.uidaho.edu/Teaching/CS445/c-Grammar.pdf
// created by Justin Fernald

const moo = __webpack_require__(/*! moo */ "./node_modules/moo/moo.js");

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
    return { scopeHead, title, parts: part};  
    // return { scopeHead, title, values, context, parts: part};  
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
if ( true&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();


/***/ }),

/***/ "./node_modules/moo/moo.js":
/*!*********************************!*\
  !*** ./node_modules/moo/moo.js ***!
  \*********************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) /* global define */
  } else {}
}(this, function() {
  'use strict';

  var hasOwnProperty = Object.prototype.hasOwnProperty
  var toString = Object.prototype.toString
  var hasSticky = typeof new RegExp().sticky === 'boolean'

  /***************************************************************************/

  function isRegExp(o) { return o && toString.call(o) === '[object RegExp]' }
  function isObject(o) { return o && typeof o === 'object' && !isRegExp(o) && !Array.isArray(o) }

  function reEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  }
  function reGroups(s) {
    var re = new RegExp('|' + s)
    return re.exec('').length - 1
  }
  function reCapture(s) {
    return '(' + s + ')'
  }
  function reUnion(regexps) {
    if (!regexps.length) return '(?!)'
    var source =  regexps.map(function(s) {
      return "(?:" + s + ")"
    }).join('|')
    return "(?:" + source + ")"
  }

  function regexpOrLiteral(obj) {
    if (typeof obj === 'string') {
      return '(?:' + reEscape(obj) + ')'

    } else if (isRegExp(obj)) {
      // TODO: consider /u support
      if (obj.ignoreCase) throw new Error('RegExp /i flag not allowed')
      if (obj.global) throw new Error('RegExp /g flag is implied')
      if (obj.sticky) throw new Error('RegExp /y flag is implied')
      if (obj.multiline) throw new Error('RegExp /m flag is implied')
      return obj.source

    } else {
      throw new Error('Not a pattern: ' + obj)
    }
  }

  function objectToRules(object) {
    var keys = Object.getOwnPropertyNames(object)
    var result = []
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var thing = object[key]
      var rules = [].concat(thing)
      if (key === 'include') {
        for (var j = 0; j < rules.length; j++) {
          result.push({include: rules[j]})
        }
        continue
      }
      var match = []
      rules.forEach(function(rule) {
        if (isObject(rule)) {
          if (match.length) result.push(ruleOptions(key, match))
          result.push(ruleOptions(key, rule))
          match = []
        } else {
          match.push(rule)
        }
      })
      if (match.length) result.push(ruleOptions(key, match))
    }
    return result
  }

  function arrayToRules(array) {
    var result = []
    for (var i = 0; i < array.length; i++) {
      var obj = array[i]
      if (obj.include) {
        var include = [].concat(obj.include)
        for (var j = 0; j < include.length; j++) {
          result.push({include: include[j]})
        }
        continue
      }
      if (!obj.type) {
        throw new Error('Rule has no type: ' + JSON.stringify(obj))
      }
      result.push(ruleOptions(obj.type, obj))
    }
    return result
  }

  function ruleOptions(type, obj) {
    if (!isObject(obj)) {
      obj = { match: obj }
    }
    if (obj.include) {
      throw new Error('Matching rules cannot also include states')
    }

    // nb. error and fallback imply lineBreaks
    var options = {
      defaultType: type,
      lineBreaks: !!obj.error || !!obj.fallback,
      pop: false,
      next: null,
      push: null,
      error: false,
      fallback: false,
      value: null,
      type: null,
      shouldThrow: false,
    }

    // Avoid Object.assign(), so we support IE9+
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        options[key] = obj[key]
      }
    }

    // type transform cannot be a string
    if (typeof options.type === 'string' && type !== options.type) {
      throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')")
    }

    // convert to array
    var match = options.match
    options.match = Array.isArray(match) ? match : match ? [match] : []
    options.match.sort(function(a, b) {
      return isRegExp(a) && isRegExp(b) ? 0
           : isRegExp(b) ? -1 : isRegExp(a) ? +1 : b.length - a.length
    })
    return options
  }

  function toRules(spec) {
    return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec)
  }

  var defaultErrorRule = ruleOptions('error', {lineBreaks: true, shouldThrow: true})
  function compileRules(rules, hasStates) {
    var errorRule = null
    var fast = Object.create(null)
    var fastAllowed = true
    var unicodeFlag = null
    var groups = []
    var parts = []

    // If there is a fallback rule, then disable fast matching
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].fallback) {
        fastAllowed = false
      }
    }

    for (var i = 0; i < rules.length; i++) {
      var options = rules[i]

      if (options.include) {
        // all valid inclusions are removed by states() preprocessor
        throw new Error('Inheritance is not allowed in stateless lexers')
      }

      if (options.error || options.fallback) {
        // errorRule can only be set once
        if (errorRule) {
          if (!options.fallback === !errorRule.fallback) {
            throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')")
          } else {
            throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')")
          }
        }
        errorRule = options
      }

      var match = options.match.slice()
      if (fastAllowed) {
        while (match.length && typeof match[0] === 'string' && match[0].length === 1) {
          var word = match.shift()
          fast[word.charCodeAt(0)] = options
        }
      }

      // Warn about inappropriate state-switching options
      if (options.pop || options.push || options.next) {
        if (!hasStates) {
          throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')")
        }
        if (options.fallback) {
          throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')")
        }
      }

      // Only rules with a .match are included in the RegExp
      if (match.length === 0) {
        continue
      }
      fastAllowed = false

      groups.push(options)

      // Check unicode flag is used everywhere or nowhere
      for (var j = 0; j < match.length; j++) {
        var obj = match[j]
        if (!isRegExp(obj)) {
          continue
        }

        if (unicodeFlag === null) {
          unicodeFlag = obj.unicode
        } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
          throw new Error('If one rule is /u then all must be')
        }
      }

      // convert to RegExp
      var pat = reUnion(match.map(regexpOrLiteral))

      // validate
      var regexp = new RegExp(pat)
      if (regexp.test("")) {
        throw new Error("RegExp matches empty string: " + regexp)
      }
      var groupCount = reGroups(pat)
      if (groupCount > 0) {
        throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: … ) instead")
      }

      // try and detect rules matching newlines
      if (!options.lineBreaks && regexp.test('\n')) {
        throw new Error('Rule should declare lineBreaks: ' + regexp)
      }

      // store regex
      parts.push(reCapture(pat))
    }


    // If there's no fallback rule, use the sticky flag so we only look for
    // matches at the current index.
    //
    // If we don't support the sticky flag, then fake it using an irrefutable
    // match (i.e. an empty pattern).
    var fallbackRule = errorRule && errorRule.fallback
    var flags = hasSticky && !fallbackRule ? 'ym' : 'gm'
    var suffix = hasSticky || fallbackRule ? '' : '|'

    if (unicodeFlag === true) flags += "u"
    var combined = new RegExp(reUnion(parts) + suffix, flags)
    return {regexp: combined, groups: groups, fast: fast, error: errorRule || defaultErrorRule}
  }

  function compile(rules) {
    var result = compileRules(toRules(rules))
    return new Lexer({start: result}, 'start')
  }

  function checkStateGroup(g, name, map) {
    var state = g && (g.push || g.next)
    if (state && !map[state]) {
      throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')")
    }
    if (g && g.pop && +g.pop !== 1) {
      throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')")
    }
  }
  function compileStates(states, start) {
    var all = states.$all ? toRules(states.$all) : []
    delete states.$all

    var keys = Object.getOwnPropertyNames(states)
    if (!start) start = keys[0]

    var ruleMap = Object.create(null)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      ruleMap[key] = toRules(states[key]).concat(all)
    }
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var rules = ruleMap[key]
      var included = Object.create(null)
      for (var j = 0; j < rules.length; j++) {
        var rule = rules[j]
        if (!rule.include) continue
        var splice = [j, 1]
        if (rule.include !== key && !included[rule.include]) {
          included[rule.include] = true
          var newRules = ruleMap[rule.include]
          if (!newRules) {
            throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')")
          }
          for (var k = 0; k < newRules.length; k++) {
            var newRule = newRules[k]
            if (rules.indexOf(newRule) !== -1) continue
            splice.push(newRule)
          }
        }
        rules.splice.apply(rules, splice)
        j--
      }
    }

    var map = Object.create(null)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      map[key] = compileRules(ruleMap[key], true)
    }

    for (var i = 0; i < keys.length; i++) {
      var name = keys[i]
      var state = map[name]
      var groups = state.groups
      for (var j = 0; j < groups.length; j++) {
        checkStateGroup(groups[j], name, map)
      }
      var fastKeys = Object.getOwnPropertyNames(state.fast)
      for (var j = 0; j < fastKeys.length; j++) {
        checkStateGroup(state.fast[fastKeys[j]], name, map)
      }
    }

    return new Lexer(map, start)
  }

  function keywordTransform(map) {
    var reverseMap = Object.create(null)
    var byLength = Object.create(null)
    var types = Object.getOwnPropertyNames(map)
    for (var i = 0; i < types.length; i++) {
      var tokenType = types[i]
      var item = map[tokenType]
      var keywordList = Array.isArray(item) ? item : [item]
      keywordList.forEach(function(keyword) {
        (byLength[keyword.length] = byLength[keyword.length] || []).push(keyword)
        if (typeof keyword !== 'string') {
          throw new Error("keyword must be string (in keyword '" + tokenType + "')")
        }
        reverseMap[keyword] = tokenType
      })
    }

    // fast string lookup
    // https://jsperf.com/string-lookups
    function str(x) { return JSON.stringify(x) }
    var source = ''
    source += 'switch (value.length) {\n'
    for (var length in byLength) {
      var keywords = byLength[length]
      source += 'case ' + length + ':\n'
      source += 'switch (value) {\n'
      keywords.forEach(function(keyword) {
        var tokenType = reverseMap[keyword]
        source += 'case ' + str(keyword) + ': return ' + str(tokenType) + '\n'
      })
      source += '}\n'
    }
    source += '}\n'
    return Function('value', source) // type
  }

  /***************************************************************************/

  var Lexer = function(states, state) {
    this.startState = state
    this.states = states
    this.buffer = ''
    this.stack = []
    this.reset()
  }

  Lexer.prototype.reset = function(data, info) {
    this.buffer = data || ''
    this.index = 0
    this.line = info ? info.line : 1
    this.col = info ? info.col : 1
    this.queuedToken = info ? info.queuedToken : null
    this.queuedThrow = info ? info.queuedThrow : null
    this.setState(info ? info.state : this.startState)
    this.stack = info && info.stack ? info.stack.slice() : []
    return this
  }

  Lexer.prototype.save = function() {
    return {
      line: this.line,
      col: this.col,
      state: this.state,
      stack: this.stack.slice(),
      queuedToken: this.queuedToken,
      queuedThrow: this.queuedThrow,
    }
  }

  Lexer.prototype.setState = function(state) {
    if (!state || this.state === state) return
    this.state = state
    var info = this.states[state]
    this.groups = info.groups
    this.error = info.error
    this.re = info.regexp
    this.fast = info.fast
  }

  Lexer.prototype.popState = function() {
    this.setState(this.stack.pop())
  }

  Lexer.prototype.pushState = function(state) {
    this.stack.push(this.state)
    this.setState(state)
  }

  var eat = hasSticky ? function(re, buffer) { // assume re is /y
    return re.exec(buffer)
  } : function(re, buffer) { // assume re is /g
    var match = re.exec(buffer)
    // will always match, since we used the |(?:) trick
    if (match[0].length === 0) {
      return null
    }
    return match
  }

  Lexer.prototype._getGroup = function(match) {
    var groupCount = this.groups.length
    for (var i = 0; i < groupCount; i++) {
      if (match[i + 1] !== undefined) {
        return this.groups[i]
      }
    }
    throw new Error('Cannot find token type for matched text')
  }

  function tokenToString() {
    return this.value
  }

  Lexer.prototype.next = function() {
    var index = this.index

    // If a fallback token matched, we don't need to re-run the RegExp
    if (this.queuedGroup) {
      var token = this._token(this.queuedGroup, this.queuedText, index)
      this.queuedGroup = null
      this.queuedText = ""
      return token
    }

    var buffer = this.buffer
    if (index === buffer.length) {
      return // EOF
    }

    // Fast matching for single characters
    var group = this.fast[buffer.charCodeAt(index)]
    if (group) {
      return this._token(group, buffer.charAt(index), index)
    }

    // Execute RegExp
    var re = this.re
    re.lastIndex = index
    var match = eat(re, buffer)

    // Error tokens match the remaining buffer
    var error = this.error
    if (match == null) {
      return this._token(error, buffer.slice(index, buffer.length), index)
    }

    var group = this._getGroup(match)
    var text = match[0]

    if (error.fallback && match.index !== index) {
      this.queuedGroup = group
      this.queuedText = text

      // Fallback tokens contain the unmatched portion of the buffer
      return this._token(error, buffer.slice(index, match.index), index)
    }

    return this._token(group, text, index)
  }

  Lexer.prototype._token = function(group, text, offset) {
    // count line breaks
    var lineBreaks = 0
    if (group.lineBreaks) {
      var matchNL = /\n/g
      var nl = 1
      if (text === '\n') {
        lineBreaks = 1
      } else {
        while (matchNL.exec(text)) { lineBreaks++; nl = matchNL.lastIndex }
      }
    }

    var token = {
      type: (typeof group.type === 'function' && group.type(text)) || group.defaultType,
      value: typeof group.value === 'function' ? group.value(text) : text,
      text: text,
      toString: tokenToString,
      offset: offset,
      lineBreaks: lineBreaks,
      line: this.line,
      col: this.col,
    }
    // nb. adding more props to token object will make V8 sad!

    var size = text.length
    this.index += size
    this.line += lineBreaks
    if (lineBreaks !== 0) {
      this.col = size - nl + 1
    } else {
      this.col += size
    }

    // throw, if no rule with {error: true}
    if (group.shouldThrow) {
      throw new Error(this.formatError(token, "invalid syntax"))
    }

    if (group.pop) this.popState()
    else if (group.push) this.pushState(group.push)
    else if (group.next) this.setState(group.next)

    return token
  }

  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
    var LexerIterator = function(lexer) {
      this.lexer = lexer
    }

    LexerIterator.prototype.next = function() {
      var token = this.lexer.next()
      return {value: token, done: !token}
    }

    LexerIterator.prototype[Symbol.iterator] = function() {
      return this
    }

    Lexer.prototype[Symbol.iterator] = function() {
      return new LexerIterator(this)
    }
  }

  Lexer.prototype.formatError = function(token, message) {
    if (token == null) {
      // An undefined token indicates EOF
      var text = this.buffer.slice(this.index)
      var token = {
        text: text,
        offset: this.index,
        lineBreaks: text.indexOf('\n') === -1 ? 0 : 1,
        line: this.line,
        col: this.col,
      }
    }
    var start = Math.max(0, token.offset - token.col + 1)
    var eol = token.lineBreaks ? token.text.indexOf('\n') : token.text.length
    var firstLine = this.buffer.substring(start, token.offset + eol)
    message += " at line " + token.line + " col " + token.col + ":\n\n"
    message += "  " + firstLine + "\n"
    message += "  " + Array(token.col).join(" ") + "^"
    return message
  }

  Lexer.prototype.clone = function() {
    return new Lexer(this.states, this.state)
  }

  Lexer.prototype.has = function(tokenType) {
    return true
  }


  return {
    compile: compile,
    states: compileStates,
    error: Object.freeze({error: true}),
    fallback: Object.freeze({fallback: true}),
    keywords: keywordTransform,
  }

}));


/***/ }),

/***/ "./node_modules/nearley/lib/nearley.js":
/*!*********************************************!*\
  !*** ./node_modules/nearley/lib/nearley.js ***!
  \*********************************************/
/***/ (function(module) {

(function(root, factory) {
    if ( true && module.exports) {
        module.exports = factory();
    } else {
        root.nearley = factory();
    }
}(this, function() {

    function Rule(name, symbols, postprocess) {
        this.id = ++Rule.highestId;
        this.name = name;
        this.symbols = symbols;        // a list of literal | regex class | nonterminal
        this.postprocess = postprocess;
        return this;
    }
    Rule.highestId = 0;

    Rule.prototype.toString = function(withCursorAt) {
        var symbolSequence = (typeof withCursorAt === "undefined")
                             ? this.symbols.map(getSymbolShortDisplay).join(' ')
                             : (   this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(' ')
                                 + " ● "
                                 + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(' ')     );
        return this.name + " → " + symbolSequence;
    }


    // a State is a rule at a position from a given starting point in the input stream (reference)
    function State(rule, dot, reference, wantedBy) {
        this.rule = rule;
        this.dot = dot;
        this.reference = reference;
        this.data = [];
        this.wantedBy = wantedBy;
        this.isComplete = this.dot === rule.symbols.length;
    }

    State.prototype.toString = function() {
        return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
    };

    State.prototype.nextState = function(child) {
        var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
        state.left = this;
        state.right = child;
        if (state.isComplete) {
            state.data = state.build();
            // Having right set here will prevent the right state and its children
            // form being garbage collected
            state.right = undefined;
        }
        return state;
    };

    State.prototype.build = function() {
        var children = [];
        var node = this;
        do {
            children.push(node.right.data);
            node = node.left;
        } while (node.left);
        children.reverse();
        return children;
    };

    State.prototype.finish = function() {
        if (this.rule.postprocess) {
            this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
        }
    };


    function Column(grammar, index) {
        this.grammar = grammar;
        this.index = index;
        this.states = [];
        this.wants = {}; // states indexed by the non-terminal they expect
        this.scannable = []; // list of states that expect a token
        this.completed = {}; // states that are nullable
    }


    Column.prototype.process = function(nextColumn) {
        var states = this.states;
        var wants = this.wants;
        var completed = this.completed;

        for (var w = 0; w < states.length; w++) { // nb. we push() during iteration
            var state = states[w];

            if (state.isComplete) {
                state.finish();
                if (state.data !== Parser.fail) {
                    // complete
                    var wantedBy = state.wantedBy;
                    for (var i = wantedBy.length; i--; ) { // this line is hot
                        var left = wantedBy[i];
                        this.complete(left, state);
                    }

                    // special-case nullables
                    if (state.reference === this.index) {
                        // make sure future predictors of this rule get completed.
                        var exp = state.rule.name;
                        (this.completed[exp] = this.completed[exp] || []).push(state);
                    }
                }

            } else {
                // queue scannable states
                var exp = state.rule.symbols[state.dot];
                if (typeof exp !== 'string') {
                    this.scannable.push(state);
                    continue;
                }

                // predict
                if (wants[exp]) {
                    wants[exp].push(state);

                    if (completed.hasOwnProperty(exp)) {
                        var nulls = completed[exp];
                        for (var i = 0; i < nulls.length; i++) {
                            var right = nulls[i];
                            this.complete(state, right);
                        }
                    }
                } else {
                    wants[exp] = [state];
                    this.predict(exp);
                }
            }
        }
    }

    Column.prototype.predict = function(exp) {
        var rules = this.grammar.byName[exp] || [];

        for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            var wantedBy = this.wants[exp];
            var s = new State(r, 0, this.index, wantedBy);
            this.states.push(s);
        }
    }

    Column.prototype.complete = function(left, right) {
        var copy = left.nextState(right);
        this.states.push(copy);
    }


    function Grammar(rules, start) {
        this.rules = rules;
        this.start = start || this.rules[0].name;
        var byName = this.byName = {};
        this.rules.forEach(function(rule) {
            if (!byName.hasOwnProperty(rule.name)) {
                byName[rule.name] = [];
            }
            byName[rule.name].push(rule);
        });
    }

    // So we can allow passing (rules, start) directly to Parser for backwards compatibility
    Grammar.fromCompiled = function(rules, start) {
        var lexer = rules.Lexer;
        if (rules.ParserStart) {
          start = rules.ParserStart;
          rules = rules.ParserRules;
        }
        var rules = rules.map(function (r) { return (new Rule(r.name, r.symbols, r.postprocess)); });
        var g = new Grammar(rules, start);
        g.lexer = lexer; // nb. storing lexer on Grammar is iffy, but unavoidable
        return g;
    }


    function StreamLexer() {
      this.reset("");
    }

    StreamLexer.prototype.reset = function(data, state) {
        this.buffer = data;
        this.index = 0;
        this.line = state ? state.line : 1;
        this.lastLineBreak = state ? -state.col : 0;
    }

    StreamLexer.prototype.next = function() {
        if (this.index < this.buffer.length) {
            var ch = this.buffer[this.index++];
            if (ch === '\n') {
              this.line += 1;
              this.lastLineBreak = this.index;
            }
            return {value: ch};
        }
    }

    StreamLexer.prototype.save = function() {
      return {
        line: this.line,
        col: this.index - this.lastLineBreak,
      }
    }

    StreamLexer.prototype.formatError = function(token, message) {
        // nb. this gets called after consuming the offending token,
        // so the culprit is index-1
        var buffer = this.buffer;
        if (typeof buffer === 'string') {
            var lines = buffer
                .split("\n")
                .slice(
                    Math.max(0, this.line - 5), 
                    this.line
                );

            var nextLineBreak = buffer.indexOf('\n', this.index);
            if (nextLineBreak === -1) nextLineBreak = buffer.length;
            var col = this.index - this.lastLineBreak;
            var lastLineDigits = String(this.line).length;
            message += " at line " + this.line + " col " + col + ":\n\n";
            message += lines
                .map(function(line, i) {
                    return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
                }, this)
                .join("\n");
            message += "\n" + pad("", lastLineDigits + col) + "^\n";
            return message;
        } else {
            return message + " at index " + (this.index - 1);
        }

        function pad(n, length) {
            var s = String(n);
            return Array(length - s.length + 1).join(" ") + s;
        }
    }

    function Parser(rules, start, options) {
        if (rules instanceof Grammar) {
            var grammar = rules;
            var options = start;
        } else {
            var grammar = Grammar.fromCompiled(rules, start);
        }
        this.grammar = grammar;

        // Read options
        this.options = {
            keepHistory: false,
            lexer: grammar.lexer || new StreamLexer,
        };
        for (var key in (options || {})) {
            this.options[key] = options[key];
        }

        // Setup lexer
        this.lexer = this.options.lexer;
        this.lexerState = undefined;

        // Setup a table
        var column = new Column(grammar, 0);
        var table = this.table = [column];

        // I could be expecting anything.
        column.wants[grammar.start] = [];
        column.predict(grammar.start);
        // TODO what if start rule is nullable?
        column.process();
        this.current = 0; // token index
    }

    // create a reserved token for indicating a parse fail
    Parser.fail = {};

    Parser.prototype.feed = function(chunk) {
        var lexer = this.lexer;
        lexer.reset(chunk, this.lexerState);

        var token;
        while (true) {
            try {
                token = lexer.next();
                if (!token) {
                    break;
                }
            } catch (e) {
                // Create the next column so that the error reporter
                // can display the correctly predicted states.
                var nextColumn = new Column(this.grammar, this.current + 1);
                this.table.push(nextColumn);
                var err = new Error(this.reportLexerError(e));
                err.offset = this.current;
                err.token = e.token;
                throw err;
            }
            // We add new states to table[current+1]
            var column = this.table[this.current];

            // GC unused states
            if (!this.options.keepHistory) {
                delete this.table[this.current - 1];
            }

            var n = this.current + 1;
            var nextColumn = new Column(this.grammar, n);
            this.table.push(nextColumn);

            // Advance all tokens that expect the symbol
            var literal = token.text !== undefined ? token.text : token.value;
            var value = lexer.constructor === StreamLexer ? token.value : token;
            var scannable = column.scannable;
            for (var w = scannable.length; w--; ) {
                var state = scannable[w];
                var expect = state.rule.symbols[state.dot];
                // Try to consume the token
                // either regex or literal
                if (expect.test ? expect.test(value) :
                    expect.type ? expect.type === token.type
                                : expect.literal === literal) {
                    // Add it
                    var next = state.nextState({data: value, token: token, isToken: true, reference: n - 1});
                    nextColumn.states.push(next);
                }
            }

            // Next, for each of the rules, we either
            // (a) complete it, and try to see if the reference row expected that
            //     rule
            // (b) predict the next nonterminal it expects by adding that
            //     nonterminal's start state
            // To prevent duplication, we also keep track of rules we have already
            // added

            nextColumn.process();

            // If needed, throw an error:
            if (nextColumn.states.length === 0) {
                // No states at all! This is not good.
                var err = new Error(this.reportError(token));
                err.offset = this.current;
                err.token = token;
                throw err;
            }

            // maybe save lexer state
            if (this.options.keepHistory) {
              column.lexerState = lexer.save()
            }

            this.current++;
        }
        if (column) {
          this.lexerState = lexer.save()
        }

        // Incrementally keep track of results
        this.results = this.finish();

        // Allow chaining, for whatever it's worth
        return this;
    };

    Parser.prototype.reportLexerError = function(lexerError) {
        var tokenDisplay, lexerMessage;
        // Planning to add a token property to moo's thrown error
        // even on erroring tokens to be used in error display below
        var token = lexerError.token;
        if (token) {
            tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
            lexerMessage = this.lexer.formatError(token, "Syntax error");
        } else {
            tokenDisplay = "input (lexer error)";
            lexerMessage = lexerError.message;
        }
        return this.reportErrorCommon(lexerMessage, tokenDisplay);
    };

    Parser.prototype.reportError = function(token) {
        var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== undefined ? token.value : token);
        var lexerMessage = this.lexer.formatError(token, "Syntax error");
        return this.reportErrorCommon(lexerMessage, tokenDisplay);
    };

    Parser.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
        var lines = [];
        lines.push(lexerMessage);
        var lastColumnIndex = this.table.length - 2;
        var lastColumn = this.table[lastColumnIndex];
        var expectantStates = lastColumn.states
            .filter(function(state) {
                var nextSymbol = state.rule.symbols[state.dot];
                return nextSymbol && typeof nextSymbol !== "string";
            });

        if (expectantStates.length === 0) {
            lines.push('Unexpected ' + tokenDisplay + '. I did not expect any more input. Here is the state of my parse table:\n');
            this.displayStateStack(lastColumn.states, lines);
        } else {
            lines.push('Unexpected ' + tokenDisplay + '. Instead, I was expecting to see one of the following:\n');
            // Display a "state stack" for each expectant state
            // - which shows you how this state came to be, step by step.
            // If there is more than one derivation, we only display the first one.
            var stateStacks = expectantStates
                .map(function(state) {
                    return this.buildFirstStateStack(state, []) || [state];
                }, this);
            // Display each state that is expecting a terminal symbol next.
            stateStacks.forEach(function(stateStack) {
                var state = stateStack[0];
                var nextSymbol = state.rule.symbols[state.dot];
                var symbolDisplay = this.getSymbolDisplay(nextSymbol);
                lines.push('A ' + symbolDisplay + ' based on:');
                this.displayStateStack(stateStack, lines);
            }, this);
        }
        lines.push("");
        return lines.join("\n");
    }
    
    Parser.prototype.displayStateStack = function(stateStack, lines) {
        var lastDisplay;
        var sameDisplayCount = 0;
        for (var j = 0; j < stateStack.length; j++) {
            var state = stateStack[j];
            var display = state.rule.toString(state.dot);
            if (display === lastDisplay) {
                sameDisplayCount++;
            } else {
                if (sameDisplayCount > 0) {
                    lines.push('    ^ ' + sameDisplayCount + ' more lines identical to this');
                }
                sameDisplayCount = 0;
                lines.push('    ' + display);
            }
            lastDisplay = display;
        }
    };

    Parser.prototype.getSymbolDisplay = function(symbol) {
        return getSymbolLongDisplay(symbol);
    };

    /*
    Builds a the first state stack. You can think of a state stack as the call stack
    of the recursive-descent parser which the Nearley parse algorithm simulates.
    A state stack is represented as an array of state objects. Within a
    state stack, the first item of the array will be the starting
    state, with each successive item in the array going further back into history.

    This function needs to be given a starting state and an empty array representing
    the visited states, and it returns an single state stack.

    */
    Parser.prototype.buildFirstStateStack = function(state, visited) {
        if (visited.indexOf(state) !== -1) {
            // Found cycle, return null
            // to eliminate this path from the results, because
            // we don't know how to display it meaningfully
            return null;
        }
        if (state.wantedBy.length === 0) {
            return [state];
        }
        var prevState = state.wantedBy[0];
        var childVisited = [state].concat(visited);
        var childResult = this.buildFirstStateStack(prevState, childVisited);
        if (childResult === null) {
            return null;
        }
        return [state].concat(childResult);
    };

    Parser.prototype.save = function() {
        var column = this.table[this.current];
        column.lexerState = this.lexerState;
        return column;
    };

    Parser.prototype.restore = function(column) {
        var index = column.index;
        this.current = index;
        this.table[index] = column;
        this.table.splice(index + 1);
        this.lexerState = column.lexerState;

        // Incrementally keep track of results
        this.results = this.finish();
    };

    // nb. deprecated: use save/restore instead!
    Parser.prototype.rewind = function(index) {
        if (!this.options.keepHistory) {
            throw new Error('set option `keepHistory` to enable rewinding')
        }
        // nb. recall column (table) indicies fall between token indicies.
        //        col 0   --   token 0   --   col 1
        this.restore(this.table[index]);
    };

    Parser.prototype.finish = function() {
        // Return the possible parsings
        var considerations = [];
        var start = this.grammar.start;
        var column = this.table[this.table.length - 1]
        column.states.forEach(function (t) {
            if (t.rule.name === start
                    && t.dot === t.rule.symbols.length
                    && t.reference === 0
                    && t.data !== Parser.fail) {
                considerations.push(t);
            }
        });
        return considerations.map(function(c) {return c.data; });
    };

    function getSymbolLongDisplay(symbol) {
        var type = typeof symbol;
        if (type === "string") {
            return symbol;
        } else if (type === "object") {
            if (symbol.literal) {
                return JSON.stringify(symbol.literal);
            } else if (symbol instanceof RegExp) {
                return 'character matching ' + symbol;
            } else if (symbol.type) {
                return symbol.type + ' token';
            } else if (symbol.test) {
                return 'token matching ' + String(symbol.test);
            } else {
                throw new Error('Unknown symbol type: ' + symbol);
            }
        }
    }

    function getSymbolShortDisplay(symbol) {
        var type = typeof symbol;
        if (type === "string") {
            return symbol;
        } else if (type === "object") {
            if (symbol.literal) {
                return JSON.stringify(symbol.literal);
            } else if (symbol instanceof RegExp) {
                return symbol.toString();
            } else if (symbol.type) {
                return '%' + symbol.type;
            } else if (symbol.test) {
                return '<' + String(symbol.test) + '>';
            } else {
                throw new Error('Unknown symbol type: ' + symbol);
            }
        }
    }

    return {
        Parser: Parser,
        Grammar: Grammar,
        Rule: Rule,
    };

}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/

// created by Justin Fernald

const nearley = __webpack_require__(/*! nearley */ "./node_modules/nearley/lib/nearley.js");
const grammar = __webpack_require__(/*! ../dist/grammar */ "./dist/grammar.js");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const input = document.getElementById("input").value;

parser.feed(input);
const ast = JSON.stringify(parser.results[0], null, 1);

const addASTIndex = (node, index = [0]) => {
    node.index = index;
    if (node.parts) {
        for (let i = 0; i < node.parts.length; i++) {
            addASTIndex(node.parts[i], [...index, i]);
        }
    }
}

addASTIndex(ast);

console.full = (...args) => console.dir(...args, { depth: null });

const scope = {
    name: "global",
    symbols: [
        { type: "int", name: "input", function: true, scope: { symbols: [] } },
        { type: "void", name: "output", function: true, scope: { symbols: [{ type: "int", name: "x" }] } },
    ],
    scopes: [],
};

let scopePath = [scope];
const currentScope = () => scopePath[scopePath.length - 1];

let currentMemoryLocation = 0;

const findSymbol = (id, scopes = scopePath) => scopes.length ? scopes[scopes.length - 1].symbols.find(symbol => symbol.name === id) || findSymbol(id, scopes.slice(0, -1)) : undefined;

const findScopeFromSymbol = (id, scopes = scopePath) => scopes.length ? scopes[scopes.length - 1].symbols.find(symbol => symbol.name === id) ? scopes[scopes.length - 1] : findScopeFromSymbol(id, scopes.slice(0, -1)) : undefined;

const findFunctionSymbol = (scopes = scopePath) => scopes.length ? scopes[scopes.length - 1].symbols.find(symbol => symbol.function) || findFunctionSymbol(scopes.slice(0, -1)) : undefined;

const indexer = (node, ...indices) =>
    indices.length === 0 ? node : indexer(node.parts[indices[0]], ...indices.slice(1));

const findTerminal = (node) => {
    if (node.value) return node;
    return findTerminal(node.parts[0]);
}

const findLastTerminal = (node) => {
    if (node.value) return node;
    return findLastTerminal(node.parts[node.parts.length - 1]);
}

const getContext = (node) => {
    const startTerminal = findTerminal(node);
    const endTerminal = findLastTerminal(node);

    return "\n" + JSON.stringify({
        start: startTerminal.start || { line: startTerminal.line, col: startTerminal.col },
        end: endTerminal.end || { line: endTerminal.line, col: endTerminal.col },
        preview: node.value || node.values?.join(" ") || node
    }, null, 4)
}

const checkType = (node) => {
    switch (node.type) {
        case "exp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));
                if (type1 !== type2) {
                    throw new Error(`Type mismatch: ${type1} and ${type2}` + getContext(node));
                }
                return type1;
            }
            else if (node.rule === 1) {
                return checkType(indexer(node, 0));
            }
        }
        case "simpleExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "bool" || type2 !== "bool")
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be bool` + getContext(node));

                return "bool";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "andExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "bool" || type2 !== "bool")
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be bool` + getContext(node));

                return "bool";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "unaryRelExp": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 1));
                if (type !== "bool")
                    throw new Error(`Type mismatch: ${type} | Should be bool` + getContext(node));

                return "bool";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "relExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "int" || type2 !== "int")
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be int` + getContext(node));

                return "bool";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "sumExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "int" || type2 !== "int") {
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be int` + getContext(node));
                }

                return "int";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "mulExp": {
            if (node.rule === 0) {
                const type1 = checkType(indexer(node, 0));
                const type2 = checkType(indexer(node, 2));

                if (type1 !== "int" || type2 !== "int")
                    throw new Error(`Type mismatch: ${type1} and ${type2} | Should be int` + getContext(node));

                return "int";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "unaryExp": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 1));
                if (type !== "int")
                    throw new Error(`Type mismatch: ${type} | Should be int` + getContext(node));

                return "int";
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "factor": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 0));
                return type;
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "mutable": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 0));
                return type;
            } else if (node.rule === 1) {
                const symbol = findSymbol(indexer(node, 0).value);

                const typeIndex = checkType(indexer(node, 2));
                if (typeIndex !== "int")
                    throw new Error(`Type mismatch: ${typeIndex} | Should be int` + getContext(node));

                return symbol.type;
            }
        }

        case "immutable": {
            if (node.rule === 0) {
                const type = checkType(indexer(node, 1));
                return type;
            } else if (node.rule === 1) {
                const type = checkType(indexer(node, 0));
                return type;
            } else if (node.rule === 2) {
                const type = checkType(indexer(node, 0));
                return type;
            }
        }

        case "identifier": {
            const symbol = findSymbol(node.value);
            if (!symbol) {
                throw new Error(`Symbol ${node.value} not found` + getContext(node));
            }
            return symbol.type + (symbol.array ? "[]" : "");
        }

        case "call": {
            const symbol = findSymbol(indexer(node, 0).value);
            if (!symbol) {
                throw new Error(`Symbol ${indexer(node, 0).value} not found` + getContext(node));
            }
            if (!symbol.function) {
                throw new Error(`Type mismatch: ${symbol} | Should be function` + getContext(node));
            }

            const argsTree = indexer(node, 2);
            const getArgs = (node) => {
                if (node.type === "args") {
                    if (node.rule === 0) {
                        const argsTree = indexer(node, 0);
                        return getArgs(argsTree);
                    } else {
                        return [];
                    }
                }
                if (node.rule === 0) {
                    const argsTree = indexer(node, 0);
                    const arg = indexer(node, 2);
                    return [...getArgs(argsTree), arg];
                } else if (node.rule === 1) {
                    const arg = indexer(node, 0);
                    return [arg];
                }
            }
            const args = getArgs(argsTree);
            const params = symbol.scope.symbols;

            if (args.length !== params.length) {
                throw new Error(`Arguments length mismatch: should be ${params.length} arguments and got ${args.length}` + getContext(node));
            }

            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                const param = params[i];
                if (checkType(arg) !== param.type) {
                    throw new Error(`Type mismatch: ${arg.type} and ${param.type} | Should be ${param.type}` + getContext(node));
                }
            }
            return symbol.type;
        }

        case "constant": {
            if (node.rule === 0) {
                return "int";
            }
            else if (node.rule === 1) {
                return "char";
            }
            else if (node.rule === 2) {
                return "bool";
            }
        }


        case "selectStmt": {
            const type = checkType(indexer(node, 2));
            if (type !== "bool") {
                throw new Error(`Type mismatch: ${type} | Should be bool` + getContext(node));
            }
            break;
        }

        case "iterStmt": {
            const type = checkType(indexer(node, 2));
            if (type !== "bool") {
                throw new Error(`Type mismatch: ${type} | Should be bool` + getContext(node));
            }
            break;
        }

        case "returnStmt": {
            let type;
            if (node.rule === 0) {
                type = "void";
            } else if (node.rule === 1) {
                type = checkType(indexer(node, 1));
            }

            const symbol = currentFunction;
            if (symbol.type !== type) {
                throw new Error(`Type mismatch: ${type} | Should be ${symbol.type}` + getContext(node));
            }
            break;
        }
    }
}

let currentFunction = null;

const semanticCheckDFS = (node) => {
    // TODO: need to make sure non-void function finish with return statement

    let isFunctionDeclaration = false;

    switch (node.type) {
        case "varDecl": {
            if (indexer(node, 1, 0).rule === 0) {
                currentScope().symbols.push({ type: indexer(node, 0, 0).value, name: indexer(node, 1, 0, 0).value })
            } else {
                const size = +indexer(node, 1, 0, 2).value;
                currentScope().symbols.push({ type: indexer(node, 0, 0).value, name: indexer(node, 1, 0, 0).value, array: true, size, length: 4 * size })
            }
            break;
        }
        case "funcDecl": {
            currentScope().symbols.push({ type: indexer(node, 0, 0).value, function: true, name: indexer(node, 1).value })
            isFunctionDeclaration = true;
            currentFunction = currentScope().symbols[currentScope().symbols.length - 1];
            break;
        }
        case "scopedVarDecl": {
            if (indexer(node, 1, 0).rule === 0) {
                currentScope().symbols.push({ type: indexer(node, 0, 0).value, name: indexer(node, 1, 0, 0).value })
            } else {
                const size = +indexer(node, 1, 0, 2).value;
                currentScope().symbols.push({ type: indexer(node, 0, 0).value, name: indexer(node, 1, 0, 0).value, array: true, size, length: 4 * size })
            }
            break;
        }
        case "parmTypeList": {
            currentScope().symbols.push({ type: indexer(node, 0, 0).value, name: indexer(node, 1, 0).value })
            break;
        }
    }

    checkType(node)

    if (node.scopeHead) {
        const scope = {
            name: node.title,
            nodeIndex: node.index,
            symbols: [],
            scopes: [],
        }

        if (isFunctionDeclaration)
            currentScope().symbols[currentScope().symbols.length - 1].scope = scope;


        currentScope().scopes.push(scope);
        scopePath.push(scope);
    }

    if (node.parts)
        for (const part of node.parts)
            semanticCheckDFS(part);

    if (node.scopeHead)
        scopePath.pop();
}

let memPointer = 0;

const getLocalDecls = (scope, skip = false) => {
    const output = skip ? [] : scope.symbols.map(symbol => ({ type: symbol.type, name: symbol.name, array: symbol.array, size: symbol.size, length: symbol.length/* + "_" + scope.index.join('') */ }));
    for (const child of scope.scopes) {
        output.push(...getLocalDecls(child));
    }
    return output;
}

const codeGenDFS = (node, scope) => {
    const terminals = {
        "program": {
            pre: (node) => {
                const globalArrays = scope.symbols.filter(x => x.array);
                let globalArrayOutput = "";
                for (const globalArray of globalArrays) {
                    globalArrayOutput += "\n    " + `(global $${globalArray.name} (mut i32) (i32.const ${memPointer}))`
                    memPointer += globalArray.length;
                }
                return `(module\n    (import "console" "log" (func $output (param i32)))\n    (import "window" "prompt" (func $input (result i32)))\n    (memory (import "js" "mem") 1)\n    (global $mem_pointer (mut i32) (i32.const ${memPointer}))${globalArrayOutput}`
            },
            post: (node) => `)`
        },
        "declList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "decl": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "varDecl": {
            pre: (node) => findSymbol(indexer(node, 1, 0, 0).value).array ? `` : `(global $${indexer(node, 1, 0, 0).value} (mut i32) (i32.const 0))`,
            post: (node) => ``
        },
        "scopedVarDecl": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "varDeclList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "varDeclInit": {
            pre: [(node) => ``, (node) => `(local.set $${indexer(node, 0, 0).value}`],
            post: [(node) => ``, (node) => `)`]
        },
        "varDeclId": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "typeSpec": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "funcDecl": {
            order: (node) => [(node) => `(func $${indexer(node, 1).value}`,
                3,
            (node) => indexer(node, 0, 0).value === "void" ? '' : `(result i32)`,
            (node) => {
                const localDecls = getLocalDecls(findSymbol(indexer(node, 1).value).scope, true);
                let localDeclOutput = "(local $function_output i32)";
                let localDeclArrayOutput = "";
                for (const decl of localDecls) {
                    localDeclOutput += `(local $${decl.name} i32)`
                    if (decl.array) {
                        localDeclArrayOutput += `(local.set $${decl.name} (global.get $mem_pointer))(global.set $mem_pointer (i32.add (global.get $mem_pointer) (i32.const ${decl.length})))`;
                    }
                }


                return localDeclOutput + " " + localDeclArrayOutput;
            },

                '(block $function_block',
                5,
                ')',
            (node) => {
                const localDecls = getLocalDecls(findSymbol(indexer(node, 1).value).scope, true);
                let totalLength = 0;
                for (const decl of localDecls) {
                    if (decl.array) {
                        totalLength += decl.length;
                    }
                }
                return `(global.set $mem_pointer (i32.sub (global.get $mem_pointer) (i32.const ${totalLength})))`
            },
            (node) => indexer(node, 0, 0).value === "void" ? '' : '(return (local.get $function_output))',
            `)(export "${indexer(node, 1).value}" (func $${indexer(node, 1).value}))\n`]
        },
        "parms": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "parmList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "parmTypeList": {
            pre: (node) => `(param $${indexer(node, 1, 0).value} i32)`,
            post: (node) => ``
        },
        "parmIdList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "parmId": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "stmt": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "expStmt": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "compoundStmt": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "localDecls": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "stmtList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "selectStmt": {
            order: {
                0: [`(if`, 2, `(then`, 4, `))`],
                1: [`(if`, 2, `(then`, 4, `)(else`, 6, '))']
            }
        },
        "iterStmt": {
            order: [(node) => `(block $block_${node.index.join("")} (loop $loop_${node.index.join("")}`, `(if`, 2, `(then`, 4, (node) => `br $loop_${node.index.join("")}`, `))))`]
        },
        "returnStmt": {
            pre: (node) => `(local.set $function_output `,
            post: (node) => `)(br $function_block)`
        },
        "breakStmt": {
            pre: (node) => `(br 0)`,
            post: (node) => ``
        },
        "exp": {
            pre: [(node) => {
                const symbol = findSymbol(indexer(node, 0, 0).value);
                const scope = findScopeFromSymbol(symbol.name);

                if (symbol.array) {
                    const indexValue = codeTreeToString(codeGenDFS(indexer(node, 0, 2)), 0, false);
                    return `(i32.store (i32.add (${scope.name === "global" ? "global" : "local"}.get $${symbol.name}) (i32.mul (i32.const 4) ${indexValue}))`;
                }

                return `(${scope.name === "global" ? "global" : "local"}.set $${symbol.name}`
            }, (node) => ``],
            post: [(node) => `)`, (node) => ``]
        },
        "simpleExp": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "andExp": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "unaryRelExp": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "relExp": {
            order: { 0: ['(', 1, 0, 2, ')'] }
        },
        "relOp": {
            pre: (node) => 'i32.' + {
                lte: 'le_s',
                lt: 'lt_s',
                gte: 'ge_s',
                gt: 'gt_s',
                eq: 'eq',
                neq: 'ne',
            }[indexer(node, 0).type],
            post: (node) => ``
        },
        "sumExp": {
            pre: [(node) => `(i32.${indexer(node, 1, 0).type === "plus" ? "add" : "sub"}`, (node) => ``],
            post: [(node) => `)`, (node) => ``]
        },
        "sumop": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "mulExp": {
            pre: [(node) => `(i32.${indexer(node, 1, 0).type === "multiply" ? "mul" : "div_s"}`, (node) => ``],
            post: [(node) => `)`, (node) => ``]
        },
        "mulop": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "unaryExp": {
            pre: [(node) => `(i32.sub (i32.const 0)`, (node) => ``],
            post: [(node) => `)`, (node) => ``]
        },
        "unaryop": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "factor": {
            pre: [(node) => ``, (node) => {
                const symbol = findSymbol(indexer(node, 0, 0).value);
                const scope = findScopeFromSymbol(symbol.name);
                if (symbol.array) {
                    const indexValue = codeTreeToString(codeGenDFS(indexer(node, 0, 2)), 0, false);
                    return `(i32.load (i32.add (${scope.name === "global" ? "global" : "local"}.get $${symbol.name}) (i32.mul (i32.const 4) ${indexValue})))`;
                }
                return `(${scope.name === "global" ? "global" : "local"}.get $${symbol.name})`
            }],
            post: [(node) => ``, (node) => ``]
        },
        "mutable": {
            order: ['', '']
        },
        "immutable": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "call": {
            pre: (node) => `(call $${indexer(node, 0).value}`,
            post: (node) => `)`
        },
        "args": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "argList": {
            pre: (node) => ``,
            post: (node) => ``
        },
        "constant": {
            pre: (node) => [`(i32.const ${indexer(node, 0).value})`, indexer(node, 0).value, `(i32.const ${indexer(node, 0).value === "true" ? 1 : 0})`][node.rule],
            post: (node) => ``
        }
    }


    const output = { type: node.type, pre: null, children: [], post: null };

    if (node.scopeHead) {
        const arrayEquals = (a, b) => {
            if (a.length !== b.length)
                return false;
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        }

        const scope = currentScope().scopes.find(s => arrayEquals(s.nodeIndex, node.index));
        if (scope) {
            scopePath.push(scope);
        } else {
            throw new Error("Scope not found");
        }
    }

    if (node.type in terminals) {
        const terminal = terminals[node.type];
        if (terminal.order) {
            let orderOutput = [];

            const order = terminal.order;
            const rule = node.rule;
            if (typeof order === "object" && !Array.isArray(order)) {
                const orderRule = order[rule];
                if (typeof orderRule === "function") {
                    const result = orderRule(node);
                    for (const part of result) {
                        if (typeof part === "function") {
                            orderOutput.push(part(node));
                        } else if (typeof part === "number") {
                            if (node?.parts?.[part]) {
                                const outputPart = codeGenDFS(node.parts[part], scope);
                                orderOutput.push(outputPart);
                            } else {
                                throw new Error(`No part at index ${part}`);
                            }
                        } else {
                            orderOutput.push(part);
                        }
                    }
                } else if (!orderRule) {
                    const children = [];
                    if (node.parts) {
                        for (const part of node.parts) {
                            const outputPart = codeGenDFS(part, scope);
                            children.push(outputPart);
                        }
                    }
                    orderOutput = ['', ...children, ''];
                } else {
                    for (const part of orderRule) {
                        if (typeof part === "function") {
                            orderOutput.push(part(node));
                        } else if (typeof part === "number") {
                            if (node?.parts?.[part]) {
                                const outputPart = codeGenDFS(node.parts[part], scope);
                                orderOutput.push(outputPart);
                            } else {
                                throw new Error(`No part at index ${part}`);
                            }
                        } else {
                            orderOutput.push(part);
                        }
                    }
                }
            } else if (Array.isArray(order)) {
                for (const part of order) {
                    if (typeof part === "function") {
                        orderOutput.push(part(node));
                    } else if (typeof part === "number") {
                        if (node?.parts?.[part]) {
                            const outputPart = codeGenDFS(node.parts[part], scope);
                            orderOutput.push(outputPart);
                        } else {
                            throw new Error(`No part at index ${part}`);
                        }
                    } else {
                        orderOutput.push(part);
                    }
                }
            } else if (typeof order === "function") {
                const orderValue = order(node);

                for (const part of orderValue) {
                    if (typeof part === "function") {
                        orderOutput.push(part(node));
                    } else if (typeof part === "number") {
                        if (node?.parts?.[part]) {
                            const outputPart = codeGenDFS(node.parts[part], scope);
                            orderOutput.push(outputPart);
                        } else {
                            throw new Error(`No part at index ${part}`);
                        }
                    } else {
                        orderOutput.push(part);
                    }
                }
            } else {
                throw new Error(`Invalid order for terminal ${node.type}`);
            }

            output.pre = orderOutput.length === 0 ? '' : orderOutput[0];
            output.post = orderOutput.length === 1 ? '' : orderOutput[orderOutput.length - 1];
            output.children = orderOutput.slice(1, orderOutput.length - 1);
        } else {
            if (terminal.pre) {
                if (Array.isArray(terminal.pre)) {
                    if (terminal.pre[node.rule]) {
                        if (typeof terminal.pre[node.rule] === "string") {
                            output.pre = terminal.pre[node.rule];
                        } else {
                            output.pre = terminal.pre[node.rule]?.(node) || '';
                        }
                    } else {
                        output.pre = '';
                    }
                } else if (typeof terminal.pre === "string") {
                    output.pre = terminal.pre;
                } else {
                    output.pre = terminal?.pre?.(node) || '';
                }
            } else {
                output.pre = '';
            }

            if (node.parts) {

                for (const part of node.parts) {
                    const outputPart = codeGenDFS(part, scope);
                    output.children.push(outputPart);
                }
            }

            if (terminal.post) {
                if (Array.isArray(terminal.post)) {
                    if (terminal.post[node.rule]) {
                        if (typeof terminal.post[node.rule] === "string") {
                            output.post = terminal.post[node.rule];
                        } else {
                            output.post = terminal.post[node.rule]?.(node) || '';
                        }
                    } else {
                        output.post = '';
                    }
                } else if (typeof terminal.post === "string") {
                    output.post = terminal.post;
                } else {
                    output.post = terminal?.post?.(node) || '';
                }
            } else {
                output.post = '';
            }
        }
    } else {
        if (!node.value)
            throw new Error(`No value for node ${node.type}`);
    }

    if (node.scopeHead)
        scopePath.pop();

    return output;
}

const reduceCodeTree = (tree) => {
    if (tree?.pre?.length > 0 || tree?.post?.length > 0) return { pre: tree.pre, children: (Array.isArray(tree.children) ? (tree.children.map(reduceCodeTree).flat()) : (tree.children)), post: tree.post };
    if (tree.children) return Array.isArray(tree.children) ? tree.children.map(reduceCodeTree).flat() : tree.children;
    return tree
}

const codeTreeToString = (node, level = 0, spacing = true) => {
    node = reduceCodeTree(node);
    if (Array.isArray(node))
        node = node.length === 1 ? node[0] : { pre: '', children: node, post: '' };

    let output = "";
    let spaces = "";
    if (spacing)
        for (let i = 0; i < level; i++)
            spaces += "    ";

    if (node.pre)
        output += spaces + node.pre + (spacing ? "\n" : "");

    if (node.children) {
        for (const child of node.children) {
            output += codeTreeToString(child, level + 1);
        }
    } else {
        output += spaces + node + (spacing ? "\n" : "");
    }

    if (node.post)
        output += spaces + node.post + (spacing ? "\n" : "");

    return output;
}

semanticCheckDFS(ast);

const addIndex = (node, index = [0]) => {
    node.index = index;
    if (node.scopes) {
        for (let i = 0; i < node.scopes.length; i++) {
            addIndex(node.scopes[i], [...index, i]);
        }
    }
}
let scopeCopy = JSON.parse(JSON.stringify(scope));
scopeCopy.symbols = scopeCopy.symbols.map(({ scope, ...x }) => x)
// console.full(scopeCopy);
addIndex(scope);
scopePath = [scope];

const codeTree = codeGenDFS(ast, scope);
const codeOutput = codeTreeToString(codeTree);

console.log(codeOutput);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQztBQUN0QztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxLQUFLO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsMkRBQTJEO0FBQzNHO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtB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Q0Esc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZCw4REFBOEQsVUFBVTtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsaURBQWlELFVBQVU7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWtFO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLFdBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isd0JBQXdCO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsYUFBYTtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY29tcGlsZXIvLi9kaXN0L2dyYW1tYXIuanMiLCJ3ZWJwYWNrOi8vY29tcGlsZXIvLi9ub2RlX21vZHVsZXMvbW9vL21vby5qcyIsIndlYnBhY2s6Ly9jb21waWxlci8uL25vZGVfbW9kdWxlcy9uZWFybGV5L2xpYi9uZWFybGV5LmpzIiwid2VicGFjazovL2NvbXBpbGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NvbXBpbGVyLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5IGJ5IG5lYXJsZXksIHZlcnNpb24gMi4yMC4xXG4vLyBodHRwOi8vZ2l0aHViLmNvbS9IYXJkbWF0aDEyMy9uZWFybGV5XG4oZnVuY3Rpb24gKCkge1xuZnVuY3Rpb24gaWQoeCkgeyByZXR1cm4geFswXTsgfVxuXHJcbi8vIGdyYW1tYXIgbW9kaWZpZWQgYW5kIGluc3BpcmVkIGZyb206IGh0dHA6Ly9tYXJ2aW4uY3MudWlkYWhvLmVkdS9UZWFjaGluZy9DUzQ0NS9jLUdyYW1tYXIucGRmXHJcbi8vIGNyZWF0ZWQgYnkgSnVzdGluIEZlcm5hbGRcclxuXHJcbmNvbnN0IG1vbyA9IHJlcXVpcmUoXCJtb29cIik7XHJcblxyXG4vLyBsaXN0IG91dCBhbGwgdGVybWluYWwgdG9rZW5zXHJcbmNvbnN0IGxleGVyID0gbW9vLmNvbXBpbGUoe1xyXG4gICAgd3M6IHttYXRjaDogL1xccysvLCBsaW5lQnJlYWtzOiB0cnVlfSxcclxuICAgIGx0ZTogXCI8PVwiLFxyXG4gICAgbHQ6IFwiPFwiLFxyXG4gICAgZ3RlOiBcIj49XCIsXHJcbiAgICBndDogXCI+XCIsXHJcbiAgICBuZXE6IFwiIT1cIixcclxuICAgIGVxOiBcIj09XCIsXHJcbiAgICBscGFyYW46IFwiKFwiLFxyXG4gICAgcnBhcmFuOiBcIilcIixcclxuICAgIGNvbW1hOiBcIixcIixcclxuICAgIGxicmFja2V0OiBcIltcIixcclxuICAgIHJicmFja2V0OiBcIl1cIixcclxuICAgIGxicmFjZTogXCJ7XCIsXHJcbiAgICByYnJhY2U6IFwifVwiLFxyXG4gICAgYXNzaWdubWVudDogXCI9XCIsXHJcbiAgICBwbHVzOiBcIitcIixcclxuICAgIG1pbnVzOiBcIi1cIixcclxuICAgIG11bHRpcGx5OiBcIipcIixcclxuICAgIGRpdmlkZTogXCIvXCIsXHJcbiAgICBzY29sb246IFwiO1wiLFxyXG4gICAgaW50OiBcImludFwiLFxyXG4gICAgY2hhcjogXCJjaGFyXCIsXHJcbiAgICBib29sOiBcImJvb2xcIixcclxuICAgIHZvaWRkOiBcInZvaWRcIixcclxuICAgIHdoaWxlZTogXCJ3aGlsZVwiLFxyXG4gICAgZWxzZWU6IFwiZWxzZVwiLFxyXG4gICAgaWZmOiBcImlmXCIsXHJcbiAgICBicmVha2s6IFwiYnJlYWtcIixcclxuICAgIHJldHVybm46IFwicmV0dXJuXCIsXHJcbiAgICBhbmQ6IFwiJiZcIixcclxuICAgIG9yOiBcInx8XCIsXHJcbiAgICB0cnVlOiBcInRydWVcIixcclxuICAgIGZhbHNlOiBcImZhbHNlXCIsXHJcbiAgICAvLyBpbnB1dDogXCJpbnB1dCgpXCIsXHJcbiAgICAvLyBvdXRwdXQ6IFwib3V0cHV0XCIsXHJcbiAgICBjaGFyYzogLydbXiddJy8sXHJcbiAgICAvLyBzdHJpbmc6IC9cIlteXCJdKlwiLyxcclxuICAgIGNvbW1lbnQ6IHsgLy8gZmluZCBhbGwgY29tbWVudHMgYW5kIHJlbW92ZXMgdGhlbVxyXG4gICAgICAgIG1hdGNoOiAvI1teXFxuXSovLFxyXG4gICAgICAgIC8vIHZhbHVlOiBzID0+IHMuc3Vic3RyaW5nKDEpXHJcbiAgICAgICAgdmFsdWU6IHMgPT4gcy5zdWJzdHJpbmcoMSlcclxuICAgIH0sXHJcbiAgICBudW1iZXJfbGl0ZXJhbDogeyAvLyBmaW5kcyBhbGwgbnVtYmVyIHRva2Vuc1xyXG4gICAgICAgIG1hdGNoOiAvWzAtOV0rKD86XFwuWzAtOV0rKT8vLFxyXG4gICAgICAgIC8vIHZhbHVlOiBzID0+IE51bWJlcihzKVxyXG4gICAgfSxcclxuICAgIGlkZW50aWZpZXI6IHsgLy8gZmluZHMgYWxsIGlkZW50aWZpZXJzIGZvciB2YXJpYWJsZXMgYW5kIGZ1bmN0aW9uc1xyXG4gICAgICAgIG1hdGNoOiAvW2EtekEtWl9dW2EtekEtWl8wLTldKi9cclxuICAgIH1cclxufSk7XHJcblxyXG4vLyBjdXN0b20gZWRpdGVkIGxleGVyIGZyb20gbW9vIGZvciBuZXh0IHN1Y2ggdGhhdCBpdCBpZ25vcmVzIGFsbCB3aGl0ZSBzcGFjZVxyXG5sZXhlci5uZXh0ID0gKG5leHQgPT4gKCkgPT4ge1xyXG4gICAgbGV0IHRva2VuO1xyXG4gICAgd2hpbGUgKCh0b2tlbiA9IG5leHQuY2FsbChsZXhlcikpICYmICh0b2tlbi50eXBlID09PSBcIndzXCIgfHwgdG9rZW4udHlwZSA9PT0gXCJjb21tZW50XCIpKSB7fVxyXG4gICAgcmV0dXJuIHRva2VuO1xyXG59KShsZXhlci5uZXh0KTtcclxuXHJcbmZ1bmN0aW9uIGhhc2goc3RyaW5nKSB7ICAgICAgXHJcbiAgICB2YXIgaGFzaCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICBpZiAoc3RyaW5nLmxlbmd0aCA9PSAwKSByZXR1cm4gaGFzaDtcclxuICAgICAgICBcclxuICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjaGFyID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgaGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgY2hhcjtcclxuICAgICAgICBoYXNoID0gaGFzaCAmIGhhc2g7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcbiAgICByZXR1cm4gTWF0aC5hYnMoaGFzaCk7XHJcbn1cclxuXHJcbi8vIGZ1bmN0aW9uIHRvIHByb3BvZ2F0ZSBhc3QgZGF0YSB0aHJvdWdob3V0IHRoZSBwcm9ncmFtXHJcbmZ1bmN0aW9uIGFzdChwYXJ0LCBzY29wZUhlYWQgPSBmYWxzZSwgdGl0bGUgPSBcImRlZmF1bHRcIikge1xyXG4gICAgY29uc3QgZ3JhbW1hckRhdGEgPSBwYXJ0cyA9PiB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHBhcnRzKSl7XHJcbiAgICAgICAgICAgIGlmICghcGFydHMpIHJldHVybiBbXTtcclxuICAgICAgICAgICAgcGFydHMgPSBbcGFydHNdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnRzLm1hcCh4ID0+ICh7dGVybXM6IHgudHlwZSwgdmFsdWU6IHgudmFsdWUsIHBhcnRzOiBncmFtbWFyRGF0YSh4LnBhcnRzKSB8fCBbXX0pKTsgICAgICAgICAgICBcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgYnVpbGQgPSBwYXJ0cyA9PiB7IFxyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwYXJ0IG9mIHBhcnRzKSB7XHJcbiAgICAgICAgICAgIGlmIChwYXJ0LnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7dGVybXM6IFtwYXJ0LnRlcm1zXSwgdmFsdWU6IHBhcnQudmFsdWV9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdWIgPSBidWlsZChwYXJ0LnBhcnRzKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHN1YlBhcnQgb2Ygc3ViKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ViUGFydC50ZXJtcyA9IFtwYXJ0LnRlcm1zLCAuLi5zdWJQYXJ0LnRlcm1zXTtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChzdWJQYXJ0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gb3V0cHV0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbnRleHQgPSBidWlsZChncmFtbWFyRGF0YShwYXJ0KSk7XHJcbiAgICBjb25zdCB2YWx1ZXMgPSBjb250ZXh0Lm1hcCh4ID0+IHgudmFsdWUpO1xyXG4gICAgY29uc3Qgc3RhcnRUeXBlcyA9IGNvbnRleHQubWFwKHggPT4geC50ZXJtc1swXSk7XHJcbiAgICBjb25zdCBlbmRUeXBlcyA9IGNvbnRleHQubWFwKHggPT4geC50ZXJtc1t4LnRlcm1zLmxlbmd0aCAtIDFdKTtcclxuICAgIGlmICghc2NvcGVIZWFkKSB0aXRsZSA9IHVuZGVmaW5lZDtcclxuICAgIHJldHVybiB7IHNjb3BlSGVhZCwgdGl0bGUsIHBhcnRzOiBwYXJ0fTsgIFxyXG4gICAgLy8gcmV0dXJuIHsgc2NvcGVIZWFkLCB0aXRsZSwgdmFsdWVzLCBjb250ZXh0LCBwYXJ0czogcGFydH07ICBcclxufVxyXG5cclxuZnVuY3Rpb24gc3ltYm9sKHR5cGUsIG5hbWUsIHNjb3BlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICBzY29wZTogc2NvcGVcclxuICAgIH1cclxufVxyXG5cclxuLy8gZ2V0cyBzdGFydCBvZiB0b2tlbnNcclxuZnVuY3Rpb24gdG9rZW5TdGFydCh0b2tlbikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsaW5lOiB0b2tlbi5saW5lLFxyXG4gICAgICAgIGNvbDogdG9rZW4uY29sIC0gMVxyXG4gICAgfTtcclxufVxyXG5cclxuLy8gZ2V0cyBlbmQgb2YgdG9rZW5zXHJcbmZ1bmN0aW9uIHRva2VuRW5kKHRva2VuKSB7XHJcbiAgICBjb25zdCBsYXN0TmV3TGluZSA9IHRva2VuLnRleHQubGFzdEluZGV4T2YoXCJcXG5cIik7XHJcbiAgICBpZiAobGFzdE5ld0xpbmUgIT09IC0xKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgY2FzZTogdG9rZW4gd2l0aCBsaW5lIGJyZWFrc1wiKTtcclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgbGluZTogdG9rZW4ubGluZSxcclxuICAgICAgICBjb2w6IHRva2VuLmNvbCArIHRva2VuLnRleHQubGVuZ3RoIC0gMVxyXG4gICAgfTtcclxufVxyXG5cclxuLy8gY29udmVydHMgdG9rZW5zIHRvIGFzdCBkYXRhXHJcbmZ1bmN0aW9uIGNvbnZlcnRUb2tlbih0b2tlbikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0eXBlOiB0b2tlbi50eXBlLFxyXG4gICAgICAgIHZhbHVlOiB0b2tlbi52YWx1ZSxcclxuICAgICAgICBzdGFydDogdG9rZW5TdGFydCh0b2tlbiksXHJcbiAgICAgICAgZW5kOiB0b2tlbkVuZCh0b2tlbilcclxuICAgIH07XHJcbn1cclxuXHJcbi8vIGdldHMgdG9rZW4gaWRcclxuZnVuY3Rpb24gY29udmVydFRva2VuSWQoZGF0YSkge1xyXG4gICAgcmV0dXJuIGNvbnZlcnRUb2tlbihkYXRhWzBdKTtcclxufVxyXG5cclxudmFyIGdyYW1tYXIgPSB7XG4gICAgTGV4ZXI6IGxleGVyLFxuICAgIFBhcnNlclJ1bGVzOiBbXG4gICAge1wibmFtZVwiOiBcInByb2dyYW1cIiwgXCJzeW1ib2xzXCI6IFtcImRlY2xMaXN0XCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicHJvZ3JhbVwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImRlY2xMaXN0XCIsIFwic3ltYm9sc1wiOiBbXCJkZWNsTGlzdFwiLCBcImRlY2xcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJkZWNsTGlzdFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImRlY2xMaXN0XCIsIFwic3ltYm9sc1wiOiBbXCJkZWNsXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiZGVjbExpc3RcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJkZWNsXCIsIFwic3ltYm9sc1wiOiBbXCJ2YXJEZWNsXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiZGVjbFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImRlY2xcIiwgXCJzeW1ib2xzXCI6IFtcImZ1bmNEZWNsXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiZGVjbFwiLCBydWxlOiAxLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInZhckRlY2xcIiwgXCJzeW1ib2xzXCI6IFtcInR5cGVTcGVjXCIsIFwidmFyRGVjbEluaXRcIiwgKGxleGVyLmhhcyhcInNjb2xvblwiKSA/IHt0eXBlOiBcInNjb2xvblwifSA6IHNjb2xvbildLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwidmFyRGVjbFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSksIHN5bWJvbDogc3ltYm9sKGRhdGFbMF0sIGRhdGFbMV0sIC4uLmRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJzY29wZWRWYXJEZWNsXCIsIFwic3ltYm9sc1wiOiBbXCJ0eXBlU3BlY1wiLCBcInZhckRlY2xJbml0XCIsIChsZXhlci5oYXMoXCJzY29sb25cIikgPyB7dHlwZTogXCJzY29sb25cIn0gOiBzY29sb24pXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInNjb3BlZFZhckRlY2xcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJ2YXJEZWNsSW5pdFwiLCBcInN5bWJvbHNcIjogW1widmFyRGVjbElkXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwidmFyRGVjbEluaXRcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpLCBzeW1ib2w6IHN5bWJvbChkYXRhWzBdKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwidmFyRGVjbEluaXRcIiwgXCJzeW1ib2xzXCI6IFtcInZhckRlY2xJZFwiLCAobGV4ZXIuaGFzKFwiYXNzaWdubWVudFwiKSA/IHt0eXBlOiBcImFzc2lnbm1lbnRcIn0gOiBhc3NpZ25tZW50KSwgXCJzaW1wbGVFeHBcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJ2YXJEZWNsSW5pdFwiLCBydWxlOiAxLCAuLi5hc3QoZGF0YSksIHN5bWJvbDogc3ltYm9sKGRhdGFbMF0pfSl9LFxuICAgIHtcIm5hbWVcIjogXCJ2YXJEZWNsSWRcIiwgXCJzeW1ib2xzXCI6IFtcImlkZW50aWZpZXJcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJ2YXJEZWNsSWRcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpLCBzeW1ib2w6IHN5bWJvbChkYXRhWzBdKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwidmFyRGVjbElkXCIsIFwic3ltYm9sc1wiOiBbXCJpZGVudGlmaWVyXCIsIChsZXhlci5oYXMoXCJsYnJhY2tldFwiKSA/IHt0eXBlOiBcImxicmFja2V0XCJ9IDogbGJyYWNrZXQpLCBcIm51bWJlclwiLCAobGV4ZXIuaGFzKFwicmJyYWNrZXRcIikgPyB7dHlwZTogXCJyYnJhY2tldFwifSA6IHJicmFja2V0KV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJ2YXJEZWNsSWRcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpLCBzeW1ib2w6IHN5bWJvbChkYXRhWzBdKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwidHlwZVNwZWNcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwiaW50XCIpID8ge3R5cGU6IFwiaW50XCJ9IDogaW50KV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJ0eXBlU3BlY1wiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInR5cGVTcGVjXCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImNoYXJcIikgPyB7dHlwZTogXCJjaGFyXCJ9IDogY2hhcildLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwidHlwZVNwZWNcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJ0eXBlU3BlY1wiLCBcInN5bWJvbHNcIjogWyhsZXhlci5oYXMoXCJib29sXCIpID8ge3R5cGU6IFwiYm9vbFwifSA6IGJvb2wpXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInR5cGVTcGVjXCIsIHJ1bGU6IDIsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwidHlwZVNwZWNcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwidm9pZGRcIikgPyB7dHlwZTogXCJ2b2lkZFwifSA6IHZvaWRkKV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJ0eXBlU3BlY1wiLCBydWxlOiAzLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImZ1bmNEZWNsXCIsIFwic3ltYm9sc1wiOiBbXCJ0eXBlU3BlY1wiLCBcImlkZW50aWZpZXJcIiwgKGxleGVyLmhhcyhcImxwYXJhblwiKSA/IHt0eXBlOiBcImxwYXJhblwifSA6IGxwYXJhbiksIFwicGFybXNcIiwgKGxleGVyLmhhcyhcInJwYXJhblwiKSA/IHt0eXBlOiBcInJwYXJhblwifSA6IHJwYXJhbiksIFwiY29tcG91bmRTdG10XCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiZnVuY0RlY2xcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEsIHRydWUsIFwiZnVuY3Rpb25cIil9KX0sXG4gICAge1wibmFtZVwiOiBcInBhcm1zXCIsIFwic3ltYm9sc1wiOiBbXCJwYXJtTGlzdFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInBhcm1zXCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwicGFybXNcIiwgXCJzeW1ib2xzXCI6IFtdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicGFybXNcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJwYXJtTGlzdFwiLCBcInN5bWJvbHNcIjogW1wicGFybUxpc3RcIiwgKGxleGVyLmhhcyhcImNvbW1hXCIpID8ge3R5cGU6IFwiY29tbWFcIn0gOiBjb21tYSksIFwicGFybVR5cGVMaXN0XCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicGFybUxpc3RcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJwYXJtTGlzdFwiLCBcInN5bWJvbHNcIjogW1wicGFybVR5cGVMaXN0XCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicGFybUxpc3RcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJwYXJtVHlwZUxpc3RcIiwgXCJzeW1ib2xzXCI6IFtcInR5cGVTcGVjXCIsIFwicGFybUlkXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicGFybVR5cGVMaXN0XCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwicGFybUlkTGlzdFwiLCBcInN5bWJvbHNcIjogW1wicGFybUlkTGlzdFwiLCAobGV4ZXIuaGFzKFwiY29tbWFcIikgPyB7dHlwZTogXCJjb21tYVwifSA6IGNvbW1hKSwgXCJwYXJtSWRcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJwYXJtSWRMaXN0XCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwicGFybUlkTGlzdFwiLCBcInN5bWJvbHNcIjogW1wicGFybUlkXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicGFybUlkTGlzdFwiLCBydWxlOiAxLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInBhcm1JZFwiLCBcInN5bWJvbHNcIjogW1wiaWRlbnRpZmllclwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInBhcm1JZFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInBhcm1JZFwiLCBcInN5bWJvbHNcIjogW1wiaWRlbnRpZmllclwiLCAobGV4ZXIuaGFzKFwibGJyYWNrZXRcIikgPyB7dHlwZTogXCJsYnJhY2tldFwifSA6IGxicmFja2V0KSwgKGxleGVyLmhhcyhcInJicmFja2V0XCIpID8ge3R5cGU6IFwicmJyYWNrZXRcIn0gOiByYnJhY2tldCldLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicGFybUlkXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwic3RtdFwiLCBcInN5bWJvbHNcIjogW1wiZXhwU3RtdFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInN0bXRcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJzdG10XCIsIFwic3ltYm9sc1wiOiBbXCJjb21wb3VuZFN0bXRcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJzdG10XCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwic3RtdFwiLCBcInN5bWJvbHNcIjogW1wic2VsZWN0U3RtdFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInN0bXRcIiwgcnVsZTogMiwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJzdG10XCIsIFwic3ltYm9sc1wiOiBbXCJpdGVyU3RtdFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInN0bXRcIiwgcnVsZTogMywgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJzdG10XCIsIFwic3ltYm9sc1wiOiBbXCJyZXR1cm5TdG10XCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwic3RtdFwiLCBydWxlOiA0LCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInN0bXRcIiwgXCJzeW1ib2xzXCI6IFtcImJyZWFrU3RtdFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInN0bXRcIiwgcnVsZTogNSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJzdG10XCIsIFwic3ltYm9sc1wiOiBbXCJzY29wZWRWYXJEZWNsXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwic3RtdFwiLCBydWxlOiA2LCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImV4cFN0bXRcIiwgXCJzeW1ib2xzXCI6IFtcImV4cFwiLCAobGV4ZXIuaGFzKFwic2NvbG9uXCIpID8ge3R5cGU6IFwic2NvbG9uXCJ9IDogc2NvbG9uKV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJleHBTdG10XCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiZXhwU3RtdFwiLCBcInN5bWJvbHNcIjogWyhsZXhlci5oYXMoXCJzY29sb25cIikgPyB7dHlwZTogXCJzY29sb25cIn0gOiBzY29sb24pXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcImV4cFN0bXRcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJjb21wb3VuZFN0bXRcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwibGJyYWNlXCIpID8ge3R5cGU6IFwibGJyYWNlXCJ9IDogbGJyYWNlKSwgXCJzdG10TGlzdFwiLCAobGV4ZXIuaGFzKFwicmJyYWNlXCIpID8ge3R5cGU6IFwicmJyYWNlXCJ9IDogcmJyYWNlKV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJjb21wb3VuZFN0bXRcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEsIHRydWUsIFwiY29tcG91bmRcIil9KX0sXG4gICAge1wibmFtZVwiOiBcInN0bXRMaXN0XCIsIFwic3ltYm9sc1wiOiBbXCJzdG10TGlzdFwiLCBcInN0bXRcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJzdG10TGlzdFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInN0bXRMaXN0XCIsIFwic3ltYm9sc1wiOiBbXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInN0bXRMaXN0XCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwic2VsZWN0U3RtdFwiLCBcInN5bWJvbHNcIjogWyhsZXhlci5oYXMoXCJpZmZcIikgPyB7dHlwZTogXCJpZmZcIn0gOiBpZmYpLCAobGV4ZXIuaGFzKFwibHBhcmFuXCIpID8ge3R5cGU6IFwibHBhcmFuXCJ9IDogbHBhcmFuKSwgXCJzaW1wbGVFeHBcIiwgKGxleGVyLmhhcyhcInJwYXJhblwiKSA/IHt0eXBlOiBcInJwYXJhblwifSA6IHJwYXJhbiksIFwic3RtdFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInNlbGVjdFN0bXRcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEsIHRydWUsIFwic2VsZWN0XCIpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJzZWxlY3RTdG10XCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImlmZlwiKSA/IHt0eXBlOiBcImlmZlwifSA6IGlmZiksIChsZXhlci5oYXMoXCJscGFyYW5cIikgPyB7dHlwZTogXCJscGFyYW5cIn0gOiBscGFyYW4pLCBcInNpbXBsZUV4cFwiLCAobGV4ZXIuaGFzKFwicnBhcmFuXCIpID8ge3R5cGU6IFwicnBhcmFuXCJ9IDogcnBhcmFuKSwgXCJzdG10XCIsIChsZXhlci5oYXMoXCJlbHNlZVwiKSA/IHt0eXBlOiBcImVsc2VlXCJ9IDogZWxzZWUpLCBcInN0bXRcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJzZWxlY3RTdG10XCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhLCB0cnVlLCBcInNlbGVjdFwiKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiaXRlclN0bXRcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwid2hpbGVlXCIpID8ge3R5cGU6IFwid2hpbGVlXCJ9IDogd2hpbGVlKSwgKGxleGVyLmhhcyhcImxwYXJhblwiKSA/IHt0eXBlOiBcImxwYXJhblwifSA6IGxwYXJhbiksIFwic2ltcGxlRXhwXCIsIChsZXhlci5oYXMoXCJycGFyYW5cIikgPyB7dHlwZTogXCJycGFyYW5cIn0gOiBycGFyYW4pLCBcInN0bXRcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJpdGVyU3RtdFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSwgdHJ1ZSwgXCJ3aGlsZVwiKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwicmV0dXJuU3RtdFwiLCBcInN5bWJvbHNcIjogWyhsZXhlci5oYXMoXCJyZXR1cm5uXCIpID8ge3R5cGU6IFwicmV0dXJublwifSA6IHJldHVybm4pLCAobGV4ZXIuaGFzKFwic2NvbG9uXCIpID8ge3R5cGU6IFwic2NvbG9uXCJ9IDogc2NvbG9uKV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJyZXR1cm5TdG10XCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwicmV0dXJuU3RtdFwiLCBcInN5bWJvbHNcIjogWyhsZXhlci5oYXMoXCJyZXR1cm5uXCIpID8ge3R5cGU6IFwicmV0dXJublwifSA6IHJldHVybm4pLCBcInNpbXBsZUV4cFwiLCAobGV4ZXIuaGFzKFwic2NvbG9uXCIpID8ge3R5cGU6IFwic2NvbG9uXCJ9IDogc2NvbG9uKV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJyZXR1cm5TdG10XCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiYnJlYWtTdG10XCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImJyZWFra1wiKSA/IHt0eXBlOiBcImJyZWFra1wifSA6IGJyZWFrayksIChsZXhlci5oYXMoXCJzY29sb25cIikgPyB7dHlwZTogXCJzY29sb25cIn0gOiBzY29sb24pXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcImJyZWFrU3RtdFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImV4cFwiLCBcInN5bWJvbHNcIjogW1wibXV0YWJsZVwiLCAobGV4ZXIuaGFzKFwiYXNzaWdubWVudFwiKSA/IHt0eXBlOiBcImFzc2lnbm1lbnRcIn0gOiBhc3NpZ25tZW50KSwgXCJleHBcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJleHBcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJleHBcIiwgXCJzeW1ib2xzXCI6IFtcInNpbXBsZUV4cFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcImV4cFwiLCBydWxlOiAxLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInNpbXBsZUV4cFwiLCBcInN5bWJvbHNcIjogW1wic2ltcGxlRXhwXCIsIChsZXhlci5oYXMoXCJvclwiKSA/IHt0eXBlOiBcIm9yXCJ9IDogb3IpLCBcImFuZEV4cFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInNpbXBsZUV4cFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInNpbXBsZUV4cFwiLCBcInN5bWJvbHNcIjogW1wiYW5kRXhwXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwic2ltcGxlRXhwXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiYW5kRXhwXCIsIFwic3ltYm9sc1wiOiBbXCJhbmRFeHBcIiwgKGxleGVyLmhhcyhcImFuZFwiKSA/IHt0eXBlOiBcImFuZFwifSA6IGFuZCksIFwidW5hcnlSZWxFeHBcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJhbmRFeHBcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJhbmRFeHBcIiwgXCJzeW1ib2xzXCI6IFtcInVuYXJ5UmVsRXhwXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiYW5kRXhwXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwidW5hcnlSZWxFeHBcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwibm90XCIpID8ge3R5cGU6IFwibm90XCJ9IDogbm90KSwgXCJ1bmFyeVJlbEV4cFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInVuYXJ5UmVsRXhwXCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwidW5hcnlSZWxFeHBcIiwgXCJzeW1ib2xzXCI6IFtcInJlbEV4cFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInVuYXJ5UmVsRXhwXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwicmVsRXhwXCIsIFwic3ltYm9sc1wiOiBbXCJzdW1FeHBcIiwgXCJyZWxPcFwiLCBcInN1bUV4cFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInJlbEV4cFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInJlbEV4cFwiLCBcInN5bWJvbHNcIjogW1wic3VtRXhwXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicmVsRXhwXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwicmVsT3BcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwibHRlXCIpID8ge3R5cGU6IFwibHRlXCJ9IDogbHRlKV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJyZWxPcFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInJlbE9wXCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImx0XCIpID8ge3R5cGU6IFwibHRcIn0gOiBsdCldLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicmVsT3BcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJyZWxPcFwiLCBcInN5bWJvbHNcIjogWyhsZXhlci5oYXMoXCJndGVcIikgPyB7dHlwZTogXCJndGVcIn0gOiBndGUpXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInJlbE9wXCIsIHJ1bGU6IDIsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwicmVsT3BcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwiZ3RcIikgPyB7dHlwZTogXCJndFwifSA6IGd0KV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJyZWxPcFwiLCBydWxlOiAzLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInJlbE9wXCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImVxXCIpID8ge3R5cGU6IFwiZXFcIn0gOiBlcSldLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwicmVsT3BcIiwgcnVsZTogNCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJyZWxPcFwiLCBcInN5bWJvbHNcIjogWyhsZXhlci5oYXMoXCJuZXFcIikgPyB7dHlwZTogXCJuZXFcIn0gOiBuZXEpXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInJlbE9wXCIsIHJ1bGU6IDUsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwic3VtRXhwXCIsIFwic3ltYm9sc1wiOiBbXCJzdW1FeHBcIiwgXCJzdW1vcFwiLCBcIm11bEV4cFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcInN1bUV4cFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInN1bUV4cFwiLCBcInN5bWJvbHNcIjogW1wibXVsRXhwXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwic3VtRXhwXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwic3Vtb3BcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwicGx1c1wiKSA/IHt0eXBlOiBcInBsdXNcIn0gOiBwbHVzKV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJzdW1vcFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcInN1bW9wXCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcIm1pbnVzXCIpID8ge3R5cGU6IFwibWludXNcIn0gOiBtaW51cyldLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwic3Vtb3BcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJtdWxFeHBcIiwgXCJzeW1ib2xzXCI6IFtcIm11bEV4cFwiLCBcIm11bG9wXCIsIFwidW5hcnlFeHBcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJtdWxFeHBcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJtdWxFeHBcIiwgXCJzeW1ib2xzXCI6IFtcInVuYXJ5RXhwXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwibXVsRXhwXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwibXVsb3BcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwibXVsdGlwbHlcIikgPyB7dHlwZTogXCJtdWx0aXBseVwifSA6IG11bHRpcGx5KV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJtdWxvcFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcIm11bG9wXCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImRpdmlkZVwiKSA/IHt0eXBlOiBcImRpdmlkZVwifSA6IGRpdmlkZSldLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwibXVsb3BcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJ1bmFyeUV4cFwiLCBcInN5bWJvbHNcIjogW1widW5hcnlvcFwiLCBcInVuYXJ5RXhwXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwidW5hcnlFeHBcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJ1bmFyeUV4cFwiLCBcInN5bWJvbHNcIjogW1wiZmFjdG9yXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwidW5hcnlFeHBcIiwgcnVsZTogMSwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJ1bmFyeW9wXCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcIm1pbnVzXCIpID8ge3R5cGU6IFwibWludXNcIn0gOiBtaW51cyldLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwidW5hcnlvcFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImZhY3RvclwiLCBcInN5bWJvbHNcIjogW1wiaW1tdXRhYmxlXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiZmFjdG9yXCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiZmFjdG9yXCIsIFwic3ltYm9sc1wiOiBbXCJtdXRhYmxlXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiZmFjdG9yXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwibXV0YWJsZVwiLCBcInN5bWJvbHNcIjogW1wiaWRlbnRpZmllclwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcIm11dGFibGVcIiwgcnVsZTogMCwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJtdXRhYmxlXCIsIFwic3ltYm9sc1wiOiBbXCJpZGVudGlmaWVyXCIsIChsZXhlci5oYXMoXCJsYnJhY2tldFwiKSA/IHt0eXBlOiBcImxicmFja2V0XCJ9IDogbGJyYWNrZXQpLCBcImV4cFwiLCAobGV4ZXIuaGFzKFwicmJyYWNrZXRcIikgPyB7dHlwZTogXCJyYnJhY2tldFwifSA6IHJicmFja2V0KV0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJtdXRhYmxlXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiaW1tdXRhYmxlXCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImxwYXJhblwiKSA/IHt0eXBlOiBcImxwYXJhblwifSA6IGxwYXJhbiksIFwiZXhwXCIsIChsZXhlci5oYXMoXCJycGFyYW5cIikgPyB7dHlwZTogXCJycGFyYW5cIn0gOiBycGFyYW4pXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcImltbXV0YWJsZVwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImltbXV0YWJsZVwiLCBcInN5bWJvbHNcIjogW1wiY2FsbFwiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcImltbXV0YWJsZVwiLCBydWxlOiAxLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImltbXV0YWJsZVwiLCBcInN5bWJvbHNcIjogW1wiY29uc3RhbnRcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJpbW11dGFibGVcIiwgcnVsZTogMiwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJjYWxsXCIsIFwic3ltYm9sc1wiOiBbXCJpZGVudGlmaWVyXCIsIChsZXhlci5oYXMoXCJscGFyYW5cIikgPyB7dHlwZTogXCJscGFyYW5cIn0gOiBscGFyYW4pLCBcImFyZ3NcIiwgKGxleGVyLmhhcyhcInJwYXJhblwiKSA/IHt0eXBlOiBcInJwYXJhblwifSA6IHJwYXJhbildLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiY2FsbFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImFyZ3NcIiwgXCJzeW1ib2xzXCI6IFtcImFyZ0xpc3RcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJhcmdzXCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiYXJnc1wiLCBcInN5bWJvbHNcIjogW10sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJhcmdzXCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiYXJnTGlzdFwiLCBcInN5bWJvbHNcIjogW1wiYXJnTGlzdFwiLCAobGV4ZXIuaGFzKFwiY29tbWFcIikgPyB7dHlwZTogXCJjb21tYVwifSA6IGNvbW1hKSwgXCJleHBcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJhcmdMaXN0XCIsIHJ1bGU6IDAsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiYXJnTGlzdFwiLCBcInN5bWJvbHNcIjogW1wiZXhwXCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiYXJnTGlzdFwiLCBydWxlOiAxLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImNvbnN0YW50XCIsIFwic3ltYm9sc1wiOiBbXCJudW1iZXJcIl0sIFwicG9zdHByb2Nlc3NcIjogKGRhdGEpID0+ICh7dHlwZTogXCJjb25zdGFudFwiLCBydWxlOiAwLCAuLi5hc3QoZGF0YSl9KX0sXG4gICAge1wibmFtZVwiOiBcImNvbnN0YW50XCIsIFwic3ltYm9sc1wiOiBbXCJjaGFyY1wiXSwgXCJwb3N0cHJvY2Vzc1wiOiAoZGF0YSkgPT4gKHt0eXBlOiBcImNvbnN0YW50XCIsIHJ1bGU6IDEsIC4uLmFzdChkYXRhKX0pfSxcbiAgICB7XCJuYW1lXCI6IFwiY29uc3RhbnRcIiwgXCJzeW1ib2xzXCI6IFtcImJvb2x2XCJdLCBcInBvc3Rwcm9jZXNzXCI6IChkYXRhKSA9PiAoe3R5cGU6IFwiY29uc3RhbnRcIiwgcnVsZTogMiwgLi4uYXN0KGRhdGEpfSl9LFxuICAgIHtcIm5hbWVcIjogXCJsaW5lX2NvbW1lbnRcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwiY29tbWVudFwiKSA/IHt0eXBlOiBcImNvbW1lbnRcIn0gOiBjb21tZW50KV0sIFwicG9zdHByb2Nlc3NcIjogY29udmVydFRva2VuSWR9LFxuICAgIHtcIm5hbWVcIjogXCJudW1iZXJcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwibnVtYmVyX2xpdGVyYWxcIikgPyB7dHlwZTogXCJudW1iZXJfbGl0ZXJhbFwifSA6IG51bWJlcl9saXRlcmFsKV0sIFwicG9zdHByb2Nlc3NcIjogY29udmVydFRva2VuSWR9LFxuICAgIHtcIm5hbWVcIjogXCJib29sdlwiLCBcInN5bWJvbHNcIjogWyhsZXhlci5oYXMoXCJ0cnVlXCIpID8ge3R5cGU6IFwidHJ1ZVwifSA6IHRydWUpXSwgXCJwb3N0cHJvY2Vzc1wiOiBjb252ZXJ0VG9rZW5JZH0sXG4gICAge1wibmFtZVwiOiBcImJvb2x2XCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImZhbHNlXCIpID8ge3R5cGU6IFwiZmFsc2VcIn0gOiBmYWxzZSldLCBcInBvc3Rwcm9jZXNzXCI6IGNvbnZlcnRUb2tlbklkfSxcbiAgICB7XCJuYW1lXCI6IFwiY2hhcmNcIiwgXCJzeW1ib2xzXCI6IFsobGV4ZXIuaGFzKFwiY2hhcmNcIikgPyB7dHlwZTogXCJjaGFyY1wifSA6IGNoYXJjKV0sIFwicG9zdHByb2Nlc3NcIjogY29udmVydFRva2VuSWR9LFxuICAgIHtcIm5hbWVcIjogXCJpZGVudGlmaWVyXCIsIFwic3ltYm9sc1wiOiBbKGxleGVyLmhhcyhcImlkZW50aWZpZXJcIikgPyB7dHlwZTogXCJpZGVudGlmaWVyXCJ9IDogaWRlbnRpZmllcildLCBcInBvc3Rwcm9jZXNzXCI6IGNvbnZlcnRUb2tlbklkfVxuXVxuICAsIFBhcnNlclN0YXJ0OiBcInByb2dyYW1cIlxufVxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgbW9kdWxlLmV4cG9ydHMgPSBncmFtbWFyO1xufSBlbHNlIHtcbiAgIHdpbmRvdy5ncmFtbWFyID0gZ3JhbW1hcjtcbn1cbn0pKCk7XG4iLCIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KSAvKiBnbG9iYWwgZGVmaW5lICovXG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKVxuICB9IGVsc2Uge1xuICAgIHJvb3QubW9vID0gZmFjdG9yeSgpXG4gIH1cbn0odGhpcywgZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG4gIHZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcbiAgdmFyIGhhc1N0aWNreSA9IHR5cGVvZiBuZXcgUmVnRXhwKCkuc3RpY2t5ID09PSAnYm9vbGVhbidcblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIGZ1bmN0aW9uIGlzUmVnRXhwKG8pIHsgcmV0dXJuIG8gJiYgdG9TdHJpbmcuY2FsbChvKSA9PT0gJ1tvYmplY3QgUmVnRXhwXScgfVxuICBmdW5jdGlvbiBpc09iamVjdChvKSB7IHJldHVybiBvICYmIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiAhaXNSZWdFeHAobykgJiYgIUFycmF5LmlzQXJyYXkobykgfVxuXG4gIGZ1bmN0aW9uIHJlRXNjYXBlKHMpIHtcbiAgICByZXR1cm4gcy5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKVxuICB9XG4gIGZ1bmN0aW9uIHJlR3JvdXBzKHMpIHtcbiAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKCd8JyArIHMpXG4gICAgcmV0dXJuIHJlLmV4ZWMoJycpLmxlbmd0aCAtIDFcbiAgfVxuICBmdW5jdGlvbiByZUNhcHR1cmUocykge1xuICAgIHJldHVybiAnKCcgKyBzICsgJyknXG4gIH1cbiAgZnVuY3Rpb24gcmVVbmlvbihyZWdleHBzKSB7XG4gICAgaWYgKCFyZWdleHBzLmxlbmd0aCkgcmV0dXJuICcoPyEpJ1xuICAgIHZhciBzb3VyY2UgPSAgcmVnZXhwcy5tYXAoZnVuY3Rpb24ocykge1xuICAgICAgcmV0dXJuIFwiKD86XCIgKyBzICsgXCIpXCJcbiAgICB9KS5qb2luKCd8JylcbiAgICByZXR1cm4gXCIoPzpcIiArIHNvdXJjZSArIFwiKVwiXG4gIH1cblxuICBmdW5jdGlvbiByZWdleHBPckxpdGVyYWwob2JqKSB7XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gJyg/OicgKyByZUVzY2FwZShvYmopICsgJyknXG5cbiAgICB9IGVsc2UgaWYgKGlzUmVnRXhwKG9iaikpIHtcbiAgICAgIC8vIFRPRE86IGNvbnNpZGVyIC91IHN1cHBvcnRcbiAgICAgIGlmIChvYmouaWdub3JlQ2FzZSkgdGhyb3cgbmV3IEVycm9yKCdSZWdFeHAgL2kgZmxhZyBub3QgYWxsb3dlZCcpXG4gICAgICBpZiAob2JqLmdsb2JhbCkgdGhyb3cgbmV3IEVycm9yKCdSZWdFeHAgL2cgZmxhZyBpcyBpbXBsaWVkJylcbiAgICAgIGlmIChvYmouc3RpY2t5KSB0aHJvdyBuZXcgRXJyb3IoJ1JlZ0V4cCAveSBmbGFnIGlzIGltcGxpZWQnKVxuICAgICAgaWYgKG9iai5tdWx0aWxpbmUpIHRocm93IG5ldyBFcnJvcignUmVnRXhwIC9tIGZsYWcgaXMgaW1wbGllZCcpXG4gICAgICByZXR1cm4gb2JqLnNvdXJjZVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGEgcGF0dGVybjogJyArIG9iailcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvYmplY3RUb1J1bGVzKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KVxuICAgIHZhciByZXN1bHQgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgIHZhciB0aGluZyA9IG9iamVjdFtrZXldXG4gICAgICB2YXIgcnVsZXMgPSBbXS5jb25jYXQodGhpbmcpXG4gICAgICBpZiAoa2V5ID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBydWxlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHtpbmNsdWRlOiBydWxlc1tqXX0pXG4gICAgICAgIH1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIHZhciBtYXRjaCA9IFtdXG4gICAgICBydWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHJ1bGUpIHtcbiAgICAgICAgaWYgKGlzT2JqZWN0KHJ1bGUpKSB7XG4gICAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCkgcmVzdWx0LnB1c2gocnVsZU9wdGlvbnMoa2V5LCBtYXRjaCkpXG4gICAgICAgICAgcmVzdWx0LnB1c2gocnVsZU9wdGlvbnMoa2V5LCBydWxlKSlcbiAgICAgICAgICBtYXRjaCA9IFtdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2gucHVzaChydWxlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKG1hdGNoLmxlbmd0aCkgcmVzdWx0LnB1c2gocnVsZU9wdGlvbnMoa2V5LCBtYXRjaCkpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5VG9SdWxlcyhhcnJheSkge1xuICAgIHZhciByZXN1bHQgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBvYmogPSBhcnJheVtpXVxuICAgICAgaWYgKG9iai5pbmNsdWRlKSB7XG4gICAgICAgIHZhciBpbmNsdWRlID0gW10uY29uY2F0KG9iai5pbmNsdWRlKVxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGluY2x1ZGUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh7aW5jbHVkZTogaW5jbHVkZVtqXX0pXG4gICAgICAgIH1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICghb2JqLnR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSdWxlIGhhcyBubyB0eXBlOiAnICsgSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKHJ1bGVPcHRpb25zKG9iai50eXBlLCBvYmopKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBmdW5jdGlvbiBydWxlT3B0aW9ucyh0eXBlLCBvYmopIHtcbiAgICBpZiAoIWlzT2JqZWN0KG9iaikpIHtcbiAgICAgIG9iaiA9IHsgbWF0Y2g6IG9iaiB9XG4gICAgfVxuICAgIGlmIChvYmouaW5jbHVkZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYXRjaGluZyBydWxlcyBjYW5ub3QgYWxzbyBpbmNsdWRlIHN0YXRlcycpXG4gICAgfVxuXG4gICAgLy8gbmIuIGVycm9yIGFuZCBmYWxsYmFjayBpbXBseSBsaW5lQnJlYWtzXG4gICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICBkZWZhdWx0VHlwZTogdHlwZSxcbiAgICAgIGxpbmVCcmVha3M6ICEhb2JqLmVycm9yIHx8ICEhb2JqLmZhbGxiYWNrLFxuICAgICAgcG9wOiBmYWxzZSxcbiAgICAgIG5leHQ6IG51bGwsXG4gICAgICBwdXNoOiBudWxsLFxuICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgZmFsbGJhY2s6IGZhbHNlLFxuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICB0eXBlOiBudWxsLFxuICAgICAgc2hvdWxkVGhyb3c6IGZhbHNlLFxuICAgIH1cblxuICAgIC8vIEF2b2lkIE9iamVjdC5hc3NpZ24oKSwgc28gd2Ugc3VwcG9ydCBJRTkrXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIG9wdGlvbnNba2V5XSA9IG9ialtrZXldXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdHlwZSB0cmFuc2Zvcm0gY2Fubm90IGJlIGEgc3RyaW5nXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUgIT09IG9wdGlvbnMudHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHlwZSB0cmFuc2Zvcm0gY2Fubm90IGJlIGEgc3RyaW5nICh0eXBlICdcIiArIG9wdGlvbnMudHlwZSArIFwiJyBmb3IgdG9rZW4gJ1wiICsgdHlwZSArIFwiJylcIilcbiAgICB9XG5cbiAgICAvLyBjb252ZXJ0IHRvIGFycmF5XG4gICAgdmFyIG1hdGNoID0gb3B0aW9ucy5tYXRjaFxuICAgIG9wdGlvbnMubWF0Y2ggPSBBcnJheS5pc0FycmF5KG1hdGNoKSA/IG1hdGNoIDogbWF0Y2ggPyBbbWF0Y2hdIDogW11cbiAgICBvcHRpb25zLm1hdGNoLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGlzUmVnRXhwKGEpICYmIGlzUmVnRXhwKGIpID8gMFxuICAgICAgICAgICA6IGlzUmVnRXhwKGIpID8gLTEgOiBpc1JlZ0V4cChhKSA/ICsxIDogYi5sZW5ndGggLSBhLmxlbmd0aFxuICAgIH0pXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvUnVsZXMoc3BlYykge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHNwZWMpID8gYXJyYXlUb1J1bGVzKHNwZWMpIDogb2JqZWN0VG9SdWxlcyhzcGVjKVxuICB9XG5cbiAgdmFyIGRlZmF1bHRFcnJvclJ1bGUgPSBydWxlT3B0aW9ucygnZXJyb3InLCB7bGluZUJyZWFrczogdHJ1ZSwgc2hvdWxkVGhyb3c6IHRydWV9KVxuICBmdW5jdGlvbiBjb21waWxlUnVsZXMocnVsZXMsIGhhc1N0YXRlcykge1xuICAgIHZhciBlcnJvclJ1bGUgPSBudWxsXG4gICAgdmFyIGZhc3QgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgdmFyIGZhc3RBbGxvd2VkID0gdHJ1ZVxuICAgIHZhciB1bmljb2RlRmxhZyA9IG51bGxcbiAgICB2YXIgZ3JvdXBzID0gW11cbiAgICB2YXIgcGFydHMgPSBbXVxuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSBmYWxsYmFjayBydWxlLCB0aGVuIGRpc2FibGUgZmFzdCBtYXRjaGluZ1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChydWxlc1tpXS5mYWxsYmFjaykge1xuICAgICAgICBmYXN0QWxsb3dlZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG9wdGlvbnMgPSBydWxlc1tpXVxuXG4gICAgICBpZiAob3B0aW9ucy5pbmNsdWRlKSB7XG4gICAgICAgIC8vIGFsbCB2YWxpZCBpbmNsdXNpb25zIGFyZSByZW1vdmVkIGJ5IHN0YXRlcygpIHByZXByb2Nlc3NvclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luaGVyaXRhbmNlIGlzIG5vdCBhbGxvd2VkIGluIHN0YXRlbGVzcyBsZXhlcnMnKVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5lcnJvciB8fCBvcHRpb25zLmZhbGxiYWNrKSB7XG4gICAgICAgIC8vIGVycm9yUnVsZSBjYW4gb25seSBiZSBzZXQgb25jZVxuICAgICAgICBpZiAoZXJyb3JSdWxlKSB7XG4gICAgICAgICAgaWYgKCFvcHRpb25zLmZhbGxiYWNrID09PSAhZXJyb3JSdWxlLmZhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNdWx0aXBsZSBcIiArIChvcHRpb25zLmZhbGxiYWNrID8gXCJmYWxsYmFja1wiIDogXCJlcnJvclwiKSArIFwiIHJ1bGVzIG5vdCBhbGxvd2VkIChmb3IgdG9rZW4gJ1wiICsgb3B0aW9ucy5kZWZhdWx0VHlwZSArIFwiJylcIilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZmFsbGJhY2sgYW5kIGVycm9yIGFyZSBtdXR1YWxseSBleGNsdXNpdmUgKGZvciB0b2tlbiAnXCIgKyBvcHRpb25zLmRlZmF1bHRUeXBlICsgXCInKVwiKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlcnJvclJ1bGUgPSBvcHRpb25zXG4gICAgICB9XG5cbiAgICAgIHZhciBtYXRjaCA9IG9wdGlvbnMubWF0Y2guc2xpY2UoKVxuICAgICAgaWYgKGZhc3RBbGxvd2VkKSB7XG4gICAgICAgIHdoaWxlIChtYXRjaC5sZW5ndGggJiYgdHlwZW9mIG1hdGNoWzBdID09PSAnc3RyaW5nJyAmJiBtYXRjaFswXS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICB2YXIgd29yZCA9IG1hdGNoLnNoaWZ0KClcbiAgICAgICAgICBmYXN0W3dvcmQuY2hhckNvZGVBdCgwKV0gPSBvcHRpb25zXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gV2FybiBhYm91dCBpbmFwcHJvcHJpYXRlIHN0YXRlLXN3aXRjaGluZyBvcHRpb25zXG4gICAgICBpZiAob3B0aW9ucy5wb3AgfHwgb3B0aW9ucy5wdXNoIHx8IG9wdGlvbnMubmV4dCkge1xuICAgICAgICBpZiAoIWhhc1N0YXRlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0YXRlLXN3aXRjaGluZyBvcHRpb25zIGFyZSBub3QgYWxsb3dlZCBpbiBzdGF0ZWxlc3MgbGV4ZXJzIChmb3IgdG9rZW4gJ1wiICsgb3B0aW9ucy5kZWZhdWx0VHlwZSArIFwiJylcIilcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5mYWxsYmFjaykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0YXRlLXN3aXRjaGluZyBvcHRpb25zIGFyZSBub3QgYWxsb3dlZCBvbiBmYWxsYmFjayB0b2tlbnMgKGZvciB0b2tlbiAnXCIgKyBvcHRpb25zLmRlZmF1bHRUeXBlICsgXCInKVwiKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE9ubHkgcnVsZXMgd2l0aCBhIC5tYXRjaCBhcmUgaW5jbHVkZWQgaW4gdGhlIFJlZ0V4cFxuICAgICAgaWYgKG1hdGNoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgZmFzdEFsbG93ZWQgPSBmYWxzZVxuXG4gICAgICBncm91cHMucHVzaChvcHRpb25zKVxuXG4gICAgICAvLyBDaGVjayB1bmljb2RlIGZsYWcgaXMgdXNlZCBldmVyeXdoZXJlIG9yIG5vd2hlcmVcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWF0Y2gubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIG9iaiA9IG1hdGNoW2pdXG4gICAgICAgIGlmICghaXNSZWdFeHAob2JqKSkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodW5pY29kZUZsYWcgPT09IG51bGwpIHtcbiAgICAgICAgICB1bmljb2RlRmxhZyA9IG9iai51bmljb2RlXG4gICAgICAgIH0gZWxzZSBpZiAodW5pY29kZUZsYWcgIT09IG9iai51bmljb2RlICYmIG9wdGlvbnMuZmFsbGJhY2sgPT09IGZhbHNlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJZiBvbmUgcnVsZSBpcyAvdSB0aGVuIGFsbCBtdXN0IGJlJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBjb252ZXJ0IHRvIFJlZ0V4cFxuICAgICAgdmFyIHBhdCA9IHJlVW5pb24obWF0Y2gubWFwKHJlZ2V4cE9yTGl0ZXJhbCkpXG5cbiAgICAgIC8vIHZhbGlkYXRlXG4gICAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChwYXQpXG4gICAgICBpZiAocmVnZXhwLnRlc3QoXCJcIikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVnRXhwIG1hdGNoZXMgZW1wdHkgc3RyaW5nOiBcIiArIHJlZ2V4cClcbiAgICAgIH1cbiAgICAgIHZhciBncm91cENvdW50ID0gcmVHcm91cHMocGF0KVxuICAgICAgaWYgKGdyb3VwQ291bnQgPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlZ0V4cCBoYXMgY2FwdHVyZSBncm91cHM6IFwiICsgcmVnZXhwICsgXCJcXG5Vc2UgKD86IOKApiApIGluc3RlYWRcIilcbiAgICAgIH1cblxuICAgICAgLy8gdHJ5IGFuZCBkZXRlY3QgcnVsZXMgbWF0Y2hpbmcgbmV3bGluZXNcbiAgICAgIGlmICghb3B0aW9ucy5saW5lQnJlYWtzICYmIHJlZ2V4cC50ZXN0KCdcXG4nKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1J1bGUgc2hvdWxkIGRlY2xhcmUgbGluZUJyZWFrczogJyArIHJlZ2V4cClcbiAgICAgIH1cblxuICAgICAgLy8gc3RvcmUgcmVnZXhcbiAgICAgIHBhcnRzLnB1c2gocmVDYXB0dXJlKHBhdCkpXG4gICAgfVxuXG5cbiAgICAvLyBJZiB0aGVyZSdzIG5vIGZhbGxiYWNrIHJ1bGUsIHVzZSB0aGUgc3RpY2t5IGZsYWcgc28gd2Ugb25seSBsb29rIGZvclxuICAgIC8vIG1hdGNoZXMgYXQgdGhlIGN1cnJlbnQgaW5kZXguXG4gICAgLy9cbiAgICAvLyBJZiB3ZSBkb24ndCBzdXBwb3J0IHRoZSBzdGlja3kgZmxhZywgdGhlbiBmYWtlIGl0IHVzaW5nIGFuIGlycmVmdXRhYmxlXG4gICAgLy8gbWF0Y2ggKGkuZS4gYW4gZW1wdHkgcGF0dGVybikuXG4gICAgdmFyIGZhbGxiYWNrUnVsZSA9IGVycm9yUnVsZSAmJiBlcnJvclJ1bGUuZmFsbGJhY2tcbiAgICB2YXIgZmxhZ3MgPSBoYXNTdGlja3kgJiYgIWZhbGxiYWNrUnVsZSA/ICd5bScgOiAnZ20nXG4gICAgdmFyIHN1ZmZpeCA9IGhhc1N0aWNreSB8fCBmYWxsYmFja1J1bGUgPyAnJyA6ICd8J1xuXG4gICAgaWYgKHVuaWNvZGVGbGFnID09PSB0cnVlKSBmbGFncyArPSBcInVcIlxuICAgIHZhciBjb21iaW5lZCA9IG5ldyBSZWdFeHAocmVVbmlvbihwYXJ0cykgKyBzdWZmaXgsIGZsYWdzKVxuICAgIHJldHVybiB7cmVnZXhwOiBjb21iaW5lZCwgZ3JvdXBzOiBncm91cHMsIGZhc3Q6IGZhc3QsIGVycm9yOiBlcnJvclJ1bGUgfHwgZGVmYXVsdEVycm9yUnVsZX1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBpbGUocnVsZXMpIHtcbiAgICB2YXIgcmVzdWx0ID0gY29tcGlsZVJ1bGVzKHRvUnVsZXMocnVsZXMpKVxuICAgIHJldHVybiBuZXcgTGV4ZXIoe3N0YXJ0OiByZXN1bHR9LCAnc3RhcnQnKVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tTdGF0ZUdyb3VwKGcsIG5hbWUsIG1hcCkge1xuICAgIHZhciBzdGF0ZSA9IGcgJiYgKGcucHVzaCB8fCBnLm5leHQpXG4gICAgaWYgKHN0YXRlICYmICFtYXBbc3RhdGVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIHN0YXRlICdcIiArIHN0YXRlICsgXCInIChpbiB0b2tlbiAnXCIgKyBnLmRlZmF1bHRUeXBlICsgXCInIG9mIHN0YXRlICdcIiArIG5hbWUgKyBcIicpXCIpXG4gICAgfVxuICAgIGlmIChnICYmIGcucG9wICYmICtnLnBvcCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwicG9wIG11c3QgYmUgMSAoaW4gdG9rZW4gJ1wiICsgZy5kZWZhdWx0VHlwZSArIFwiJyBvZiBzdGF0ZSAnXCIgKyBuYW1lICsgXCInKVwiKVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjb21waWxlU3RhdGVzKHN0YXRlcywgc3RhcnQpIHtcbiAgICB2YXIgYWxsID0gc3RhdGVzLiRhbGwgPyB0b1J1bGVzKHN0YXRlcy4kYWxsKSA6IFtdXG4gICAgZGVsZXRlIHN0YXRlcy4kYWxsXG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHN0YXRlcylcbiAgICBpZiAoIXN0YXJ0KSBzdGFydCA9IGtleXNbMF1cblxuICAgIHZhciBydWxlTWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgIHJ1bGVNYXBba2V5XSA9IHRvUnVsZXMoc3RhdGVzW2tleV0pLmNvbmNhdChhbGwpXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgIHZhciBydWxlcyA9IHJ1bGVNYXBba2V5XVxuICAgICAgdmFyIGluY2x1ZGVkID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBydWxlcy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgcnVsZSA9IHJ1bGVzW2pdXG4gICAgICAgIGlmICghcnVsZS5pbmNsdWRlKSBjb250aW51ZVxuICAgICAgICB2YXIgc3BsaWNlID0gW2osIDFdXG4gICAgICAgIGlmIChydWxlLmluY2x1ZGUgIT09IGtleSAmJiAhaW5jbHVkZWRbcnVsZS5pbmNsdWRlXSkge1xuICAgICAgICAgIGluY2x1ZGVkW3J1bGUuaW5jbHVkZV0gPSB0cnVlXG4gICAgICAgICAgdmFyIG5ld1J1bGVzID0gcnVsZU1hcFtydWxlLmluY2x1ZGVdXG4gICAgICAgICAgaWYgKCFuZXdSdWxlcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGluY2x1ZGUgbm9uZXhpc3RlbnQgc3RhdGUgJ1wiICsgcnVsZS5pbmNsdWRlICsgXCInIChpbiBzdGF0ZSAnXCIgKyBrZXkgKyBcIicpXCIpXG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgbmV3UnVsZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIHZhciBuZXdSdWxlID0gbmV3UnVsZXNba11cbiAgICAgICAgICAgIGlmIChydWxlcy5pbmRleE9mKG5ld1J1bGUpICE9PSAtMSkgY29udGludWVcbiAgICAgICAgICAgIHNwbGljZS5wdXNoKG5ld1J1bGUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJ1bGVzLnNwbGljZS5hcHBseShydWxlcywgc3BsaWNlKVxuICAgICAgICBqLS1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgIG1hcFtrZXldID0gY29tcGlsZVJ1bGVzKHJ1bGVNYXBba2V5XSwgdHJ1ZSlcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBuYW1lID0ga2V5c1tpXVxuICAgICAgdmFyIHN0YXRlID0gbWFwW25hbWVdXG4gICAgICB2YXIgZ3JvdXBzID0gc3RhdGUuZ3JvdXBzXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGdyb3Vwcy5sZW5ndGg7IGorKykge1xuICAgICAgICBjaGVja1N0YXRlR3JvdXAoZ3JvdXBzW2pdLCBuYW1lLCBtYXApXG4gICAgICB9XG4gICAgICB2YXIgZmFzdEtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzdGF0ZS5mYXN0KVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBmYXN0S2V5cy5sZW5ndGg7IGorKykge1xuICAgICAgICBjaGVja1N0YXRlR3JvdXAoc3RhdGUuZmFzdFtmYXN0S2V5c1tqXV0sIG5hbWUsIG1hcClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExleGVyKG1hcCwgc3RhcnQpXG4gIH1cblxuICBmdW5jdGlvbiBrZXl3b3JkVHJhbnNmb3JtKG1hcCkge1xuICAgIHZhciByZXZlcnNlTWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIHZhciBieUxlbmd0aCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICB2YXIgdHlwZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtYXApXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0eXBlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHRva2VuVHlwZSA9IHR5cGVzW2ldXG4gICAgICB2YXIgaXRlbSA9IG1hcFt0b2tlblR5cGVdXG4gICAgICB2YXIga2V5d29yZExpc3QgPSBBcnJheS5pc0FycmF5KGl0ZW0pID8gaXRlbSA6IFtpdGVtXVxuICAgICAga2V5d29yZExpc3QuZm9yRWFjaChmdW5jdGlvbihrZXl3b3JkKSB7XG4gICAgICAgIChieUxlbmd0aFtrZXl3b3JkLmxlbmd0aF0gPSBieUxlbmd0aFtrZXl3b3JkLmxlbmd0aF0gfHwgW10pLnB1c2goa2V5d29yZClcbiAgICAgICAgaWYgKHR5cGVvZiBrZXl3b3JkICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImtleXdvcmQgbXVzdCBiZSBzdHJpbmcgKGluIGtleXdvcmQgJ1wiICsgdG9rZW5UeXBlICsgXCInKVwiKVxuICAgICAgICB9XG4gICAgICAgIHJldmVyc2VNYXBba2V5d29yZF0gPSB0b2tlblR5cGVcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gZmFzdCBzdHJpbmcgbG9va3VwXG4gICAgLy8gaHR0cHM6Ly9qc3BlcmYuY29tL3N0cmluZy1sb29rdXBzXG4gICAgZnVuY3Rpb24gc3RyKHgpIHsgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHgpIH1cbiAgICB2YXIgc291cmNlID0gJydcbiAgICBzb3VyY2UgKz0gJ3N3aXRjaCAodmFsdWUubGVuZ3RoKSB7XFxuJ1xuICAgIGZvciAodmFyIGxlbmd0aCBpbiBieUxlbmd0aCkge1xuICAgICAgdmFyIGtleXdvcmRzID0gYnlMZW5ndGhbbGVuZ3RoXVxuICAgICAgc291cmNlICs9ICdjYXNlICcgKyBsZW5ndGggKyAnOlxcbidcbiAgICAgIHNvdXJjZSArPSAnc3dpdGNoICh2YWx1ZSkge1xcbidcbiAgICAgIGtleXdvcmRzLmZvckVhY2goZnVuY3Rpb24oa2V5d29yZCkge1xuICAgICAgICB2YXIgdG9rZW5UeXBlID0gcmV2ZXJzZU1hcFtrZXl3b3JkXVxuICAgICAgICBzb3VyY2UgKz0gJ2Nhc2UgJyArIHN0cihrZXl3b3JkKSArICc6IHJldHVybiAnICsgc3RyKHRva2VuVHlwZSkgKyAnXFxuJ1xuICAgICAgfSlcbiAgICAgIHNvdXJjZSArPSAnfVxcbidcbiAgICB9XG4gICAgc291cmNlICs9ICd9XFxuJ1xuICAgIHJldHVybiBGdW5jdGlvbigndmFsdWUnLCBzb3VyY2UpIC8vIHR5cGVcbiAgfVxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgdmFyIExleGVyID0gZnVuY3Rpb24oc3RhdGVzLCBzdGF0ZSkge1xuICAgIHRoaXMuc3RhcnRTdGF0ZSA9IHN0YXRlXG4gICAgdGhpcy5zdGF0ZXMgPSBzdGF0ZXNcbiAgICB0aGlzLmJ1ZmZlciA9ICcnXG4gICAgdGhpcy5zdGFjayA9IFtdXG4gICAgdGhpcy5yZXNldCgpXG4gIH1cblxuICBMZXhlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbihkYXRhLCBpbmZvKSB7XG4gICAgdGhpcy5idWZmZXIgPSBkYXRhIHx8ICcnXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLmxpbmUgPSBpbmZvID8gaW5mby5saW5lIDogMVxuICAgIHRoaXMuY29sID0gaW5mbyA/IGluZm8uY29sIDogMVxuICAgIHRoaXMucXVldWVkVG9rZW4gPSBpbmZvID8gaW5mby5xdWV1ZWRUb2tlbiA6IG51bGxcbiAgICB0aGlzLnF1ZXVlZFRocm93ID0gaW5mbyA/IGluZm8ucXVldWVkVGhyb3cgOiBudWxsXG4gICAgdGhpcy5zZXRTdGF0ZShpbmZvID8gaW5mby5zdGF0ZSA6IHRoaXMuc3RhcnRTdGF0ZSlcbiAgICB0aGlzLnN0YWNrID0gaW5mbyAmJiBpbmZvLnN0YWNrID8gaW5mby5zdGFjay5zbGljZSgpIDogW11cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgTGV4ZXIucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGluZTogdGhpcy5saW5lLFxuICAgICAgY29sOiB0aGlzLmNvbCxcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2suc2xpY2UoKSxcbiAgICAgIHF1ZXVlZFRva2VuOiB0aGlzLnF1ZXVlZFRva2VuLFxuICAgICAgcXVldWVkVGhyb3c6IHRoaXMucXVldWVkVGhyb3csXG4gICAgfVxuICB9XG5cbiAgTGV4ZXIucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoIXN0YXRlIHx8IHRoaXMuc3RhdGUgPT09IHN0YXRlKSByZXR1cm5cbiAgICB0aGlzLnN0YXRlID0gc3RhdGVcbiAgICB2YXIgaW5mbyA9IHRoaXMuc3RhdGVzW3N0YXRlXVxuICAgIHRoaXMuZ3JvdXBzID0gaW5mby5ncm91cHNcbiAgICB0aGlzLmVycm9yID0gaW5mby5lcnJvclxuICAgIHRoaXMucmUgPSBpbmZvLnJlZ2V4cFxuICAgIHRoaXMuZmFzdCA9IGluZm8uZmFzdFxuICB9XG5cbiAgTGV4ZXIucHJvdG90eXBlLnBvcFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0aGlzLnN0YWNrLnBvcCgpKVxuICB9XG5cbiAgTGV4ZXIucHJvdG90eXBlLnB1c2hTdGF0ZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdGhpcy5zdGFjay5wdXNoKHRoaXMuc3RhdGUpXG4gICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSlcbiAgfVxuXG4gIHZhciBlYXQgPSBoYXNTdGlja3kgPyBmdW5jdGlvbihyZSwgYnVmZmVyKSB7IC8vIGFzc3VtZSByZSBpcyAveVxuICAgIHJldHVybiByZS5leGVjKGJ1ZmZlcilcbiAgfSA6IGZ1bmN0aW9uKHJlLCBidWZmZXIpIHsgLy8gYXNzdW1lIHJlIGlzIC9nXG4gICAgdmFyIG1hdGNoID0gcmUuZXhlYyhidWZmZXIpXG4gICAgLy8gd2lsbCBhbHdheXMgbWF0Y2gsIHNpbmNlIHdlIHVzZWQgdGhlIHwoPzopIHRyaWNrXG4gICAgaWYgKG1hdGNoWzBdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoXG4gIH1cblxuICBMZXhlci5wcm90b3R5cGUuX2dldEdyb3VwID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICB2YXIgZ3JvdXBDb3VudCA9IHRoaXMuZ3JvdXBzLmxlbmd0aFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXBDb3VudDsgaSsrKSB7XG4gICAgICBpZiAobWF0Y2hbaSArIDFdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBzW2ldXG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgdG9rZW4gdHlwZSBmb3IgbWF0Y2hlZCB0ZXh0JylcbiAgfVxuXG4gIGZ1bmN0aW9uIHRva2VuVG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVcbiAgfVxuXG4gIExleGVyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5pbmRleFxuXG4gICAgLy8gSWYgYSBmYWxsYmFjayB0b2tlbiBtYXRjaGVkLCB3ZSBkb24ndCBuZWVkIHRvIHJlLXJ1biB0aGUgUmVnRXhwXG4gICAgaWYgKHRoaXMucXVldWVkR3JvdXApIHtcbiAgICAgIHZhciB0b2tlbiA9IHRoaXMuX3Rva2VuKHRoaXMucXVldWVkR3JvdXAsIHRoaXMucXVldWVkVGV4dCwgaW5kZXgpXG4gICAgICB0aGlzLnF1ZXVlZEdyb3VwID0gbnVsbFxuICAgICAgdGhpcy5xdWV1ZWRUZXh0ID0gXCJcIlxuICAgICAgcmV0dXJuIHRva2VuXG4gICAgfVxuXG4gICAgdmFyIGJ1ZmZlciA9IHRoaXMuYnVmZmVyXG4gICAgaWYgKGluZGV4ID09PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gLy8gRU9GXG4gICAgfVxuXG4gICAgLy8gRmFzdCBtYXRjaGluZyBmb3Igc2luZ2xlIGNoYXJhY3RlcnNcbiAgICB2YXIgZ3JvdXAgPSB0aGlzLmZhc3RbYnVmZmVyLmNoYXJDb2RlQXQoaW5kZXgpXVxuICAgIGlmIChncm91cCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Rva2VuKGdyb3VwLCBidWZmZXIuY2hhckF0KGluZGV4KSwgaW5kZXgpXG4gICAgfVxuXG4gICAgLy8gRXhlY3V0ZSBSZWdFeHBcbiAgICB2YXIgcmUgPSB0aGlzLnJlXG4gICAgcmUubGFzdEluZGV4ID0gaW5kZXhcbiAgICB2YXIgbWF0Y2ggPSBlYXQocmUsIGJ1ZmZlcilcblxuICAgIC8vIEVycm9yIHRva2VucyBtYXRjaCB0aGUgcmVtYWluaW5nIGJ1ZmZlclxuICAgIHZhciBlcnJvciA9IHRoaXMuZXJyb3JcbiAgICBpZiAobWF0Y2ggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Rva2VuKGVycm9yLCBidWZmZXIuc2xpY2UoaW5kZXgsIGJ1ZmZlci5sZW5ndGgpLCBpbmRleClcbiAgICB9XG5cbiAgICB2YXIgZ3JvdXAgPSB0aGlzLl9nZXRHcm91cChtYXRjaClcbiAgICB2YXIgdGV4dCA9IG1hdGNoWzBdXG5cbiAgICBpZiAoZXJyb3IuZmFsbGJhY2sgJiYgbWF0Y2guaW5kZXggIT09IGluZGV4KSB7XG4gICAgICB0aGlzLnF1ZXVlZEdyb3VwID0gZ3JvdXBcbiAgICAgIHRoaXMucXVldWVkVGV4dCA9IHRleHRcblxuICAgICAgLy8gRmFsbGJhY2sgdG9rZW5zIGNvbnRhaW4gdGhlIHVubWF0Y2hlZCBwb3J0aW9uIG9mIHRoZSBidWZmZXJcbiAgICAgIHJldHVybiB0aGlzLl90b2tlbihlcnJvciwgYnVmZmVyLnNsaWNlKGluZGV4LCBtYXRjaC5pbmRleCksIGluZGV4KVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl90b2tlbihncm91cCwgdGV4dCwgaW5kZXgpXG4gIH1cblxuICBMZXhlci5wcm90b3R5cGUuX3Rva2VuID0gZnVuY3Rpb24oZ3JvdXAsIHRleHQsIG9mZnNldCkge1xuICAgIC8vIGNvdW50IGxpbmUgYnJlYWtzXG4gICAgdmFyIGxpbmVCcmVha3MgPSAwXG4gICAgaWYgKGdyb3VwLmxpbmVCcmVha3MpIHtcbiAgICAgIHZhciBtYXRjaE5MID0gL1xcbi9nXG4gICAgICB2YXIgbmwgPSAxXG4gICAgICBpZiAodGV4dCA9PT0gJ1xcbicpIHtcbiAgICAgICAgbGluZUJyZWFrcyA9IDFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChtYXRjaE5MLmV4ZWModGV4dCkpIHsgbGluZUJyZWFrcysrOyBubCA9IG1hdGNoTkwubGFzdEluZGV4IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdG9rZW4gPSB7XG4gICAgICB0eXBlOiAodHlwZW9mIGdyb3VwLnR5cGUgPT09ICdmdW5jdGlvbicgJiYgZ3JvdXAudHlwZSh0ZXh0KSkgfHwgZ3JvdXAuZGVmYXVsdFR5cGUsXG4gICAgICB2YWx1ZTogdHlwZW9mIGdyb3VwLnZhbHVlID09PSAnZnVuY3Rpb24nID8gZ3JvdXAudmFsdWUodGV4dCkgOiB0ZXh0LFxuICAgICAgdGV4dDogdGV4dCxcbiAgICAgIHRvU3RyaW5nOiB0b2tlblRvU3RyaW5nLFxuICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICBsaW5lQnJlYWtzOiBsaW5lQnJlYWtzLFxuICAgICAgbGluZTogdGhpcy5saW5lLFxuICAgICAgY29sOiB0aGlzLmNvbCxcbiAgICB9XG4gICAgLy8gbmIuIGFkZGluZyBtb3JlIHByb3BzIHRvIHRva2VuIG9iamVjdCB3aWxsIG1ha2UgVjggc2FkIVxuXG4gICAgdmFyIHNpemUgPSB0ZXh0Lmxlbmd0aFxuICAgIHRoaXMuaW5kZXggKz0gc2l6ZVxuICAgIHRoaXMubGluZSArPSBsaW5lQnJlYWtzXG4gICAgaWYgKGxpbmVCcmVha3MgIT09IDApIHtcbiAgICAgIHRoaXMuY29sID0gc2l6ZSAtIG5sICsgMVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbCArPSBzaXplXG4gICAgfVxuXG4gICAgLy8gdGhyb3csIGlmIG5vIHJ1bGUgd2l0aCB7ZXJyb3I6IHRydWV9XG4gICAgaWYgKGdyb3VwLnNob3VsZFRocm93KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy5mb3JtYXRFcnJvcih0b2tlbiwgXCJpbnZhbGlkIHN5bnRheFwiKSlcbiAgICB9XG5cbiAgICBpZiAoZ3JvdXAucG9wKSB0aGlzLnBvcFN0YXRlKClcbiAgICBlbHNlIGlmIChncm91cC5wdXNoKSB0aGlzLnB1c2hTdGF0ZShncm91cC5wdXNoKVxuICAgIGVsc2UgaWYgKGdyb3VwLm5leHQpIHRoaXMuc2V0U3RhdGUoZ3JvdXAubmV4dClcblxuICAgIHJldHVybiB0b2tlblxuICB9XG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5pdGVyYXRvcikge1xuICAgIHZhciBMZXhlckl0ZXJhdG9yID0gZnVuY3Rpb24obGV4ZXIpIHtcbiAgICAgIHRoaXMubGV4ZXIgPSBsZXhlclxuICAgIH1cblxuICAgIExleGVySXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0b2tlbiA9IHRoaXMubGV4ZXIubmV4dCgpXG4gICAgICByZXR1cm4ge3ZhbHVlOiB0b2tlbiwgZG9uZTogIXRva2VufVxuICAgIH1cblxuICAgIExleGVySXRlcmF0b3IucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgTGV4ZXIucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgTGV4ZXJJdGVyYXRvcih0aGlzKVxuICAgIH1cbiAgfVxuXG4gIExleGVyLnByb3RvdHlwZS5mb3JtYXRFcnJvciA9IGZ1bmN0aW9uKHRva2VuLCBtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuID09IG51bGwpIHtcbiAgICAgIC8vIEFuIHVuZGVmaW5lZCB0b2tlbiBpbmRpY2F0ZXMgRU9GXG4gICAgICB2YXIgdGV4dCA9IHRoaXMuYnVmZmVyLnNsaWNlKHRoaXMuaW5kZXgpXG4gICAgICB2YXIgdG9rZW4gPSB7XG4gICAgICAgIHRleHQ6IHRleHQsXG4gICAgICAgIG9mZnNldDogdGhpcy5pbmRleCxcbiAgICAgICAgbGluZUJyZWFrczogdGV4dC5pbmRleE9mKCdcXG4nKSA9PT0gLTEgPyAwIDogMSxcbiAgICAgICAgbGluZTogdGhpcy5saW5lLFxuICAgICAgICBjb2w6IHRoaXMuY29sLFxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc3RhcnQgPSBNYXRoLm1heCgwLCB0b2tlbi5vZmZzZXQgLSB0b2tlbi5jb2wgKyAxKVxuICAgIHZhciBlb2wgPSB0b2tlbi5saW5lQnJlYWtzID8gdG9rZW4udGV4dC5pbmRleE9mKCdcXG4nKSA6IHRva2VuLnRleHQubGVuZ3RoXG4gICAgdmFyIGZpcnN0TGluZSA9IHRoaXMuYnVmZmVyLnN1YnN0cmluZyhzdGFydCwgdG9rZW4ub2Zmc2V0ICsgZW9sKVxuICAgIG1lc3NhZ2UgKz0gXCIgYXQgbGluZSBcIiArIHRva2VuLmxpbmUgKyBcIiBjb2wgXCIgKyB0b2tlbi5jb2wgKyBcIjpcXG5cXG5cIlxuICAgIG1lc3NhZ2UgKz0gXCIgIFwiICsgZmlyc3RMaW5lICsgXCJcXG5cIlxuICAgIG1lc3NhZ2UgKz0gXCIgIFwiICsgQXJyYXkodG9rZW4uY29sKS5qb2luKFwiIFwiKSArIFwiXlwiXG4gICAgcmV0dXJuIG1lc3NhZ2VcbiAgfVxuXG4gIExleGVyLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgTGV4ZXIodGhpcy5zdGF0ZXMsIHRoaXMuc3RhdGUpXG4gIH1cblxuICBMZXhlci5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24odG9rZW5UeXBlKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG5cbiAgcmV0dXJuIHtcbiAgICBjb21waWxlOiBjb21waWxlLFxuICAgIHN0YXRlczogY29tcGlsZVN0YXRlcyxcbiAgICBlcnJvcjogT2JqZWN0LmZyZWV6ZSh7ZXJyb3I6IHRydWV9KSxcbiAgICBmYWxsYmFjazogT2JqZWN0LmZyZWV6ZSh7ZmFsbGJhY2s6IHRydWV9KSxcbiAgICBrZXl3b3Jkczoga2V5d29yZFRyYW5zZm9ybSxcbiAgfVxuXG59KSk7XG4iLCIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290Lm5lYXJsZXkgPSBmYWN0b3J5KCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbigpIHtcblxuICAgIGZ1bmN0aW9uIFJ1bGUobmFtZSwgc3ltYm9scywgcG9zdHByb2Nlc3MpIHtcbiAgICAgICAgdGhpcy5pZCA9ICsrUnVsZS5oaWdoZXN0SWQ7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuc3ltYm9scyA9IHN5bWJvbHM7ICAgICAgICAvLyBhIGxpc3Qgb2YgbGl0ZXJhbCB8IHJlZ2V4IGNsYXNzIHwgbm9udGVybWluYWxcbiAgICAgICAgdGhpcy5wb3N0cHJvY2VzcyA9IHBvc3Rwcm9jZXNzO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgUnVsZS5oaWdoZXN0SWQgPSAwO1xuXG4gICAgUnVsZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbih3aXRoQ3Vyc29yQXQpIHtcbiAgICAgICAgdmFyIHN5bWJvbFNlcXVlbmNlID0gKHR5cGVvZiB3aXRoQ3Vyc29yQXQgPT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5zeW1ib2xzLm1hcChnZXRTeW1ib2xTaG9ydERpc3BsYXkpLmpvaW4oJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICggICB0aGlzLnN5bWJvbHMuc2xpY2UoMCwgd2l0aEN1cnNvckF0KS5tYXAoZ2V0U3ltYm9sU2hvcnREaXNwbGF5KS5qb2luKCcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCIg4pePIFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMuc3ltYm9scy5zbGljZSh3aXRoQ3Vyc29yQXQpLm1hcChnZXRTeW1ib2xTaG9ydERpc3BsYXkpLmpvaW4oJyAnKSAgICAgKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArIFwiIOKGkiBcIiArIHN5bWJvbFNlcXVlbmNlO1xuICAgIH1cblxuXG4gICAgLy8gYSBTdGF0ZSBpcyBhIHJ1bGUgYXQgYSBwb3NpdGlvbiBmcm9tIGEgZ2l2ZW4gc3RhcnRpbmcgcG9pbnQgaW4gdGhlIGlucHV0IHN0cmVhbSAocmVmZXJlbmNlKVxuICAgIGZ1bmN0aW9uIFN0YXRlKHJ1bGUsIGRvdCwgcmVmZXJlbmNlLCB3YW50ZWRCeSkge1xuICAgICAgICB0aGlzLnJ1bGUgPSBydWxlO1xuICAgICAgICB0aGlzLmRvdCA9IGRvdDtcbiAgICAgICAgdGhpcy5yZWZlcmVuY2UgPSByZWZlcmVuY2U7XG4gICAgICAgIHRoaXMuZGF0YSA9IFtdO1xuICAgICAgICB0aGlzLndhbnRlZEJ5ID0gd2FudGVkQnk7XG4gICAgICAgIHRoaXMuaXNDb21wbGV0ZSA9IHRoaXMuZG90ID09PSBydWxlLnN5bWJvbHMubGVuZ3RoO1xuICAgIH1cblxuICAgIFN0YXRlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gXCJ7XCIgKyB0aGlzLnJ1bGUudG9TdHJpbmcodGhpcy5kb3QpICsgXCJ9LCBmcm9tOiBcIiArICh0aGlzLnJlZmVyZW5jZSB8fCAwKTtcbiAgICB9O1xuXG4gICAgU3RhdGUucHJvdG90eXBlLm5leHRTdGF0ZSA9IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IG5ldyBTdGF0ZSh0aGlzLnJ1bGUsIHRoaXMuZG90ICsgMSwgdGhpcy5yZWZlcmVuY2UsIHRoaXMud2FudGVkQnkpO1xuICAgICAgICBzdGF0ZS5sZWZ0ID0gdGhpcztcbiAgICAgICAgc3RhdGUucmlnaHQgPSBjaGlsZDtcbiAgICAgICAgaWYgKHN0YXRlLmlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgIHN0YXRlLmRhdGEgPSBzdGF0ZS5idWlsZCgpO1xuICAgICAgICAgICAgLy8gSGF2aW5nIHJpZ2h0IHNldCBoZXJlIHdpbGwgcHJldmVudCB0aGUgcmlnaHQgc3RhdGUgYW5kIGl0cyBjaGlsZHJlblxuICAgICAgICAgICAgLy8gZm9ybSBiZWluZyBnYXJiYWdlIGNvbGxlY3RlZFxuICAgICAgICAgICAgc3RhdGUucmlnaHQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH07XG5cbiAgICBTdGF0ZS5wcm90b3R5cGUuYnVpbGQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XG4gICAgICAgIHZhciBub2RlID0gdGhpcztcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChub2RlLnJpZ2h0LmRhdGEpO1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUubGVmdDtcbiAgICAgICAgfSB3aGlsZSAobm9kZS5sZWZ0KTtcbiAgICAgICAgY2hpbGRyZW4ucmV2ZXJzZSgpO1xuICAgICAgICByZXR1cm4gY2hpbGRyZW47XG4gICAgfTtcblxuICAgIFN0YXRlLnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMucnVsZS5wb3N0cHJvY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5ydWxlLnBvc3Rwcm9jZXNzKHRoaXMuZGF0YSwgdGhpcy5yZWZlcmVuY2UsIFBhcnNlci5mYWlsKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIGZ1bmN0aW9uIENvbHVtbihncmFtbWFyLCBpbmRleCkge1xuICAgICAgICB0aGlzLmdyYW1tYXIgPSBncmFtbWFyO1xuICAgICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMuc3RhdGVzID0gW107XG4gICAgICAgIHRoaXMud2FudHMgPSB7fTsgLy8gc3RhdGVzIGluZGV4ZWQgYnkgdGhlIG5vbi10ZXJtaW5hbCB0aGV5IGV4cGVjdFxuICAgICAgICB0aGlzLnNjYW5uYWJsZSA9IFtdOyAvLyBsaXN0IG9mIHN0YXRlcyB0aGF0IGV4cGVjdCBhIHRva2VuXG4gICAgICAgIHRoaXMuY29tcGxldGVkID0ge307IC8vIHN0YXRlcyB0aGF0IGFyZSBudWxsYWJsZVxuICAgIH1cblxuXG4gICAgQ29sdW1uLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24obmV4dENvbHVtbikge1xuICAgICAgICB2YXIgc3RhdGVzID0gdGhpcy5zdGF0ZXM7XG4gICAgICAgIHZhciB3YW50cyA9IHRoaXMud2FudHM7XG4gICAgICAgIHZhciBjb21wbGV0ZWQgPSB0aGlzLmNvbXBsZXRlZDtcblxuICAgICAgICBmb3IgKHZhciB3ID0gMDsgdyA8IHN0YXRlcy5sZW5ndGg7IHcrKykgeyAvLyBuYi4gd2UgcHVzaCgpIGR1cmluZyBpdGVyYXRpb25cbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHN0YXRlc1t3XTtcblxuICAgICAgICAgICAgaWYgKHN0YXRlLmlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5maW5pc2goKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuZGF0YSAhPT0gUGFyc2VyLmZhaWwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdhbnRlZEJ5ID0gc3RhdGUud2FudGVkQnk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSB3YW50ZWRCeS5sZW5ndGg7IGktLTsgKSB7IC8vIHRoaXMgbGluZSBpcyBob3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsZWZ0ID0gd2FudGVkQnlbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXBsZXRlKGxlZnQsIHN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNwZWNpYWwtY2FzZSBudWxsYWJsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXRlLnJlZmVyZW5jZSA9PT0gdGhpcy5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIGZ1dHVyZSBwcmVkaWN0b3JzIG9mIHRoaXMgcnVsZSBnZXQgY29tcGxldGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV4cCA9IHN0YXRlLnJ1bGUubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLmNvbXBsZXRlZFtleHBdID0gdGhpcy5jb21wbGV0ZWRbZXhwXSB8fCBbXSkucHVzaChzdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gcXVldWUgc2Nhbm5hYmxlIHN0YXRlc1xuICAgICAgICAgICAgICAgIHZhciBleHAgPSBzdGF0ZS5ydWxlLnN5bWJvbHNbc3RhdGUuZG90XTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGV4cCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FubmFibGUucHVzaChzdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHByZWRpY3RcbiAgICAgICAgICAgICAgICBpZiAod2FudHNbZXhwXSkge1xuICAgICAgICAgICAgICAgICAgICB3YW50c1tleHBdLnB1c2goc3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWQuaGFzT3duUHJvcGVydHkoZXhwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bGxzID0gY29tcGxldGVkW2V4cF07XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJpZ2h0ID0gbnVsbHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wbGV0ZShzdGF0ZSwgcmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd2FudHNbZXhwXSA9IFtzdGF0ZV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJlZGljdChleHApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIENvbHVtbi5wcm90b3R5cGUucHJlZGljdCA9IGZ1bmN0aW9uKGV4cCkge1xuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLmdyYW1tYXIuYnlOYW1lW2V4cF0gfHwgW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHIgPSBydWxlc1tpXTtcbiAgICAgICAgICAgIHZhciB3YW50ZWRCeSA9IHRoaXMud2FudHNbZXhwXTtcbiAgICAgICAgICAgIHZhciBzID0gbmV3IFN0YXRlKHIsIDAsIHRoaXMuaW5kZXgsIHdhbnRlZEJ5KTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGVzLnB1c2gocyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBDb2x1bW4ucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgdmFyIGNvcHkgPSBsZWZ0Lm5leHRTdGF0ZShyaWdodCk7XG4gICAgICAgIHRoaXMuc3RhdGVzLnB1c2goY29weSk7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBHcmFtbWFyKHJ1bGVzLCBzdGFydCkge1xuICAgICAgICB0aGlzLnJ1bGVzID0gcnVsZXM7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydCB8fCB0aGlzLnJ1bGVzWzBdLm5hbWU7XG4gICAgICAgIHZhciBieU5hbWUgPSB0aGlzLmJ5TmFtZSA9IHt9O1xuICAgICAgICB0aGlzLnJ1bGVzLmZvckVhY2goZnVuY3Rpb24ocnVsZSkge1xuICAgICAgICAgICAgaWYgKCFieU5hbWUuaGFzT3duUHJvcGVydHkocnVsZS5uYW1lKSkge1xuICAgICAgICAgICAgICAgIGJ5TmFtZVtydWxlLm5hbWVdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBieU5hbWVbcnVsZS5uYW1lXS5wdXNoKHJ1bGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTbyB3ZSBjYW4gYWxsb3cgcGFzc2luZyAocnVsZXMsIHN0YXJ0KSBkaXJlY3RseSB0byBQYXJzZXIgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgR3JhbW1hci5mcm9tQ29tcGlsZWQgPSBmdW5jdGlvbihydWxlcywgc3RhcnQpIHtcbiAgICAgICAgdmFyIGxleGVyID0gcnVsZXMuTGV4ZXI7XG4gICAgICAgIGlmIChydWxlcy5QYXJzZXJTdGFydCkge1xuICAgICAgICAgIHN0YXJ0ID0gcnVsZXMuUGFyc2VyU3RhcnQ7XG4gICAgICAgICAgcnVsZXMgPSBydWxlcy5QYXJzZXJSdWxlcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSBydWxlcy5tYXAoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIChuZXcgUnVsZShyLm5hbWUsIHIuc3ltYm9scywgci5wb3N0cHJvY2VzcykpOyB9KTtcbiAgICAgICAgdmFyIGcgPSBuZXcgR3JhbW1hcihydWxlcywgc3RhcnQpO1xuICAgICAgICBnLmxleGVyID0gbGV4ZXI7IC8vIG5iLiBzdG9yaW5nIGxleGVyIG9uIEdyYW1tYXIgaXMgaWZmeSwgYnV0IHVuYXZvaWRhYmxlXG4gICAgICAgIHJldHVybiBnO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gU3RyZWFtTGV4ZXIoKSB7XG4gICAgICB0aGlzLnJlc2V0KFwiXCIpO1xuICAgIH1cblxuICAgIFN0cmVhbUxleGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKGRhdGEsIHN0YXRlKSB7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gZGF0YTtcbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICAgIHRoaXMubGluZSA9IHN0YXRlID8gc3RhdGUubGluZSA6IDE7XG4gICAgICAgIHRoaXMubGFzdExpbmVCcmVhayA9IHN0YXRlID8gLXN0YXRlLmNvbCA6IDA7XG4gICAgfVxuXG4gICAgU3RyZWFtTGV4ZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggPCB0aGlzLmJ1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBjaCA9IHRoaXMuYnVmZmVyW3RoaXMuaW5kZXgrK107XG4gICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgIHRoaXMubGluZSArPSAxO1xuICAgICAgICAgICAgICB0aGlzLmxhc3RMaW5lQnJlYWsgPSB0aGlzLmluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHt2YWx1ZTogY2h9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgU3RyZWFtTGV4ZXIucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxpbmU6IHRoaXMubGluZSxcbiAgICAgICAgY29sOiB0aGlzLmluZGV4IC0gdGhpcy5sYXN0TGluZUJyZWFrLFxuICAgICAgfVxuICAgIH1cblxuICAgIFN0cmVhbUxleGVyLnByb3RvdHlwZS5mb3JtYXRFcnJvciA9IGZ1bmN0aW9uKHRva2VuLCBtZXNzYWdlKSB7XG4gICAgICAgIC8vIG5iLiB0aGlzIGdldHMgY2FsbGVkIGFmdGVyIGNvbnN1bWluZyB0aGUgb2ZmZW5kaW5nIHRva2VuLFxuICAgICAgICAvLyBzbyB0aGUgY3VscHJpdCBpcyBpbmRleC0xXG4gICAgICAgIHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgaWYgKHR5cGVvZiBidWZmZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YXIgbGluZXMgPSBidWZmZXJcbiAgICAgICAgICAgICAgICAuc3BsaXQoXCJcXG5cIilcbiAgICAgICAgICAgICAgICAuc2xpY2UoXG4gICAgICAgICAgICAgICAgICAgIE1hdGgubWF4KDAsIHRoaXMubGluZSAtIDUpLCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5lXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdmFyIG5leHRMaW5lQnJlYWsgPSBidWZmZXIuaW5kZXhPZignXFxuJywgdGhpcy5pbmRleCk7XG4gICAgICAgICAgICBpZiAobmV4dExpbmVCcmVhayA9PT0gLTEpIG5leHRMaW5lQnJlYWsgPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGNvbCA9IHRoaXMuaW5kZXggLSB0aGlzLmxhc3RMaW5lQnJlYWs7XG4gICAgICAgICAgICB2YXIgbGFzdExpbmVEaWdpdHMgPSBTdHJpbmcodGhpcy5saW5lKS5sZW5ndGg7XG4gICAgICAgICAgICBtZXNzYWdlICs9IFwiIGF0IGxpbmUgXCIgKyB0aGlzLmxpbmUgKyBcIiBjb2wgXCIgKyBjb2wgKyBcIjpcXG5cXG5cIjtcbiAgICAgICAgICAgIG1lc3NhZ2UgKz0gbGluZXNcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGxpbmUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZCh0aGlzLmxpbmUgLSBsaW5lcy5sZW5ndGggKyBpICsgMSwgbGFzdExpbmVEaWdpdHMpICsgXCIgXCIgKyBsaW5lO1xuICAgICAgICAgICAgICAgIH0sIHRoaXMpXG4gICAgICAgICAgICAgICAgLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgICBtZXNzYWdlICs9IFwiXFxuXCIgKyBwYWQoXCJcIiwgbGFzdExpbmVEaWdpdHMgKyBjb2wpICsgXCJeXFxuXCI7XG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlICsgXCIgYXQgaW5kZXggXCIgKyAodGhpcy5pbmRleCAtIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcGFkKG4sIGxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHMgPSBTdHJpbmcobik7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkobGVuZ3RoIC0gcy5sZW5ndGggKyAxKS5qb2luKFwiIFwiKSArIHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBQYXJzZXIocnVsZXMsIHN0YXJ0LCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChydWxlcyBpbnN0YW5jZW9mIEdyYW1tYXIpIHtcbiAgICAgICAgICAgIHZhciBncmFtbWFyID0gcnVsZXM7XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHN0YXJ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGdyYW1tYXIgPSBHcmFtbWFyLmZyb21Db21waWxlZChydWxlcywgc3RhcnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JhbW1hciA9IGdyYW1tYXI7XG5cbiAgICAgICAgLy8gUmVhZCBvcHRpb25zXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGtlZXBIaXN0b3J5OiBmYWxzZSxcbiAgICAgICAgICAgIGxleGVyOiBncmFtbWFyLmxleGVyIHx8IG5ldyBTdHJlYW1MZXhlcixcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIChvcHRpb25zIHx8IHt9KSkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXR1cCBsZXhlclxuICAgICAgICB0aGlzLmxleGVyID0gdGhpcy5vcHRpb25zLmxleGVyO1xuICAgICAgICB0aGlzLmxleGVyU3RhdGUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gU2V0dXAgYSB0YWJsZVxuICAgICAgICB2YXIgY29sdW1uID0gbmV3IENvbHVtbihncmFtbWFyLCAwKTtcbiAgICAgICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZSA9IFtjb2x1bW5dO1xuXG4gICAgICAgIC8vIEkgY291bGQgYmUgZXhwZWN0aW5nIGFueXRoaW5nLlxuICAgICAgICBjb2x1bW4ud2FudHNbZ3JhbW1hci5zdGFydF0gPSBbXTtcbiAgICAgICAgY29sdW1uLnByZWRpY3QoZ3JhbW1hci5zdGFydCk7XG4gICAgICAgIC8vIFRPRE8gd2hhdCBpZiBzdGFydCBydWxlIGlzIG51bGxhYmxlP1xuICAgICAgICBjb2x1bW4ucHJvY2VzcygpO1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSAwOyAvLyB0b2tlbiBpbmRleFxuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBhIHJlc2VydmVkIHRva2VuIGZvciBpbmRpY2F0aW5nIGEgcGFyc2UgZmFpbFxuICAgIFBhcnNlci5mYWlsID0ge307XG5cbiAgICBQYXJzZXIucHJvdG90eXBlLmZlZWQgPSBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICB2YXIgbGV4ZXIgPSB0aGlzLmxleGVyO1xuICAgICAgICBsZXhlci5yZXNldChjaHVuaywgdGhpcy5sZXhlclN0YXRlKTtcblxuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRva2VuID0gbGV4ZXIubmV4dCgpO1xuICAgICAgICAgICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgbmV4dCBjb2x1bW4gc28gdGhhdCB0aGUgZXJyb3IgcmVwb3J0ZXJcbiAgICAgICAgICAgICAgICAvLyBjYW4gZGlzcGxheSB0aGUgY29ycmVjdGx5IHByZWRpY3RlZCBzdGF0ZXMuXG4gICAgICAgICAgICAgICAgdmFyIG5leHRDb2x1bW4gPSBuZXcgQ29sdW1uKHRoaXMuZ3JhbW1hciwgdGhpcy5jdXJyZW50ICsgMSk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5wdXNoKG5leHRDb2x1bW4pO1xuICAgICAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IodGhpcy5yZXBvcnRMZXhlckVycm9yKGUpKTtcbiAgICAgICAgICAgICAgICBlcnIub2Zmc2V0ID0gdGhpcy5jdXJyZW50O1xuICAgICAgICAgICAgICAgIGVyci50b2tlbiA9IGUudG9rZW47XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2UgYWRkIG5ldyBzdGF0ZXMgdG8gdGFibGVbY3VycmVudCsxXVxuICAgICAgICAgICAgdmFyIGNvbHVtbiA9IHRoaXMudGFibGVbdGhpcy5jdXJyZW50XTtcblxuICAgICAgICAgICAgLy8gR0MgdW51c2VkIHN0YXRlc1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMua2VlcEhpc3RvcnkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy50YWJsZVt0aGlzLmN1cnJlbnQgLSAxXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG4gPSB0aGlzLmN1cnJlbnQgKyAxO1xuICAgICAgICAgICAgdmFyIG5leHRDb2x1bW4gPSBuZXcgQ29sdW1uKHRoaXMuZ3JhbW1hciwgbik7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnB1c2gobmV4dENvbHVtbik7XG5cbiAgICAgICAgICAgIC8vIEFkdmFuY2UgYWxsIHRva2VucyB0aGF0IGV4cGVjdCB0aGUgc3ltYm9sXG4gICAgICAgICAgICB2YXIgbGl0ZXJhbCA9IHRva2VuLnRleHQgIT09IHVuZGVmaW5lZCA/IHRva2VuLnRleHQgOiB0b2tlbi52YWx1ZTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGxleGVyLmNvbnN0cnVjdG9yID09PSBTdHJlYW1MZXhlciA/IHRva2VuLnZhbHVlIDogdG9rZW47XG4gICAgICAgICAgICB2YXIgc2Nhbm5hYmxlID0gY29sdW1uLnNjYW5uYWJsZTtcbiAgICAgICAgICAgIGZvciAodmFyIHcgPSBzY2FubmFibGUubGVuZ3RoOyB3LS07ICkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHNjYW5uYWJsZVt3XTtcbiAgICAgICAgICAgICAgICB2YXIgZXhwZWN0ID0gc3RhdGUucnVsZS5zeW1ib2xzW3N0YXRlLmRvdF07XG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGNvbnN1bWUgdGhlIHRva2VuXG4gICAgICAgICAgICAgICAgLy8gZWl0aGVyIHJlZ2V4IG9yIGxpdGVyYWxcbiAgICAgICAgICAgICAgICBpZiAoZXhwZWN0LnRlc3QgPyBleHBlY3QudGVzdCh2YWx1ZSkgOlxuICAgICAgICAgICAgICAgICAgICBleHBlY3QudHlwZSA/IGV4cGVjdC50eXBlID09PSB0b2tlbi50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogZXhwZWN0LmxpdGVyYWwgPT09IGxpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGl0XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gc3RhdGUubmV4dFN0YXRlKHtkYXRhOiB2YWx1ZSwgdG9rZW46IHRva2VuLCBpc1Rva2VuOiB0cnVlLCByZWZlcmVuY2U6IG4gLSAxfSk7XG4gICAgICAgICAgICAgICAgICAgIG5leHRDb2x1bW4uc3RhdGVzLnB1c2gobmV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOZXh0LCBmb3IgZWFjaCBvZiB0aGUgcnVsZXMsIHdlIGVpdGhlclxuICAgICAgICAgICAgLy8gKGEpIGNvbXBsZXRlIGl0LCBhbmQgdHJ5IHRvIHNlZSBpZiB0aGUgcmVmZXJlbmNlIHJvdyBleHBlY3RlZCB0aGF0XG4gICAgICAgICAgICAvLyAgICAgcnVsZVxuICAgICAgICAgICAgLy8gKGIpIHByZWRpY3QgdGhlIG5leHQgbm9udGVybWluYWwgaXQgZXhwZWN0cyBieSBhZGRpbmcgdGhhdFxuICAgICAgICAgICAgLy8gICAgIG5vbnRlcm1pbmFsJ3Mgc3RhcnQgc3RhdGVcbiAgICAgICAgICAgIC8vIFRvIHByZXZlbnQgZHVwbGljYXRpb24sIHdlIGFsc28ga2VlcCB0cmFjayBvZiBydWxlcyB3ZSBoYXZlIGFscmVhZHlcbiAgICAgICAgICAgIC8vIGFkZGVkXG5cbiAgICAgICAgICAgIG5leHRDb2x1bW4ucHJvY2VzcygpO1xuXG4gICAgICAgICAgICAvLyBJZiBuZWVkZWQsIHRocm93IGFuIGVycm9yOlxuICAgICAgICAgICAgaWYgKG5leHRDb2x1bW4uc3RhdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIE5vIHN0YXRlcyBhdCBhbGwhIFRoaXMgaXMgbm90IGdvb2QuXG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcih0aGlzLnJlcG9ydEVycm9yKHRva2VuKSk7XG4gICAgICAgICAgICAgICAgZXJyLm9mZnNldCA9IHRoaXMuY3VycmVudDtcbiAgICAgICAgICAgICAgICBlcnIudG9rZW4gPSB0b2tlbjtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG1heWJlIHNhdmUgbGV4ZXIgc3RhdGVcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMua2VlcEhpc3RvcnkpIHtcbiAgICAgICAgICAgICAgY29sdW1uLmxleGVyU3RhdGUgPSBsZXhlci5zYXZlKClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbHVtbikge1xuICAgICAgICAgIHRoaXMubGV4ZXJTdGF0ZSA9IGxleGVyLnNhdmUoKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5jcmVtZW50YWxseSBrZWVwIHRyYWNrIG9mIHJlc3VsdHNcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gdGhpcy5maW5pc2goKTtcblxuICAgICAgICAvLyBBbGxvdyBjaGFpbmluZywgZm9yIHdoYXRldmVyIGl0J3Mgd29ydGhcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIFBhcnNlci5wcm90b3R5cGUucmVwb3J0TGV4ZXJFcnJvciA9IGZ1bmN0aW9uKGxleGVyRXJyb3IpIHtcbiAgICAgICAgdmFyIHRva2VuRGlzcGxheSwgbGV4ZXJNZXNzYWdlO1xuICAgICAgICAvLyBQbGFubmluZyB0byBhZGQgYSB0b2tlbiBwcm9wZXJ0eSB0byBtb28ncyB0aHJvd24gZXJyb3JcbiAgICAgICAgLy8gZXZlbiBvbiBlcnJvcmluZyB0b2tlbnMgdG8gYmUgdXNlZCBpbiBlcnJvciBkaXNwbGF5IGJlbG93XG4gICAgICAgIHZhciB0b2tlbiA9IGxleGVyRXJyb3IudG9rZW47XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgICAgdG9rZW5EaXNwbGF5ID0gXCJpbnB1dCBcIiArIEpTT04uc3RyaW5naWZ5KHRva2VuLnRleHRbMF0pICsgXCIgKGxleGVyIGVycm9yKVwiO1xuICAgICAgICAgICAgbGV4ZXJNZXNzYWdlID0gdGhpcy5sZXhlci5mb3JtYXRFcnJvcih0b2tlbiwgXCJTeW50YXggZXJyb3JcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b2tlbkRpc3BsYXkgPSBcImlucHV0IChsZXhlciBlcnJvcilcIjtcbiAgICAgICAgICAgIGxleGVyTWVzc2FnZSA9IGxleGVyRXJyb3IubWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yZXBvcnRFcnJvckNvbW1vbihsZXhlck1lc3NhZ2UsIHRva2VuRGlzcGxheSk7XG4gICAgfTtcblxuICAgIFBhcnNlci5wcm90b3R5cGUucmVwb3J0RXJyb3IgPSBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICB2YXIgdG9rZW5EaXNwbGF5ID0gKHRva2VuLnR5cGUgPyB0b2tlbi50eXBlICsgXCIgdG9rZW46IFwiIDogXCJcIikgKyBKU09OLnN0cmluZ2lmeSh0b2tlbi52YWx1ZSAhPT0gdW5kZWZpbmVkID8gdG9rZW4udmFsdWUgOiB0b2tlbik7XG4gICAgICAgIHZhciBsZXhlck1lc3NhZ2UgPSB0aGlzLmxleGVyLmZvcm1hdEVycm9yKHRva2VuLCBcIlN5bnRheCBlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3JDb21tb24obGV4ZXJNZXNzYWdlLCB0b2tlbkRpc3BsYXkpO1xuICAgIH07XG5cbiAgICBQYXJzZXIucHJvdG90eXBlLnJlcG9ydEVycm9yQ29tbW9uID0gZnVuY3Rpb24obGV4ZXJNZXNzYWdlLCB0b2tlbkRpc3BsYXkpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gW107XG4gICAgICAgIGxpbmVzLnB1c2gobGV4ZXJNZXNzYWdlKTtcbiAgICAgICAgdmFyIGxhc3RDb2x1bW5JbmRleCA9IHRoaXMudGFibGUubGVuZ3RoIC0gMjtcbiAgICAgICAgdmFyIGxhc3RDb2x1bW4gPSB0aGlzLnRhYmxlW2xhc3RDb2x1bW5JbmRleF07XG4gICAgICAgIHZhciBleHBlY3RhbnRTdGF0ZXMgPSBsYXN0Q29sdW1uLnN0YXRlc1xuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0U3ltYm9sID0gc3RhdGUucnVsZS5zeW1ib2xzW3N0YXRlLmRvdF07XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHRTeW1ib2wgJiYgdHlwZW9mIG5leHRTeW1ib2wgIT09IFwic3RyaW5nXCI7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZXhwZWN0YW50U3RhdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbGluZXMucHVzaCgnVW5leHBlY3RlZCAnICsgdG9rZW5EaXNwbGF5ICsgJy4gSSBkaWQgbm90IGV4cGVjdCBhbnkgbW9yZSBpbnB1dC4gSGVyZSBpcyB0aGUgc3RhdGUgb2YgbXkgcGFyc2UgdGFibGU6XFxuJyk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlTdGF0ZVN0YWNrKGxhc3RDb2x1bW4uc3RhdGVzLCBsaW5lcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCdVbmV4cGVjdGVkICcgKyB0b2tlbkRpc3BsYXkgKyAnLiBJbnN0ZWFkLCBJIHdhcyBleHBlY3RpbmcgdG8gc2VlIG9uZSBvZiB0aGUgZm9sbG93aW5nOlxcbicpO1xuICAgICAgICAgICAgLy8gRGlzcGxheSBhIFwic3RhdGUgc3RhY2tcIiBmb3IgZWFjaCBleHBlY3RhbnQgc3RhdGVcbiAgICAgICAgICAgIC8vIC0gd2hpY2ggc2hvd3MgeW91IGhvdyB0aGlzIHN0YXRlIGNhbWUgdG8gYmUsIHN0ZXAgYnkgc3RlcC5cbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgZGVyaXZhdGlvbiwgd2Ugb25seSBkaXNwbGF5IHRoZSBmaXJzdCBvbmUuXG4gICAgICAgICAgICB2YXIgc3RhdGVTdGFja3MgPSBleHBlY3RhbnRTdGF0ZXNcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1aWxkRmlyc3RTdGF0ZVN0YWNrKHN0YXRlLCBbXSkgfHwgW3N0YXRlXTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIC8vIERpc3BsYXkgZWFjaCBzdGF0ZSB0aGF0IGlzIGV4cGVjdGluZyBhIHRlcm1pbmFsIHN5bWJvbCBuZXh0LlxuICAgICAgICAgICAgc3RhdGVTdGFja3MuZm9yRWFjaChmdW5jdGlvbihzdGF0ZVN0YWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gc3RhdGVTdGFja1swXTtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFN5bWJvbCA9IHN0YXRlLnJ1bGUuc3ltYm9sc1tzdGF0ZS5kb3RdO1xuICAgICAgICAgICAgICAgIHZhciBzeW1ib2xEaXNwbGF5ID0gdGhpcy5nZXRTeW1ib2xEaXNwbGF5KG5leHRTeW1ib2wpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJ0EgJyArIHN5bWJvbERpc3BsYXkgKyAnIGJhc2VkIG9uOicpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVN0YXRlU3RhY2soc3RhdGVTdGFjaywgbGluZXMpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuICAgIFxuICAgIFBhcnNlci5wcm90b3R5cGUuZGlzcGxheVN0YXRlU3RhY2sgPSBmdW5jdGlvbihzdGF0ZVN0YWNrLCBsaW5lcykge1xuICAgICAgICB2YXIgbGFzdERpc3BsYXk7XG4gICAgICAgIHZhciBzYW1lRGlzcGxheUNvdW50ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdGF0ZVN0YWNrLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBzdGF0ZVN0YWNrW2pdO1xuICAgICAgICAgICAgdmFyIGRpc3BsYXkgPSBzdGF0ZS5ydWxlLnRvU3RyaW5nKHN0YXRlLmRvdCk7XG4gICAgICAgICAgICBpZiAoZGlzcGxheSA9PT0gbGFzdERpc3BsYXkpIHtcbiAgICAgICAgICAgICAgICBzYW1lRGlzcGxheUNvdW50Kys7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzYW1lRGlzcGxheUNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcgICAgXiAnICsgc2FtZURpc3BsYXlDb3VudCArICcgbW9yZSBsaW5lcyBpZGVudGljYWwgdG8gdGhpcycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzYW1lRGlzcGxheUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcgICAgJyArIGRpc3BsYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdERpc3BsYXkgPSBkaXNwbGF5O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFBhcnNlci5wcm90b3R5cGUuZ2V0U3ltYm9sRGlzcGxheSA9IGZ1bmN0aW9uKHN5bWJvbCkge1xuICAgICAgICByZXR1cm4gZ2V0U3ltYm9sTG9uZ0Rpc3BsYXkoc3ltYm9sKTtcbiAgICB9O1xuXG4gICAgLypcbiAgICBCdWlsZHMgYSB0aGUgZmlyc3Qgc3RhdGUgc3RhY2suIFlvdSBjYW4gdGhpbmsgb2YgYSBzdGF0ZSBzdGFjayBhcyB0aGUgY2FsbCBzdGFja1xuICAgIG9mIHRoZSByZWN1cnNpdmUtZGVzY2VudCBwYXJzZXIgd2hpY2ggdGhlIE5lYXJsZXkgcGFyc2UgYWxnb3JpdGhtIHNpbXVsYXRlcy5cbiAgICBBIHN0YXRlIHN0YWNrIGlzIHJlcHJlc2VudGVkIGFzIGFuIGFycmF5IG9mIHN0YXRlIG9iamVjdHMuIFdpdGhpbiBhXG4gICAgc3RhdGUgc3RhY2ssIHRoZSBmaXJzdCBpdGVtIG9mIHRoZSBhcnJheSB3aWxsIGJlIHRoZSBzdGFydGluZ1xuICAgIHN0YXRlLCB3aXRoIGVhY2ggc3VjY2Vzc2l2ZSBpdGVtIGluIHRoZSBhcnJheSBnb2luZyBmdXJ0aGVyIGJhY2sgaW50byBoaXN0b3J5LlxuXG4gICAgVGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSBnaXZlbiBhIHN0YXJ0aW5nIHN0YXRlIGFuZCBhbiBlbXB0eSBhcnJheSByZXByZXNlbnRpbmdcbiAgICB0aGUgdmlzaXRlZCBzdGF0ZXMsIGFuZCBpdCByZXR1cm5zIGFuIHNpbmdsZSBzdGF0ZSBzdGFjay5cblxuICAgICovXG4gICAgUGFyc2VyLnByb3RvdHlwZS5idWlsZEZpcnN0U3RhdGVTdGFjayA9IGZ1bmN0aW9uKHN0YXRlLCB2aXNpdGVkKSB7XG4gICAgICAgIGlmICh2aXNpdGVkLmluZGV4T2Yoc3RhdGUpICE9PSAtMSkge1xuICAgICAgICAgICAgLy8gRm91bmQgY3ljbGUsIHJldHVybiBudWxsXG4gICAgICAgICAgICAvLyB0byBlbGltaW5hdGUgdGhpcyBwYXRoIGZyb20gdGhlIHJlc3VsdHMsIGJlY2F1c2VcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IGtub3cgaG93IHRvIGRpc3BsYXkgaXQgbWVhbmluZ2Z1bGx5XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUud2FudGVkQnkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3N0YXRlXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJldlN0YXRlID0gc3RhdGUud2FudGVkQnlbMF07XG4gICAgICAgIHZhciBjaGlsZFZpc2l0ZWQgPSBbc3RhdGVdLmNvbmNhdCh2aXNpdGVkKTtcbiAgICAgICAgdmFyIGNoaWxkUmVzdWx0ID0gdGhpcy5idWlsZEZpcnN0U3RhdGVTdGFjayhwcmV2U3RhdGUsIGNoaWxkVmlzaXRlZCk7XG4gICAgICAgIGlmIChjaGlsZFJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzdGF0ZV0uY29uY2F0KGNoaWxkUmVzdWx0KTtcbiAgICB9O1xuXG4gICAgUGFyc2VyLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb2x1bW4gPSB0aGlzLnRhYmxlW3RoaXMuY3VycmVudF07XG4gICAgICAgIGNvbHVtbi5sZXhlclN0YXRlID0gdGhpcy5sZXhlclN0YXRlO1xuICAgICAgICByZXR1cm4gY29sdW1uO1xuICAgIH07XG5cbiAgICBQYXJzZXIucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgdmFyIGluZGV4ID0gY29sdW1uLmluZGV4O1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBpbmRleDtcbiAgICAgICAgdGhpcy50YWJsZVtpbmRleF0gPSBjb2x1bW47XG4gICAgICAgIHRoaXMudGFibGUuc3BsaWNlKGluZGV4ICsgMSk7XG4gICAgICAgIHRoaXMubGV4ZXJTdGF0ZSA9IGNvbHVtbi5sZXhlclN0YXRlO1xuXG4gICAgICAgIC8vIEluY3JlbWVudGFsbHkga2VlcCB0cmFjayBvZiByZXN1bHRzXG4gICAgICAgIHRoaXMucmVzdWx0cyA9IHRoaXMuZmluaXNoKCk7XG4gICAgfTtcblxuICAgIC8vIG5iLiBkZXByZWNhdGVkOiB1c2Ugc2F2ZS9yZXN0b3JlIGluc3RlYWQhXG4gICAgUGFyc2VyLnByb3RvdHlwZS5yZXdpbmQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5rZWVwSGlzdG9yeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXQgb3B0aW9uIGBrZWVwSGlzdG9yeWAgdG8gZW5hYmxlIHJld2luZGluZycpXG4gICAgICAgIH1cbiAgICAgICAgLy8gbmIuIHJlY2FsbCBjb2x1bW4gKHRhYmxlKSBpbmRpY2llcyBmYWxsIGJldHdlZW4gdG9rZW4gaW5kaWNpZXMuXG4gICAgICAgIC8vICAgICAgICBjb2wgMCAgIC0tICAgdG9rZW4gMCAgIC0tICAgY29sIDFcbiAgICAgICAgdGhpcy5yZXN0b3JlKHRoaXMudGFibGVbaW5kZXhdKTtcbiAgICB9O1xuXG4gICAgUGFyc2VyLnByb3RvdHlwZS5maW5pc2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBwb3NzaWJsZSBwYXJzaW5nc1xuICAgICAgICB2YXIgY29uc2lkZXJhdGlvbnMgPSBbXTtcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5ncmFtbWFyLnN0YXJ0O1xuICAgICAgICB2YXIgY29sdW1uID0gdGhpcy50YWJsZVt0aGlzLnRhYmxlLmxlbmd0aCAtIDFdXG4gICAgICAgIGNvbHVtbi5zdGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgaWYgKHQucnVsZS5uYW1lID09PSBzdGFydFxuICAgICAgICAgICAgICAgICAgICAmJiB0LmRvdCA9PT0gdC5ydWxlLnN5bWJvbHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICYmIHQucmVmZXJlbmNlID09PSAwXG4gICAgICAgICAgICAgICAgICAgICYmIHQuZGF0YSAhPT0gUGFyc2VyLmZhaWwpIHtcbiAgICAgICAgICAgICAgICBjb25zaWRlcmF0aW9ucy5wdXNoKHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNvbnNpZGVyYXRpb25zLm1hcChmdW5jdGlvbihjKSB7cmV0dXJuIGMuZGF0YTsgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldFN5bWJvbExvbmdEaXNwbGF5KHN5bWJvbCkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBzeW1ib2w7XG4gICAgICAgIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gc3ltYm9sO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGlmIChzeW1ib2wubGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzeW1ib2wubGl0ZXJhbCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN5bWJvbCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnY2hhcmFjdGVyIG1hdGNoaW5nICcgKyBzeW1ib2w7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN5bWJvbC50eXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN5bWJvbC50eXBlICsgJyB0b2tlbic7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN5bWJvbC50ZXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0b2tlbiBtYXRjaGluZyAnICsgU3RyaW5nKHN5bWJvbC50ZXN0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHN5bWJvbCB0eXBlOiAnICsgc3ltYm9sKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFN5bWJvbFNob3J0RGlzcGxheShzeW1ib2wpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ltYm9sO1xuICAgICAgICBpZiAodHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBpZiAoc3ltYm9sLmxpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc3ltYm9sLmxpdGVyYWwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzeW1ib2wgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ltYm9sLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN5bWJvbC50eXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICclJyArIHN5bWJvbC50eXBlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzeW1ib2wudGVzdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnPCcgKyBTdHJpbmcoc3ltYm9sLnRlc3QpICsgJz4nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gc3ltYm9sIHR5cGU6ICcgKyBzeW1ib2wpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgUGFyc2VyOiBQYXJzZXIsXG4gICAgICAgIEdyYW1tYXI6IEdyYW1tYXIsXG4gICAgICAgIFJ1bGU6IFJ1bGUsXG4gICAgfTtcblxufSkpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIlxyXG4vLyBjcmVhdGVkIGJ5IEp1c3RpbiBGZXJuYWxkXHJcblxyXG5jb25zdCBuZWFybGV5ID0gcmVxdWlyZShcIm5lYXJsZXlcIik7XHJcbmNvbnN0IGdyYW1tYXIgPSByZXF1aXJlKFwiLi4vZGlzdC9ncmFtbWFyXCIpO1xyXG5cclxuY29uc3QgcGFyc2VyID0gbmV3IG5lYXJsZXkuUGFyc2VyKG5lYXJsZXkuR3JhbW1hci5mcm9tQ29tcGlsZWQoZ3JhbW1hcikpO1xyXG5jb25zdCBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5wdXRcIikudmFsdWU7XHJcblxyXG5wYXJzZXIuZmVlZChpbnB1dCk7XHJcbmNvbnN0IGFzdCA9IEpTT04uc3RyaW5naWZ5KHBhcnNlci5yZXN1bHRzWzBdLCBudWxsLCAxKTtcclxuXHJcbmNvbnN0IGFkZEFTVEluZGV4ID0gKG5vZGUsIGluZGV4ID0gWzBdKSA9PiB7XHJcbiAgICBub2RlLmluZGV4ID0gaW5kZXg7XHJcbiAgICBpZiAobm9kZS5wYXJ0cykge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5wYXJ0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBhZGRBU1RJbmRleChub2RlLnBhcnRzW2ldLCBbLi4uaW5kZXgsIGldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmFkZEFTVEluZGV4KGFzdCk7XHJcblxyXG5jb25zb2xlLmZ1bGwgPSAoLi4uYXJncykgPT4gY29uc29sZS5kaXIoLi4uYXJncywgeyBkZXB0aDogbnVsbCB9KTtcclxuXHJcbmNvbnN0IHNjb3BlID0ge1xyXG4gICAgbmFtZTogXCJnbG9iYWxcIixcclxuICAgIHN5bWJvbHM6IFtcclxuICAgICAgICB7IHR5cGU6IFwiaW50XCIsIG5hbWU6IFwiaW5wdXRcIiwgZnVuY3Rpb246IHRydWUsIHNjb3BlOiB7IHN5bWJvbHM6IFtdIH0gfSxcclxuICAgICAgICB7IHR5cGU6IFwidm9pZFwiLCBuYW1lOiBcIm91dHB1dFwiLCBmdW5jdGlvbjogdHJ1ZSwgc2NvcGU6IHsgc3ltYm9sczogW3sgdHlwZTogXCJpbnRcIiwgbmFtZTogXCJ4XCIgfV0gfSB9LFxyXG4gICAgXSxcclxuICAgIHNjb3BlczogW10sXHJcbn07XHJcblxyXG5sZXQgc2NvcGVQYXRoID0gW3Njb3BlXTtcclxuY29uc3QgY3VycmVudFNjb3BlID0gKCkgPT4gc2NvcGVQYXRoW3Njb3BlUGF0aC5sZW5ndGggLSAxXTtcclxuXHJcbmxldCBjdXJyZW50TWVtb3J5TG9jYXRpb24gPSAwO1xyXG5cclxuY29uc3QgZmluZFN5bWJvbCA9IChpZCwgc2NvcGVzID0gc2NvcGVQYXRoKSA9PiBzY29wZXMubGVuZ3RoID8gc2NvcGVzW3Njb3Blcy5sZW5ndGggLSAxXS5zeW1ib2xzLmZpbmQoc3ltYm9sID0+IHN5bWJvbC5uYW1lID09PSBpZCkgfHwgZmluZFN5bWJvbChpZCwgc2NvcGVzLnNsaWNlKDAsIC0xKSkgOiB1bmRlZmluZWQ7XHJcblxyXG5jb25zdCBmaW5kU2NvcGVGcm9tU3ltYm9sID0gKGlkLCBzY29wZXMgPSBzY29wZVBhdGgpID0+IHNjb3Blcy5sZW5ndGggPyBzY29wZXNbc2NvcGVzLmxlbmd0aCAtIDFdLnN5bWJvbHMuZmluZChzeW1ib2wgPT4gc3ltYm9sLm5hbWUgPT09IGlkKSA/IHNjb3Blc1tzY29wZXMubGVuZ3RoIC0gMV0gOiBmaW5kU2NvcGVGcm9tU3ltYm9sKGlkLCBzY29wZXMuc2xpY2UoMCwgLTEpKSA6IHVuZGVmaW5lZDtcclxuXHJcbmNvbnN0IGZpbmRGdW5jdGlvblN5bWJvbCA9IChzY29wZXMgPSBzY29wZVBhdGgpID0+IHNjb3Blcy5sZW5ndGggPyBzY29wZXNbc2NvcGVzLmxlbmd0aCAtIDFdLnN5bWJvbHMuZmluZChzeW1ib2wgPT4gc3ltYm9sLmZ1bmN0aW9uKSB8fCBmaW5kRnVuY3Rpb25TeW1ib2woc2NvcGVzLnNsaWNlKDAsIC0xKSkgOiB1bmRlZmluZWQ7XHJcblxyXG5jb25zdCBpbmRleGVyID0gKG5vZGUsIC4uLmluZGljZXMpID0+XHJcbiAgICBpbmRpY2VzLmxlbmd0aCA9PT0gMCA/IG5vZGUgOiBpbmRleGVyKG5vZGUucGFydHNbaW5kaWNlc1swXV0sIC4uLmluZGljZXMuc2xpY2UoMSkpO1xyXG5cclxuY29uc3QgZmluZFRlcm1pbmFsID0gKG5vZGUpID0+IHtcclxuICAgIGlmIChub2RlLnZhbHVlKSByZXR1cm4gbm9kZTtcclxuICAgIHJldHVybiBmaW5kVGVybWluYWwobm9kZS5wYXJ0c1swXSk7XHJcbn1cclxuXHJcbmNvbnN0IGZpbmRMYXN0VGVybWluYWwgPSAobm9kZSkgPT4ge1xyXG4gICAgaWYgKG5vZGUudmFsdWUpIHJldHVybiBub2RlO1xyXG4gICAgcmV0dXJuIGZpbmRMYXN0VGVybWluYWwobm9kZS5wYXJ0c1tub2RlLnBhcnRzLmxlbmd0aCAtIDFdKTtcclxufVxyXG5cclxuY29uc3QgZ2V0Q29udGV4dCA9IChub2RlKSA9PiB7XHJcbiAgICBjb25zdCBzdGFydFRlcm1pbmFsID0gZmluZFRlcm1pbmFsKG5vZGUpO1xyXG4gICAgY29uc3QgZW5kVGVybWluYWwgPSBmaW5kTGFzdFRlcm1pbmFsKG5vZGUpO1xyXG5cclxuICAgIHJldHVybiBcIlxcblwiICsgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIHN0YXJ0OiBzdGFydFRlcm1pbmFsLnN0YXJ0IHx8IHsgbGluZTogc3RhcnRUZXJtaW5hbC5saW5lLCBjb2w6IHN0YXJ0VGVybWluYWwuY29sIH0sXHJcbiAgICAgICAgZW5kOiBlbmRUZXJtaW5hbC5lbmQgfHwgeyBsaW5lOiBlbmRUZXJtaW5hbC5saW5lLCBjb2w6IGVuZFRlcm1pbmFsLmNvbCB9LFxyXG4gICAgICAgIHByZXZpZXc6IG5vZGUudmFsdWUgfHwgbm9kZS52YWx1ZXM/LmpvaW4oXCIgXCIpIHx8IG5vZGVcclxuICAgIH0sIG51bGwsIDQpXHJcbn1cclxuXHJcbmNvbnN0IGNoZWNrVHlwZSA9IChub2RlKSA9PiB7XHJcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xyXG4gICAgICAgIGNhc2UgXCJleHBcIjoge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5ydWxlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlMSA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDApKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUyID0gY2hlY2tUeXBlKGluZGV4ZXIobm9kZSwgMikpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUxICE9PSB0eXBlMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVHlwZSBtaXNtYXRjaDogJHt0eXBlMX0gYW5kICR7dHlwZTJ9YCArIGdldENvbnRleHQobm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGUxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUucnVsZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwic2ltcGxlRXhwXCI6IHtcclxuICAgICAgICAgICAgaWYgKG5vZGUucnVsZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTEgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlMiA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDIpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZTEgIT09IFwiYm9vbFwiIHx8IHR5cGUyICE9PSBcImJvb2xcIilcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFR5cGUgbWlzbWF0Y2g6ICR7dHlwZTF9IGFuZCAke3R5cGUyfSB8IFNob3VsZCBiZSBib29sYCArIGdldENvbnRleHQobm9kZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBcImJvb2xcIjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnJ1bGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImFuZEV4cFwiOiB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLnJ1bGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUxID0gY2hlY2tUeXBlKGluZGV4ZXIobm9kZSwgMCkpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTIgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAyKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUxICE9PSBcImJvb2xcIiB8fCB0eXBlMiAhPT0gXCJib29sXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlIG1pc21hdGNoOiAke3R5cGUxfSBhbmQgJHt0eXBlMn0gfCBTaG91bGQgYmUgYm9vbGAgKyBnZXRDb250ZXh0KG5vZGUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJib29sXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5ydWxlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gY2hlY2tUeXBlKGluZGV4ZXIobm9kZSwgMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhc2UgXCJ1bmFyeVJlbEV4cFwiOiB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLnJ1bGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAxKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZSAhPT0gXCJib29sXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlIG1pc21hdGNoOiAke3R5cGV9IHwgU2hvdWxkIGJlIGJvb2xgICsgZ2V0Q29udGV4dChub2RlKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiYm9vbFwiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUucnVsZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwicmVsRXhwXCI6IHtcclxuICAgICAgICAgICAgaWYgKG5vZGUucnVsZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTEgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlMiA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDIpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZTEgIT09IFwiaW50XCIgfHwgdHlwZTIgIT09IFwiaW50XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlIG1pc21hdGNoOiAke3R5cGUxfSBhbmQgJHt0eXBlMn0gfCBTaG91bGQgYmUgaW50YCArIGdldENvbnRleHQobm9kZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBcImJvb2xcIjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnJ1bGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcInN1bUV4cFwiOiB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLnJ1bGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUxID0gY2hlY2tUeXBlKGluZGV4ZXIobm9kZSwgMCkpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTIgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAyKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUxICE9PSBcImludFwiIHx8IHR5cGUyICE9PSBcImludFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlIG1pc21hdGNoOiAke3R5cGUxfSBhbmQgJHt0eXBlMn0gfCBTaG91bGQgYmUgaW50YCArIGdldENvbnRleHQobm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBcImludFwiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUucnVsZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwibXVsRXhwXCI6IHtcclxuICAgICAgICAgICAgaWYgKG5vZGUucnVsZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTEgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlMiA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDIpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZTEgIT09IFwiaW50XCIgfHwgdHlwZTIgIT09IFwiaW50XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlIG1pc21hdGNoOiAke3R5cGUxfSBhbmQgJHt0eXBlMn0gfCBTaG91bGQgYmUgaW50YCArIGdldENvbnRleHQobm9kZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBcImludFwiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUucnVsZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwidW5hcnlFeHBcIjoge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5ydWxlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gY2hlY2tUeXBlKGluZGV4ZXIobm9kZSwgMSkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgIT09IFwiaW50XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlIG1pc21hdGNoOiAke3R5cGV9IHwgU2hvdWxkIGJlIGludGAgKyBnZXRDb250ZXh0KG5vZGUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJpbnRcIjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnJ1bGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImZhY3RvclwiOiB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLnJ1bGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnJ1bGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcIm11dGFibGVcIjoge1xyXG4gICAgICAgICAgICBpZiAobm9kZS5ydWxlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gY2hlY2tUeXBlKGluZGV4ZXIobm9kZSwgMCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5ydWxlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzeW1ib2wgPSBmaW5kU3ltYm9sKGluZGV4ZXIobm9kZSwgMCkudmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGVJbmRleCA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDIpKTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlSW5kZXggIT09IFwiaW50XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlIG1pc21hdGNoOiAke3R5cGVJbmRleH0gfCBTaG91bGQgYmUgaW50YCArIGdldENvbnRleHQobm9kZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzeW1ib2wudHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImltbXV0YWJsZVwiOiB7XHJcbiAgICAgICAgICAgIGlmIChub2RlLnJ1bGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAxKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnJ1bGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnJ1bGUgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAwKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImlkZW50aWZpZXJcIjoge1xyXG4gICAgICAgICAgICBjb25zdCBzeW1ib2wgPSBmaW5kU3ltYm9sKG5vZGUudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoIXN5bWJvbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTeW1ib2wgJHtub2RlLnZhbHVlfSBub3QgZm91bmRgICsgZ2V0Q29udGV4dChub2RlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbC50eXBlICsgKHN5bWJvbC5hcnJheSA/IFwiW11cIiA6IFwiXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImNhbGxcIjoge1xyXG4gICAgICAgICAgICBjb25zdCBzeW1ib2wgPSBmaW5kU3ltYm9sKGluZGV4ZXIobm9kZSwgMCkudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoIXN5bWJvbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTeW1ib2wgJHtpbmRleGVyKG5vZGUsIDApLnZhbHVlfSBub3QgZm91bmRgICsgZ2V0Q29udGV4dChub2RlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFzeW1ib2wuZnVuY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVHlwZSBtaXNtYXRjaDogJHtzeW1ib2x9IHwgU2hvdWxkIGJlIGZ1bmN0aW9uYCArIGdldENvbnRleHQobm9kZSkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhcmdzVHJlZSA9IGluZGV4ZXIobm9kZSwgMik7XHJcbiAgICAgICAgICAgIGNvbnN0IGdldEFyZ3MgPSAobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gXCJhcmdzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ydWxlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3NUcmVlID0gaW5kZXhlcihub2RlLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldEFyZ3MoYXJnc1RyZWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ydWxlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJnc1RyZWUgPSBpbmRleGVyKG5vZGUsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFyZyA9IGluZGV4ZXIobm9kZSwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsuLi5nZXRBcmdzKGFyZ3NUcmVlKSwgYXJnXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5ydWxlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJnID0gaW5kZXhlcihub2RlLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2FyZ107XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYXJncyA9IGdldEFyZ3MoYXJnc1RyZWUpO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBzeW1ib2wuc2NvcGUuc3ltYm9scztcclxuXHJcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gcGFyYW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBcmd1bWVudHMgbGVuZ3RoIG1pc21hdGNoOiBzaG91bGQgYmUgJHtwYXJhbXMubGVuZ3RofSBhcmd1bWVudHMgYW5kIGdvdCAke2FyZ3MubGVuZ3RofWAgKyBnZXRDb250ZXh0KG5vZGUpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhcmcgPSBhcmdzW2ldO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW0gPSBwYXJhbXNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tUeXBlKGFyZykgIT09IHBhcmFtLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFR5cGUgbWlzbWF0Y2g6ICR7YXJnLnR5cGV9IGFuZCAke3BhcmFtLnR5cGV9IHwgU2hvdWxkIGJlICR7cGFyYW0udHlwZX1gICsgZ2V0Q29udGV4dChub2RlKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbC50eXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcImNvbnN0YW50XCI6IHtcclxuICAgICAgICAgICAgaWYgKG5vZGUucnVsZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaW50XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ydWxlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJjaGFyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ydWxlID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJib29sXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBjYXNlIFwic2VsZWN0U3RtdFwiOiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjaGVja1R5cGUoaW5kZXhlcihub2RlLCAyKSk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlICE9PSBcImJvb2xcIikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlIG1pc21hdGNoOiAke3R5cGV9IHwgU2hvdWxkIGJlIGJvb2xgICsgZ2V0Q29udGV4dChub2RlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYXNlIFwiaXRlclN0bXRcIjoge1xyXG4gICAgICAgICAgICBjb25zdCB0eXBlID0gY2hlY2tUeXBlKGluZGV4ZXIobm9kZSwgMikpO1xyXG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gXCJib29sXCIpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVHlwZSBtaXNtYXRjaDogJHt0eXBlfSB8IFNob3VsZCBiZSBib29sYCArIGdldENvbnRleHQobm9kZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSBcInJldHVyblN0bXRcIjoge1xyXG4gICAgICAgICAgICBsZXQgdHlwZTtcclxuICAgICAgICAgICAgaWYgKG5vZGUucnVsZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdHlwZSA9IFwidm9pZFwiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUucnVsZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgdHlwZSA9IGNoZWNrVHlwZShpbmRleGVyKG5vZGUsIDEpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgc3ltYm9sID0gY3VycmVudEZ1bmN0aW9uO1xyXG4gICAgICAgICAgICBpZiAoc3ltYm9sLnR5cGUgIT09IHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVHlwZSBtaXNtYXRjaDogJHt0eXBlfSB8IFNob3VsZCBiZSAke3N5bWJvbC50eXBlfWAgKyBnZXRDb250ZXh0KG5vZGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBjdXJyZW50RnVuY3Rpb24gPSBudWxsO1xyXG5cclxuY29uc3Qgc2VtYW50aWNDaGVja0RGUyA9IChub2RlKSA9PiB7XHJcbiAgICAvLyBUT0RPOiBuZWVkIHRvIG1ha2Ugc3VyZSBub24tdm9pZCBmdW5jdGlvbiBmaW5pc2ggd2l0aCByZXR1cm4gc3RhdGVtZW50XHJcblxyXG4gICAgbGV0IGlzRnVuY3Rpb25EZWNsYXJhdGlvbiA9IGZhbHNlO1xyXG5cclxuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcInZhckRlY2xcIjoge1xyXG4gICAgICAgICAgICBpZiAoaW5kZXhlcihub2RlLCAxLCAwKS5ydWxlID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2NvcGUoKS5zeW1ib2xzLnB1c2goeyB0eXBlOiBpbmRleGVyKG5vZGUsIDAsIDApLnZhbHVlLCBuYW1lOiBpbmRleGVyKG5vZGUsIDEsIDAsIDApLnZhbHVlIH0pXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzaXplID0gK2luZGV4ZXIobm9kZSwgMSwgMCwgMikudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2NvcGUoKS5zeW1ib2xzLnB1c2goeyB0eXBlOiBpbmRleGVyKG5vZGUsIDAsIDApLnZhbHVlLCBuYW1lOiBpbmRleGVyKG5vZGUsIDEsIDAsIDApLnZhbHVlLCBhcnJheTogdHJ1ZSwgc2l6ZSwgbGVuZ3RoOiA0ICogc2l6ZSB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwiZnVuY0RlY2xcIjoge1xyXG4gICAgICAgICAgICBjdXJyZW50U2NvcGUoKS5zeW1ib2xzLnB1c2goeyB0eXBlOiBpbmRleGVyKG5vZGUsIDAsIDApLnZhbHVlLCBmdW5jdGlvbjogdHJ1ZSwgbmFtZTogaW5kZXhlcihub2RlLCAxKS52YWx1ZSB9KVxyXG4gICAgICAgICAgICBpc0Z1bmN0aW9uRGVjbGFyYXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICBjdXJyZW50RnVuY3Rpb24gPSBjdXJyZW50U2NvcGUoKS5zeW1ib2xzW2N1cnJlbnRTY29wZSgpLnN5bWJvbHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwic2NvcGVkVmFyRGVjbFwiOiB7XHJcbiAgICAgICAgICAgIGlmIChpbmRleGVyKG5vZGUsIDEsIDApLnJ1bGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTY29wZSgpLnN5bWJvbHMucHVzaCh7IHR5cGU6IGluZGV4ZXIobm9kZSwgMCwgMCkudmFsdWUsIG5hbWU6IGluZGV4ZXIobm9kZSwgMSwgMCwgMCkudmFsdWUgfSlcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNpemUgPSAraW5kZXhlcihub2RlLCAxLCAwLCAyKS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTY29wZSgpLnN5bWJvbHMucHVzaCh7IHR5cGU6IGluZGV4ZXIobm9kZSwgMCwgMCkudmFsdWUsIG5hbWU6IGluZGV4ZXIobm9kZSwgMSwgMCwgMCkudmFsdWUsIGFycmF5OiB0cnVlLCBzaXplLCBsZW5ndGg6IDQgKiBzaXplIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJwYXJtVHlwZUxpc3RcIjoge1xyXG4gICAgICAgICAgICBjdXJyZW50U2NvcGUoKS5zeW1ib2xzLnB1c2goeyB0eXBlOiBpbmRleGVyKG5vZGUsIDAsIDApLnZhbHVlLCBuYW1lOiBpbmRleGVyKG5vZGUsIDEsIDApLnZhbHVlIH0pXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjaGVja1R5cGUobm9kZSlcclxuXHJcbiAgICBpZiAobm9kZS5zY29wZUhlYWQpIHtcclxuICAgICAgICBjb25zdCBzY29wZSA9IHtcclxuICAgICAgICAgICAgbmFtZTogbm9kZS50aXRsZSxcclxuICAgICAgICAgICAgbm9kZUluZGV4OiBub2RlLmluZGV4LFxyXG4gICAgICAgICAgICBzeW1ib2xzOiBbXSxcclxuICAgICAgICAgICAgc2NvcGVzOiBbXSxcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uRGVjbGFyYXRpb24pXHJcbiAgICAgICAgICAgIGN1cnJlbnRTY29wZSgpLnN5bWJvbHNbY3VycmVudFNjb3BlKCkuc3ltYm9scy5sZW5ndGggLSAxXS5zY29wZSA9IHNjb3BlO1xyXG5cclxuXHJcbiAgICAgICAgY3VycmVudFNjb3BlKCkuc2NvcGVzLnB1c2goc2NvcGUpO1xyXG4gICAgICAgIHNjb3BlUGF0aC5wdXNoKHNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobm9kZS5wYXJ0cylcclxuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2Ygbm9kZS5wYXJ0cylcclxuICAgICAgICAgICAgc2VtYW50aWNDaGVja0RGUyhwYXJ0KTtcclxuXHJcbiAgICBpZiAobm9kZS5zY29wZUhlYWQpXHJcbiAgICAgICAgc2NvcGVQYXRoLnBvcCgpO1xyXG59XHJcblxyXG5sZXQgbWVtUG9pbnRlciA9IDA7XHJcblxyXG5jb25zdCBnZXRMb2NhbERlY2xzID0gKHNjb3BlLCBza2lwID0gZmFsc2UpID0+IHtcclxuICAgIGNvbnN0IG91dHB1dCA9IHNraXAgPyBbXSA6IHNjb3BlLnN5bWJvbHMubWFwKHN5bWJvbCA9PiAoeyB0eXBlOiBzeW1ib2wudHlwZSwgbmFtZTogc3ltYm9sLm5hbWUsIGFycmF5OiBzeW1ib2wuYXJyYXksIHNpemU6IHN5bWJvbC5zaXplLCBsZW5ndGg6IHN5bWJvbC5sZW5ndGgvKiArIFwiX1wiICsgc2NvcGUuaW5kZXguam9pbignJykgKi8gfSkpO1xyXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBzY29wZS5zY29wZXMpIHtcclxuICAgICAgICBvdXRwdXQucHVzaCguLi5nZXRMb2NhbERlY2xzKGNoaWxkKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG59XHJcblxyXG5jb25zdCBjb2RlR2VuREZTID0gKG5vZGUsIHNjb3BlKSA9PiB7XHJcbiAgICBjb25zdCB0ZXJtaW5hbHMgPSB7XHJcbiAgICAgICAgXCJwcm9ncmFtXCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2xvYmFsQXJyYXlzID0gc2NvcGUuc3ltYm9scy5maWx0ZXIoeCA9PiB4LmFycmF5KTtcclxuICAgICAgICAgICAgICAgIGxldCBnbG9iYWxBcnJheU91dHB1dCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGdsb2JhbEFycmF5IG9mIGdsb2JhbEFycmF5cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbEFycmF5T3V0cHV0ICs9IFwiXFxuICAgIFwiICsgYChnbG9iYWwgJCR7Z2xvYmFsQXJyYXkubmFtZX0gKG11dCBpMzIpIChpMzIuY29uc3QgJHttZW1Qb2ludGVyfSkpYFxyXG4gICAgICAgICAgICAgICAgICAgIG1lbVBvaW50ZXIgKz0gZ2xvYmFsQXJyYXkubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAobW9kdWxlXFxuICAgIChpbXBvcnQgXCJjb25zb2xlXCIgXCJsb2dcIiAoZnVuYyAkb3V0cHV0IChwYXJhbSBpMzIpKSlcXG4gICAgKGltcG9ydCBcIndpbmRvd1wiIFwicHJvbXB0XCIgKGZ1bmMgJGlucHV0IChyZXN1bHQgaTMyKSkpXFxuICAgIChtZW1vcnkgKGltcG9ydCBcImpzXCIgXCJtZW1cIikgMSlcXG4gICAgKGdsb2JhbCAkbWVtX3BvaW50ZXIgKG11dCBpMzIpIChpMzIuY29uc3QgJHttZW1Qb2ludGVyfSkpJHtnbG9iYWxBcnJheU91dHB1dH1gXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgKWBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZGVjbExpc3RcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBgYCxcclxuICAgICAgICAgICAgcG9zdDogKG5vZGUpID0+IGBgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImRlY2xcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBgYCxcclxuICAgICAgICAgICAgcG9zdDogKG5vZGUpID0+IGBgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInZhckRlY2xcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBmaW5kU3ltYm9sKGluZGV4ZXIobm9kZSwgMSwgMCwgMCkudmFsdWUpLmFycmF5ID8gYGAgOiBgKGdsb2JhbCAkJHtpbmRleGVyKG5vZGUsIDEsIDAsIDApLnZhbHVlfSAobXV0IGkzMikgKGkzMi5jb25zdCAwKSlgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwic2NvcGVkVmFyRGVjbFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwidmFyRGVjbExpc3RcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBgYCxcclxuICAgICAgICAgICAgcG9zdDogKG5vZGUpID0+IGBgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInZhckRlY2xJbml0XCI6IHtcclxuICAgICAgICAgICAgcHJlOiBbKG5vZGUpID0+IGBgLCAobm9kZSkgPT4gYChsb2NhbC5zZXQgJCR7aW5kZXhlcihub2RlLCAwLCAwKS52YWx1ZX1gXSxcclxuICAgICAgICAgICAgcG9zdDogWyhub2RlKSA9PiBgYCwgKG5vZGUpID0+IGApYF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwidmFyRGVjbElkXCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4gYGAsXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgYFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ0eXBlU3BlY1wiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZnVuY0RlY2xcIjoge1xyXG4gICAgICAgICAgICBvcmRlcjogKG5vZGUpID0+IFsobm9kZSkgPT4gYChmdW5jICQke2luZGV4ZXIobm9kZSwgMSkudmFsdWV9YCxcclxuICAgICAgICAgICAgICAgIDMsXHJcbiAgICAgICAgICAgIChub2RlKSA9PiBpbmRleGVyKG5vZGUsIDAsIDApLnZhbHVlID09PSBcInZvaWRcIiA/ICcnIDogYChyZXN1bHQgaTMyKWAsXHJcbiAgICAgICAgICAgIChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbERlY2xzID0gZ2V0TG9jYWxEZWNscyhmaW5kU3ltYm9sKGluZGV4ZXIobm9kZSwgMSkudmFsdWUpLnNjb3BlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGxldCBsb2NhbERlY2xPdXRwdXQgPSBcIihsb2NhbCAkZnVuY3Rpb25fb3V0cHV0IGkzMilcIjtcclxuICAgICAgICAgICAgICAgIGxldCBsb2NhbERlY2xBcnJheU91dHB1dCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRlY2wgb2YgbG9jYWxEZWNscykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsRGVjbE91dHB1dCArPSBgKGxvY2FsICQke2RlY2wubmFtZX0gaTMyKWBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVjbC5hcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbERlY2xBcnJheU91dHB1dCArPSBgKGxvY2FsLnNldCAkJHtkZWNsLm5hbWV9IChnbG9iYWwuZ2V0ICRtZW1fcG9pbnRlcikpKGdsb2JhbC5zZXQgJG1lbV9wb2ludGVyIChpMzIuYWRkIChnbG9iYWwuZ2V0ICRtZW1fcG9pbnRlcikgKGkzMi5jb25zdCAke2RlY2wubGVuZ3RofSkpKWA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxEZWNsT3V0cHV0ICsgXCIgXCIgKyBsb2NhbERlY2xBcnJheU91dHB1dDtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAnKGJsb2NrICRmdW5jdGlvbl9ibG9jaycsXHJcbiAgICAgICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICAgICAgJyknLFxyXG4gICAgICAgICAgICAobm9kZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxEZWNscyA9IGdldExvY2FsRGVjbHMoZmluZFN5bWJvbChpbmRleGVyKG5vZGUsIDEpLnZhbHVlKS5zY29wZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG90YWxMZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkZWNsIG9mIGxvY2FsRGVjbHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVjbC5hcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbExlbmd0aCArPSBkZWNsLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYChnbG9iYWwuc2V0ICRtZW1fcG9pbnRlciAoaTMyLnN1YiAoZ2xvYmFsLmdldCAkbWVtX3BvaW50ZXIpIChpMzIuY29uc3QgJHt0b3RhbExlbmd0aH0pKSlgXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChub2RlKSA9PiBpbmRleGVyKG5vZGUsIDAsIDApLnZhbHVlID09PSBcInZvaWRcIiA/ICcnIDogJyhyZXR1cm4gKGxvY2FsLmdldCAkZnVuY3Rpb25fb3V0cHV0KSknLFxyXG4gICAgICAgICAgICBgKShleHBvcnQgXCIke2luZGV4ZXIobm9kZSwgMSkudmFsdWV9XCIgKGZ1bmMgJCR7aW5kZXhlcihub2RlLCAxKS52YWx1ZX0pKVxcbmBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInBhcm1zXCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4gYGAsXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgYFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJwYXJtTGlzdFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicGFybVR5cGVMaXN0XCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4gYChwYXJhbSAkJHtpbmRleGVyKG5vZGUsIDEsIDApLnZhbHVlfSBpMzIpYCxcclxuICAgICAgICAgICAgcG9zdDogKG5vZGUpID0+IGBgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInBhcm1JZExpc3RcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBgYCxcclxuICAgICAgICAgICAgcG9zdDogKG5vZGUpID0+IGBgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInBhcm1JZFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwic3RtdFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZXhwU3RtdFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiY29tcG91bmRTdG10XCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4gYGAsXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgYFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJsb2NhbERlY2xzXCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4gYGAsXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgYFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzdG10TGlzdFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwic2VsZWN0U3RtdFwiOiB7XHJcbiAgICAgICAgICAgIG9yZGVyOiB7XHJcbiAgICAgICAgICAgICAgICAwOiBbYChpZmAsIDIsIGAodGhlbmAsIDQsIGApKWBdLFxyXG4gICAgICAgICAgICAgICAgMTogW2AoaWZgLCAyLCBgKHRoZW5gLCA0LCBgKShlbHNlYCwgNiwgJykpJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJpdGVyU3RtdFwiOiB7XHJcbiAgICAgICAgICAgIG9yZGVyOiBbKG5vZGUpID0+IGAoYmxvY2sgJGJsb2NrXyR7bm9kZS5pbmRleC5qb2luKFwiXCIpfSAobG9vcCAkbG9vcF8ke25vZGUuaW5kZXguam9pbihcIlwiKX1gLCBgKGlmYCwgMiwgYCh0aGVuYCwgNCwgKG5vZGUpID0+IGBiciAkbG9vcF8ke25vZGUuaW5kZXguam9pbihcIlwiKX1gLCBgKSkpKWBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInJldHVyblN0bXRcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBgKGxvY2FsLnNldCAkZnVuY3Rpb25fb3V0cHV0IGAsXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgKShiciAkZnVuY3Rpb25fYmxvY2spYFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJicmVha1N0bXRcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBgKGJyIDApYCxcclxuICAgICAgICAgICAgcG9zdDogKG5vZGUpID0+IGBgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImV4cFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogWyhub2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzeW1ib2wgPSBmaW5kU3ltYm9sKGluZGV4ZXIobm9kZSwgMCwgMCkudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcGUgPSBmaW5kU2NvcGVGcm9tU3ltYm9sKHN5bWJvbC5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3ltYm9sLmFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXhWYWx1ZSA9IGNvZGVUcmVlVG9TdHJpbmcoY29kZUdlbkRGUyhpbmRleGVyKG5vZGUsIDAsIDIpKSwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgKGkzMi5zdG9yZSAoaTMyLmFkZCAoJHtzY29wZS5uYW1lID09PSBcImdsb2JhbFwiID8gXCJnbG9iYWxcIiA6IFwibG9jYWxcIn0uZ2V0ICQke3N5bWJvbC5uYW1lfSkgKGkzMi5tdWwgKGkzMi5jb25zdCA0KSAke2luZGV4VmFsdWV9KSlgO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBgKCR7c2NvcGUubmFtZSA9PT0gXCJnbG9iYWxcIiA/IFwiZ2xvYmFsXCIgOiBcImxvY2FsXCJ9LnNldCAkJHtzeW1ib2wubmFtZX1gXHJcbiAgICAgICAgICAgIH0sIChub2RlKSA9PiBgYF0sXHJcbiAgICAgICAgICAgIHBvc3Q6IFsobm9kZSkgPT4gYClgLCAobm9kZSkgPT4gYGBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInNpbXBsZUV4cFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYW5kRXhwXCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4gYGAsXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgYFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ1bmFyeVJlbEV4cFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicmVsRXhwXCI6IHtcclxuICAgICAgICAgICAgb3JkZXI6IHsgMDogWycoJywgMSwgMCwgMiwgJyknXSB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInJlbE9wXCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4gJ2kzMi4nICsge1xyXG4gICAgICAgICAgICAgICAgbHRlOiAnbGVfcycsXHJcbiAgICAgICAgICAgICAgICBsdDogJ2x0X3MnLFxyXG4gICAgICAgICAgICAgICAgZ3RlOiAnZ2VfcycsXHJcbiAgICAgICAgICAgICAgICBndDogJ2d0X3MnLFxyXG4gICAgICAgICAgICAgICAgZXE6ICdlcScsXHJcbiAgICAgICAgICAgICAgICBuZXE6ICduZScsXHJcbiAgICAgICAgICAgIH1baW5kZXhlcihub2RlLCAwKS50eXBlXSxcclxuICAgICAgICAgICAgcG9zdDogKG5vZGUpID0+IGBgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInN1bUV4cFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogWyhub2RlKSA9PiBgKGkzMi4ke2luZGV4ZXIobm9kZSwgMSwgMCkudHlwZSA9PT0gXCJwbHVzXCIgPyBcImFkZFwiIDogXCJzdWJcIn1gLCAobm9kZSkgPT4gYGBdLFxyXG4gICAgICAgICAgICBwb3N0OiBbKG5vZGUpID0+IGApYCwgKG5vZGUpID0+IGBgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzdW1vcFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwibXVsRXhwXCI6IHtcclxuICAgICAgICAgICAgcHJlOiBbKG5vZGUpID0+IGAoaTMyLiR7aW5kZXhlcihub2RlLCAxLCAwKS50eXBlID09PSBcIm11bHRpcGx5XCIgPyBcIm11bFwiIDogXCJkaXZfc1wifWAsIChub2RlKSA9PiBgYF0sXHJcbiAgICAgICAgICAgIHBvc3Q6IFsobm9kZSkgPT4gYClgLCAobm9kZSkgPT4gYGBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIm11bG9wXCI6IHtcclxuICAgICAgICAgICAgcHJlOiAobm9kZSkgPT4gYGAsXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgYFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ1bmFyeUV4cFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogWyhub2RlKSA9PiBgKGkzMi5zdWIgKGkzMi5jb25zdCAwKWAsIChub2RlKSA9PiBgYF0sXHJcbiAgICAgICAgICAgIHBvc3Q6IFsobm9kZSkgPT4gYClgLCAobm9kZSkgPT4gYGBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInVuYXJ5b3BcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBgYCxcclxuICAgICAgICAgICAgcG9zdDogKG5vZGUpID0+IGBgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImZhY3RvclwiOiB7XHJcbiAgICAgICAgICAgIHByZTogWyhub2RlKSA9PiBgYCwgKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN5bWJvbCA9IGZpbmRTeW1ib2woaW5kZXhlcihub2RlLCAwLCAwKS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzY29wZSA9IGZpbmRTY29wZUZyb21TeW1ib2woc3ltYm9sLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN5bWJvbC5hcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4VmFsdWUgPSBjb2RlVHJlZVRvU3RyaW5nKGNvZGVHZW5ERlMoaW5kZXhlcihub2RlLCAwLCAyKSksIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYChpMzIubG9hZCAoaTMyLmFkZCAoJHtzY29wZS5uYW1lID09PSBcImdsb2JhbFwiID8gXCJnbG9iYWxcIiA6IFwibG9jYWxcIn0uZ2V0ICQke3N5bWJvbC5uYW1lfSkgKGkzMi5tdWwgKGkzMi5jb25zdCA0KSAke2luZGV4VmFsdWV9KSkpYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBgKCR7c2NvcGUubmFtZSA9PT0gXCJnbG9iYWxcIiA/IFwiZ2xvYmFsXCIgOiBcImxvY2FsXCJ9LmdldCAkJHtzeW1ib2wubmFtZX0pYFxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgcG9zdDogWyhub2RlKSA9PiBgYCwgKG5vZGUpID0+IGBgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJtdXRhYmxlXCI6IHtcclxuICAgICAgICAgICAgb3JkZXI6IFsnJywgJyddXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImltbXV0YWJsZVwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiY2FsbFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGAoY2FsbCAkJHtpbmRleGVyKG5vZGUsIDApLnZhbHVlfWAsXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgKWBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYXJnc1wiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYXJnTGlzdFwiOiB7XHJcbiAgICAgICAgICAgIHByZTogKG5vZGUpID0+IGBgLFxyXG4gICAgICAgICAgICBwb3N0OiAobm9kZSkgPT4gYGBcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiY29uc3RhbnRcIjoge1xyXG4gICAgICAgICAgICBwcmU6IChub2RlKSA9PiBbYChpMzIuY29uc3QgJHtpbmRleGVyKG5vZGUsIDApLnZhbHVlfSlgLCBpbmRleGVyKG5vZGUsIDApLnZhbHVlLCBgKGkzMi5jb25zdCAke2luZGV4ZXIobm9kZSwgMCkudmFsdWUgPT09IFwidHJ1ZVwiID8gMSA6IDB9KWBdW25vZGUucnVsZV0sXHJcbiAgICAgICAgICAgIHBvc3Q6IChub2RlKSA9PiBgYFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgY29uc3Qgb3V0cHV0ID0geyB0eXBlOiBub2RlLnR5cGUsIHByZTogbnVsbCwgY2hpbGRyZW46IFtdLCBwb3N0OiBudWxsIH07XHJcblxyXG4gICAgaWYgKG5vZGUuc2NvcGVIZWFkKSB7XHJcbiAgICAgICAgY29uc3QgYXJyYXlFcXVhbHMgPSAoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChhW2ldICE9PSBiW2ldKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNjb3BlID0gY3VycmVudFNjb3BlKCkuc2NvcGVzLmZpbmQocyA9PiBhcnJheUVxdWFscyhzLm5vZGVJbmRleCwgbm9kZS5pbmRleCkpO1xyXG4gICAgICAgIGlmIChzY29wZSkge1xyXG4gICAgICAgICAgICBzY29wZVBhdGgucHVzaChzY29wZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NvcGUgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAobm9kZS50eXBlIGluIHRlcm1pbmFscykge1xyXG4gICAgICAgIGNvbnN0IHRlcm1pbmFsID0gdGVybWluYWxzW25vZGUudHlwZV07XHJcbiAgICAgICAgaWYgKHRlcm1pbmFsLm9yZGVyKSB7XHJcbiAgICAgICAgICAgIGxldCBvcmRlck91dHB1dCA9IFtdO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3JkZXIgPSB0ZXJtaW5hbC5vcmRlcjtcclxuICAgICAgICAgICAgY29uc3QgcnVsZSA9IG5vZGUucnVsZTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcmRlciA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShvcmRlcikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyUnVsZSA9IG9yZGVyW3J1bGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvcmRlclJ1bGUgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9yZGVyUnVsZShub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlck91dHB1dC5wdXNoKHBhcnQobm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXJ0ID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZT8ucGFydHM/LltwYXJ0XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dFBhcnQgPSBjb2RlR2VuREZTKG5vZGUucGFydHNbcGFydF0sIHNjb3BlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlck91dHB1dC5wdXNoKG91dHB1dFBhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHBhcnQgYXQgaW5kZXggJHtwYXJ0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXJPdXRwdXQucHVzaChwYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIW9yZGVyUnVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUucGFydHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIG5vZGUucGFydHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dFBhcnQgPSBjb2RlR2VuREZTKHBhcnQsIHNjb3BlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2gob3V0cHV0UGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgb3JkZXJPdXRwdXQgPSBbJycsIC4uLmNoaWxkcmVuLCAnJ107XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBvcmRlclJ1bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJ0ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyT3V0cHV0LnB1c2gocGFydChub2RlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcnQgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlPy5wYXJ0cz8uW3BhcnRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0UGFydCA9IGNvZGVHZW5ERlMobm9kZS5wYXJ0c1twYXJ0XSwgc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyT3V0cHV0LnB1c2gob3V0cHV0UGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gcGFydCBhdCBpbmRleCAke3BhcnR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlck91dHB1dC5wdXNoKHBhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob3JkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2Ygb3JkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcnQgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlck91dHB1dC5wdXNoKHBhcnQobm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcnQgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGU/LnBhcnRzPy5bcGFydF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dFBhcnQgPSBjb2RlR2VuREZTKG5vZGUucGFydHNbcGFydF0sIHNjb3BlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyT3V0cHV0LnB1c2gob3V0cHV0UGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHBhcnQgYXQgaW5kZXggJHtwYXJ0fWApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXJPdXRwdXQucHVzaChwYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9yZGVyID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyVmFsdWUgPSBvcmRlcihub2RlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2Ygb3JkZXJWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyT3V0cHV0LnB1c2gocGFydChub2RlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcGFydCA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZT8ucGFydHM/LltwYXJ0XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0UGFydCA9IGNvZGVHZW5ERlMobm9kZS5wYXJ0c1twYXJ0XSwgc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXJPdXRwdXQucHVzaChvdXRwdXRQYXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gcGFydCBhdCBpbmRleCAke3BhcnR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlck91dHB1dC5wdXNoKHBhcnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBvcmRlciBmb3IgdGVybWluYWwgJHtub2RlLnR5cGV9YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG91dHB1dC5wcmUgPSBvcmRlck91dHB1dC5sZW5ndGggPT09IDAgPyAnJyA6IG9yZGVyT3V0cHV0WzBdO1xyXG4gICAgICAgICAgICBvdXRwdXQucG9zdCA9IG9yZGVyT3V0cHV0Lmxlbmd0aCA9PT0gMSA/ICcnIDogb3JkZXJPdXRwdXRbb3JkZXJPdXRwdXQubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgIG91dHB1dC5jaGlsZHJlbiA9IG9yZGVyT3V0cHV0LnNsaWNlKDEsIG9yZGVyT3V0cHV0Lmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0ZXJtaW5hbC5wcmUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlcm1pbmFsLnByZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGVybWluYWwucHJlW25vZGUucnVsZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZXJtaW5hbC5wcmVbbm9kZS5ydWxlXSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnByZSA9IHRlcm1pbmFsLnByZVtub2RlLnJ1bGVdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnByZSA9IHRlcm1pbmFsLnByZVtub2RlLnJ1bGVdPy4obm9kZSkgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHJlID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGVybWluYWwucHJlID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnByZSA9IHRlcm1pbmFsLnByZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnByZSA9IHRlcm1pbmFsPy5wcmU/Lihub2RlKSB8fCAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dC5wcmUgPSAnJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5vZGUucGFydHMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2Ygbm9kZS5wYXJ0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dFBhcnQgPSBjb2RlR2VuREZTKHBhcnQsIHNjb3BlKTtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuY2hpbGRyZW4ucHVzaChvdXRwdXRQYXJ0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRlcm1pbmFsLnBvc3QpIHtcclxuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlcm1pbmFsLnBvc3QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlcm1pbmFsLnBvc3Rbbm9kZS5ydWxlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRlcm1pbmFsLnBvc3Rbbm9kZS5ydWxlXSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnBvc3QgPSB0ZXJtaW5hbC5wb3N0W25vZGUucnVsZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucG9zdCA9IHRlcm1pbmFsLnBvc3Rbbm9kZS5ydWxlXT8uKG5vZGUpIHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnBvc3QgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0ZXJtaW5hbC5wb3N0ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnBvc3QgPSB0ZXJtaW5hbC5wb3N0O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucG9zdCA9IHRlcm1pbmFsPy5wb3N0Py4obm9kZSkgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQucG9zdCA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoIW5vZGUudmFsdWUpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gdmFsdWUgZm9yIG5vZGUgJHtub2RlLnR5cGV9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5vZGUuc2NvcGVIZWFkKVxyXG4gICAgICAgIHNjb3BlUGF0aC5wb3AoKTtcclxuXHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG59XHJcblxyXG5jb25zdCByZWR1Y2VDb2RlVHJlZSA9ICh0cmVlKSA9PiB7XHJcbiAgICBpZiAodHJlZT8ucHJlPy5sZW5ndGggPiAwIHx8IHRyZWU/LnBvc3Q/Lmxlbmd0aCA+IDApIHJldHVybiB7IHByZTogdHJlZS5wcmUsIGNoaWxkcmVuOiAoQXJyYXkuaXNBcnJheSh0cmVlLmNoaWxkcmVuKSA/ICh0cmVlLmNoaWxkcmVuLm1hcChyZWR1Y2VDb2RlVHJlZSkuZmxhdCgpKSA6ICh0cmVlLmNoaWxkcmVuKSksIHBvc3Q6IHRyZWUucG9zdCB9O1xyXG4gICAgaWYgKHRyZWUuY2hpbGRyZW4pIHJldHVybiBBcnJheS5pc0FycmF5KHRyZWUuY2hpbGRyZW4pID8gdHJlZS5jaGlsZHJlbi5tYXAocmVkdWNlQ29kZVRyZWUpLmZsYXQoKSA6IHRyZWUuY2hpbGRyZW47XHJcbiAgICByZXR1cm4gdHJlZVxyXG59XHJcblxyXG5jb25zdCBjb2RlVHJlZVRvU3RyaW5nID0gKG5vZGUsIGxldmVsID0gMCwgc3BhY2luZyA9IHRydWUpID0+IHtcclxuICAgIG5vZGUgPSByZWR1Y2VDb2RlVHJlZShub2RlKTtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKVxyXG4gICAgICAgIG5vZGUgPSBub2RlLmxlbmd0aCA9PT0gMSA/IG5vZGVbMF0gOiB7IHByZTogJycsIGNoaWxkcmVuOiBub2RlLCBwb3N0OiAnJyB9O1xyXG5cclxuICAgIGxldCBvdXRwdXQgPSBcIlwiO1xyXG4gICAgbGV0IHNwYWNlcyA9IFwiXCI7XHJcbiAgICBpZiAoc3BhY2luZylcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxldmVsOyBpKyspXHJcbiAgICAgICAgICAgIHNwYWNlcyArPSBcIiAgICBcIjtcclxuXHJcbiAgICBpZiAobm9kZS5wcmUpXHJcbiAgICAgICAgb3V0cHV0ICs9IHNwYWNlcyArIG5vZGUucHJlICsgKHNwYWNpbmcgPyBcIlxcblwiIDogXCJcIik7XHJcblxyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgb3V0cHV0ICs9IGNvZGVUcmVlVG9TdHJpbmcoY2hpbGQsIGxldmVsICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBvdXRwdXQgKz0gc3BhY2VzICsgbm9kZSArIChzcGFjaW5nID8gXCJcXG5cIiA6IFwiXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChub2RlLnBvc3QpXHJcbiAgICAgICAgb3V0cHV0ICs9IHNwYWNlcyArIG5vZGUucG9zdCArIChzcGFjaW5nID8gXCJcXG5cIiA6IFwiXCIpO1xyXG5cclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbn1cclxuXHJcbnNlbWFudGljQ2hlY2tERlMoYXN0KTtcclxuXHJcbmNvbnN0IGFkZEluZGV4ID0gKG5vZGUsIGluZGV4ID0gWzBdKSA9PiB7XHJcbiAgICBub2RlLmluZGV4ID0gaW5kZXg7XHJcbiAgICBpZiAobm9kZS5zY29wZXMpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuc2NvcGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFkZEluZGV4KG5vZGUuc2NvcGVzW2ldLCBbLi4uaW5kZXgsIGldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxubGV0IHNjb3BlQ29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2NvcGUpKTtcclxuc2NvcGVDb3B5LnN5bWJvbHMgPSBzY29wZUNvcHkuc3ltYm9scy5tYXAoKHsgc2NvcGUsIC4uLnggfSkgPT4geClcclxuLy8gY29uc29sZS5mdWxsKHNjb3BlQ29weSk7XHJcbmFkZEluZGV4KHNjb3BlKTtcclxuc2NvcGVQYXRoID0gW3Njb3BlXTtcclxuXHJcbmNvbnN0IGNvZGVUcmVlID0gY29kZUdlbkRGUyhhc3QsIHNjb3BlKTtcclxuY29uc3QgY29kZU91dHB1dCA9IGNvZGVUcmVlVG9TdHJpbmcoY29kZVRyZWUpO1xyXG5cclxuY29uc29sZS5sb2coY29kZU91dHB1dCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==