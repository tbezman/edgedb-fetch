import { RefReturnType, RefSelectorArg, RefType } from "@/app/types";
import e from "../../dbschema/edgeql-js";
import Link from "next/link";
import { edgeql } from "../../dist/manifest";

export function PostCard({ postRef }) {
  const post = edgeql(
    `fragment PostCardFragment on Post {
      id
      title
      content
    }`,
  ).pull(postRef);

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
