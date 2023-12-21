import { client } from "@/client";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import e from "../../../../dbschema/edgeql-js";
import { CommentSectionPostFragment } from "../../../../dist/manifest";
import { CommentSection } from "@/components/CommentSection";
import { generateReaderSchema } from "@/generateReaderSchema";

type PageProps = {
  searchParams: { highlightedComment?: string };
  params: { id: string };
};

export default async function PostPage({ params, searchParams }: PageProps) {
  const query = e.select(e.Post, (post) => ({
    title: true,
    content: true,

    ...CommentSectionPostFragment(post),

    filter: e.op(post.id, "=", e.uuid(params.id)),
  }));

  await generateReaderSchema(query.toEdgeQL());
  const post = (await query.run(client))[0];

  if (!post) {
    return notFound();
  }

  return (
    <>
      <Header />

      <article className="flex flex-col max-w-2xl py-4 mx-auto">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>

        <p>{post.content}</p>

        <div className="mt-4">
          <Suspense
            fallback={
              <div className="flex items-center gap-x-2">
                <h2 className="text-xl font-bold">Comments</h2>
                <Spinner className="w-4 h-4" />
              </div>
            }
          >
            <h2 className="text-xl font-bold">Comments</h2>

            <ul className="space-y-8">
              <CommentSection searchParams={searchParams} postRef={post} />
            </ul>
          </Suspense>
        </div>
      </article>
    </>
  );
}

function Header() {
  return (
    <Link
      href="/"
      className="flex items-center space-x-1 underline sticky mt-4 ml-4"
    >
      &lt;
      <span>Back to home</span>
    </Link>
  );
}
