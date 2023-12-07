import { formatDistanceToNow } from "date-fns";
import { ReplyButton } from "./ReplyButton";
import { ReplyCommentCard } from "./ReplyCommentCard";

type CommentCardProps = {
  commentRef: {
    id: string;
    text: string;
    createdAt: Date;

    replies: Array<{
      id: string;

      text: string;

      author: {
        name: string;
      };
    }>;

    author: {
      name: string;
    };
  };
  highlightedCommentId?: string;
};

export function CommentCard({
  commentRef: comment,
  highlightedCommentId,
}: CommentCardProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1">
          <a href="#" className="text-blue-700 underline">
            {comment.author.name}
          </a>
          <span>-</span>
          <span className="text-sm">
            {formatDistanceToNow(comment.createdAt)} ago
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
