import e from "../../dbschema/edgeql-js";
import { formatDistanceToNow } from "date-fns";
import { ReplyButton } from "./ReplyButton";
import { ReplyCommentCard } from "./ReplyCommentCard";
import {
  CommentCardCommentFragmentRef,
  ReplyCommentCardCommentFragment,
} from "../../dist/manifest";

type CommentCardProps = {
  commentRef: CommentCardCommentFragmentRef;
  highlightedCommentId?: string;
};

export function CommentCard({
  commentRef,
  highlightedCommentId,
}: CommentCardProps) {
  const comment = e
    .fragment("CommentCardCommentFragment", e.Comment, (comment) => ({
      id: true,
      text: true,
      created_at: true,

      author: {
        id: true,
        name: true,
      },

      replies: (reply) => ({
        id: true,

        ...ReplyCommentCardCommentFragment(reply),
      }),
    }))
    .pull(commentRef);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1">
          <a href="#" className="text-blue-700 underline">
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
