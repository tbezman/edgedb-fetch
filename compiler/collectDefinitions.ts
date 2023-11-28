import { readFile } from "fs/promises";
import MyGrammarParser, {
  FragmentDefinitionContext,
  QueryContext,
} from "../antlr/MyGrammarParser";
import { CharStream, CommonTokenStream } from "antlr4";
import MyGrammarLexer from "../antlr/MyGrammarLexer";
import { WithFileContext } from "./context";

export type Definitions = {
  queries: WithFileContext<QueryContext>[];
  fragments: WithFileContext<FragmentDefinitionContext>[];
};

export async function collectDefinitions(path: string): Promise<Definitions> {
  const content = await readFile(path, "utf8");
  const edgeqlBlocks = findEdgeqlBlocks(content);

  console.log(edgeqlBlocks);

  const definitions: Definitions = { fragments: [], queries: [] };

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

      definitions.fragments.push({
        context: fragmentDefinition,
        source: block,
      });
    } else if (definition.query()) {
      const query = definition.query();
      const name = query.name().getText();

      definitions.queries.push({
        context: query,
        source: block,
      });
    }
  }

  return definitions;
}

const edgeqlBlockRegex = /edgeql\s*\(\s*`([^`]+)`/g;
function findEdgeqlBlocks(text: string): string[] {
  const matches: string[] = [];
  let match;

  while ((match = edgeqlBlockRegex.exec(text)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === edgeqlBlockRegex.lastIndex) {
      edgeqlBlockRegex.lastIndex++;
    }

    // The first capturing group is at index 1
    if (match[1]) {
      matches.push(match[1]);
    }
  }

  return matches;
}
