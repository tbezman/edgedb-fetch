import { formatDistanceToNow } from "date-fns";
import { ReplyButton } from "./ReplyButton";
import { ReplyCommentCard } from "./ReplyCommentCard";
import { edgeql } from "../../dist/manifest";
import { CommentCardFragmentRef } from "../../dist/CommentCardFragment";

type CommentCardProps = {
  commentRef: CommentCardFragmentRef;
  highlightedCommentId?: string;
};

export function CommentCard({
  commentRef,
  highlightedCommentId,
}: CommentCardProps) {
  const comment = edgeql(`
    fragment CommentCardFragment on Comment {
      id
      text
      createdAt

      replies {
        id
        ...ReplyCommentCardFragment
      } filter len(.text) > 50

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
                  <ReplyCommentCard
                    commentRef={reply}
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
