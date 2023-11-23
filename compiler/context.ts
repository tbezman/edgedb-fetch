import { Project } from "ts-morph";
import {
  FragmentDefinitionContext,
  QueryContext,
} from "../antlr/MyGrammarParser";

export type WithFileContext<T> = {
  context: T;
  source: string;
};

export type Program = {
  project: Project;
  fragments: Map<string, WithFileContext<FragmentDefinitionContext>>;
  queries: Map<string, WithFileContext<QueryContext>>;
};
