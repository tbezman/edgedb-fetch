import { Project, SyntaxKind, VariableDeclarationKind } from "ts-morph";

debugger;

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

manifest.addTypeAlias({
  name: "ExprShape",
  typeParameters: [{ name: "Expr", constraint: "ObjectTypeExpression" }],
  type: `
$scopify<
  Expr["__element__"]
> &
  $linkPropify<{
    [k in keyof Expr]: k extends "__cardinality__"
      ? typeof Cardinality.One
      : Expr[k];
  }>
  `,
});

const fragments: Array<{ name: string; type: string; text: string }> = [];
for (const file of files) {
  file
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .forEach((callExpression) => {
      const pae = callExpression?.getChildAtIndexIfKind(
        0,
        SyntaxKind.PropertyAccessExpression,
      );

      const identifiers = pae?.getChildrenOfKind(SyntaxKind.Identifier) ?? [];
      const [first, second] = identifiers;

      if (
        first?.getText() === "e" &&
        second?.getText() === "fragment" &&
        callExpression
      ) {
        const nameArgument = callExpression.getArguments()[0];
        const fragmentName = nameArgument
          .getText()
          .slice(1, nameArgument.getText().length - 1);

        const typeArgument = callExpression.getArguments()[1];
        const typeName = typeArgument.getText().split("e.")[1];

        fragments.push({
          name: fragmentName,
          text: callExpression.getText(),
          type: typeName,
        });
      }
    });
}

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

for (const fragment of fragments) {
  manifest.addTypeAlias({
    isExported: true,
    name: `${fragment.name}Ref`,
    type: (writer) => {
      writer.block(() => {
        writer.write("$fragmentSpreads:");

        writer.block(() => {
          writer.write(`${fragment.name}: true`);
        });
      });
    },
  });

  manifest.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: fragment.name,
        initializer: (writer) => {
          writer.write("(shape: ");

          writer.write(`ExprShape<typeof e.${fragment.type}>`);

          writer.write(") =>");

          writer.block(() => {
            writer.write(`const FragmentMaskType = e.shape(e.${fragment.type}, () => ({
                '$fragmentSpreads': e.select(shape, ()=> ({
                  '${fragment.name}': e.select(e.bool(true)),
                }))
              }))`);

            writer.writeLine(
              "type AsType = ReturnType<typeof FragmentMaskType>",
            );

            writer.blankLine();

            writer.write("return ");

            writer.inlineBlock(() => {
              writer.write("__" + fragment.name);
              writer.write(": e.select(shape, ");
              writer.write(fragment.text);
              writer.write(".shape())");
            });

            writer.write("as any as AsType");
          });
        },
      },
    ],
  });
}

manifest.addVariableStatement({
  declarationKind: VariableDeclarationKind.Const,
  declarations: [
    {
      name: "fragmentMap",
      initializer: (writer) => {
        writer.write("new Map<string, ReturnType<typeof e.fragment>>()");
      },
    },
  ],
});

manifest.addStatements(
  fragments.map((fragment) => {
    return (writer) => {
      writer.writeLine(`fragmentMap.set('${fragment.name}', ${fragment.text})`);
    };
  }),
);

manifest.addExportDeclaration({ namedExports: ["fragmentMap"] });

manifest.formatText();
manifest.saveSync();
