"use server";

import e from "../../dbschema/edgeql-js";
import { createClient } from "../../dbschema/edgeql-js";

const client = createClient();
export async function submitReply(formdata: FormData) {
  const text = formdata.get("text")?.toString();
  const commentId = formdata.get("commentId")?.toString();

  if (!text) {
    throw new Error("Missing text");
  }

  const parentComment = commentId
    ? e.assert_single(
        e.select(e.Comment, (comment) => ({
          filter: e.op(comment.id, "=", e.uuid(commentId)),
        })),
      )
    : undefined;

  const author = e.assert_single(
    e.select(e.User, (user) => ({
      order_by: e.select(e.random()),
      limit: 1,
    })),
  );

  return await e
    .insert(e.Comment, {
      text,
      author,
      parentComment,
    })
    .run(client);
}
