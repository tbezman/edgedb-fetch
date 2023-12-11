import { CommentCard } from "@/components/CommentCard";
import Link from "next/link";
import { edgeql } from "../../../../dist/manifest";
import { Suspense } from "react";
import { CommentSectionFragmentRef } from "../../../../dist/CommentSectionFragment";
import { notFound } from "next/navigation";
import { client } from "@/client";
import { PostDetail } from "@/components/PostDetail";

type PageProps = {
  searchParams: { highlightedComment?: string };
  params: { id: string };
};

export default async function PostPage({ params, searchParams }: PageProps) {
  const { post } = await edgeql(`
    query PostPageQuery(id: string) {
        post: single Post {
          ...PostDetailFragment @defer
        } filter id = $id
    }
  `).run(client, { id: params.id });

  if (!post) {
    return notFound();
  }

  return (
    <>
      <Header />

      <Suspense fallback={<div>Detail Loading...</div>}>
        <PostDetail postRef={post} />
      </Suspense>
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

export const dynamic = "force-dynamic";
export const revalidate = 0;
