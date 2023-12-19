import { client } from "@/client";
import { CommentCard } from "@/components/CommentCard";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import e from "../../../../dbschema/edgeql-js";
import {
  CommentCardCommentFragment,
  CommentSectionPostFragment,
  CommentSectionPostFragmentRef,
} from "../../../../dist/manifest";

type PageProps = {
  searchParams: { highlightedComment?: string };
  params: { id: string };
};

export default async function PostPage({ params, searchParams }: PageProps) {
  const post = await e
    .select(e.Post, (post) => ({
      title: true,
      content: true,

      ...CommentSectionPostFragment(post),

      filter_single: e.op(post.id, "=", e.uuid(params.id)),
    }))
    .run(client);

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

type CommentSectionProps = {
  postRef: CommentSectionPostFragmentRef;
  searchParams: { highlightedComment?: string };
};

function CommentSection({ postRef, searchParams }: CommentSectionProps) {
  const post = e
    .fragment("CommentSectionPostFragment", e.Post, (post) => ({
      comments: (comment) => ({
        id: true,

        ...CommentCardCommentFragment(comment),
      }),
    }))
    .pull(postRef);

  console.log(post, postRef);

  return post?.comments?.map((comment) => {
    return (
      <li key={comment.id}>
        <CommentCard
          commentRef={comment}
          highlightedCommentId={searchParams.highlightedComment}
        />
      </li>
    );
  });
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
