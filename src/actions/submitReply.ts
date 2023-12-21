"use server";

import { client } from "@/client";
import e from "../../dbschema/edgeql-js";

export async function submitReply(formData: FormData) {
  const text = formData.get("text")?.toString();
  const commentId = formData.get("commentId")?.toString();

  if (!text) {
    throw new Error("Missing text");
  }

  const parentComment = commentId
    ? e.select(e.Comment, (comment) => ({
        filter_single: e.op(comment.id, "=", e.uuid(commentId)),
      }))
    : undefined;

  const author = e.select(e.User, (user) => ({
    limit: 1,
    order_by: e.select(e.random()),
    filter_single: e.op(e.bool(true), "=", e.bool(true)),
  }));

  return await e
    .insert(e.Comment, {
      text,
      author,
      parentComment,
    })
    .run(client);
}
