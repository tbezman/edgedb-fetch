import {
  CharStream,
  CommonTokenStream,
  ErrorListener,
  InputStream,
} from "antlr4";
import MyGrammarLexer from "../../antlr/MyGrammarLexer";
import MyGrammarParser from "../../antlr/MyGrammarParser";
import * as c3 from "antlr4-c3";

export function activate() {
  let inputStream = new CharStream("var c = a + b()");
  let lexer = new MyGrammarLexer(inputStream);
  let tokenStream = new CommonTokenStream(lexer);

  let parser = new MyGrammarParser(tokenStream);
  let errorListener = new ErrorListener();
  parser.addErrorListener(errorListener);
  let tree = parser.expression();

  let core = new c3.CodeCompletionCore(parser);
  let candidates = core.collectCandidates(0);

  console.log(candidates);
}

export function deactivate() {}
