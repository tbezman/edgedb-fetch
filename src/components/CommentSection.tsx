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
  searchParams: { highlightedComment?: string };
};

export function CommentSection({ postRef, searchParams }: CommentSectionProps) {
  const post = useFragment(
    postRef,
    e.fragment("CommentSectionPostFragment", e.Post, () => ({
      comments: (comment) => ({
        id: true,

        ...CommentCardCommentFragment(comment),
      }),
    })),
  );

  // return post?.comments?.map((comment) => {
  //   return (
  //     <li key={comment.id}>
  //       <CommentCard
  //         commentRef={comment}
  //         highlightedCommentId={searchParams.highlightedComment}
  //       />
  //     </li>
  //   );
  // });
}
