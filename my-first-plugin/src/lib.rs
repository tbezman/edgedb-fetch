#![feature(box_patterns)]

use std::path::PathBuf;

use swc_common::plugin::metadata::TransformPluginMetadataContextKind;
use swc_core::atoms::js_word;
use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::*;
use swc_core::ecma::transforms::testing::test_inlined_transform;
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::{
    ast::Program,
    transforms::testing::test,
    visit::{as_folder, FoldWith, VisitMut},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_ecma_parser::{Syntax, TsConfig};

pub struct TransformVisitor {
    filename: Option<String>,
}

impl VisitMut for TransformVisitor {
    fn visit_mut_expr(&mut self, b: &mut Expr) {
        if let Expr::Call(n) = b {
            let firstArg = n.args.first();

            let typeName = match firstArg {
                Some(ExprOrSpread {
                    expr:
                        box Expr::Member(MemberExpr {
                            obj: box Expr::Ident(ident),
                            prop: MemberProp::Ident(si),
                            ..
                        }),
                    ..
                }) => si.sym.to_string(),
                _ => "NOTFOUND".to_string(),
            };

            if let Callee::Expr(box Expr::Member(MemberExpr {
                obj: box Expr::Ident(ident),
                prop: MemberProp::Ident(si),
                ..
            })) = &mut n.callee
            {
                if si.sym == js_word!("shape") {
                    let fragmentName = self.filename.clone().unwrap_or("NO_FILENAME".to_string())
                        + typeName.as_str()
                        + "Fragment";

                    let pull_fn = Expr::Fn(FnExpr {
                        ident: None,
                        function: Box::new(Function {
                            params: vec![Param {
                                pat: Pat::Ident(BindingIdent::from(Ident::new(
                                    "param".into(),
                                    DUMMY_SP,
                                ))),
                                decorators: Default::default(),
                                span: DUMMY_SP,
                            }],
                            decorators: vec![],
                            span: DUMMY_SP,
                            body: Some(BlockStmt {
                                span: DUMMY_SP,
                                stmts: vec![Stmt::Return(ReturnStmt {
                                    span: DUMMY_SP,
                                    arg: Some(Box::new(Expr::Ident(Ident::new(
                                        ("param.".to_owned() + fragmentName.as_str()).into(),
                                        DUMMY_SP,
                                    )))),
                                })],
                            }),
                            is_generator: false,
                            is_async: false,
                            type_params: None,
                            return_type: None,
                        }),
                    });

                    // Object with `pull` method
                    let object_literal = Expr::Object(ObjectLit {
                        span: DUMMY_SP,
                        props: vec![PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                            key: PropName::Ident(Ident::new("pull".into(), DUMMY_SP)),
                            value: Box::new(pull_fn),
                        })))],
                    });
                    // re assign n to an expression that is an ident with the name dummy
                    *b = object_literal;
                }
            }
        }

        // continue to visit children
        b.visit_mut_children_with(self);
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let filename: Option<String> = if let Some(filename) =
        metadata.get_context(&TransformPluginMetadataContextKind::Filename)
    {
        let buf = PathBuf::from(filename);
        Some(buf.file_stem().unwrap().to_str().unwrap().to_string())
    } else {
        None
    };

    tracing::info!("Filename: {:?}", filename);

    if let Some(filename) = &filename {
        if filename.contains("manifest") {
            return program;
        }
    }

    return program.fold_with(&mut as_folder(TransformVisitor { filename }));
}

#[test]
fn my_test() {
    test_inlined_transform(
        "Some test name",
        Syntax::Typescript(TsConfig {
            tsx: true,
            ..Default::default()
        }),
        |_| {
            as_folder(TransformVisitor {
                filename: Some("".to_string()),
            })
        },
        r#"
    import e from "../../dbschema/edgeql-js";
import Link from "next/link";
import { PostCardFragmentRef } from "../../dist/manifest";

type PostCardProps = {
  postRef: PostCardFragmentRef;
};

export function PostCard({ postRef }: PostCardProps) {
  const post = e
    .shape(e.Post, () => ({
      id: true,
      title: true,
      content: true,
    }))
    .pull(postRef);

  return (
    <article className="flex flex-col max-w-2xl mx-auto">
      <Link
        href={`/post/${post.id}`}
        className="text-blue-600 underline visited:text-gray-700"
      >
        <h3 className="font-medium">{post.title}</h3>
      </Link>

      <p className="line-clamp-2">{post.content}</p>
    </article>
  );
}

export function FallbackCard() {
  return (
    <article className="flex flex-col max-w-2xl mx-auto space-y-1">
      <h3 className="h-5 font-medium bg-blue-100 animate-pulse rounded" />

      <p className="h-12 flex-grow bg-blue-100 animate-pulse rounded"></p>
    </article>
  );
}
    "#,
        false,
    )
}
