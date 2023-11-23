import { join } from "path";
import { QueryContext } from "../antlr/MyGrammarParser";
import { Program, WithFileContext } from "./context";
import { writeVariablesDefinition } from "./variablesDefinition";
import { writeSelectFromQuerySelection } from "./selectionSet";
import { prettifyPath } from "./prettifyPath";

export async function writeQueryFile(
  program: Program,
  query: WithFileContext<QueryContext>,
) {
  const filePath = join(
    process.cwd(),
    "dist",
    query.context.name().getText() + ".ts",
  );

  const sourceFile = program.project.createSourceFile(filePath);
  sourceFile.addImportDeclaration({
    moduleSpecifier: "edgedb/dist/ifaces",
    namedImports: ["Executor"],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "../dbschema/edgeql-js",
    defaultImport: "e",
  });

  let variablesType = "{}";
  if (query.context.variablesDefinition()) {
    const variablesDefinition = query.context.variablesDefinition();

    variablesType = `${query.context.name().getText()}Variables`;

    sourceFile.addTypeAlias({
      name: variablesType,
      type: (writer) => writeVariablesDefinition(writer, variablesDefinition),
    });
  }

  sourceFile.addFunction({
    name: query.context.name().getText(),
    statements: (writer) => {
      for (const selection of query.context
        .querySelectionSet()
        .querySelection_list()) {
        writer.write(
          `const ${selection
            .name()
            .getText()} = (variables: ${variablesType}) => {`,
        );
        writer.write("return ");
        writeSelectFromQuerySelection(writer, program, selection);
        writer.write("}");
      }

      writer.blankLine();

      writer.write(`return {
          async run(client: Executor, variables: ${variablesType}) {
            const promises = await Promise.all([${query.context
              .querySelectionSet()
              .querySelection_list()
              .map((selection) =>
                selection.name().getText(),
              )}(variables).run(client)]);
          
            return {
              ${query.context
                .querySelectionSet()
                .querySelection_list()
                .map((selection, index) => {
                  return `${selection.name().getText()}: promises[${index}]`;
                })} 
            }
          }
      }`);
    },
    isExported: true,
  });

  sourceFile.formatText();
  sourceFile.saveSync();

  await prettifyPath(sourceFile.getFilePath());
}
