import { RefType } from "@/types";
import e from "../../dbschema/edgeql-js";

export const ReplyCommentCardFragment = e.shape(e.Comment, (comment) => ({
  id: true,
  author: {
    name: true,
  },
  text: true,
}));

export type ReplyCommentCardFragmentRef = RefType<
  typeof e.Comment,
  typeof ReplyCommentCardFragment
>;
