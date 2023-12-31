"use client";
import { faker } from "@faker-js/faker";

import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useQueryState } from "next-usequerystate";
import {
  EdgeDBContext,
  EdgeDBContextType,
} from "@edgedb/react/dist/react/src/EdgeDBProvider";
import { submitReply } from "@/actions/submitReply";
import { CommentCardCommentFragment } from "../../dbschema/edgeql-js/manifest";

import { v4 } from "uuid";

type ReplyButtonProps = {
  commentId: string;
};

export function ReplyButton({ commentId }: ReplyButtonProps) {
  const [nextCommentId, setNextCommentId] = useState(faker.string.uuid());
  const [replyTo, setReplyTo] = useQueryState("reply_to", { shallow: true });
  const [, setHighlightedCommentId] = useQueryState("highlightedComment");

  const router = useRouter();
  const context = useContext<EdgeDBContextType | null>(EdgeDBContext);

  function insertOptimistic() {
    setReplyTo(null);

    const fakeUuid = v4();
    const fakeAuthorUuid = v4();

    context?.updateFragment(
      CommentCardCommentFragment,
      commentId,
      (previous) => {
        return {
          ...previous,
          replies: [
            ...previous.replies,
            {
              id: fakeUuid,
              author: {
                id: fakeAuthorUuid,
                name: "Fake Name",
              },

              text: "Some text here",
            },
          ],
        };
      },
    );

    setHighlightedCommentId(nextCommentId, { shallow: true });
  }

  async function handleSubmit(data: FormData) {
    const reply = await submitReply(data);

    setNextCommentId(faker.string.uuid());

    setHighlightedCommentId(reply.id, { shallow: false });
  }

  const formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    if (formRef.current && replyTo === commentId) {
      formRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [commentId, replyTo]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        replyTo === commentId &&
        !(event.target instanceof HTMLAnchorElement)
      ) {
        setReplyTo(null);
      }
    }

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [commentId, replyTo, router, setReplyTo]);

  return (
    <div className="relative">
      <Link
        replace
        scroll={false}
        onClick={(e) => {
          e.preventDefault();
          setReplyTo(commentId);
        }}
        href={`?reply_to=${commentId}`}
        className="text-blue-700 underline text-sm"
      >
        Reply
      </Link>

      {replyTo === commentId ? (
        <form
          ref={formRef}
          action={handleSubmit}
          onSubmit={insertOptimistic}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 z-10 bg-white p-4 rounded flex flex-col shadow"
        >
          <textarea
            name="text"
            className="w-[300px] rounded p-1 border border-blue-300"
            rows={6}
            defaultValue={faker.lorem.paragraph(3)}
          />

          <input name="commentId" type="hidden" value={commentId} />
          <input name="newCommentId" type="hidden" value={nextCommentId} />

          <SubmitButton />
        </form>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const status = useFormStatus();

  return (
    <button className="bg-blue-900 text-white w-24 mt-2 self-end rounded">
      {status.pending ? "..." : "Reply"}
    </button>
  );
}
