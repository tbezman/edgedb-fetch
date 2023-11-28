import { RefReturnType, RefSelectorArg, RefType } from "@/app/types";
import e from "../../dbschema/edgeql-js";
import Link from "next/link";
import { edgeql } from "../../dist/manifest";
import { PostCardFragmentRef } from "../../dist/PostCardFragment";

type PostCardProps = {
  postRef: PostCardFragmentRef;
};

export async function PostCard({ postRef }: PostCardProps) {
  const before = Date.now();
  const post = await edgeql(
    `fragment PostCardFragment on Post {
      id
      title
      content
    }`,
  ).pull(postRef);
  const after = Date.now();

  console.log(`PostCard: ${after - before}ms`);

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
