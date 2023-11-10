import e from "../../dbschema/edgeql-js";
import { RefSelectorArg, RefReturnType } from "./types";

export function ReplyCommentCardRef(comment: RefSelectorArg<typeof e.Comment>) {
  return {
    id: true,
    text: true,
    author: () => ({ name: true }),
  } satisfies RefReturnType<typeof e.Comment>;
}
