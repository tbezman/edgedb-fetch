import {
  OptionalKind,
  FunctionDeclarationOverloadStructure,
  VariableDeclarationKind,
} from "ts-morph";
import { Program } from "./context";
import { prettifyPath } from "./prettifyPath";

export async function writeManifestFile(program: Program) {
  const manifest = program.project.createSourceFile(
    "dist/manifest.ts",
    undefined,
    { overwrite: true },
  );

  manifest.addImportDeclaration({
    namedImports: ["use"],
    moduleSpecifier: "react",
  });

  manifest.addImportDeclaration({
    namedImports: ["Executor"],
    moduleSpecifier: "edgedb/dist/ifaces",
  });

  for (const query of program.queries.values()) {
    const queryName = query.context.name().getText();
    manifest.addImportDeclaration({
      namedImports: [queryName, `${queryName}Variables`],
      moduleSpecifier: `./${query.context.name().getText()}`,
    });
  }

  for (const fragment of program.fragments.values()) {
    manifest.addImportDeclaration({
      namedImports: [
        `select${fragment.context.name().getText()}`,
        `${fragment.context.name().getText()}Ref`,
        `${fragment.context.name().getText()}ValueType`,
      ],
      moduleSpecifier: `./${fragment.context.name().getText()}`,
    });
  }

  const overloads: OptionalKind<FunctionDeclarationOverloadStructure>[] = [];
  for (const query of program.queries.values()) {
    const originalText = query.source;
    const queryName = query.context.name().getText();

    overloads.push({
      parameters: [
        { name: "tag", type: `"${originalText.split("\n").join("\\n")}"` },
      ],
      returnType: `{
      run: (client: Executor, variables: ${queryName}Variables) => Promise<ReturnType<ReturnType<typeof ${queryName}>['run']>>,
      }`,
    });
  }

  for (const fragment of program.fragments.values()) {
    const originalText = fragment.source;

    overloads.push({
      parameters: [
        { name: "tag", type: `"${originalText.split("\n").join("\\n")}"` },
      ],

      returnType: `{
      pull: (ref: ${fragment.context.name().getText()}Ref) => ${fragment.context
        .name()
        .getText()}ValueType, 
    }`,
    });
  }

  manifest.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: "map",
        initializer: `new Map<string, any>()`,
      },
    ],
  });

  for (const [key, value] of program.queries.entries()) {
    manifest.addStatements(`map.set(\`${value.source}\`, ${key});`);
  }

  for (const [key, value] of program.fragments.entries()) {
    manifest.addStatements(`map.set(\`${value.source}\`, select${key});`);
  }

  manifest.addFunction({
    overloads,
    name: "edgeql",
    isExported: true,
    returnType: "any",
    parameters: [{ name: "tag", type: `any` }],
    statements: `
  return {
    run(client: any, variables: any) { return map.get(tag)().run(client, variables) },
    pull(ref: any) { 
      if('__deferred' in ref) {
        throw new Error("Did not expect to actually see _deferred, that's just for types");
      } else if (ref instanceof Promise) {
        return use(ref);
      } else {
        return ref;
      }
    }
  }
  `,
  });

  await manifest.save();
  await prettifyPath(manifest.getFilePath());
}
