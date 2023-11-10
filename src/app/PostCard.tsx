import { RefReturnType, RefSelectorArg, RefType } from "@/app/types";
import e from "../../dbschema/edgeql-js";
import Link from "next/link";

export function PostCardPostRef(post: RefSelectorArg<typeof e.Post>) {
  return {
    id: true,
    title: true,
    content: true,
    author: e.select(post.author, (author) => ({ name: true })),
  } satisfies RefReturnType<typeof e.Post>;
}

type PostCardProps = {
  post: RefType<typeof e.Post, typeof PostCardPostRef>;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="flex flex-col max-w-2xl mx-auto">
      <Link
        href={`/post/${post.id}`}
        className="text-amber-600 underline visited:text-gray-700"
      >
        <h3 className="font-medium">{post.title}</h3>
      </Link>

      <p className="line-clamp-2">{post.content}</p>
    </article>
  );
}
