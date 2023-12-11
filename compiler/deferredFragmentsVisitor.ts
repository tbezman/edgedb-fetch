import {
  FieldSelectionContext,
  FragmentSpreadContext,
  LinkedFieldContext,
  QuerySelectionContext,
  QuerySelectionSetContext,
  SelectionSetContext,
} from "../antlr/MyGrammarParser";
import MyGrammarVisitor from "../antlr/MyGrammarVisitor";
import { Program } from "./context";
import { isFragmentSpreadDeferred } from "./isDeferred";

export type DeferredFragmentPath = {
  path: string[];
  fragmentSpreads: string[];

  children: DeferredFragmentPath[];
};

export class DeferredFragmentsVisitor extends MyGrammarVisitor<void> {
  fragmentPaths: DeferredFragmentPath = {
    path: [],
    fragmentSpreads: [],
    children: [],
  };

  path: string[] = [];
  program: Program;

  constructor(program: Program) {
    super();

    this.program = program;
  }

  resetThing() {
    this.fragmentPaths = {
      path: [],
      fragmentSpreads: [],
      children: [],
    };
  }

  visitQuerySelection?: (ctx: QuerySelectionContext) => void = (ctx) => {
    this.visitChildren(ctx);
  };

  visitQuerySelectionSet: (ctx: QuerySelectionSetContext) => void = (ctx) => {
    this.visitChildren(ctx);
  };

  visitSelectionSet: (ctx: SelectionSetContext) => void = (ctx) => {
    this.visitChildren(ctx);
  };

  visitFieldSelection: (ctx: FieldSelectionContext) => void = (ctx) => {
    return this.visitChildren(ctx);
  };

  visitFragmentSpread: (ctx: FragmentSpreadContext) => void = (ctx) => {
    const fragment = this.program.fragments.get(ctx.IDENTIFIER().getText())
      ?.context;

    if (!fragment) {
      throw new Error(`Fragment: ${ctx.IDENTIFIER().getText()} did not exist.`);
    }

    if (isFragmentSpreadDeferred(ctx)) {
      this.fragmentPaths.path = [...this.path];
      this.fragmentPaths.fragmentSpreads.push(ctx.IDENTIFIER().getText());

      return;
    }

    this.visit(fragment?.selectionSet());
  };

  visitLinkedField: (ctx: LinkedFieldContext) => DeferredFragmentPath | null = (
    ctx,
  ) => {
    this.path.push(ctx.IDENTIFIER().getText());

    this.visitChildren(ctx);

    this.path.pop();

    return this.fragmentPaths;
  };
}

export function isFragmentPathValid(thing: DeferredFragmentPath): boolean {
  return thing.fragmentSpreads.length > 0;
}
