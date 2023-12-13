import { Project, ScriptTarget, VariableDeclarationKind } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});

const files = project.getSourceFiles();

const manifest = project.createSourceFile("dist/manifest.ts", undefined, {
  overwrite: true,
});

manifest.addImportDeclaration({
  defaultImport: "e",
  namedImports: [{ isTypeOnly: true, name: "Cardinality" }],
  moduleSpecifier: "../dbschema/edgeql-js",
});

manifest.addImportDeclaration({
  namedImports: [
    "$expr_Select",
    "normaliseShape",
    "SelectModifierNames",
    "ComputeSelectCardinality",
    "SelectModifiers",
    "objectTypeToSelectShape",
  ],
  moduleSpecifier: "../dbschema/edgeql-js/select",
});

manifest.addImportDeclaration({
  moduleSpecifier: "../dbschema/edgeql-js/typesystem",
  namedImports: ["ObjectType", "$scopify", "ObjectTypeExpression"],
});

manifest.addImportDeclaration({
  moduleSpecifier: "../dbschema/edgeql-js/syntax",
  namedImports: ["$linkPropify"],
});

const fragments: Array<{ name: string }> = [];
for (const file of files) {
  const declarations = file.getVariableDeclarations();

  for (const declaration of declarations) {
    if (declaration.getName().endsWith("Fragment")) {
      fragments.push({ name: declaration.getName() });

      manifest.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: declaration.getName(),
            initializer: declaration.getInitializer()?.getText(),
          },
        ],
      });
    }
  }
}

manifest.addVariableStatement({
  isExported: true,
  declarationKind: VariableDeclarationKind.Const,
  declarations: [
    {
      name: "Fragments",
      initializer: (writer) => {
        writer.write("{");

        for (const fragment of fragments) {
          writer.write(fragment.name + ",");
        }

        writer.write("} as const");
      },
    },
  ],
});

manifest.addFunction({
  name: "spread",
  isExported: true,
  overloads: fragments.map((fragment) => {
    return {
      typeParameters: [{ name: "Expr", constraint: "ObjectTypeExpression" }],
      parameters: [
        { name: "fragmentName", type: `'${fragment.name}'` },
        {
          name: "expr",
          type: "Expr",
        },
      ],
      returnType: (writer) => {
        writer.writeLine(`{
        '${fragment.name}': $expr_Select<{
          __element__: ObjectType<
            \`\${Expr["__element__"]["__name__"]}\`, // _shape
            Expr["__element__"]["__pointers__"],
            Omit<normaliseShape<ReturnType<typeof ${fragment.name}>>, SelectModifierNames>
          >;
          __cardinality__: typeof Cardinality.One;
        }>;
      }`);
      },
    };
  }),
  parameters: [
    { name: "fragmentName", type: "any" },
    { name: "shape", type: "any" },
  ],
  statements: (writer) => {
    writer.writeLine("const fragment = Fragments[fragmentName] as any;");

    writer.writeLine(
      "return { [fragmentName]: e.select(shape, arg => fragment(arg)) }",
    );
  },
});

manifest.saveSync();
