import {
  $scopify,
  ObjectType,
  ObjectTypeExpression,
  setToTsType,
} from "../../dbschema/edgeql-js/typesystem";
import { $linkPropify } from "../../dbschema/edgeql-js/path";
import e, { Cardinality } from "../../dbschema/edgeql-js";
import {
  normaliseShape,
  objectTypeToSelectShape,
  SelectModifierNames,
  SelectModifiers,
} from "../../dbschema/edgeql-js/select";

export type RefSelectorArg<Expr extends ObjectTypeExpression> = $scopify<
  Expr["__element__"]
> &
  $linkPropify<{
    [k in keyof Expr]: k extends "__cardinality__"
      ? typeof Cardinality.One
      : Expr[k];
  }>;

export type RefReturnType<Expr extends ObjectTypeExpression> =
  objectTypeToSelectShape<Expr["__element__"]> &
    SelectModifiers<Expr["__element__"]>;

export type RefType<
  Expr extends ObjectTypeExpression,
  Shape extends (
    ...args: any
  ) => objectTypeToSelectShape<Expr["__element__"]> &
    SelectModifiers<Expr["__element__"]>,
> = setToTsType<{
  __element__: ObjectType<
    `${Expr["__element__"]["__name__"]}`, // _shape
    Expr["__element__"]["__pointers__"],
    Omit<normaliseShape<Readonly<ReturnType<Shape>>>, SelectModifierNames>
  >;
  __cardinality__: typeof Cardinality.One;
}>;
