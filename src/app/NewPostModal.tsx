"use client";

import { faker } from "@faker-js/faker";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useLayoutEffect, useState } from "react";

export function NewPostModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useLayoutEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isModalOpen]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-x-1 bg-blue-700 text-white rounded px-3 py-1"
      >
        <PlusIcon className="w-4 h-4" />
        <span>New Post</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center">
          <div className="bg-white rounded p-4 w-full max-w-sm shadow-lg">
            <h2 className="text-2xl font-bold mb-2">New Post</h2>

            <form className="flex flex-col space-y-2">
              <input
                name="title"
                type="text"
                placeholder="Title"
                defaultValue={faker.lorem.paragraph(1)}
                className="rounded p-1 border border-blue-300 shadow-sm"
              />

              <textarea
                name="content"
                placeholder="Content"
                className="rounded p-1 border border-blue-300 shadow-sm"
                defaultValue={faker.lorem.paragraph(3)}
                rows={6}
              />

              <button
                type="submit"
                className="bg-blue-700 text-white rounded px-3 py-1"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
