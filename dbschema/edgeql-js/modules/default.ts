// GENERATED by @edgedb/generate v0.3.4

import * as $ from "../reflection";
import * as _ from "../imports";
import type * as _std from "./std";
export type $CommentλShape = $.typeutil.flatten<_std.$Object_d29c95e25d6b11eeabaf012dd32b5eadλShape & {
  "author": $.LinkDesc<$User, $.Cardinality.One, {}, false, false,  false, false>;
  "parentComment": $.LinkDesc<$Comment, $.Cardinality.AtMostOne, {}, false, false,  false, false>;
  "replies": $.LinkDesc<$Comment, $.Cardinality.Many, {}, false, true,  false, false>;
  "parentPost": $.LinkDesc<$Post, $.Cardinality.AtMostOne, {}, false, false,  false, false>;
  "text": $.PropertyDesc<_std.$str, $.Cardinality.One, false, false, false, false>;
  "created_at": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, false, true>;
  "<parentComment[is Comment]": $.LinkDesc<$Comment, $.Cardinality.Many, {}, false, false,  false, false>;
  "<comments[is User]": $.LinkDesc<$User, $.Cardinality.Many, {}, false, false,  false, false>;
  "<comments[is Post]": $.LinkDesc<$Post, $.Cardinality.Many, {}, false, false,  false, false>;
  "<replies[is Comment]": $.LinkDesc<$Comment, $.Cardinality.Many, {}, false, false,  false, false>;
  "<comments": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
  "<parentComment": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
  "<replies": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $Comment = $.ObjectType<"default::Comment", $CommentλShape, null, [
  ..._std.$Object_d29c95e25d6b11eeabaf012dd32b5ead['__exclusives__'],
]>;
const $Comment = $.makeType<$Comment>(_.spec, "75af485e-7f5b-11ee-8676-09c9b4c04743", _.syntax.literal);

const Comment: $.$expr_PathNode<$.TypeSet<$Comment, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Comment, $.Cardinality.Many), null);

export type $PostλShape = $.typeutil.flatten<_std.$Object_d29c95e25d6b11eeabaf012dd32b5eadλShape & {
  "author": $.LinkDesc<$User, $.Cardinality.One, {}, false, false,  false, false>;
  "comments": $.LinkDesc<$Comment, $.Cardinality.Many, {}, false, true,  false, false>;
  "published": $.PropertyDesc<_std.$bool, $.Cardinality.One, false, false, false, false>;
  "title": $.PropertyDesc<_std.$str, $.Cardinality.One, false, false, false, false>;
  "content": $.PropertyDesc<_std.$str, $.Cardinality.One, false, false, false, false>;
  "created_at": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, false, true>;
  "<posts[is User]": $.LinkDesc<$User, $.Cardinality.Many, {}, false, false,  false, false>;
  "<parentPost[is Comment]": $.LinkDesc<$Comment, $.Cardinality.Many, {}, false, false,  false, false>;
  "<parentPost": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
  "<posts": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $Post = $.ObjectType<"default::Post", $PostλShape, null, [
  ..._std.$Object_d29c95e25d6b11eeabaf012dd32b5ead['__exclusives__'],
]>;
const $Post = $.makeType<$Post>(_.spec, "7549ffe4-7f5b-11ee-ae0f-c57b3cf80c93", _.syntax.literal);

const Post: $.$expr_PathNode<$.TypeSet<$Post, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Post, $.Cardinality.Many), null);

export type $UserλShape = $.typeutil.flatten<_std.$Object_d29c95e25d6b11eeabaf012dd32b5eadλShape & {
  "posts": $.LinkDesc<$Post, $.Cardinality.Many, {}, false, true,  false, false>;
  "comments": $.LinkDesc<$Comment, $.Cardinality.Many, {}, false, true,  false, false>;
  "age": $.PropertyDesc<_std.$int32, $.Cardinality.One, false, false, false, false>;
  "name": $.PropertyDesc<_std.$str, $.Cardinality.One, false, false, false, false>;
  "<author[is Comment]": $.LinkDesc<$Comment, $.Cardinality.Many, {}, false, false,  false, false>;
  "<author[is Post]": $.LinkDesc<$Post, $.Cardinality.Many, {}, false, false,  false, false>;
  "<author": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $User = $.ObjectType<"default::User", $UserλShape, null, [
  ..._std.$Object_d29c95e25d6b11eeabaf012dd32b5ead['__exclusives__'],
]>;
const $User = $.makeType<$User>(_.spec, "754af76e-7f5b-11ee-8f5c-79b679a218e7", _.syntax.literal);

const User: $.$expr_PathNode<$.TypeSet<$User, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($User, $.Cardinality.Many), null);



export { $Comment, Comment, $Post, Post, $User, User };

type __defaultExports = {
  "Comment": typeof Comment;
  "Post": typeof Post;
  "User": typeof User
};
const __defaultExports: __defaultExports = {
  "Comment": Comment,
  "Post": Post,
  "User": User
};
export default __defaultExports;