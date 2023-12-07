"use server";

import { client } from "@/client";

export async function submitReply(formdata: FormData) {
  const text = formdata.get("text")?.toString();
  const commentId = formdata.get("commentId")?.toString();

  if (!text) {
    throw new Error("Missing text");
  }

  const userCount = await client.user.count();
  const randomSkip = Math.floor(Math.random() * userCount);
  const randomUser = await client.user.findFirstOrThrow({ skip: randomSkip });

  return client.comment.create({
    data: {
      text,
      authorId: randomUser.id,
      parentId: commentId,
    },
  });
}
