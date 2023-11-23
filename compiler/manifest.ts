import {
  OptionalKind,
  FunctionDeclarationOverloadStructure,
  VariableDeclarationKind,
} from "ts-morph";
import { Program } from "./context";
import { prettifyPath } from "./prettifyPath";

export async function writeManifestFile(program: Program) {
  const manifest = program.project.createSourceFile("dist/manifest.ts");

  for (const query of program.queries.values()) {
    manifest.addImportDeclaration({
      namedImports: [query.context.name().getText()],
      moduleSpecifier: `./${query.context.name().getText()}`,
    });
  }

  const overloads: OptionalKind<FunctionDeclarationOverloadStructure>[] = [];
  for (const query of program.queries.values()) {
    const originalText = query.source;

    overloads.push({
      parameters: [
        { name: "tag", type: `"${originalText.split("\n").join("\\n")}"` },
      ],
      returnType: `ReturnType<typeof ${query.context.name().getText()}>`,
    });
  }

  for (const fragment of program.fragments.values()) {
    const originalText = fragment.source;

    overloads.push({
      parameters: [
        { name: "tag", type: `"${originalText.split("\n").join("\\n")}"` },
      ],

      returnType: `{
      pull: (ref: any) => any
    }`,
    });
  }

  manifest.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: "map",
        initializer: `new Map<string, any>([${[...program.queries.values()].map(
          (select) => {
            return `[\`${select.source}\`, ${select.context.name().getText()}]`;
          },
        )}])
  `,
      },
    ],
  });

  manifest.addFunction({
    overloads,
    name: "edgeql",
    isExported: true,
    returnType: "any",
    parameters: [{ name: "tag", type: `any` }],
    statements: `
  return {
    run(client, variables) { return map.get(tag)().run(client, variables) },
    pull(ref) { return ref }
  }
  `,
  });

  manifest.formatText({});
  manifest.saveSync();

  await prettifyPath(manifest.getFilePath());
}
