import { CodeBlockWriter } from "ts-morph";
import {
  SimpleExpressionContext,
  ExpressionContext,
} from "../antlr/MyGrammarParser";

export function writeSimpleExpression(
  writer: CodeBlockWriter,
  simpleExpression: SimpleExpressionContext,
  argName: string,
) {
  if (simpleExpression.function_call()) {
    const functionCall = simpleExpression.function_call();
    const functionName = functionCall.name().getText();

    writer.write(`e.${functionName}(`);

    for (const arg of functionCall
      .function_arguments()
      .function_argument_list()) {
      const expression = arg.expression();

      writeExpression(writer, expression, argName);
    }

    writer.write(")");
  } else if (simpleExpression.path()) {
    const path = simpleExpression.path();

    writer.write(`${argName}${path.getText()}`);
  } else if (simpleExpression.constant_expression()) {
    const constantExpression = simpleExpression.constant_expression();

    writer.write(constantExpression.getText());
  } else if (simpleExpression.variable()) {
    const variable = simpleExpression.variable();
    writer.write(`variables.${variable.name().getText()}`);
  }
}

export function writeExpression(
  writer: CodeBlockWriter,
  expression: ExpressionContext,
  argName: string,
) {
  const operatorParts = expression.operatorParts();

  const operators = operatorParts.operator_list();
  const operatorExpressions = operatorParts.simpleExpression_list();

  if (operatorExpressions.length !== operators.length) {
    console.log(
      operatorExpressions.map((it) => it.getText()),
      operators.map((it) => it.getText()),
    );

    throw new Error("Mismatched operators and expressions");
  }

  if (operators.length > 0) {
    writer.write("e.op(");
  }

  const leftExpression = expression.leftExpression().simpleExpression();
  writeSimpleExpression(writer, leftExpression, argName);

  writer.write(",");

  for (const index in operators) {
    const operator = operators[index];
    const operatorExpression = operatorExpressions[index];

    writer.write(`'${operator.getText()}', `);

    writeSimpleExpression(writer, operatorExpression, argName);
  }

  if (operators.length > 0) {
    writer.write(")");
  }
}
