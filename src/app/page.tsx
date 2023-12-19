import e from "../../dbschema/edgeql-js";
import { FallbackCard, PostCard } from "@/ components/PostCard";
import { PropsWithChildren, Suspense } from "react";
import { client } from "@/client";
import { PostCardPostFragment } from "../../dist/manifest";

export default async function Home() {
  const posts = await e
    .select(e.Post, (post) => ({
      id: true,

      ...PostCardPostFragment(post),
    }))
    .run(client);


  return (
    <div className="py-4 px-4">
      <Title>Posts</Title>

      <ul className="list-inside space-y-4">
        {posts.map((post) => {
          return (
            <li key={post.id}>
              <Suspense fallback={<FallbackCard />}>
                <PostCard postRef={post} />
              </Suspense>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Title({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center justify-between sticky top-4">
      <h1 className="text-2xl font-bold mb-2">{children}</h1>
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
