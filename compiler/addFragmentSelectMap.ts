import { SourceFile, VariableDeclarationKind } from "ts-morph";
import { Program } from "./context";

export function addFragmentMapToSourceFile(
  sourceFile: SourceFile,
  program: Program,
) {
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
