import { createClient } from "edgedb";
import e from "../../dbschema/edgeql-js";
import { PostCard, PostCardPostRef } from "@/app/PostCard";
import { PlusIcon } from "@heroicons/react/20/solid";
import { NewPostModal } from "./NewPostModal";

const client = createClient();

export default async function Home() {
  const posts = await e
    .select(e.Post, (post) => ({
      id: true,

      postCardRef: e.select(post, PostCardPostRef),

      order_by: {
        expression: post.created_at,
        direction: e.DESC,
      },
    }))
    .run(client);

  return (
    <div className="py-4 px-4">
      <div className="flex items-center justify-between sticky top-4">
        <h1 className="text-2xl font-bold mb-2">Posts</h1>
        <NewPostModal />
      </div>

      <ul className="list-inside space-y-4">
        {posts.map((post) => {
          return (
            <li key={post.id}>
              <PostCard post={post.postCardRef} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
