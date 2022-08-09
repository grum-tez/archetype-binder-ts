import ts, { factory, KeywordTypeNode, SyntaxKind } from "typescript";

export type ArchetypeType = {
  "node": string
  "name": string | null
  "args": Array<ArchetypeType>
}

export type MichelsonType = {
  "prim": string | null
  "int": string | null
  "bytes": string | null
  "string": string | null
  "args": Array<MichelsonType>
  "annots": Array<string>
  "array": Array<MichelsonType>
}

export type ContractParameter = {
  "name": string
  "type": ArchetypeType
  "const": boolean
  "default": string | null
}

export type FunctionParameter = {
  "name": string
  "type": ArchetypeType
}

export type Entrypoint = {
  "name": string
  "args": Array<FunctionParameter>
}

export type Field = {
  "name": string
  "type": ArchetypeType
  "is_key": boolean
}

export type Asset = {
  "name": string
  "container_kind": string
  "fields": Array<Field>
  "container_type_michelson": MichelsonType
  "key_type_michelson": MichelsonType
  "value_type_michelson": MichelsonType
}

export type EnumValue = {
  "name": string,
  "types": Array<string> /* TODO */
}

export type Enum = {
  "name": string
  "constructors": Array<EnumValue>
  "type_michelson": MichelsonType
}

export type StorageElement = {
  "name": string
  "type": ArchetypeType
  "const": boolean
}

export type Record = {
  "name": string
  "fields": Array<Omit<Field,"is_key">>
  "type_michelson": MichelsonType
}

export type Getter = {} /* TODO */

export type Event = {} /* TODO */

export type ContractInterface = {
  "name" : string,
  "parameters" : Array<ContractParameter>
  "types": {
    "assets": Array<Asset>
    "enums": Array<Enum>
    "records": Array<Record>
    "events": Array<Event>
  }
  "storage": Array<StorageElement>
  "entrypoints": Array<Entrypoint>
  "getters": Array<Getter>
  "errors": Array<MichelsonType>
}

/* Archetype type to Typescript type --------------------------------------- */

export const archetype_type_to_ts_type = (at: ArchetypeType) : KeywordTypeNode<any>  => {
  switch (at.node) {
    case "key":       return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    case "date":      return factory.createTypeReferenceNode(
      factory.createIdentifier("Date"),
      undefined
    )
    case "duration":  return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Duration")
      ),
      undefined
    );
    case "bytes":  return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Bytes")
      ),
      undefined
    );
    case "option": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Option"),
      ),
      [ archetype_type_to_ts_type(at.args[0]) ]
    );
    case "address":  return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Address")
      ),
      undefined
    );
    case "bool":      return factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword)
    case "contract":  return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Entrypoint")
      ),
      undefined
    );
    case "string":    return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    case "signature": return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    case "int":       return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Int")
      ),
      undefined
    );
    case "nat":       return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Nat")
      ),
      undefined
    );
    case "rational":       return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Rational")
      ),
      undefined
    );
    case "currency":       return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Tez")
      ),
      undefined
    );
    case "asset":     return factory.createTypeReferenceNode(
      factory.createIdentifier(at.name+"_container"),
      undefined
    );
    case "asset_value":  return factory.createTypeReferenceNode(
      factory.createIdentifier(at.args[0].name+"_value"),
      undefined
    );
    case "map": case "big_map" : return factory.createTypeReferenceNode(
      factory.createIdentifier("Array"),
      [factory.createTupleTypeNode([
        archetype_type_to_ts_type(at.args[0]),
        archetype_type_to_ts_type(at.args[1])
      ])]
    );
    case "set" :
    case "list":   return factory.createTypeReferenceNode(
      factory.createIdentifier("Array"),
      [archetype_type_to_ts_type(at.args[0])]
    )
    case "record": if (at.name != null) {
      return factory.createTypeReferenceNode(
        factory.createIdentifier(at.name),
        undefined)
    };
    case "tuple": return factory.createTupleTypeNode([
      archetype_type_to_ts_type(at.args[0]),
      archetype_type_to_ts_type(at.args[1])
    ]);
    default:       return factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
  }
}

/* Complex data type comparison generators --------------------------------- */

