import { join } from "path";
import { QueryContext } from "../antlr/MyGrammarParser";
import { Program, WithFileContext } from "./context";
import { writeVariablesDefinition } from "./variablesDefinition";
import { writeSelectFromQuerySelection } from "./selectionSet";
import { prettifyPath } from "./prettifyPath";
import { SourceFile, VariableDeclarationKind } from "ts-morph";

function addFragmentMapToSourceFile(sourceFile: SourceFile, program: Program) {
  for (const fragment of program.fragments.values()) {
    sourceFile.addImportDeclaration({
      namedImports: [`select${fragment.context.name().getText()}`],
      moduleSpecifier: `./${fragment.context.name().getText()}`,
    });
  }

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: "fragmentSelectMap",
        initializer: `new Map<string, any>()`,
      },
    ],
  });

  for (const fragment of program.fragments.values()) {
    const fragmentName = fragment.context.name().getText();

    sourceFile.addStatements((writer) => {
      writer.write(
        `fragmentSelectMap.set("${fragmentName}", select${fragmentName})`,
      );
    });
  }
}

export async function writeQueryFile(
  program: Program,
  query: WithFileContext<QueryContext>,
) {
  console.log(`Writing Query: ${query.context.name().getText()}`);

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

  sourceFile.addImportDeclaration({
    moduleSpecifier: "../compiler/runtime/convertToPromises",
    namedImports: ["convertToPromises"],
  });

  addFragmentMapToSourceFile(sourceFile, program);

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
              )}(variables).run(client).then(result => {
                let outcome = result;

                convertToPromises(result, client, (newValue) => {
                  outcome = newValue;
                }, fragmentSelectMap);

                return outcome;
              })]);
          
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

  await sourceFile.save();
  await prettifyPath(sourceFile.getFilePath());
}
