import { faker } from "@faker-js/faker";
import { client } from "./client";

const USER_COUNT = 3;
const POSTS_PER_USER = 5;
const COMMENTS_PER_POST = 3;
const PROABILITY_OF_COMMENT_REPLY = 0.8;

async function seed() {
  console.log("Starting seed....");
  await client.comment.deleteMany({});
  await client.post.deleteMany();
  await client.user.deleteMany();

  console.log("After delete");

  for (let i = 0; i < USER_COUNT; i++) {
    const newUser = await client.user.create({
      data: {
        name: faker.person.fullName(),
        age: faker.number.int({ min: 18, max: 80 }),
      },
    });

    for (let j = 0; j < POSTS_PER_USER; j++) {
      const newPost = await client.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraph(10),
          published: faker.datatype.boolean(),
          authorId: newUser.id,
        },
      });

      for (let k = 0; k < COMMENTS_PER_POST; k++) {
        const userCount = await client.user.count();

        const newComment = await client.comment.create({
          data: {
            text: faker.lorem.sentence(),
            postId: newPost.id,
            authorId: (
              await client.user.findFirstOrThrow({
                skip: Math.floor(Math.random() * userCount),
              })
            ).id,
          },
        });

        while (Math.random() < PROABILITY_OF_COMMENT_REPLY) {
          const reply = await client.comment.create({
            data: {
              text: faker.lorem.sentence(),

              authorId: (
                await client.user.findFirstOrThrow({
                  skip: Math.floor(Math.random() * userCount),
                })
              ).id,

              postId: newPost.id,
              parentId: newComment.id,
            },
          });
        }
      }
    }
  }

  const userCount = await client.user.count();
  const postCount = await client.post.count();
  const commentCount = await client.comment.count();

  console.log("Users: ", userCount);
  console.log("Posts: ", postCount);
  console.log("Comment: ", commentCount);

  // process.exit(0);
}

await seed();
