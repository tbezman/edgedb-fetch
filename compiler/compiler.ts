import { globStream } from "fast-glob";
import { mkdirSync, readFileSync, rmdirSync } from "fs";
import {
  CodeBlockWriter,
  FunctionDeclarationOverloadStructure,
  OptionalKind,
  Project,
  VariableDeclarationKind,
} from "ts-morph";

import { join } from "path";

import { CharStream, CommonTokenStream } from "antlr4";
import MyGrammarLexer from "../antlr/MyGrammarLexer";

import MyGrammarParser, {
  ExpressionContext,
  FragmentDefinitionContext,
  QuerySelectionContext,
  SelectionSetContext,
  SelectStatementContext,
} from "../antlr/MyGrammarParser";
import {
  $scopify,
  ObjectTypeExpression,
} from "../dbschema/edgeql-js/typesystem";
import { $linkPropify } from "../dbschema/edgeql-js/path";
import { Cardinality } from "../dbschema/edgeql-js";

let counter = 0;
function getIncrementalArg() {
  return `arg${++counter}`;
}

const project = new Project();

type WithFileContext<T> = {
  context: T;
  source: string;
};

const edgeqlBlockRegex = /edgeql\s*\(\s*`([^`]+)`/;

const fragmentDefinitions = new Map<
  string,
  WithFileContext<FragmentDefinitionContext>
>();
const selectStatements = new Map<
  string,
  WithFileContext<SelectStatementContext>
>();

const stream = globStream("**/*.ts*", { cwd: "src" });

rmdirSync(join(process.cwd(), "dist"), { recursive: true });
mkdirSync(join(process.cwd(), "dist"));

for await (const entry of stream) {
  handleFile(join("src", entry as string));
}

function writeSelectionSetForQuerySelection(
  writer: CodeBlockWriter,
  selectionSetContext: SelectionSetContext,
  arg: string
) {
  for (const selection of selectionSetContext.fieldSelection_list()) {
    if (selection.linkedField()) {
      const linkedField = selection.linkedField();
      writer.write(`${linkedField.IDENTIFIER().getText()}: `);

      const arg = getIncrementalArg();
      writer.write(`(${arg}) => ({`);
      writeSelectionSetForQuerySelection(
        writer,
        linkedField.selectionSet(),
        arg
      );

      if (linkedField.potentialFilter()) {
        writer.write("filter: ");
        writeExpression(writer, linkedField.potentialFilter().expression());
        writer.write(",");
      }

      writer.write(`}),`);
    } else if (selection.IDENTIFIER()) {
      writer.write(`${selection.IDENTIFIER().getText()}: true,`);
    } else if (selection.fragmentSpread()) {
      const spread = selection.fragmentSpread();
      const fragment = fragmentDefinitions.get(spread.IDENTIFIER().getText());

      if (!fragment) {
        throw new Error(`Fragment ${spread.IDENTIFIER().getText()} not found`);
      }

      writer.write(`${spread.IDENTIFIER().getText()}Ref: `);

      const nextArg = getIncrementalArg();
      writer.write(`e.select(${arg}, (${nextArg}) => ({`);
      writeSelectionSetForQuerySelection(
        writer,
        fragment.context.selectionSet(),
        nextArg
      );
      writer.write("})),");
    }
  }
}

function writeExpression(
  writer: CodeBlockWriter,
  expression: ExpressionContext
) {
  const operatorParts = expression.operatorParts();

  const operators = operatorParts.operator_list();
  const operatorExpressions = operatorParts.simpleExpression_list();

  if (operatorExpressions.length !== operators.length) {
    console.log(
      operatorExpressions.map((it) => it.getText()),
      operators.map((it) => it.getText())
    );

    throw new Error("Mismatched operators and expressions");
  }

  if (operators.length > 0) {
    writer.write("e.op(");
  }

  const leftExpression = expression.leftExpression().simpleExpression();

  if (leftExpression.function_call()) {
    const functionCall = leftExpression.function_call();
    const functionName = functionCall.name().getText();

    writer.write(`e.${functionName}(`);

    for (const arg of functionCall
      .function_arguments()
      .function_argument_list()) {
      const expression = arg.expression();

      writeExpression(writer, expression);
    }

    writer.write(")");
  }

  if (operators.length > 0) {
    writer.write(")");
  }
}

function writeSelectFromQuerySelection(
  writer: CodeBlockWriter,
  selection: QuerySelectionContext
) {
  const arg = getIncrementalArg();

  if (selection.SINGLE()) {
    writer.write(`e.assert_single(`);
  }

  writer.write(`e.select(e.${selection.type_().getText()}, (${arg}) => ({`);

  writeSelectionSetForQuerySelection(writer, selection.selectionSet(), arg);

  if (selection.potentialFilter()) {
    const filter = selection.potentialFilter();
    const expression = filter.expression();

    writer.write("filter: ");

    writeExpression(writer, expression);

    writer.write(",");
  }

  writer.write(`}))`);

  if (selection.SINGLE()) {
    writer.write(`)`);
  }
}

for (const fragment of fragmentDefinitions.values()) {
  const filePath = join(
    process.cwd(),
    "dist",
    fragment.context.name().getText() + ".ts"
  );

  const sourceFile = project.createSourceFile(filePath);

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
          .getText()}, (${arg}) => ({`
      );

      writeSelectionSetForQuerySelection(
        writer,
        fragment.context.selectionSet(),
        arg
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
}

for (const select of selectStatements.values()) {
  const filePath = join(
    process.cwd(),
    "dist",
    select.context.name().getText() + ".ts"
  );

  const sourceFile = project.createSourceFile(filePath);
  sourceFile.addImportDeclaration({
    moduleSpecifier: "edgedb/dist/ifaces",
    namedImports: ["Executor"],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "../dbschema/edgeql-js",
    defaultImport: "e",
  });

  sourceFile.addFunction({
    name: select.context.name().getText(),
    statements: (writer) => {
      for (const selection of select.context
        .querySelectionSet()
        .querySelection_list()) {
        writer.write(`const ${selection.name().getText()} = (variables) => {`);
        writer.write("return ");
        writeSelectFromQuerySelection(writer, selection);
        writer.write("}");
      }

      writer.blankLine();

      writer.write(`return {
          async run(client: Executor, variables) {
            const promises = await Promise.all([${select.context
              .querySelectionSet()
              .querySelection_list()
              .map((selection) =>
                selection.name().getText()
              )}(variables).run(client)]);
          
            return {
              ${select.context
                .querySelectionSet()
                .querySelection_list()
                .map((selection, index) => {
                  return `${selection.name().getText()}: promises[${index}]`;
                })} 
            }
          }
      }`);
    },
    isExported: true,
  });

  sourceFile.formatText();
  sourceFile.saveSync();
}

const manifest = project.createSourceFile("dist/manifest.ts");

for (const query of selectStatements.values()) {
  manifest.addImportDeclaration({
    namedImports: [query.context.name().getText()],
    moduleSpecifier: `./${query.context.name().getText()}`,
  });
}

const overloads: OptionalKind<FunctionDeclarationOverloadStructure>[] = [];
for (const query of selectStatements.values()) {
  const originalText = query.source;

  overloads.push({
    parameters: [
      { name: "tag", type: `"${originalText.split("\n").join("\\n")}"` },
    ],
    returnType: `ReturnType<typeof ${query.context.name().getText()}>`,
  });
}

for (const fragment of fragmentDefinitions.values()) {
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
      initializer: `new Map<string, any>([${[...selectStatements.values()].map(
        (select) => {
          const originalText = select.source.substring(
            select.context.start.start,
            (select.context.stop?.stop ?? 0) + 1
          );

          return `["${originalText.split("\n").join("\\n")}", ${select.context
            .name()
            .getText()}]`;
        }
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

function handleFile(path: string) {
  const content = readFileSync(path, "utf8");
  const edgeqlBlocks = findEdgeqlBlocks(content);
  console.log(edgeqlBlocks);

  for (const block of edgeqlBlocks) {
    const input = block;
    const chars = new CharStream(input); // replace this with a FileStream as required
    const lexer = new MyGrammarLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new MyGrammarParser(tokens);

    const definition = parser.definition();

    if (definition.fragmentDefinition()) {
      const fragmentDefinition = definition.fragmentDefinition();
      const name = fragmentDefinition.name().getText();
      fragmentDefinitions.set(name, {
        context: fragmentDefinition,
        source: block,
      });
    } else if (definition.selectStatement()) {
      const selectStatement = definition.selectStatement();
      const name = selectStatement.name().getText();
      selectStatements.set(name, { context: selectStatement, source: block });
    }
  }
}

function findEdgeqlBlocks(content: string): string[] {
  const matches = content.match(edgeqlBlockRegex);

  if (matches) {
    return [matches[1]];
  }

  return [];
}
