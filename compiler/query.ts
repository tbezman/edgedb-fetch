import { join } from "path";
import { QueryContext } from "../antlr/MyGrammarParser";
import { Program, WithFileContext } from "./context";
import { writeVariablesDefinition } from "./variablesDefinition";
import { writeSelectFromQuerySelection } from "./selectionSet";
import { prettifyPath } from "./prettifyPath";
import { SourceFile, VariableDeclarationKind } from "ts-morph";
import chalk from "chalk";
import {
  DeferredFragmentsVisitor,
  isFragmentPathValid,
} from "./deferredFragmentsVisitor";
import { addFragmentMapToSourceFile } from "./addFragmentSelectMap";

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

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      { name: "fragmentMap", initializer: "new Map<string, () => any>" },
    ],
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

      const querySelectionList = query.context
        .querySelectionSet()
        .querySelection_list();

      writer.write(`return {
        async run(client: PrismaClient, variables: ${variablesType}) {`);

      for (const selection of querySelectionList) {
        writer.write(`const ${selection.name().getText()}Promise =`);

        writer.write(
          `${selection.name().getText()}(client, variables).then((result)=> {`,
        );

        const visitor = new DeferredFragmentsVisitor(program);
        visitor.visit(selection);
        visitor.fragmentPaths;

        if (isFragmentPathValid(visitor.fragmentPaths)) {
          writer.write(`let path = ${JSON.stringify(visitor.fragmentPaths)};`);

          writer.write(
            "convertToPromises(path, result, fragmentSelectMap, client);",
          );
        }

        writer.write("return result;");

        writer.write(`})`);
      }

      writer.blankLine();

      writer.write(`
          const promises = await Promise.all([${querySelectionList.map(
            (selection) => `${selection.name().getText()}Promise`,
          )}]);`);

      writer.write(`
          return {
            ${querySelectionList.map((selection, index) => {
              return `${selection.name().getText()}: promises[${index}]`;
            })}
          };
      `);

      writer.write(`}`);
      writer.write(`}`);
    },
    isExported: true,
  });

  await sourceFile.save();
  await prettifyPath(sourceFile.getFilePath());
}
