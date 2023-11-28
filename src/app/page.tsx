import { PostCard } from "@/app/PostCard";
import { NewPostModal } from "./NewPostModal";
import { edgeql } from "../../dist/manifest";
import { Suspense } from "react";

export default async function Home() {
  const { posts } = await edgeql(`
    query PostQuery {
        posts: Post {
          id
          ...PostCardFragment @defer
        }
    }
`).run({});

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
              <Suspense fallback={<div>Loading...</div>}>
                <PostCard postRef={post.PostCardFragmentRef} />
              </Suspense>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
