"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import e from "../../dbschema/edgeql-js";
import { Spinner } from "./Spinner";
import { PostCardPostFragmentRef } from "../../dbschema/edgeql-js/manifest";

type PostCardProps = {
  postRef: PostCardPostFragmentRef;
};

export function PostCard({ postRef }: PostCardProps) {
  const post = e
    .fragment("PostCardPostFragment", e.Post, () => ({
      id: true,
      title: true,
      content: true,
    }))
    .pull(postRef);

  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  return (
    <article className="flex flex-col max-w-2xl mx-auto">
      <Link
        href={`/post/${post.id}`}
        onClick={(e) => {
          e.preventDefault();

          startTransition(() => {
            router.push(`/post/${post.id}`);
          });
        }}
        draggable={false}
        className="text-blue-600 underline visited:text-gray-700 flex items-baseline gap-x-2 transition-transform duration-300 active:scale-[.99] origin-left "
      >
        <h3 className="font-medium">{post.title}</h3>

        {isTransitioning ? <Spinner className="w-3 h-3" /> : null}
      </Link>

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
