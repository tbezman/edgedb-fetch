"use client";

import Link from "next/link";
import { edgeql } from "../../dist/manifest";
import { PostCardFragmentRef } from "../../dist/PostCardFragment";
import { useCallback, MouseEvent, useTransition } from "react";
import router, { useRouter } from "next/router";

type PostCardProps = {
  postRef: PostCardFragmentRef;
};

export function PostCard({ postRef }: PostCardProps) {
  const post = edgeql(`
    fragment PostCardFragment on Post {
      id
      title
      content
    }
  `).pull(postRef);

  const [isTransitioning, startTransition] = useTransition();

  const handleLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      startTransition(() => {
        router.push(event.currentTarget.href);
      });
    },
    [],
  );

  return (
    <article className="flex flex-col max-w-2xl mx-auto">
      <div className="flex items-center gap-x-2">
        <Link
          href={`/post/${post.id}`}
          onClick={handleLinkClick}
          className="text-blue-600 underline visited:text-gray-700 focus:scale-[.98] origin-left transition-transform duration-100"
        >
          <h3 className="font-medium">{post.title}</h3>
        </Link>

        {isTransitioning ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-900"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
      </div>

      <p className="line-clamp-2">{post.content}</p>
    </article>
  );
}

export function FallbackCard() {
  return (
    <article className="flex flex-col max-w-2xl mx-auto space-y-1">
      <h3 className="h-5 font-medium bg-blue-100 animate-pulse rounded" />

      <p className="h-12 flex-grow bg-blue-100 animate-pulse rounded"></p>
    </article>
  );
}
