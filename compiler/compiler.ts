import { globStream } from "fast-glob";
import {
  mkdirSync,
  readFile,
  readFileSync,
  rmdirSync,
  writeFileSync,
} from "fs";
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
  QueryContext,
  QuerySelectionContext,
  SelectionSetContext,
  SimpleExpressionContext,
  TypeContext,
  VariableDefinitionContext,
  VariablesDefinitionContext,
} from "../antlr/MyGrammarParser";

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
const queries = new Map<string, WithFileContext<QueryContext>>();

const stream = globStream("**/*.ts*", { cwd: "src" });

rmdirSync(join(process.cwd(), "dist"), { recursive: true });
mkdirSync(join(process.cwd(), "dist"));

for await (const entry of stream) {
  handleFile(join("src", entry as string));
}

function writeSelectionSetForQuerySelection(
  writer: CodeBlockWriter,
  selectionSetContext: SelectionSetContext,
  arg: string,
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
        arg,
      );

      if (linkedField.potentialFilter()) {
        writer.write("filter: ");
        writeExpression(
          writer,
          linkedField.potentialFilter().expression(),
          arg,
        );
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
        nextArg,
      );
      writer.write("})),");
    }
  }
}

function writeSimpleExpression(
  writer: CodeBlockWriter,
  simpleExpression: SimpleExpressionContext,
  argName: string,
) {
  console.log("--------------------------");
  console.log("Simple Expression", simpleExpression.getText());
  console.log("--------------------------");

  if (simpleExpression.cast()) {
    const cast = simpleExpression.cast();
    writer.write(`e.${cast.type_().getText()}(`);
  }

  if (simpleExpression.function_call()) {
    const functionCall = simpleExpression.function_call();
    const functionName = functionCall.name().getText();

    writer.write(`e.${functionName}(`);

    for (const arg of functionCall
      .function_arguments()
      .function_argument_list()) {
      const expression = arg.expression();

      writeExpression(writer, expression, argName);
    }

    writer.write(")");
  } else if (simpleExpression.path()) {
    const path = simpleExpression.path();

    writer.write(`${argName}${path.getText()}`);
  } else if (simpleExpression.constant_expression()) {
    const constantExpression = simpleExpression.constant_expression();

    writer.write(constantExpression.getText());
  } else if (simpleExpression.variable()) {
    const variable = simpleExpression.variable();
    writer.write(`variables.${variable.name().getText()}`);
  }

  if (simpleExpression.cast()) {
    writer.write(`)`);
  }
}

function writeExpression(
  writer: CodeBlockWriter,
  expression: ExpressionContext,
  argName: string,
) {
  console.log("--------------------------");
  console.log("Expresion", expression.getText());
  console.log("--------------------------");

  const operatorParts = expression.operatorParts();

  const operators = operatorParts.operator_list();
  const operatorExpressions = operatorParts.simpleExpression_list();

  if (operatorExpressions.length !== operators.length) {
    console.log(
      operatorExpressions.map((it) => it.getText()),
      operators.map((it) => it.getText()),
    );

    throw new Error("Mismatched operators and expressions");
  }

  if (operators.length > 0) {
    writer.write("e.op(");
  }

  const leftExpression = expression.leftExpression().simpleExpression();
  writeSimpleExpression(writer, leftExpression, argName);

  writer.write(",");

  for (const index in operators) {
    const operator = operators[index];
    const operatorExpression = operatorExpressions[index];

    writer.write(`'${operator.getText()}', `);

    writeSimpleExpression(writer, operatorExpression, argName);

    console.log(operatorExpression.getText());

    // writer.write(")");
  }

  if (operators.length > 0) {
    writer.write(")");
  }
}

function writeSelectFromQuerySelection(
  writer: CodeBlockWriter,
  selection: QuerySelectionContext,
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

    writeExpression(writer, expression, arg);

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
    fragment.context.name().getText() + ".ts",
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
          .getText()}, (${arg}) => ({`,
      );

      writeSelectionSetForQuerySelection(
        writer,
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

function writeVariablesDefinition(
  writer: CodeBlockWriter,
  variablesDefinition: VariablesDefinitionContext,
) {
  writer.write("{");

  for (const variable of variablesDefinition.variableDefinition_list()) {
    writer.write(`${variable.name().getText()}: `);
    writeType(writer, variable.type_());
    writer.write(",");
  }

  writer.write("}");
}

function writeType(writer: CodeBlockWriter, type: TypeContext) {
  if (type.getText() === "string") {
    writer.write("string");
  }
}

for (const query of queries.values()) {
  const filePath = join(
    process.cwd(),
    "dist",
    query.context.name().getText() + ".ts",
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

  let variablesType = "{}";
  if (query.context.variablesDefinition()) {
    const variablesDefinition = query.context.variablesDefinition();

    variablesType = `${query.context.name().getText()}Variables`;

    sourceFile.addTypeAlias({
      name: variablesType,
      type: (writer) => writeVariablesDefinition(writer, variablesDefinition),
    });
  }

  sourceFile.addFunction({
    name: query.context.name().getText(),
    statements: (writer) => {
      for (const selection of query.context
        .querySelectionSet()
        .querySelection_list()) {
        writer.write(
          `const ${selection
            .name()
            .getText()} = (variables: ${variablesType}) => {`,
        );
        writer.write("return ");
        writeSelectFromQuerySelection(writer, selection);
        writer.write("}");
      }

      writer.blankLine();

      writer.write(`return {
          async run(client: Executor, variables: ${variablesType}) {
            const promises = await Promise.all([${query.context
              .querySelectionSet()
              .querySelection_list()
              .map((selection) =>
                selection.name().getText(),
              )}(variables).run(client)]);
          
            return {
              ${query.context
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

  await prettifyPath(sourceFile.getFilePath());
}

const manifest = project.createSourceFile("dist/manifest.ts");

for (const query of queries.values()) {
  manifest.addImportDeclaration({
    namedImports: [query.context.name().getText()],
    moduleSpecifier: `./${query.context.name().getText()}`,
  });
}

const overloads: OptionalKind<FunctionDeclarationOverloadStructure>[] = [];
for (const query of queries.values()) {
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
      initializer: `new Map<string, any>([${[...queries.values()].map(
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

function handleFile(path: string) {
  const content = readFileSync(path, "utf8");
  const edgeqlBlocks = findEdgeqlBlocks(content);

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
    } else if (definition.query()) {
      const query = definition.query();
      const name = query.name().getText();
      queries.set(name, { context: query, source: block });
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

async function prettifyPath(path: string) {
  const args = [`bun`, `prettier`, "--write", path, "--ignore-path"];

  const result = Bun.spawnSync(args);

  console.log(result.stdout.toString());
}
