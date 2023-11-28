import { CodeBlockWriter } from "ts-morph";
import {
  SelectionSetContext,
  QuerySelectionContext,
} from "../antlr/MyGrammarParser";
import { writeExpression } from "./expression";
import { getIncrementalArg } from "./getIncrementalArg";
import { Program } from "./context";

export function writeSelectionSetForQuerySelection(
  writer: CodeBlockWriter,
  program: Program,
  selectionSetContext: SelectionSetContext,
  arg: string,
) {
  for (const selection of selectionSetContext.fieldSelection_list()) {
    if (selection.linkedField()) {
      const linkedField = selection.linkedField();
      writer.write(`${linkedField.IDENTIFIER().getText()}: `);

      const arg = getIncrementalArg();
      writer.write(`(${arg}) => ({`);
      writeSelectionSetForQuerySelection(
        writer,
        program,
        linkedField.selectionSet(),
        arg,
      );

      if (linkedField.potentialFilter()) {
        writer.write("filter: ");
        writeExpression(
          writer,
          linkedField.potentialFilter().expression(),
          arg,
        );
        writer.write(",");
      }

      writer.write(`}),`);
    } else if (selection.IDENTIFIER()) {
      writer.write(`${selection.IDENTIFIER().getText()}: true,`);
    } else if (selection.fragmentSpread()) {
      const spread = selection.fragmentSpread();
      const fragmentName = spread.IDENTIFIER().getText();
      const fragment = program.fragments.get(fragmentName);
      const isDeferred = spread
        .maybeDirectives()
        ?.directives()
        .directive_list()
        .some((directive) => directive.name().getText() === "defer");

      if (!fragment) {
        throw new Error(`Fragment ${spread.IDENTIFIER().getText()} not found`);
      }

      writer.write(`${spread.IDENTIFIER().getText()}Ref: `);

      const nextArg = getIncrementalArg();
      writer.write(`e.select(${arg}, (${nextArg}) => ({`);

      if (isDeferred) {
        writer.write(
          `id: true, __deferred: e.select(true), fragmentName: e.select('${fragmentName}')`,
        );
      } else {
        writeSelectionSetForQuerySelection(
          writer,
          program,
          fragment.context.selectionSet(),
          nextArg,
        );
      }
      writer.write("})),");
    }
  }
}

export function writeSelectFromQuerySelection(
  writer: CodeBlockWriter,
  program: Program,
  selection: QuerySelectionContext,
) {
  const arg = getIncrementalArg();

  if (selection.SINGLE()) {
    writer.write(`e.assert_single(`);
  }

  writer.write(`e.select(e.${selection.type_().getText()}, (${arg}) => ({`);

  writeSelectionSetForQuerySelection(
    writer,
    program,
    selection.selectionSet(),
    arg,
  );

  if (selection.potentialFilter()) {
    const filter = selection.potentialFilter();
    const expression = filter.expression();

    writer.write("filter: ");

    writeExpression(writer, expression, arg);

    writer.write(",");
  }

  writer.write(`}))`);

  if (selection.SINGLE()) {
    writer.write(`)`);
  }
}
