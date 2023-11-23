import { join } from "path";
import { Program, WithFileContext } from "./context";
import { FragmentDefinitionContext } from "../antlr/MyGrammarParser";
import { getIncrementalArg } from "./getIncrementalArg";
import { writeSelectionSetForQuerySelection } from "./selectionSet";
import { prettifyPath } from "./prettifyPath";

export async function writeFragmentFile(
  program: Program,
  fragment: WithFileContext<FragmentDefinitionContext>,
) {
  const filePath = join(
    process.cwd(),
    "dist",
    fragment.context.name().getText() + ".ts",
  );

  const sourceFile = program.project.createSourceFile(filePath);

  sourceFile.addImportDeclaration({
    moduleSpecifier: "../dbschema/edgeql-js",
    defaultImport: "e",
  });

  sourceFile.addImportDeclaration({
    namedImports: ["setToTsType"],
    moduleSpecifier: "../dbschema/edgeql-js/typesystem",
  });

  sourceFile.addFunction({
    name: `select${fragment.context.name().getText()}`,
    parameters: [{ name: "variables", type: "unknown" }],
    statements: (writer) => {
      const arg = getIncrementalArg();
      writer.write(
        `return e.assert_single(e.select(e.${fragment.context
          .entity()
          .getText()}, (${arg}) => ({`,
      );

      writeSelectionSetForQuerySelection(
        writer,
        program,
        fragment.context.selectionSet(),
        arg,
      );

      writer.write("})))");
    },
  });

  sourceFile.addTypeAlias({
    isExported: true,
    name: `${fragment.context.name().getText()}Ref`,
    type: `setToTsType<ReturnType<typeof select${fragment.context
      .name()
      .getText()}>>`,
  });

  sourceFile.formatText();
  sourceFile.saveSync();

  await prettifyPath(sourceFile.getFilePath());
}
