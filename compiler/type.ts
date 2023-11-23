import { CodeBlockWriter } from "ts-morph";
import { TypeContext } from "../antlr/MyGrammarParser";

export function writeType(writer: CodeBlockWriter, type: TypeContext) {
  if (type.getText() === "string") {
    writer.write("string");
  }
}