const rm_milliseconds_from = (x : ts.Expression) : ts.BinaryExpression => {
  return factory.createBinaryExpression(
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        x,
        factory.createIdentifier("getTime")
      ),
      undefined,
      []
    ),
    factory.createToken(ts.SyntaxKind.MinusToken),
    factory.createCallExpression(
      factory.createPropertyAccessExpression(
        x,
        factory.createIdentifier("getMilliseconds")
      ),
      undefined,
      []
    )
  )
}

// factory.createPropertyAccessExpression(
//  factory.createIdentifier("a"),
//  factory.createIdentifier(f.name)
//)

export const make_cmp_body = (a : ts.Expression, b : ts.Expression, atype: ArchetypeType) => {
  switch (atype.node) {
    case "date": return  factory.createBinaryExpression(
      factory.createParenthesizedExpression(rm_milliseconds_from(a)),
      factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
      factory.createParenthesizedExpression(rm_milliseconds_from(b))
    );
    case "int"      :
    case "nat"      :
    case "rational" :
    case "bytes"    :
    case "address"  :
    case "option"   :
    case "currency" :
    case "duration" :
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          a,
          factory.createIdentifier("equals")
        ),
        undefined,
        [b]
      )
    default: return factory.createBinaryExpression(
      a,
      factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
      b
    )
  }
}

/* Michelson to Typescript utils ----------------------------------------------------- */

export const mich_to_field_decl = (atype : ArchetypeType, arg : string, idx : number = 0, len : number = 0) : ts.CallExpression => {
  switch (atype.node) {
    case "map" : return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("mich_to_map")
      ),
      undefined,
      [
        factory.createIdentifier(arg),
        factory.createArrowFunction(
          undefined,
          undefined,
          [
            factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              factory.createIdentifier("x"),
              undefined,
              undefined,
              undefined
            ),
            factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              factory.createIdentifier("y"),
              undefined,
              undefined,
              undefined
            )
          ],
          undefined,
          factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          factory.createArrayLiteralExpression(
            [
              mich_to_field_decl(atype.args[0], "x", 0, 0),
              mich_to_field_decl(atype.args[1], "y", 0, 0)
            ],
            false
          )
        )
      ]
    )
    case "record": {
      const larg = idx + 1 == len ? factory.createCallExpression(
        factory.createIdentifier("mich_to_"+ atype.name),
        undefined,
        [factory.createObjectLiteralExpression(
        [
          factory.createPropertyAssignment(
            factory.createIdentifier("prim"),
            factory.createStringLiteral("Pair")
          ),
          factory.createPropertyAssignment(
            factory.createIdentifier("args"),
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("fields"),
                factory.createIdentifier("slice")
              ),
              undefined,
              [factory.createNumericLiteral(idx)]
            )
          )
        ],
        false
      )]) : factory.createCallExpression(
        factory.createIdentifier("mich_to_" + atype.name),
        undefined,
        [factory.createIdentifier(arg)])
      return larg
    }
    case "option" :
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("ex"),
          factory.createIdentifier("mich_to_option")
        ),
        undefined,
        [
          factory.createIdentifier(arg),
          factory.createArrowFunction(
            undefined,
            undefined,
            [factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              factory.createIdentifier("x"),
              undefined,
              undefined,
              undefined
            )],
            undefined,
            factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            factory.createBlock(
              [factory.createReturnStatement(mich_to_field_decl(atype.args[0], "x", 0, 0))],
              false
            )
          )
        ]
      )
    default :
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("ex"),
          factory.createIdentifier(archetype_type_to_mich_to_name(atype))
        ),
        undefined,
        [factory.createIdentifier(arg)]
      )
  }
}

export const archetype_type_to_mich_to_name = (atype : ArchetypeType) : string => {
  switch (atype.node) {
    case "date"     : return "mich_to_date"
    case "nat"      : return "mich_to_nat"
    case "int"      : return "mich_to_int"
    case "currency" : return "mich_to_tez"
    case "duration" : return "mich_to_duration"
    case "bool"     : return "mich_to_bool"
    case "string"   : return "mich_to_string"
    case "rational" : return "mich_to_rational"
    case "address"  : return "mich_to_address"
    case "bytes"    : return "mich_to_bytes"
    default: throw new Error("archetype_type_to_mich_to_name: unknown type '" + atype.node + "'")
  }
}

