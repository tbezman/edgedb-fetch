"use client";
import { faker } from "@faker-js/faker";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { submitReply } from "./submitReply";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useQueryState } from "next-usequerystate";

type ReplyButtonProps = {
  commentId: string;
};

export function ReplyButton({ commentId }: ReplyButtonProps) {
  const [replyTo, setReplyTo] = useQueryState("reply_to", { shallow: true });

  const router = useRouter();
  async function handleSubmit(data: FormData) {
    setReplyTo(null);

    const reply = await submitReply(data);

    await router.replace(`?highlightedComment=${reply.id}`, { scroll: false });
    await router.refresh();
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
