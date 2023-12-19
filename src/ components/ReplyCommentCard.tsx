"use client";

import { useEffect, useRef } from "react";
import e from "../../dbschema/edgeql-js";
import { ReplyCommentCardFragmentRef } from "../../dist/manifest";

type ReplyCommentCardProps = {
  highlightedCommentId?: string;
  commentRef: any;
};

export function ReplyCommentCard({
  commentRef,
  highlightedCommentId,
}: ReplyCommentCardProps) {
  const comment = e
    .shape(e.Comment, (comment) => ({
      id: true,
      author: {
        name: true,
      },
      text: true,
    }))
    .pull(commentRef);

  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlightedCommentId === comment.id) {
      elementRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [comment.id, highlightedCommentId]);

  return (
    <div
      ref={elementRef}
      className={`text-[15px] flex items-center gap-x-2 rounded ${
        highlightedCommentId === comment.id ? "flash p-2" : ""
      }`}
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
