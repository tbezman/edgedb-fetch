import { formatDistanceToNow } from "date-fns";
import { ReplyButton } from "./ReplyButton";
import { ReplyCommentCard, ReplyCommentCardFallback } from "./ReplyCommentCard";
import { edgeql } from "../../dist/manifest";
import { CommentCardFragmentRef } from "../../dist/CommentCardFragment";
import { Suspense } from "react";

export function CommentCardFallback() {
  return <div className="h-12 w-full bg-blue-100 animate-pulse rounded" />;
}

type CommentCardProps = {
  commentRef: CommentCardFragmentRef;
};

export function CommentCard({ commentRef }: CommentCardProps) {
  const comment = edgeql(`
    fragment CommentCardFragment on Comment {
      id
      text
      createdAt

      replies {
        id
        ...ReplyCommentCardFragment @defer
      }

      author {
        name
      }
    }
  `).pull(commentRef);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1">
          <a href="#" className="text-blue-700 underline">
            {comment.author.name}
          </a>
          <span>-</span>
          <span className="text-sm">
            {formatDistanceToNow(comment.createdAt!)} ago
          </span>
        </div>

        <ReplyButton commentId={comment.id} />
      </div>

      <p>{comment.text}</p>

      {comment.replies.length > 0 ? (
        <div className="flex flex-col mt-2">
          <ul className="list-inside space-y-4">
            {comment.replies.map((reply) => {
              return (
                <li key={reply.id}>
                  <Suspense fallback={<ReplyCommentCardFallback />}>
                    <ReplyCommentCard commentRef={reply} />
                  </Suspense>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
