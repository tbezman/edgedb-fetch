"use client";

import { useEffect, useRef } from "react";
import e from "../../dbschema/edgeql-js";
import { useQueryState } from "next-usequerystate";
import clsx from "clsx";
import { isOptimistic } from "@edgedb/react/dist/react/src/cache";
import { ReplyCommentCardCommentFragmentRef } from "../../dbschema/edgeql-js/manifest";

type ReplyCommentCardProps = {
  highlightedCommentId?: string;
  commentRef: ReplyCommentCardCommentFragmentRef;
};

export function ReplyCommentCard({ commentRef }: ReplyCommentCardProps) {
  const comment = e
    .fragment("ReplyCommentCardCommentFragment", e.Comment, (comment) => ({
      id: true,
      author: {
        id: true,
        name: true,
      },
      text: true,
    }))
    .pull(commentRef);

  const elementRef = useRef<HTMLDivElement | null>(null);

  const [highlightedCommentId] = useQueryState("highlightedComment");

  useEffect(() => {
    if (highlightedCommentId === comment.id) {
      elementRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [comment.id, highlightedCommentId]);

  const isHighlighted = highlightedCommentId === comment.id;

  return (
    <div
      ref={elementRef}
      className={clsx("p-2 text-[15px] flex items-center gap-x-2 rounded", {
        flash: isHighlighted && !isOptimistic(comment),
        "opacity-50": isOptimistic(comment),
      })}
    >
      <div className="flex justify-end">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 transform rotate-180"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
          />
        </svg>
      </div>

      <div className="flex-col">
        <a href="#" className="text-blue-700 underline">
          {comment.author.name}
        </a>
        <p>{comment.text}</p>
      </div>
    </div>
  );
}
