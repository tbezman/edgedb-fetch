import { CommentCard, CommentCardCommentRef } from "@/app/CommentCard";
import { createClient } from "../../../../dbschema/edgeql-js";
import e from "../../../../dbschema/edgeql-js";
import { BackwardIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

type PageProps = {
  searchParams: { highlightedComment?: string };
  params: { id: string };
};

const client = createClient();

export default async function PostPage({ params, searchParams }: PageProps) {
  const post = await e
    .assert_single(
      e.select(e.Post, (post) => ({
        id: true,
        title: true,
        content: true,
        comments: (comment) => ({
          id: true,

          commentCardRef: e.select(comment, CommentCardCommentRef),

          order_by: {
            expression: comment.created_at,
            direction: e.DESC,
          },
        }),
        filter: e.op(post.id, "=", e.uuid(params.id)),
      }))
    )
    .run(client);

  return (
    <>
      <Link
        href="/"
        className="flex items-center space-x-1 underline sticky mt-4 ml-4"
      >
        <BackwardIcon className="w-4 h-4" />

        <span>Back to home</span>
      </Link>

      <article className="flex flex-col max-w-2xl py-4 mx-auto">
        <h1 className="text-2xl font-bold mb-2">{post?.title}</h1>

        <p>{post?.content}</p>

        <div className="mt-4">
          <h2 className="text-xl font-bold">Comments</h2>

          <ul className="space-y-8">
            {post?.comments.map((comment) => {
              return (
                <li key={comment.id}>
                  <CommentCard
                    comment={comment.commentCardRef}
                    highlightedCommentId={searchParams.highlightedComment}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </article>
    </>
  );
}