/* storage element getter formulas ----------------------------------------- */

const access_nth_field = (x : ts.Expression, i : number) : ts.Expression => {
  return factory.createElementAccessExpression(
    x,
    factory.createElementAccessExpression(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("Object"),
          factory.createIdentifier("keys")
        ),
        undefined,
        [x]
      ),
      factory.createNumericLiteral(""+i)
    )
  )
}

const get_record_type = (name : string | null, ci : ContractInterface) : Record => {
  if (name != null) {
    for (let i = 0; i < ci.types.records.length; i++) {
      if (ci.types.records[i].name == name) {
        return ci.types.records[i]
      }
    }
  }
  throw new Error("get_record_type: record '" + name + "' not found")
}

const get_field_annot_names = (r : Record) : { [key: string] : string } => {
  const internal_get_fan =
  (mt : MichelsonType, idx : number, acc : { [key: string] : string }) : [ number, { [key: string] : string } ] => {
    if (mt.annots.length > 0) {
      const annot = mt.annots[0].slice(1)
      acc[r.fields[idx].name] = annot
      return [ idx + 1, acc ]
    } else {
      switch (mt.prim) {
        case "pair" : {
          // left
          const [idx_left,   acc_left] = internal_get_fan(mt.args[0], idx, acc)
          // right
          const [idx_right, acc_right] = internal_get_fan(mt.args[1], idx_left, acc_left)
          return [idx_right, acc_right]
        }
        default : throw new Error("internal_get_fan: found a node which is not annotated nor is a pair")
      }
    }
  }
  const [ _, res ] = internal_get_fan(r.type_michelson, 0, {})
  return res
}

const get_lambda_form = (body : ts.Statement[], arg : ts.Expression) : ts.Expression => {
  return factory.createCallExpression(
    factory.createParenthesizedExpression(factory.createArrowFunction(
      undefined,
      undefined,
      [factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier("x"),
        undefined,
        undefined,
        undefined
      )],
      undefined,
      factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      factory.createBlock(
        body,
        false
      )
    )),
    undefined,
    [arg]
  )
}

