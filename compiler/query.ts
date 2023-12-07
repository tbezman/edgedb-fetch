import { join } from "path";
import { QueryContext } from "../antlr/MyGrammarParser";
import { Program, WithFileContext } from "./context";
import { writeVariablesDefinition } from "./variablesDefinition";
import { writeSelectFromQuerySelection } from "./selectionSet";
import { prettifyPath } from "./prettifyPath";
import { SourceFile, VariableDeclarationKind } from "ts-morph";
import chalk from "chalk";

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
  console.log(
    chalk.yellow("✏️"),
    chalk.blue("Query"),
    chalk.white(query.context.name().getText()),
  );

  const filePath = join(
    process.cwd(),
    "dist",
    query.context.name().getText() + ".ts",
  );
  const sourceFile = program.project.createSourceFile(filePath, undefined, {
    overwrite: true,
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "@prisma/client",
    namedImports: ["PrismaClient"],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "../compiler/runtime/convertToPromises",
    namedImports: ["convertToPromises"],
  });

  addFragmentMapToSourceFile(sourceFile, program);

  let variablesType = `${query.context.name().getText()}Variables`;
  const variablesDefinition = query.context.variablesDefinition();

  sourceFile.addTypeAlias({
    isExported: true,
    name: variablesType,
    type: variablesDefinition
      ? (writer) => writeVariablesDefinition(writer, variablesDefinition)
      : "{}",
  });

  sourceFile.addFunction({
    name: query.context.name().getText(),
    statements: (writer) => {
      for (const selection of query.context
        .querySelectionSet()
        .querySelection_list()) {
        writer.write(
          `const ${selection
            .name()
            .getText()} = (client: PrismaClient, variables: ${variablesType}) => {`,
        );
        writer.write("return ");
        writeSelectFromQuerySelection(writer, program, selection);
        writer.write("}");
      }

      writer.blankLine();

      writer.write(`return {
          async run(client: PrismaClient, variables: ${variablesType}) {
            const promises = await Promise.all([${query.context
              .querySelectionSet()
              .querySelection_list()
              .map((selection) =>
                selection.name().getText(),
              )}(client,variables).then(result => {
                let outcome = result;

                convertToPromises(result, client, (newValue) => {
                  // @ts-expect-error Haven't figured out types yet
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
