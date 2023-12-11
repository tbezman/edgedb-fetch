"use client";
import { faker } from "@faker-js/faker";

import Link from "next/link";
import { useEffect, useRef, useTransition } from "react";
import { submitReply } from "./submitReply";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useQueryState } from "next-usequerystate";
import { motion, AnimatePresence } from "framer-motion";

type ReplyButtonProps = {
  commentId: string;
};

export function ReplyButton({ commentId }: ReplyButtonProps) {
  const [replyTo, setReplyTo] = useQueryState("reply_to", { shallow: true });

  const [isTransitioning, transition] = useTransition();

  const [, setHighlightedCommentId] = useQueryState("highlightedComment", {
    startTransition: transition,
  });

  const router = useRouter();
  async function handleSubmit(data: FormData) {
    const reply = await submitReply(data);

    transition(() => {
      setReplyTo(null);
      setHighlightedCommentId(reply.id);
    });
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

      <AnimatePresence>
        {replyTo === commentId ? (
          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            ref={formRef}
            action={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 z-10 bg-white p-5 rounded-lg flex flex-col shadow-lg"
          >
            <textarea
              name="text"
              className="w-[500px] rounded p-1 border border-blue-300"
              rows={10}
              defaultValue={faker.lorem.paragraph(3)}
            />

            <input name="commentId" type="hidden" value={commentId} />

            <SubmitButton />
          </motion.form>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SubmitButton() {
  const status = useFormStatus();

  return (
    <button className="bg-blue-900 text-white w-24 mt-2 py-2 self-end rounded">
      {status.pending ? "..." : "Reply"}
    </button>
  );
}
