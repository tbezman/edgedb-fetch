import { FragmentSpreadContext } from "../antlr/MyGrammarParser";

export function isFragmentSpreadDeferred(spread: FragmentSpreadContext) {
  return spread
    .maybeDirectives()
    ?.directives()
    .directive_list()
    .some((directive) => directive.name().getText() === "defer");
}
