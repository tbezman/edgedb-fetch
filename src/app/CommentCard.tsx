import e from "../../dbschema/edgeql-js";
import { formatDistanceToNow } from "date-fns";
import { ReplyButton } from "./ReplyButton";
import { ReplyCommentCard, ReplyCommentCardFragment } from "./ReplyCommentCard";
import { RefType } from "@/types";

export const CommentCardFragment = e.shape(e.Comment, (comment) => ({
  id: true,
  text: true,
  created_at: true,

  author: {
    name: true,
  },

  replies: {
    id: true,

    ...ReplyCommentCardFragment(comment),
  },
}));

type CommentCardFragmentRef = RefType<
  typeof e.Comment,
  typeof CommentCardFragment
>;

type CommentCardProps = {
  comment: CommentCardFragmentRef;
  highlightedCommentId?: string;
};

export function CommentCard({
  comment,
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
                    comment={reply}
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
