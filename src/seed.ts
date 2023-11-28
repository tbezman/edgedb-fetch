import { faker } from "@faker-js/faker";
import { createClient } from "../dbschema/edgeql-js";
import e from "../dbschema/edgeql-js";

const client = createClient();

const USER_COUNT = 5;
const POSTS_PER_USER = 10;
const COMMENTS_PER_POST = 10;
const PROABILITY_OF_COMMENT_REPLY = 0.8;

async function seed() {
  await e.delete(e.Comment).run(client);
  await e.delete(e.Post).run(client);
  await e.delete(e.User).run(client);

  for (let i = 0; i < USER_COUNT; i++) {
    const newUser = await e
      .insert(e.User, {
        name: faker.person.fullName(),
        age: faker.number.int({ min: 18, max: 80 }),
      })
      .run(client);

    for (let j = 0; j < POSTS_PER_USER; j++) {
      const newPost = await e
        .insert(e.Post, {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraph(10),
          published: faker.datatype.boolean(),
          author: e.assert_single(
            e.select(e.User, (user) => ({
              filter: e.op(user.id, "=", e.uuid(newUser.id)),
            })),
          ),
        })
        .run(client);

      for (let k = 0; k < COMMENTS_PER_POST; k++) {
        const newComment = await e
          .insert(e.Comment, {
            text: faker.lorem.sentences(2),

            created_at: faker.date.past({ years: 1 }),

            parentPost: e.assert_single(
              e.select(e.Post, (post) => ({
                filter: e.op(post.id, "=", e.uuid(newPost.id)),
              })),
            ),

            author: e.assert_single(
              e.select(e.User, (user) => ({
                order_by: e.select(e.random()),
                limit: 1,
              })),
            ),
          })
          .run(client);

        while (Math.random() < PROABILITY_OF_COMMENT_REPLY) {
          const reply = await e
            .insert(e.Comment, {
              text: faker.lorem.sentences(2),

              created_at: faker.date.past({ years: 1 }),

              // select a random user for the author
              author: e.assert_single(
                e.select(e.User, (user) => ({
                  order_by: e.select(e.random()),
                  limit: 1,
                })),
              ),

              parentComment: e.assert_single(
                e.select(e.Comment, (comment) => ({
                  filter: e.op(comment.id, "=", e.uuid(newComment.id)),
                })),
              ),
            })
            .run(client);
        }
      }
    }
  }

  const userCount = await e.select(e.count(e.User)).run(client);
  const postCount = await e.select(e.count(e.Post)).run(client);
  const commentCount = await e.select(e.count(e.Comment)).run(client);

  console.log("Users: ", userCount);
  console.log("Posts: ", postCount);
  console.log("Comment: ", commentCount);

  process.exit(0);
}

seed();
