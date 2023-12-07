import { CodeBlockWriter } from "ts-morph";
import {
  SelectionSetContext,
  QuerySelectionContext,
} from "../antlr/MyGrammarParser";
import { getIncrementalArg } from "./getIncrementalArg";
import { Program } from "./context";
import { writeFilter } from "./filter";

export function writeSelectionSetForQuerySelection(
  writer: CodeBlockWriter,
  program: Program,
  selectionSetContext: SelectionSetContext,
) {
  for (const selection of selectionSetContext.fieldSelection_list()) {
    if (selection.linkedField()) {
      const linkedField = selection.linkedField();
      writer.write(`${linkedField.IDENTIFIER().getText()}: `);

      const arg = getIncrementalArg();
      writer.write(`{ select: {`);
      writeSelectionSetForQuerySelection(
        writer,
        program,
        linkedField.selectionSet(),
      );

      if (linkedField.potentialFilter()) {
        writer.write("where: {");
        writeFilter(writer, linkedField.potentialFilter().filter());
        writer.write("},");
      }

      writer.write(`}},`);
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
        console.log(program.fragments.entries());
        throw new Error(`Fragment ${spread.IDENTIFIER().getText()} not found`);
      }

      if (isDeferred) {
        writer.write(
          `id: true, __deferred: e.select(true), fragmentName: e.select('${fragmentName}')`,
        );
      } else {
        writeSelectionSetForQuerySelection(
          writer,
          program,
          fragment.context.selectionSet(),
        );
      }
    }
  }
}

export function writeSelectFromQuerySelection(
  writer: CodeBlockWriter,
  program: Program,
  selection: QuerySelectionContext,
) {
  const arg = getIncrementalArg();
  const typeName = selection.type_().getText();

  if (selection.SINGLE()) {
    writer.write(`client.${typeName.toLowerCase()}.findFirst(`);
  } else {
    writer.write(`client.${typeName.toLowerCase()}.findMany(`);
  }

  writer.write(`{`);

  writer.write(`select: {`);

  writeSelectionSetForQuerySelection(writer, program, selection.selectionSet());

  writer.write("},");

  if (selection.potentialFilter()) {
    const filter = selection.potentialFilter().filter();

    writer.write("where: {");

    writeFilter(writer, filter);

    writer.write("},");
  }

  writer.write(`})`);
}
