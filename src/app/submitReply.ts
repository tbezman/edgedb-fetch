"use server";

import { client } from "@/client";

export async function submitReply(formdata: FormData) {
  const text = formdata.get("text")?.toString();
  const commentId = formdata.get("commentId")?.toString();

  if (!text) {
    throw new Error("Missing text");
  }

  const userCount = await client.user.count();
  const randomUserSkip = Math.floor(Math.random() * userCount);

  const randomUser = await client.user.findFirstOrThrow({
    skip: randomUserSkip,
  });

  await client.comment.create({
    data: {
      text: text,
      parentId: commentId,
      authorId: randomUser.id,
    },
  });
}
