import Link from "next/link";
import e from "../../dbschema/edgeql-js";
import { PostCardPostFragmentRef } from "../../dist/manifest";

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
