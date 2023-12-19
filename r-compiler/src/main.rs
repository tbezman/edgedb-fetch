#![feature(box_patterns)]

use glob::{glob, glob_with, MatchOptions};
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use std::env;
use std::path::PathBuf;
use std::str::FromStr;
use std::{fs, sync::Arc};
use swc::atoms::Atom;
use swc::Compiler;
use swc_common::sync::Lrc;
use swc_common::{FilePathMapping, SourceMap, SourceMapper};
use swc_ecma_codegen::text_writer::JsWriter;
use swc_ecma_codegen::Emitter;
use swc_ecmascript::parser::TsConfig;
use swc_ecmascript::visit::{noop_visit_type, FoldWith, Visit, VisitWith};

use swc_ecmascript::ast::*;

#[derive(Debug)]
struct Fragment {
    name: String,
    _type: String,
    call_expr: CallExpr,
}

struct ExpressionVisitor {
    fragments: Vec<Fragment>,
}

// const post = e
// .fragment("PostCardPostFragment", e.Post, () => ({
//   id: true,
//   title: true,
//   content: true,
// }))
// .pull(postRef);

impl Visit for ExpressionVisitor {
    noop_visit_type!();

    fn visit_call_expr(&mut self, n: &CallExpr) {
        // we need to extract the name, and type from the e.fragment calls as Strings
        if let Callee::Expr(box Expr::Member(MemberExpr {
            obj: box Expr::Ident(first),
            prop: MemberProp::Ident(second),
            ..
        })) = &n.callee
        {
            if first.sym == *"e" && second.sym == *"fragment" {
                // grab the first parameter as the name
                let first_arg = n.args.get(0).expect("misisng first arg");
                let second_arg = n.args.get(1).expect("misisng first arg");
                if let ExprOrSpread {
                    expr: box Expr::Lit(Lit::Str(literal)),
                    ..
                } = first_arg
                {
                    if let ExprOrSpread {
                        expr:
                            box Expr::Member(MemberExpr {
                                obj: box Expr::Ident(first),
                                prop: MemberProp::Ident(second),
                                ..
                            }),
                        ..
                    } = second_arg
                    {
                        if first.sym == *"e" {
                            self.fragments.push(Fragment {
                                name: literal.value.to_string(),
                                _type: second.sym.to_string(),
                                call_expr: n.clone(),
                            });
                        }
                    }
                }
            }
        }

        n.visit_children_with(self);
    }
}

fn find_fragments(module: &Module) -> Vec<Fragment> {
    let mut visitor = ExpressionVisitor {
        fragments: Vec::new(),
    };

    module.visit_with(&mut visitor);

    visitor.fragments
}

fn compile(path: PathBuf) {
    println!("Compiling path: {:?}", path);

    let source_map = Arc::new(SourceMap::new(Default::default()));
    let compiler = Compiler::new(source_map);

    let content = fs::read_to_string(&path).expect("Failed to read TypeScript file");

    let fm = compiler
        .cm
        .new_source_file(swc_common::FileName::Real(path.clone()), content);

    let input = swc_ecmascript::parser::StringInput::from(&*fm);
    let mut parser = swc_ecmascript::parser::Parser::new(
        swc_ecmascript::parser::Syntax::Typescript(TsConfig {
            tsx: true,
            ..Default::default()
        }),
        input,
        None,
    );

    let mut manifest = Module {
        span: Default::default(),
        body: vec![],
        shebang: None,
    };

    manifest
        .body
        .push(ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
            span: Default::default(),
            specifiers: vec![],
            src: Box::new(Str {
                span: Default::default(),
                value: "react".into(),
                raw: None,
            }),
            type_only: false,
            with: None,
        })));

    let mut code = vec![];
    let mut srcmap = vec![];

    let cm = Lrc::new(SourceMap::new(FilePathMapping::empty()));
    let mut emitter = Emitter {
        cfg: Default::default(),
        cm: cm,
        comments: None,
        wr: JsWriter::new(Default::default(), "\n", &mut code, Some(&mut srcmap)),
    };

    emitter.emit_module(&manifest).unwrap();

    println!("{}", String::from_utf8(code).expect("bad str"));

    // write the manifest module to disk

    // Parse the TypeScript file and print the AST
    match parser.parse_module() {
        Ok(module) => {
            let expressions = find_fragments(&module);
        }
        Err(error) => {
            eprintln!("Failed to parse TypeScript file: {:?}", error);
        }
    }
}

fn main() -> anyhow::Result<()> {
    // Set the current directory up one level
    let current_dir = env::current_dir().expect("Failed to get current directory");
    let parent_dir = current_dir
        .parent()
        .expect("Failed to get parent directory");
    env::set_current_dir(parent_dir).expect("Failed to set current directory");

    let options = MatchOptions {
        case_sensitive: false,
        require_literal_separator: false,
        require_literal_leading_dot: false,
    };

    for entry in glob_with("src/**/*.ts*", options).expect("Failed to read glob pattern") {
        match entry {
            Ok(path) => {
                // ignore path if node modules
                if path.to_str().unwrap().contains("node_modules") {
                    continue;
                }

                compile(path);
            }
            Err(e) => println!("{:?}", e),
        }
    }

    // let (tx, _rx) = std::sync::mpsc::channel();

    // Automatically select the best implementation for your platform.
    // You can also access each implementation directly e.g. INotifyWatcher.
    // let mut watcher = RecommendedWatcher::new(tx, Config::default())?;

    // Add a path to be watched. All files and directories at that path and
    // below will be monitored for changes.
    // watcher.watch(
    //     PathBuf::from_str(".").expect("path did not exist").as_ref(),
    //     RecursiveMode::Recursive,
    // )?;

    Ok(())
}
