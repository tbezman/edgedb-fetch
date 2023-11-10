function HomePage() {
  return (
    <div>
      <Posts />
    </div>
  );
}

function Posts() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map((post) => (
        <Post post={post} />
      ))}
    </div>
  );
}
