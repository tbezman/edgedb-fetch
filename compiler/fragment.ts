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
  const fragmentName = fragment.context.name().getText();
  console.log(`Writing Fragment: ${fragmentName}`);

  const filePath = join(process.cwd(), "dist", fragmentName + ".ts");

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
    isExported: true,
    name: `select${fragmentName}`,
    parameters: [{ name: "id", type: "string" }],
    statements: (writer) => {
      const arg = getIncrementalArg();
      writer.write(
        `return e.select(e.${fragment.context
          .entity()
          .getText()}, (${arg}) => ({`,
      );

      writer.write(`filter_single: e.op(${arg}.id, "=", e.uuid(id)),`);

      writeSelectionSetForQuerySelection(
        writer,
        program,
        fragment.context.selectionSet(),
        arg,
      );

      writer.write("}))");
    },
  });

  sourceFile.addTypeAlias({
    isExported: true,
    name: `${fragmentName}ValueType`,
    type: `NonNullable<setToTsType<ReturnType<typeof select${fragment.context
      .name()
      .getText()}>>>`,
  });

  sourceFile.addTypeAlias({
    isExported: true,
    name: `${fragmentName}Ref`,
    type: `{id: string, __deferred: true, fragmentName: '${fragmentName}'} | ${fragment.context
      .name()
      .getText()}ValueType`,
  });

  await sourceFile.save();
  await prettifyPath(sourceFile.getFilePath());
}
