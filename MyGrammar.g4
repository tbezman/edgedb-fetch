grammar MyGrammar;

//https://spec.graphql.org/October2021/#sec-Document
document: definition+ EOF;

definition: selectStatement | fragmentDefinition;

fragmentDefinition: 'fragment' name 'on' entity '{' selectionSet '}';

selectStatement: 'query' name '{' querySelectionSet '}';

querySelectionSet: querySelection*;

querySelection: fragmentSpread | name ':' SINGLE? type '{' selectionSet '}' potentialFilter?;

potentialFilter: 'filter' expression;

expression: leftExpression operatorParts;

operatorParts: (operator simpleExpression)*;

leftExpression: simpleExpression;

simpleExpression: function_call | variable | path | constant_expression;

constant_expression: STRING | NUMBER | 'true' | 'false' | 'null';

NUMBER: INT ('.' INT)? (E INT)?;

fragment INT: [0-9]+ ;
fragment E: [eE] [+\-]? ;

STRING: '"' (ESC | .)*? '"';
ESC: '\\' (['"\\bfnrt] | UNICODE) ;

fragment UNICODE: 'u' HEX HEX HEX HEX ;
fragment HEX: [0-9a-fA-F] ;

function_call: name '(' function_arguments ')';

function_arguments: function_argument (',' function_argument)*;

function_argument: expression;

path: '.'name;

operator: '=' | '<' | '>' | '<=' | '>=' | '!=' | 'in' | 'not in' | 'like' | 'not like' | 'is null' | 'is not null';

functionCall: name '(' functionArguments ')';

functionArguments: functionArgument (',' functionArgument)*;

functionArgument: name;

variable: cast? '$' name;

cast: '<'type'>';

selectionSet: fieldSelection*;

type: IDENTIFIER;
name: IDENTIFIER;
entity: IDENTIFIER;

SINGLE: 'single';

fieldSelection: IDENTIFIER | linkedField | fragmentSpread;

linkedField: IDENTIFIER '{' selectionSet '}' potentialFilter?;

fragmentSpread: '...' IDENTIFIER;

// Lexer rules
IDENTIFIER: [a-zA-Z_] [a-zA-Z_0-9]*;

// Skip whitespaces and new lines
WS: [ \t\r\n]+ -> skip;