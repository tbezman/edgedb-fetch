import e from "../../dbschema/edgeql-js";
import { RefReturnType, RefSelectorArg, RefType } from "@/app/types";
import { PostCard, PostCardPostRef } from "@/app/PostCard";

export function UserCardUserRef(user: RefSelectorArg<typeof e.User>) {
  return {
    name: true,
    posts: e.select(user.posts, (post) => ({
      ...PostCardPostRef(post),
      id: true,
    })),
  } satisfies RefReturnType<typeof e.User>;
}

type UserProps = {
  user: RefType<typeof e.User, typeof UserCardUserRef>;
};

export function UserCard({ user }: UserProps) {
  return (
    <li className="list-disc">
      {user.name}

      <ul className="list-disc list-inside ml-10">
        {user.posts.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}
      </ul>
    </li>
  );
}
