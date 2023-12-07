import { join } from "path";
import { Program, WithFileContext } from "./context";
import { FragmentDefinitionContext } from "../antlr/MyGrammarParser";
import { getIncrementalArg } from "./getIncrementalArg";
import { writeSelectionSetForQuerySelection } from "./selectionSet";
import { prettifyPath } from "./prettifyPath";
import chalk from "chalk";

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

  sourceFile.addFunction({
    isExported: true,
    isAsync: true,
    name: `select${fragmentName}`,
    parameters: [{ name: "id", type: "string" }],
    statements: (writer) => {
      writer.write(`let client: PrismaClient;`);

      const fragmentType = fragment.context.entity().IDENTIFIER().getText();
      writer.write(
        `return client!.${fragmentType.toLowerCase()}.findFirst({ select : {`,
      );

      writeSelectionSetForQuerySelection(
        writer,
        program,
        fragment.context.selectionSet(),
      );

      writer.write("}});");
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
    type: `Promise<${fragmentName}ValueType> | {id: string, __deferred: true, fragmentName: '${fragmentName}'} | ${fragmentName}ValueType`,
  });

  await sourceFile.save();
  await prettifyPath(sourceFile.getFilePath());
}
