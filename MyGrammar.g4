grammar MyGrammar;

//https://spec.graphql.org/October2021/#sec-Document
document: definition+ EOF;

definition: query | fragmentDefinition;

fragmentDefinition: 'fragment' name 'on' entity '{' selectionSet '}';

query: 'query' name variablesDefinition? '{' querySelectionSet '}';

variablesDefinition: '(' variableDefinition (',' variableDefinition)* ')';

variableDefinition: name ':' type;

querySelectionSet: querySelection*;

querySelection: fragmentSpread | name ':' SINGLE? type '{' selectionSet '}' potentialFilter?;

potentialFilter: 'filter' filter;

filter: fieldName operator simpleExpression;

fieldName: IDENTIFIER;

simpleExpression: variable | path | constant_expression;

constant_expression: STRING | NUMBER | 'true' | 'false' | 'null';

NUMBER: INT ('.' INT)? (E INT)?;

fragment INT: [0-9]+ ;
fragment E: [eE] [+\-]? ;

STRING: '"' (ESC | .)*? '"';
ESC: '\\' (['"\\bfnrt] | UNICODE) ;

fragment UNICODE: 'u' HEX HEX HEX HEX ;
fragment HEX: [0-9a-fA-F] ;

path: '.'name;

operator: '=';

functionCall: name '(' functionArguments ')';

functionArguments: functionArgument (',' functionArgument)*;

functionArgument: name;

variable: '$' name;

selectionSet: fieldSelection*;

type: IDENTIFIER;
name: IDENTIFIER;
entity: IDENTIFIER;

SINGLE: 'single';

fieldSelection: IDENTIFIER | linkedField | fragmentSpread;

linkedField: IDENTIFIER '{' selectionSet '}' potentialFilter?;

fragmentSpread: '...' IDENTIFIER maybeDirectives?;

maybeDirectives: directives;

directives: directive+;

directive: '@' name;

// Lexer rules
IDENTIFIER: [a-zA-Z_] [a-zA-Z_0-9]*;

// Skip whitespaces and new lines
WS: [ \t\r\n]+ -> skip;