export const get_return_body = (root : ts.Expression, elt : ts.Expression, atype: ArchetypeType, ci : ContractInterface) : ts.Statement[] => {
  switch (atype.node) {
    case "bool"     :
    case "string"   : return [factory.createReturnStatement(elt)]
    case "int"      :
    case "nat"      :
    case "bytes"    :
    case "address"  :
    case "duration" : return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier(atype.node.charAt(0).toUpperCase() + atype.node.slice(1))
      ),
      undefined,
      [ elt ]
    ))]
    case "rational" :
      return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Rational")
      ),
      undefined,
      [
        access_nth_field(elt, 0),
        access_nth_field(elt, 1)
      ]
    ))]
    case "currency" : return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Tez")
      ),
      undefined,
      [ elt, factory.createStringLiteral("mutez") ]
    ))]
    case "date"    : return [factory.createReturnStatement(factory.createNewExpression(
      factory.createIdentifier("Date"),
      undefined,
      [ elt ]
    ))]
    case "option"  : return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("Option")
      ),
      [ archetype_type_to_ts_type(atype.args[0]) ],
      [factory.createConditionalExpression(
        factory.createBinaryExpression(
          elt,
          factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
          factory.createNull()
        ),
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createNull(),
        factory.createToken(ts.SyntaxKind.ColonToken),
        get_lambda_form(get_return_body(root, factory.createIdentifier("x"), atype.args[0], ci), elt)
      )]
    ))]
    case "set"  :
    case "list" : {
      return [
        factory.createVariableStatement(
          undefined,
          factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
              factory.createIdentifier("res"),
              undefined,
              archetype_type_to_ts_type(atype),
              factory.createArrayLiteralExpression(
                [],
                false
              )
            )],
            ts.NodeFlags.Const
          )
        ),
        factory.createForStatement(
          factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
              factory.createIdentifier("i"),
              undefined,
              undefined,
              factory.createNumericLiteral("0")
            )],
            ts.NodeFlags.Let
          ),
          factory.createBinaryExpression(
            factory.createIdentifier("i"),
            factory.createToken(ts.SyntaxKind.LessThanToken),
            factory.createPropertyAccessExpression(
              elt,
              factory.createIdentifier("length")
            )
          ),
          factory.createPostfixUnaryExpression(
            factory.createIdentifier("i"),
            ts.SyntaxKind.PlusPlusToken
          ),
          factory.createBlock(
            [factory.createExpressionStatement(factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("res"),
                factory.createIdentifier("push")
              ),
              undefined,
              [ get_lambda_form(
                  get_return_body(factory.createIdentifier("x"), factory.createIdentifier("x"), atype.args[0], ci),
                  factory.createElementAccessExpression(
                    elt,
                    factory.createIdentifier("i")
                  )
                )
              ]
            ))],
            true
          )
        ),
        factory.createReturnStatement(factory.createIdentifier("res"))
      ];
    }
    case "asset" : return []
    case "map" : {
      return [
        factory.createVariableStatement(
          undefined,
          factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
              factory.createIdentifier("res"),
              undefined,
              archetype_type_to_ts_type(atype)
              ,
              factory.createArrayLiteralExpression(
                [],
                false
              )
            )],
            ts.NodeFlags.Let
          )
        ),
        factory.createForOfStatement(
          undefined,
          factory.createVariableDeclarationList(
            [factory.createVariableDeclaration(
              factory.createIdentifier("e"),
              undefined,
              undefined,
              undefined
            )],
            ts.NodeFlags.Let
          ),
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              elt,
              factory.createIdentifier("entries")
            ),
            undefined,
            []
          ),
          factory.createBlock(
            [factory.createExpressionStatement(factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("res"),
                factory.createIdentifier("push")
              ),
              undefined,
              [factory.createArrayLiteralExpression(
                [
                  get_lambda_form(
                    get_return_body(factory.createIdentifier("x"), factory.createIdentifier("x"), atype.args[0], ci),
                    factory.createElementAccessExpression(
                      factory.createIdentifier("e"),
                      factory.createIdentifier("0")
                    )
                  ),
                  get_lambda_form(
                    get_return_body(factory.createIdentifier("x"), factory.createIdentifier("x"), atype.args[1], ci),
                    factory.createElementAccessExpression(
                      factory.createIdentifier("e"),
                      factory.createIdentifier("1")
                    )
                  )
                ],
                false
              )]
            ))],
            true
          )
        ),
        factory.createReturnStatement(factory.createIdentifier("res"))
      ]
    }
    case "tuple" : {
      return [ factory.createReturnStatement(factory.createArrayLiteralExpression(
        atype.args.map((t,i) => {
          return get_lambda_form(
            get_return_body(factory.createIdentifier("x"), factory.createIdentifier("x"), t, ci),
            factory.createElementAccessExpression(
              elt,
              factory.createIdentifier(""+i)
            )
          )
        }),
        false
      ))]
    }
    case "record" : {
      const r = get_record_type(atype.name, ci)
      const field_annot_names = get_field_annot_names(r)
      return [factory.createReturnStatement(factory.createObjectLiteralExpression(
        r.fields.map(f => {
          const field_value = factory.createPropertyAccessExpression(
            root,
            factory.createIdentifier(field_annot_names[f.name])
          )
          return factory.createPropertyAssignment(
            factory.createIdentifier(f.name),
            get_lambda_form(get_return_body(root, factory.createIdentifier("x"), f.type, ci), field_value)
          )
        })
      ))]
    }
  }
  throw new Error("get_return_body: type '" + atype.node + "' not found")
}

/* Typescript To Micheline utils ------------------------------------------------------ */

const class_to_mich = (x  :ts.Expression) => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      x,
      factory.createIdentifier("to_mich")
    ),
    undefined,
    []
  )
}

const string_to_mich = (x : ts.Expression) => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("ex"),
      factory.createIdentifier("string_to_mich")
    ),
    undefined,
    [x]
  );
}

const bool_to_mich = (x : ts.Expression) => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("ex"),
      factory.createIdentifier("bool_to_mich")
    ),
    undefined,
    [x]
  );
}

const date_to_mich = (x : ts.Expression) => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("ex"),
      factory.createIdentifier("date_to_mich")
    ),
    undefined,
    [x]
  );
}

