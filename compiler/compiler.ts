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
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .forEach((declaration) => {
      const initializer = declaration.getInitializer();

      console.log("----------------");
      console.log(initializer?.getText());

      if (initializer?.isKind(SyntaxKind.CallExpression)) {
        const expression = initializer.getExpressionIfKind(
          SyntaxKind.PropertyAccessExpression,
        );

        if (expression) {
          const callExpression = expression.getChildAtIndexIfKind(
            0,
            SyntaxKind.CallExpression,
          );

          const pae = callExpression?.getChildAtIndexIfKind(
            0,
            SyntaxKind.PropertyAccessExpression,
          );

          const identifiers =
            pae?.getChildrenOfKind(SyntaxKind.Identifier) ?? [];
          console.log(identifiers.map((it) => it.getText()));
          const [first, second] = identifiers;

          if (
            first?.getText() === "e" &&
            second?.getText() === "shape" &&
            callExpression
          ) {
            const argument = callExpression.getArguments()[0];
            const typeName = argument.getText().split("e.")[1];

            fragments.push({
              name: `${file.getBaseNameWithoutExtension()}${typeName}Fragment`,
              text: callExpression.getText(),
              type: typeName,
            });
          }
        }
      }
    });
}

console.log(fragments);

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

          writer.write(") => ");
          writer.write("({");
          writer.write(fragment.name);
          writer.write(": ");
          writer.write("e.select(shape, ");
          writer.write(fragment.text);
          writer.write(")})");
        },
      },
    ],
  });
}

manifest.formatText();
manifest.saveSync();
