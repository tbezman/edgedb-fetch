import { RefSelectorArg, RefType, RefReturnType } from "@/app/types";
import e from "../../dbschema/edgeql-js";
import { formatDistanceToNow } from "date-fns";
import { ReplyButton } from "./ReplyButton";
import { ReplyCommentCard } from "./ReplyCommentCard";
import { ReplyCommentCardRef } from "./ReplyCommentCardRef";

export function CommentCardCommentRef(
  comment: RefSelectorArg<typeof e.Comment>
) {
  return {
    id: true,
    text: true,
    created_at: true,
    parentPost: (post) => ({ id: true }),
    replies: (comment) => ({
      id: true,

      replyRef: e.select(comment, ReplyCommentCardRef),

      order_by: {
        expression: comment.created_at,
        direction: e.ASC,
      },
    }),
    author: (author) => ({ name: true }),
  } satisfies RefReturnType<typeof e.Comment>;
}

type CommentCardProps = {
  highlightedCommentId?: string;
  comment: RefType<typeof e.Comment, typeof CommentCardCommentRef>;
};

export function CommentCard({
  comment,
  highlightedCommentId,
}: CommentCardProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1">
          <a href="#" className="text-amber-700 underline">
            {comment.author.name}
          </a>
          <span>-</span>
          <span className="text-sm">
            {formatDistanceToNow(comment.created_at!)} ago
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
                  <ReplyCommentCard
                    comment={reply.replyRef}
                    highlightedCommentId={highlightedCommentId}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