const asset_value_to_mich = (type_name : string | null, x : ts.Expression) => {
  if (type_name == null) {
    throw (new Error("asset_value_to_mich: null type name"))
  }
  return factory.createCallExpression(
    factory.createIdentifier(type_name + "_value_to_mich"),
    undefined,
    [x]
  )
}

const tuple_to_mich = (name : string, types : ArchetypeType[]) => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("ex"),
      factory.createIdentifier("pair_to_mich")
    ),
    undefined,
    [factory.createArrayLiteralExpression(
      types.map((x,i) => function_param_to_mich({ name: name + "[" + i + "]", type: x })),
      false
    )]
  )
}

const record_to_mich = (name : string, x : ts.Expression) => {
  return factory.createCallExpression(
    factory.createIdentifier(name + "_to_mich"),
    undefined,
    [x])
}

const internal_map_to_mich = (name : string, decls : ts.CallExpression[]) => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("ex"),
      factory.createIdentifier("list_to_mich")
    ),
    undefined,
    [
      factory.createIdentifier(name),
      factory.createArrowFunction(
        undefined,
        undefined,
        [factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier("x"),
          undefined,
          undefined,
          undefined
        )],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createBlock(
          [
            factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                  factory.createIdentifier("x_key"),
                  undefined,
                  undefined,
                  factory.createElementAccessExpression(
                    factory.createIdentifier("x"),
                    factory.createNumericLiteral("0")
                  )
                )],
                ts.NodeFlags.Const
              )
            ),
            factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                  factory.createIdentifier("x_value"),
                  undefined,
                  undefined,
                  factory.createElementAccessExpression(
                    factory.createIdentifier("x"),
                    factory.createNumericLiteral("1")
                  )
                )],
                ts.NodeFlags.Const
              )
            ),
            factory.createReturnStatement(factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("ex"),
                factory.createIdentifier("elt_to_mich")
              ),
              undefined,
              decls
            ))
          ],
          true
        )
      )
    ]
  )
}

const map_to_mich = (name : string, key_type : ArchetypeType | null, value_type : ArchetypeType | null) => {
  if (null == key_type) throw new Error("map_to_mich: null key type")
  if (null == value_type) throw new Error("map_to_mich: null value type")
  return internal_map_to_mich(name, [
    function_param_to_mich({ name: "x_key", type: key_type }),
    function_param_to_mich({ name: "x_value", type: value_type })
  ])
}

const function_param_to_mich = (fp: FunctionParameter) : ts.CallExpression => {
  switch (fp.type.node) {
    case "signature"   :
    case "string"      : return string_to_mich(factory.createIdentifier(fp.name))
    case "bool"        : return bool_to_mich(factory.createIdentifier(fp.name))
    case "date"        : return date_to_mich(factory.createIdentifier(fp.name))
    case "int"         :
    case "nat"         :
    case "bytes"       :
    case "currency"    :
    case "address"     :
    case "duration"    :
    case "rational"    :
    case "option"      :
    case "contract"    : return class_to_mich(factory.createIdentifier(fp.name))
    case "asset_value" : return asset_value_to_mich(fp.type.args[0].name, factory.createIdentifier(fp.name))
    case "tuple"       : return tuple_to_mich(fp.name, fp.type.args)
    case "record"      : if (fp.type.name == null) {
      throw new Error("function_param_to_mich: null record name")
    } else return record_to_mich(fp.type.name, factory.createIdentifier(fp.name))
    case "map"         :
    case "big_map"     : return map_to_mich(fp.name, fp.type.args[0], fp.type.args[1])
    default            : throw new Error("function_param_to_mich: unhandled type '" + fp.type.node + "'")
  }
}

export const function_params_to_mich = (a : Array<FunctionParameter>) => {
  if (a.length == 0) {
    return factory.createPropertyAccessExpression(
      factory.createIdentifier("ex"),
      factory.createIdentifier("unit_mich")
    )
  } else if (a.length == 1) {
    return function_param_to_mich(a[0])
  } else {
    return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("pair_to_mich")
      ),
      undefined,
      [factory.createArrayLiteralExpression(
        a.map((x, i) => function_param_to_mich(x)),
        true
      )]
    )
  }
}

const get_archetype_type_of = (name : string, fields : Array<Omit<Field, "is_key">>) => {
  for (var i = 0; i < fields.length; i++) {
    const field = fields[i]
    if (field.name == name) {
      return field.type
    }
  }
}

