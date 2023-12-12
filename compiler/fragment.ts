import { join } from "path";
import { Program, WithFileContext } from "./context";
import { FragmentDefinitionContext } from "../antlr/MyGrammarParser";
import { getIncrementalArg } from "./getIncrementalArg";
import { writeSelectionSetForQuerySelection } from "./selectionSet";
import { prettifyPath } from "./prettifyPath";
import chalk from "chalk";
import { SourceFile, VariableDeclarationKind } from "ts-morph";
import {
  DeferredFragmentsVisitor,
  isFragmentPathValid,
} from "./deferredFragmentsVisitor";
import { addFragmentMapToSourceFile } from "./addFragmentSelectMap";

export async function writeFragmentFile(
  program: Program,
  fragment: WithFileContext<FragmentDefinitionContext>,
) {
  const fragmentName = fragment.context.name().getText();
  console.log(
    chalk.yellow("✏️"),
    chalk.blue("️Fragment"),
    chalk.white(fragmentName),
  );

  const filePath = join(process.cwd(), "dist", fragmentName + ".ts");

  const sourceFile = program.project.createSourceFile(filePath, undefined, {
    overwrite: true,
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "@prisma/client",
    isTypeOnly: true,
    namedImports: ["PrismaClient"],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "../compiler/runtime/convertToPromises",
    namedImports: ["convertToPromises"],
  });

  addFragmentMapToSourceFile(sourceFile, program);

  sourceFile.addFunction({
    isExported: true,
    isAsync: true,
    name: `select${fragmentName}`,
    parameters: [
      { name: "client", type: "PrismaClient" },
      { name: "id", type: "string" },
    ],
    statements: (writer) => {
      const fragmentType = fragment.context.entity().IDENTIFIER().getText();
      writer.write(
        `const result = await client!.${fragmentType.toLowerCase()}.findFirst({ select : {`,
      );

      writeSelectionSetForQuerySelection(
        writer,
        program,
        fragment.context.selectionSet(),
      );

      writer.write("},");

      writer.write("where: { id }");

      writer.write("});");

      // writer.write(
      //   "await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));",
      // );

      const visitor = new DeferredFragmentsVisitor(program);
      visitor.visit(fragment.context.selectionSet());
      visitor.fragmentPaths;

      if (isFragmentPathValid(visitor.fragmentPaths)) {
        writer.write(`let path = ${JSON.stringify(visitor.fragmentPaths)};`);

        writer.write(
          "convertToPromises(path, result, fragmentSelectMap, client);",
        );
      }

      writer.write("return result");
    },
  });

  sourceFile.addTypeAlias({
    isExported: true,
    name: `${fragmentName}ValueType`,
    type: `NonNullable<Awaited<ReturnType<typeof select${fragmentName}>>>`,
  });

  sourceFile.addTypeAlias({
    isExported: true,
    name: `${fragmentName}Ref`,
    type: `Promise<${fragmentName}ValueType> | { id: string } | ${fragmentName}ValueType`,
  });

  await sourceFile.save();
  await prettifyPath(sourceFile.getFilePath());
}
