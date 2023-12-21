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

          writer.write(`
           $scopify<typeof e.${fragment.type}["__element__"]> &
            $linkPropify<{
              [k in keyof typeof e.${fragment.type}]: k extends "__cardinality__"
                ? typeof Cardinality.One
                : typeof e.${fragment.type}[k];
            }>
          `);

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

manifest.formatText();
manifest.saveSync();