const get_archetype_type_from_idx = (idx : number, fields : Array<Omit<Field, "is_key">>) => {
  return fields[idx].type
}

const get_field_name_from_idx = (idx : number, fields : Array<Omit<Field, "is_key">>) => {
  return fields[idx].name
}

const mich_type_to_archetype = (mt : MichelsonType) : ArchetypeType => {
  switch (mt.prim) {
    case "string"    : return { node: "string", name: null, args: [] }
    case "int"       : return { node: "int", name: null, args: [] }
    case "nat"       : return { node: "nat", name: null, args: [] }
    case "timestamp" : return { node: "date", name: null, args: [] }
    case "address" : return { node: "address", name: null, args: [] }
    case "bytes" : return { node: "bytes", name: null, args: [] }
    default: throw new Error("mich_type_to_archetype: cannot convert prim '" + mt.prim + "'")
  }
}

/**
 * Generates To Michelson TS expression that follows its Michelson Type structure
 * @param v value name
 * @param mt local michelson type
 * @param fields base of fields for type lookup
 * @param fidx field index
 * @returns pair of number of fields looked up so far and 'to_mich' expression
 */
export const entity_to_mich = (v : string, mt: MichelsonType, fields : Array<Omit<Field, "is_key">>, fidx : number = 0) : [number, ts.CallExpression] => {
  if (mt.annots.length > 0) {
    //const name = mt.annots[0].slice(1)
    const name = get_field_name_from_idx(fidx, fields)

    //const atype = get_archetype_type_of(name, fields)
    const atype = get_archetype_type_from_idx(fidx, fields)
    if (undefined == atype) {
      throw new Error("entity_to_mich: type not found for '" + name + "'")
    }
    const fp = { name: v + "." + name, type : atype }
    return [ fidx + 1, function_param_to_mich(fp) ]
  } else {
    switch (mt.prim) {
      case "pair" : {
        // left
        const [fidx0, expr0] = entity_to_mich(v, mt.args[0], fields, fidx)
        // right
        const [fidx1, expr1] = entity_to_mich(v, mt.args[1], fields, fidx0)
        return [fidx1, factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier("ex"),
            factory.createIdentifier("pair_to_mich")
          ),
          undefined,
          [factory.createArrayLiteralExpression(
            [ expr0, expr1 ],
            false
          )]
        )]
      }
      case "map"     :
      case "big_map" : {
        // left
        const [ _,    expr0] = entity_to_mich("x_key", mt.args[0], fields, fidx)
        // right
        const [fidx1, expr1] = entity_to_mich("x_value", mt.args[1], fields, fidx)
        return [ fidx1, internal_map_to_mich(v, [
          expr0,
          expr1
        ]) ]
      }
      default: return [ fidx, function_param_to_mich({ name: v, type: mich_type_to_archetype(mt) }) ]
    }
  }
}


export const valuetoMichType = (mt : MichelsonType) : ts.CallExpression => {
  switch (mt.prim) {
    case "big_map": return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("pair_to_mich_type")
      ),
      undefined,
      [ factory.createStringLiteral("big_map"), valuetoMichType(mt.args[0]), valuetoMichType(mt.args[1]) ]
    )
    case "map": return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("pair_to_mich_type")
      ),
      undefined,
      [ factory.createStringLiteral("map"), valuetoMichType(mt.args[0]), valuetoMichType(mt.args[1]) ]
    )
    case "pair": return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("pair_array_to_mich_type")
      ),
      undefined,
      [factory.createArrayLiteralExpression(
        [ valuetoMichType(mt.args[0]), valuetoMichType(mt.args[1]) ],
        true
      )]
    )
    case "option":
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("ex"),
        factory.createIdentifier("option_annot_to_mich_type")
      ),
      undefined,
      [
        valuetoMichType(mt.args[0]),
        factory.createArrayLiteralExpression(
          annots,
          false
        )
      ]
    )
    default: {
      const prim = mt.prim == null ? "string" : mt.prim
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("ex"),
          factory.createIdentifier("prim_annot_to_mich_type")
        ),
        undefined,
        [
          factory.createStringLiteral(prim),
          factory.createArrayLiteralExpression(
            annots,
            false
          )
        ]
      )
    }
  }
}