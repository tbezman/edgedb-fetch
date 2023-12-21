"use client";

import { useFragment } from "@/useFragment";
import e from "../../dbschema/edgeql-js";
import {
  CommentCardCommentFragment,
  CommentSectionPostFragmentRef,
} from "../../dist/manifest";
import { CommentCard } from "./CommentCard";

type CommentSectionProps = {
  postRef: CommentSectionPostFragmentRef;
};

export function CommentSection({ postRef }: CommentSectionProps) {
  const post = useFragment(
    postRef,
    e.fragment("CommentSectionPostFragment", e.Post, () => ({
      id: true,
      comments: (comment) => ({
        id: true,

        ...CommentCardCommentFragment(comment),
      }),
    })),
  );

  return post?.comments?.map((comment) => {
    return (
      <li key={comment.id}>
        <CommentCard commentRef={comment} />
      </li>
    );
  });
}
