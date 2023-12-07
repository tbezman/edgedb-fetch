import { CodeBlockWriter } from "ts-morph";
import {
  FilterContext,
  SimpleExpressionContext,
} from "../antlr/MyGrammarParser";

function writeExpression(
  writer: CodeBlockWriter,
  expression: SimpleExpressionContext,
) {
  if (expression.variable()) {
    const variable = expression.variable();

    writer.write(`variables.${variable.name().getText()}`);
  }
}

export function writeFilter(writer: CodeBlockWriter, filter: FilterContext) {
  writer.write(`${filter.fieldName().getText()}: {`);

  writer.write(`equals: `);

  writeExpression(writer, filter.simpleExpression());

  writer.write("}");
}
