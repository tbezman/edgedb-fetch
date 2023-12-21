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

const Fragment = e.fragment("CommentSectionPostFragment", e.Post, () => ({
  comments: (comment) => ({
    id: true,

    text: true,
  }),
}));

type X = {
  comments: Array<{
    id: string;
    __CommentCardCommentFragment: { text: string };
  }>;
};

export function CommentSection({ postRef, searchParams }: CommentSectionProps) {
  const post = useFragment(postRef, Fragment);

  return null;
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
