import e from "../../dbschema/edgeql-js";
import Link from "next/link";
import { PostCardFragmentRef } from "../../dist/manifest";

type PostCardProps = {
  postRef: PostCardFragmentRef;
};

export function PostCard({ postRef }: PostCardProps) {
  const post = e
    .fragment(e.Post, () => ({
      id: true,
      title: true,
      content: true,
    }))
    .pull(postRef);

  return (
    <article className="flex flex-col max-w-2xl mx-auto">
      <Link
        href={`/post/${post.id}`}
        className="text-blue-600 underline visited:text-gray-700"
      >
        <h3 className="font-medium">{post.title}</h3>
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
