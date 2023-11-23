import { CodeBlockWriter } from "ts-morph";
import { VariablesDefinitionContext } from "../antlr/MyGrammarParser";
import { writeType } from "./type";

export function writeVariablesDefinition(
  writer: CodeBlockWriter,
  variablesDefinition: VariablesDefinitionContext,
) {
  writer.write("{");

  for (const variable of variablesDefinition.variableDefinition_list()) {
    writer.write(`${variable.name().getText()}: `);
    writeType(writer, variable.type_());
    writer.write(",");
  }

  writer.write("}");
}
