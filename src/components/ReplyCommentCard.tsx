"use client";
import { useEffect, useRef } from "react";
import { edgeql } from "../../dist/manifest";
import { ReplyCommentCardFragmentRef } from "../../dist/ReplyCommentCardFragment";
import { useQueryState } from "next-usequerystate";

type ReplyCommentCardProps = {
  highlightedCommentId?: string;
  commentRef: ReplyCommentCardFragmentRef;
};

export function ReplyCommentCard({ commentRef }: ReplyCommentCardProps) {
  const comment = edgeql(`fragment ReplyCommentCardFragment on Comment {
    id
    text
    author {
      name
    }
  }`).pull(commentRef);

  const elementRef = useRef<HTMLDivElement | null>(null);

  const [highlightedCommentId, setHighlightedCommentId] =
    useQueryState("highlightedComment");

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
