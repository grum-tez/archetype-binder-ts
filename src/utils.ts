import ts, { factory, KeywordTypeNode, SyntaxKind } from "typescript";

export type ATSimple = {
  node: "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" | "chain_id" | "chest_key" | "chest" | "currency" | "date" | "duration" | "int" | "key_hash" | "key" | "nat" | "never" | "operation" | "rational" | "sapling_state" | "sapling_transaction" | "signature" | "state" | "string" | "timestamp" | "unit"
}

export type ATNamed = {
  node: "aggregate" | "asset_container" | "asset_key" | "asset_value" | "asset_view" | "asset" | "collection" | "enum" | "event" | "partition" | "record"
  name: string
}

export type ATSingle = {
  node: "contract" | "list" | "option" | "set" | "ticket"
  arg: ArchetypeType
}

export type ATMap = {
  node: "big_map" | "iterable_big_map" | "map"
  key_type: ArchetypeType
  value_type: ArchetypeType
}

export type ATOr = {
  node: "or"
  left_type: ArchetypeType
  right_type: ArchetypeType
}

export type ATLambda = {
  node: "lambda"
  arg_type: ArchetypeType
  ret_type: ArchetypeType
}

export type ATTuple = {
  "node": "tuple"
  "args": Array<ArchetypeType>
}

export type ArchetypeType = ATSimple | ATNamed | ATSingle | ATMap | ATOr | ATLambda | ATTuple

export type RawArchetypeType = {
  node: "address" | "aggregate" | "asset_container" | "asset_key" | "asset_value" | "asset_view" | "asset" | "big_map" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" | "chain_id" | "chest_key" | "chest" | "collection" | "contract" | "currency" | "date" | "duration" | "enum" | "event" | "int" | "iterable_big_map" | "key_hash" | "key" | "lambda" | "list" | "map" | "nat" | "never" | "operation" | "option" | "or" | "partition" | "rational" | "record" | "sapling_state" | "sapling_transaction" | "set" | "signature" | "state" | "string" | "ticket" | "timestamp" | "tuple" | "unit"
  name: string | null
  args: Array<RawArchetypeType>
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

type ContractParameterGen<T> = {
  "name": string
  "type": T
  "const": boolean
  "default": string | null
}
export type ContractParameter = ContractParameterGen<ArchetypeType>

type FunctionParameterGen<T> = {
  "name": string
  "type": T
}
export type FunctionParameter = FunctionParameterGen<ArchetypeType>

type EntrypointGen<T> = {
  "name": string
  "args": Array<FunctionParameterGen<T>>
}
export type Entrypoint = EntrypointGen<ArchetypeType>

type FieldGen<T> = {
  "name": string
  "type": T
  "is_key": boolean
}
export type Field = FieldGen<ArchetypeType>


type AssetGen<T> = {
  "name": string
  "container_kind": "map" | "big_map" | "iterable_big_map"
  "fields": Array<FieldGen<T>>
  "container_type_michelson": MichelsonType
  "key_type_michelson": MichelsonType
  "value_type_michelson": MichelsonType
}
export type Asset = AssetGen<ArchetypeType>

type EnumValueGen<T> = {
  "name": string,
  "types": Array<T>
}
export type EnumValue = EnumValueGen<ArchetypeType>

type EnumGen<T> = {
  "name": string
  "constructors": Array<EnumValueGen<T>>
  "type_michelson": MichelsonType
}
export type Enum = EnumGen<ArchetypeType>

type StorageElementGen<T> = {
  "name": string
  "type": T
  "const": boolean
}
export type StorageElement = StorageElementGen<ArchetypeType>

type RecordGen<T> = {
  "name": string
  "fields": Array<Omit<FieldGen<T>, "is_key">>
  "type_michelson": MichelsonType
}
export type Record = RecordGen<ArchetypeType>

type GetterGen<T> = {
  "name": string
  "args": Array<FunctionParameterGen<T>>
  "return": T
  "return_michelson": {
    "value": MichelsonType
    "is_storable": boolean
  }
}
export type Getter = GetterGen<ArchetypeType>

type ViewGen<T> = {
  "name": string
  "args": Array<FunctionParameterGen<T>>
  "return": T
}
export type View = ViewGen<ArchetypeType>

type EventGen<T> = {
  "name": string
  "fields": Array<Omit<FieldGen<T>, "is_key">>
  "type_michelson": MichelsonType
}
export type Event = EventGen<ArchetypeType>

export type Error = {
  "kind": string
  "args": Array<string>
  "expr": MichelsonType
}

export type ContractInterfaceGen<T> = {
  "name": string,
  "parameters": Array<ContractParameterGen<T>>
  "types": {
    "assets": Array<AssetGen<T>>
    "enums": Array<EnumGen<T>>
    "records": Array<RecordGen<T>>
    "events": Array<EventGen<T>>
  }
  "storage": Array<StorageElementGen<T>>
  "storage_type": null | {
    "value": MichelsonType
    "is_storable": boolean
  }
  "entrypoints": Array<EntrypointGen<T>>
  "getters": Array<GetterGen<T>>
  "views": Array<ViewGen<T>>
  "errors": Array<Error>
}

export type RawContractInterface = ContractInterfaceGen<RawArchetypeType>
export type ContractInterface = ContractInterfaceGen<ArchetypeType>

type TaquitoEnv = {
  in_map_key: boolean
}

export const makeTaquitoEnv = (): TaquitoEnv => {
  return { in_map_key: false }
}

/* Archetype type to Michelson type ---------------------------------------- */


export const archetype_type_to_mich_type = (at: ArchetypeType): MichelsonType => {
  const generate_mich = (prim: string, args?: Array<MichelsonType>) => {
    return {
      prim: prim,
      int: null,
      bytes: null,
      string: null,
      args: args ?? [],
      annots: [],
      array: [],
    }
  }
  switch (at.node) {
    /* TODO record asset tuple enum option or ... */
    case "address": return generate_mich(at.node)
    case "aggregate": return generate_mich(at.node)
    case "asset_container": return generate_mich(at.node)
    case "asset_key": return generate_mich(at.node)
    case "asset_value": return generate_mich(at.node)
    case "asset_view": return generate_mich(at.node)
    case "asset": return generate_mich(at.node)
    case "big_map": return generate_mich(at.node, [archetype_type_to_mich_type(at.key_type), archetype_type_to_mich_type(at.value_type)])
    case "bls12_381_fr": return generate_mich(at.node)
    case "bls12_381_g1": return generate_mich(at.node)
    case "bls12_381_g2": return generate_mich(at.node)
    case "bool": return generate_mich(at.node)
    case "bytes": return generate_mich(at.node)
    case "chain_id": return generate_mich(at.node)
    case "chest_key": return generate_mich(at.node)
    case "chest": return generate_mich(at.node)
    case "collection": return generate_mich(at.node)
    case "contract": return generate_mich(at.node, [archetype_type_to_mich_type(at.arg)])
    case "currency": return generate_mich("mutez")
    case "date": return generate_mich(at.node)
    case "duration": return generate_mich(at.node)
    case "enum": return generate_mich(at.node)
    case "event": return generate_mich(at.node)
    case "int": return generate_mich(at.node)
    case "iterable_big_map": return generate_mich(at.node)
    case "key_hash": return generate_mich(at.node)
    case "key": return generate_mich(at.node)
    case "lambda": return generate_mich(at.node, [archetype_type_to_mich_type(at.arg_type), archetype_type_to_mich_type(at.ret_type)])
    case "list": return generate_mich(at.node, [archetype_type_to_mich_type(at.arg)])
    case "map": return generate_mich(at.node, [archetype_type_to_mich_type(at.key_type), archetype_type_to_mich_type(at.value_type)])
    case "nat": return generate_mich(at.node)
    case "never": return generate_mich(at.node)
    case "operation": return generate_mich(at.node)
    case "option": return generate_mich(at.node, [archetype_type_to_mich_type(at.arg)])
    case "or": return generate_mich(at.node, [archetype_type_to_mich_type(at.left_type), archetype_type_to_mich_type(at.right_type)])
    case "partition": return generate_mich(at.node)
    case "rational": return generate_mich("pair", [generate_mich("int"), generate_mich("nat")])
    case "record": return generate_mich(at.node)
    case "sapling_state": return generate_mich(at.node)
    case "sapling_transaction": return generate_mich(at.node)
    case "set": return generate_mich(at.node, [archetype_type_to_mich_type(at.arg)])
    case "signature": return generate_mich(at.node)
    case "state": return generate_mich(at.node)
    case "string": return generate_mich(at.node)
    case "ticket": return generate_mich(at.node, [archetype_type_to_mich_type(at.arg)])
    case "timestamp": return generate_mich(at.node)
    case "tuple": return generate_mich("pair", at.args.map(x => { return archetype_type_to_mich_type(x) }))
    case "unit": return generate_mich(at.node)
  }
}

/* Archetype type to Typescript type --------------------------------------- */

export const archetype_type_to_ts_type = (at: ArchetypeType): KeywordTypeNode<any> => {
  const throw_error = (ty: string): KeywordTypeNode<any> => {
    throw new Error(`archetype_type_to_ts_type: '${ty}' type not handled`)
  }
  switch (at.node) {
    case "address": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Address")
      ),
      undefined
    );
    case "aggregate": return throw_error(at.node)
    case "asset_container": return throw_error(at.node)
    case "asset_key": return throw_error(at.node)
    case "asset_value": return throw_error(at.node)

    //    {
    //   if (at.args[0].name != null) {
    //     return factory.createTypeReferenceNode(
    //       factory.createIdentifier(at.args[0].name + "_value"),
    //       undefined
    //     );
    //   } else {
    //     throw new Error(`Cannot get asset name (asset_value)`)
    //   }
    // }
    case "asset_view": return throw_error(at.node)
    case "asset": {
      if (at.name != null) {
        return factory.createTypeReferenceNode(
          factory.createIdentifier(at.name + "_container"),
          undefined
        );
      } else {
        throw new Error(`Cannot get asset name (asset)`)
      }
    }
    case "big_map": return factory.createTypeReferenceNode(
      factory.createIdentifier("Array"),
      [factory.createTupleTypeNode([
        archetype_type_to_ts_type(at.key_type),
        archetype_type_to_ts_type(at.value_type)
      ])]
    );
    case "bls12_381_fr": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Bls12_381_fr")
      ),
      undefined
    );
    case "bls12_381_g1": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Bls12_381_g1")
      ),
      undefined
    );
    case "bls12_381_g2": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Bls12_381_g2")
      ),
      undefined
    );
    case "bool": return factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword)
    case "bytes": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Bytes")
      ),
      undefined
    );
    case "chain_id": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Chain_id")
      ),
      undefined
    );
    case "chest_key": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Chest_key")
      ),
      undefined
    );
    case "chest": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Chest")
      ),
      undefined
    );
    case "collection": return throw_error(at.node)
    case "contract": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Entrypoint")
      ),
      undefined
    );
    case "currency": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Tez")
      ),
      undefined
    );
    case "date": return factory.createTypeReferenceNode(
      factory.createIdentifier("Date"),
      undefined
    )
    case "duration": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Duration")
      ),
      undefined
    );
    case "enum": return factory.createTypeReferenceNode(
      factory.createIdentifier(at.name != null ? at.name : ""),
      undefined
    )
    case "event": {
      return factory.createTypeReferenceNode(
        factory.createIdentifier(at.name),
        undefined)
    }
    case "int": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Int")
      ),
      undefined
    );
    case "iterable_big_map": return throw_error(at.node)
    case "key_hash": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Key_hash")
      ),
      undefined
    );
    case "key": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Key")
      ),
      undefined
    );
    case "lambda": return throw_error(at.node)
    case "list": return factory.createTypeReferenceNode(
      factory.createIdentifier("Array"),
      [archetype_type_to_ts_type(at.arg)]
    )
    case "map": return factory.createTypeReferenceNode(
      factory.createIdentifier("Array"),
      [factory.createTupleTypeNode([
        archetype_type_to_ts_type(at.key_type),
        archetype_type_to_ts_type(at.value_type)
      ])]
    );
    case "nat": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Nat")
      ),
      undefined
    );
    case "never": return throw_error(at.node)
    case "operation": return throw_error(at.node)
    case "option": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Option"),
      ),
      [archetype_type_to_ts_type(at.arg)]
    );
    case "or": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Or")
      ),
      [
        archetype_type_to_ts_type(at.left_type),
        archetype_type_to_ts_type(at.right_type)
      ]
    )
    case "partition": return throw_error(at.node)
    case "rational": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Rational")
      ),
      undefined
    );
    case "record": {
      return factory.createTypeReferenceNode(
        factory.createIdentifier(at.name),
        undefined)
    }
    case "sapling_state": return throw_error(at.node)
    case "sapling_transaction": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Sapling_transaction")
      ),
      undefined
    );
    case "set": return factory.createTypeReferenceNode(
      factory.createIdentifier("Array"),
      [archetype_type_to_ts_type(at.arg)]
    )
    case "signature": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Signature")
      ),
      undefined
    );
    case "state": return throw_error(at.node)
    case "string": return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    case "ticket": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Ticket")
      ),
      [archetype_type_to_ts_type(at.arg)]
    );
    case "timestamp": return throw_error(at.node)
    case "tuple": return factory.createTupleTypeNode(
      at.args.map(t => archetype_type_to_ts_type(t))
    );
    case "unit": return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Unit")
      ),
      undefined
    );
  }
}

/* Complex data type comparison generators --------------------------------- */

const rm_milliseconds_from = (x: ts.Expression): ts.BinaryExpression => {
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

const make_tuple_cmp_body = (a: ts.Expression, b: ts.Expression, types: Array<ArchetypeType>): ts.Expression => {
  return factory.createCallExpression(
    factory.createParenthesizedExpression(factory.createArrowFunction(
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
      factory.createBlock(
        [factory.createReturnStatement(
          types.slice(1).reduce((acc, t, i) => {
            return factory.createBinaryExpression(
              acc,
              factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
              make_cmp_body(factory.createElementAccessExpression(
                factory.createIdentifier("x"),
                factory.createNumericLiteral(i + 1)
              ), factory.createElementAccessExpression(
                factory.createIdentifier("y"),
                factory.createNumericLiteral(i + 1)
              ), t)
            )
          }, make_cmp_body(factory.createElementAccessExpression(
            factory.createIdentifier("x"),
            factory.createNumericLiteral("0")
          ), factory.createElementAccessExpression(
            factory.createIdentifier("y"),
            factory.createNumericLiteral("0")
          ), types[0])))],
        true
      )
    )),
    undefined,
    [a, b]
  )
}

export const make_cmp_body = (a: ts.Expression, b: ts.Expression, atype: ArchetypeType) => {
  const make_cmp_equals = (a: ts.Expression, b: ts.Expression) => {
    return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        a,
        factory.createIdentifier("equals")
      ),
      undefined,
      [b]
    )
  }
  const make_cmp_equals_default = (a: ts.Expression, b: ts.Expression) => {
    return factory.createBinaryExpression(a, factory.createToken(ts.SyntaxKind.EqualsEqualsToken), b)
  }
  const make_cmp_equals_container = (a: ts.Expression, b: ts.Expression) => {
    return factory.createBinaryExpression(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("JSON"),
          factory.createIdentifier("stringify")
        ),
        undefined,
        [a]
      ),
      factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("JSON"),
          factory.createIdentifier("stringify")
        ),
        undefined,
        [b]
      )
    )
  }
  switch (atype.node) {
    case "address": return make_cmp_equals(a, b);
    case "aggregate": return make_cmp_equals_default(a, b);
    case "asset_container": return make_cmp_equals_default(a, b);
    case "asset_key": return make_cmp_equals_default(a, b);
    case "asset_value": return make_cmp_equals_default(a, b);
    case "asset_view": return make_cmp_equals_default(a, b);
    case "asset": return make_cmp_equals_container(a, b);
    case "big_map": return make_cmp_equals_default(a, b);
    case "bls12_381_fr": return make_cmp_equals(a, b);
    case "bls12_381_g1": return make_cmp_equals(a, b);
    case "bls12_381_g2": return make_cmp_equals(a, b);
    case "bool": return make_cmp_equals_default(a, b);
    case "bytes": return make_cmp_equals(a, b);
    case "chain_id": return make_cmp_equals(a, b);
    case "chest_key": return make_cmp_equals(a, b);
    case "chest": return make_cmp_equals(a, b);
    case "collection": return make_cmp_equals_default(a, b);
    case "contract": return make_cmp_equals(a, b);
    case "currency": return make_cmp_equals(a, b);
    case "date": return factory.createBinaryExpression(
      factory.createParenthesizedExpression(rm_milliseconds_from(a)),
      factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
      factory.createParenthesizedExpression(rm_milliseconds_from(b))
    );
    case "duration": return make_cmp_equals(a, b);
    case "enum": return make_cmp_equals_default(a, b);
    case "event": return make_cmp_equals_default(a, b);
    case "int": return make_cmp_equals(a, b);
    case "iterable_big_map": return make_cmp_equals_default(a, b);
    case "key_hash": return make_cmp_equals(a, b);
    case "key": return make_cmp_equals(a, b);
    case "lambda": return make_cmp_equals_default(a, b);
    case "list": return make_cmp_equals_container(a, b);
    case "map": return make_cmp_equals_container(a, b);
    case "nat": return make_cmp_equals(a, b);
    case "never": return make_cmp_equals_default(a, b);
    case "operation": return make_cmp_equals_default(a, b);
    case "option": return make_cmp_equals(a, b);
    case "or": return make_cmp_equals_default(a, b);
    case "partition": return make_cmp_equals_default(a, b);
    case "rational": return make_cmp_equals(a, b);
    case "record": return make_cmp_equals_default(a, b);
    case "sapling_state": return make_cmp_equals(a, b);
    case "sapling_transaction": return make_cmp_equals(a, b);
    case "set": return make_cmp_equals_container(a, b);
    case "signature": return make_cmp_equals(a, b);
    case "state": return make_cmp_equals(a, b);
    case "string": return make_cmp_equals_default(a, b);
    case "ticket": return make_cmp_equals(a, b);
    case "timestamp": return make_cmp_equals_default(a, b);
    case "tuple": return make_tuple_cmp_body(a, b, atype.args);
    case "unit": return make_cmp_equals(a, b);
  }
}

/* Michelson to Typescript utils ----------------------------------------------------- */

const make_arg = (i: number): ts.Expression => {
  const p_idx = Math.floor(i / 2)
  const arg_idx = i % 2
  return factory.createElementAccessExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("p" + p_idx.toString()),
      factory.createIdentifier("args")
    ),
    factory.createNumericLiteral(arg_idx.toString())
  )
}

const make_pair_decl = (arg: ts.Expression, i: number) => {
  const idx = Math.floor(i / 2)
  if (idx == 0) {
    return factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [factory.createVariableDeclaration(
          factory.createIdentifier("p0"),
          undefined,
          undefined,
          factory.createParenthesizedExpression(factory.createAsExpression(
            arg,
            factory.createTypeReferenceNode(
              factory.createQualifiedName(
                factory.createIdentifier("att"),
                factory.createIdentifier("Mpair")
              ),
              undefined
            )
          ))
        )],
        ts.NodeFlags.Const
      )
    )
  } else {
    return factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [factory.createVariableDeclaration(
          factory.createIdentifier("p" + idx.toString()),
          undefined,
          undefined,
          factory.createParenthesizedExpression(factory.createAsExpression(
            factory.createElementAccessExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("p" + (idx - 1).toString()),
                factory.createIdentifier("args")
              ),
              factory.createNumericLiteral("1")
            ),
            factory.createTypeReferenceNode(
              factory.createQualifiedName(
                factory.createIdentifier("att"),
                factory.createIdentifier("Mpair")
              ),
              undefined
            )
          ))
        )],
        ts.NodeFlags.Const
      )
    )
  }
}

const mich_to_tuple = (types: Array<ArchetypeType>, arg: ts.Expression) => {
  const decls: Array<ts.Statement> = []
  const args: Array<ts.Expression> = []
  for (let i = 0; i < types.length; i++) {
    if (i % 2 == 0) {
      // create declaration
      decls.push(make_pair_decl(factory.createIdentifier("p"), i))
    }
    args.push(mich_to_field_decl(types[i], make_arg(i)))
  }
  const body = [...decls, factory.createReturnStatement(factory.createArrayLiteralExpression(args))]
  return factory.createCallExpression(
    factory.createParenthesizedExpression(factory.createArrowFunction(
      undefined,
      undefined,
      [factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier("p"),
        undefined,
        undefined,
        undefined
      )],
      undefined,
      factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      factory.createBlock(
        body,
        true
      )
    )),
    undefined,
    [arg]
  )
}

const contained_type_to_field_decl = (fname: string, arg: ts.Expression, atype: ArchetypeType) => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("att"),
      factory.createIdentifier(fname)
    ),
    undefined,
    [
      arg,
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
          [factory.createReturnStatement(mich_to_field_decl(atype, factory.createIdentifier("x"), 0, 0))],
          false
        )
      )
    ]
  )
}

export const mich_to_field_decl = (atype: ArchetypeType, arg: ts.Expression, idx = 0, len = 0): ts.Expression => {
  switch (atype.node) {
    case "map": return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("mich_to_map")
      ),
      undefined,
      [
        arg,
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
              mich_to_field_decl(atype.key_type, factory.createIdentifier("x"), 0, 0),
              mich_to_field_decl(atype.value_type, factory.createIdentifier("y"), 0, 0)
            ],
            false
          )
        )
      ]
    )
    case "record": {
      const larg = idx + 1 == len ? factory.createCallExpression(
        factory.createIdentifier("mich_to_" + atype.name),
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
        ), factory.createIdentifier("collapsed")]) : factory.createCallExpression(
          factory.createIdentifier("mich_to_" + atype.name),
          undefined,
          [arg, factory.createIdentifier("collapsed")])
      return larg
    }
    case "option":
      return contained_type_to_field_decl("mich_to_option", arg, atype.arg)
    case "set":
    case "list":
      return contained_type_to_field_decl("mich_to_list", arg, atype.arg)
    case "tuple":
      return mich_to_tuple(atype.args, arg)
    case "enum":
      return factory.createCallExpression(
        factory.createIdentifier("mich_to_" + atype.name),
        undefined,
        [arg]
      )
    default:
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier(archetype_type_to_mich_to_name(atype))
        ),
        undefined,
        [arg]
      )
  }
}

export const archetype_type_to_mich_to_name = (atype: ArchetypeType): string => {
  switch (atype.node) {
    case "date": return "mich_to_date"
    case "nat": return "mich_to_nat"
    case "int": return "mich_to_int"
    case "currency": return "mich_to_tez"
    case "duration": return "mich_to_duration"
    case "bool": return "mich_to_bool"
    case "string": return "mich_to_string"
    case "rational": return "mich_to_rational"
    case "address": return "mich_to_address"
    case "bytes": return "mich_to_bytes"
    case "signature": return "mich_to_signature"
    case "key": return "mich_to_key"
    case "bls12_381_fr": return "mich_to_bls12_381_fr"
    default: throw new Error("archetype_type_to_mich_to_name: unknown type '" + atype.node + "'")
  }
}

/* storage element getter formulas ----------------------------------------- */

const access_nth_field = (x: ts.Expression, i: number): ts.Expression => {
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
      factory.createNumericLiteral(i)
    )
  )
}

const get_record_or_event_type = (name: string | null, ci: ContractInterface) => {
  if (name != null) {
    for (let i = 0; i < ci.types.records.length; i++) {
      if (ci.types.records[i].name == name) {
        return ci.types.records[i]
      }
    }
    for (let i = 0; i < ci.types.events.length; i++) {
      if (ci.types.events[i].name == name) {
        return ci.types.events[i]
      }
    }
  }
  throw new Error("get_record_or_event_type: '" + name + "' not found")
}

const get_asset_type = (name: string, ci: ContractInterface) => {
  if (name != null) {
    for (let i = 0; i < ci.types.assets.length; i++) {
      if (ci.types.assets[i].name == name) {
        return ci.types.assets[i]
      }
    }
  }
  throw new Error("get_asset_type: '" + name + "' not found")
}

const get_field_annot_names = (r: Record): { [key: string]: string } => {
  const internal_get_fan =
    (mt: MichelsonType, idx: number, acc: { [key: string]: string }): [number, { [key: string]: string }] => {
      if (mt.annots.length > 0) {
        const annot = mt.annots[0].slice(1)
        acc[r.fields[idx].name] = annot
        return [idx + 1, acc]
      } else {
        switch (mt.prim) {
          case "pair": {
            // left
            const [idx_left, acc_left] = internal_get_fan(mt.args[0], idx, acc)
            // right
            const [idx_right, acc_right] = internal_get_fan(mt.args[1], idx_left, acc_left)
            return [idx_right, acc_right]
          }
          case "unit": {
            return [idx, acc]
          }
          //default : throw new Error(`internal_get_fan: found a node '${mt.prim}' which is not annotated nor is a pair`)
          default: {
            acc[r.fields[idx].name] = r.fields[idx].name
            return [idx + 1, acc]
          }
        }
      }
    }
  const [_, res] = internal_get_fan(r.type_michelson, 0, {})
  return res
}

const get_lambda_form = (body: ts.Statement[], arg: ts.Expression): ts.Expression => {
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

const get_enum = (name: string, ci: ContractInterface) => {
  if (name != null) {
    for (let i = 0; i < ci.types.enums.length; i++) {
      if (ci.types.enums[i].name == name) {
        return ci.types.enums[i]
      }
    }
  }
  throw new Error("get_enum_type: '" + name + "' not found")
}

const make_enum_type_case_body = (elt: ts.Expression, c: EnumValue, ci: ContractInterface) => {
  if (c.types.length == 0) {
    return factory.createReturnStatement(factory.createNewExpression(
      factory.createIdentifier(c.name),
      undefined,
      []
    ))
  } else {
    let atype: ArchetypeType
    if (c.types.length == 1) {
      atype = c.types[0]
    } else {
      atype = {
        node: "tuple",
        args: c.types
      }
    }
    return factory.createReturnStatement(factory.createNewExpression(
      factory.createIdentifier(c.name),
      undefined,
      [factory.createCallExpression(
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
          archetype_type_to_ts_type(atype),
          factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          factory.createBlock(
            taquito_to_ts(factory.createIdentifier("x"), atype, ci, makeTaquitoEnv()),
            false
          )
        )),
        undefined,
        [factory.createPropertyAccessExpression(
          elt,
          factory.createIdentifier(c.name)
        )]
      )]
    ))
  }
}

const make_enum_simple_return_body = (elt: ts.Expression, e: Enum, ci: ContractInterface): ts.Statement => {
  const tmp = e.constructors.map((x, i) => {
    return <[EnumValue, number]>[x, i]
  });

  return tmp.slice(1).reduce(
    (acc, c) => {
      return factory.createIfStatement(
        factory.createBinaryExpression(
          factory.createBinaryExpression(
            elt,
            factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
            factory.createStringLiteral(`${c[1]}`)
          ),
          factory.createToken(ts.SyntaxKind.BarBarToken),
          factory.createParenthesizedExpression(factory.createConditionalExpression(
            factory.createPropertyAccessExpression(
              elt,
              factory.createIdentifier("toNumber")
            ),
            factory.createToken(ts.SyntaxKind.QuestionToken),
            factory.createBinaryExpression(
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  elt,
                  factory.createIdentifier("toNumber")
                ),
                undefined,
                []
              ),
              factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
              factory.createNumericLiteral(c[1])
            ),
            factory.createToken(ts.SyntaxKind.ColonToken),
            factory.createFalse()
          ))
        ),
        factory.createBlock(
          [make_enum_type_case_body(elt, c[0], ci)],
          true
        ),
        acc
      )
    },
    <ts.Statement>make_enum_type_case_body(elt, e.constructors[0], ci)
  )
}

const make_enum_return_body = (elt: ts.Expression, e: Enum, ci: ContractInterface): ts.Statement => {
  return e.constructors.slice(1).reduce(
    (acc, c) => {
      return factory.createIfStatement(
        factory.createBinaryExpression(
          factory.createPropertyAccessExpression(
            elt,
            factory.createIdentifier(c.name)
          ),
          factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
          factory.createIdentifier("undefined")
        ),
        factory.createBlock(
          [make_enum_type_case_body(elt, c, ci)],
          true
        ),
        acc
      )
    },
    <ts.Statement>make_enum_type_case_body(elt, e.constructors[0], ci)
  )
}

const get_element_access = (elt: ts.Expression, idx: number) => {
  return factory.createElementAccessExpression(
    elt,
    factory.createElementAccessExpression(
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("Object"),
          factory.createIdentifier("keys")
        ),
        undefined,
        [elt]
      ),
      factory.createNumericLiteral(idx)
    )
  )
}

export const taquito_to_ts = (elt: ts.Expression, atype: ArchetypeType, ci: ContractInterface, env: TaquitoEnv): ts.Statement[] => {
  const make_class = (x: ts.Expression[]) => {
    return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier(atype.node.charAt(0).toUpperCase() + atype.node.slice(1))
      ),
      undefined,
      x
    ))]
  }
  const make_list = (atype: ATSingle) => {
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
            [get_lambda_form(
              taquito_to_ts(factory.createIdentifier("x"), atype.arg, ci, env),
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

  const get_tuple_body = (elt: ts.Expression, t: ATTuple, ci: ContractInterface, start_idx = 0): [ts.Expression[], number] => {
    const [array, idx] = t.args.reduce((acc, a) => {
      const [acc_array, acc_idx] = acc
      switch (a.node) {
        case "tuple": {
          const [tuple_array, tuple_idx] = get_tuple_body(elt, a, ci, acc_idx)
          return [
            [...acc_array, factory.createArrayLiteralExpression(tuple_array)],
            tuple_idx
          ]
        }
        default:
          return [
            [...acc_array, get_lambda_form(taquito_to_ts(factory.createIdentifier("x"), a, ci, env), get_element_access(elt, acc_idx))],
            acc_idx + 1
          ]
      }
    }, [<ts.Expression[]>[], start_idx])
    return [array, idx]
  }

  const throw_error = (): ts.Statement[] => {
    throw new Error("taquito_to_ts: type '" + atype.node + "' not found")
  }

  switch (atype.node) {
    case "address": return make_class([elt]);
    case "aggregate": return throw_error();
    case "asset_container": return throw_error();
    case "asset_key": return throw_error();
    case "asset_value": return throw_error();
    case "asset_view": return throw_error();
    case "asset": {
      const a = get_asset_type(atype.name, ci)
      switch (a.container_kind) {
        case "map": {
          // create asset container (not for asset to big_map)
          const fields_no_key = a.fields.filter(x => !x.is_key)
          const fields_key = a.fields.filter(x => x.is_key)

          const asset_name_key = a.name + "_key";
          const asset_name_value = a.name + "_value";

          const asset_key_record_type: Record = {
            name: asset_name_key,
            fields: fields_key,
            type_michelson: a.key_type_michelson
          }

          const asset_value_record_type: Record = {
            name: asset_name_value,
            fields: fields_no_key,
            type_michelson: a.value_type_michelson
          }

          const key_type: ArchetypeType = fields_key.length == 0 ? { node: "unit" } : (fields_key.length == 1 ? fields_key[0].type : { node: "record", name: asset_name_key });
          const value_type: ArchetypeType = fields_no_key.length == 0 ? { node: "unit" } : (fields_no_key.length == 1 ? fields_no_key[0].type : { node: "record", name: asset_name_value });
          const tmp_ci = fields_key.length > 1 ? { ...ci, types: { ...ci.types, records: [...ci.types.records, asset_key_record_type] } } : ci;
          const augmented_ci = fields_no_key.length > 1 ? { ...tmp_ci, types: { ...tmp_ci.types, records: [...tmp_ci.types.records, asset_value_record_type] } } : tmp_ci;

          const container_type: ArchetypeType = fields_no_key.length > 0 ?
            {
              node: "map",
              key_type: key_type,
              value_type: value_type
            } : {
              node: "set",
              arg: key_type
            };

          return taquito_to_ts(elt, container_type, augmented_ci, env)
        }
        case "big_map": {
          const fields_no_key = a.fields.filter(x => !x.is_key)
          if (fields_no_key.length == 1) {
            // asset value is assimiliated to the field
            return taquito_to_ts(elt, fields_no_key[0].type, ci, env)
          } else {
            // create asset value record
            const asset_value_record_type: Record = {
              name: a.name + "_value",
              fields: fields_no_key,
              type_michelson: a.value_type_michelson
            }
            const augmented_ci: ContractInterface = {
              ...ci,
              types: {
                ...ci.types,
                records: [...ci.types.records, asset_value_record_type]
              }
            }
            return taquito_to_ts(elt, { name: a.name + "_value", node: "record" }, augmented_ci, env)
          }
        }
        case "iterable_big_map": return throw_error();
      }
      break;
    }
    case "big_map": return throw_error();
    case "bls12_381_fr": return make_class([elt]);
    case "bls12_381_g1": return make_class([elt]);
    case "bls12_381_g2": return make_class([elt]);
    case "bool": return [factory.createReturnStatement(
      factory.createConditionalExpression(
        factory.createPropertyAccessExpression(
          elt,
          factory.createIdentifier("prim")
        ),
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createParenthesizedExpression(factory.createConditionalExpression(
          factory.createBinaryExpression(
            factory.createPropertyAccessExpression(
              elt,
              factory.createIdentifier("prim")
            ),
            factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
            factory.createStringLiteral("True")
          ),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          factory.createTrue(),
          factory.createToken(ts.SyntaxKind.ColonToken),
          factory.createFalse()
        )),
        factory.createToken(ts.SyntaxKind.ColonToken),
        elt
      )
    )];
    case "bytes": return make_class([elt]);
    case "chain_id": return make_class([elt]);
    case "chest_key": return make_class([elt]);
    case "chest": return make_class([elt]);
    case "collection": return throw_error();
    case "contract": return throw_error();
    case "currency": return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("Tez")
      ),
      undefined,
      [elt, factory.createStringLiteral("mutez")]
    ))];
    case "date": return [factory.createReturnStatement(factory.createNewExpression(
      factory.createIdentifier("Date"),
      undefined,
      [elt]
    ))];
    case "duration": return make_class([elt]);
    case "enum": {
      const e = get_enum(atype.name, ci)
      const is_simple: boolean = e.type_michelson.prim != "or";
      return [(is_simple ? make_enum_simple_return_body : make_enum_return_body)(elt, e, ci)]
    }
    case "int": return make_class([elt]);
    case "iterable_big_map": return throw_error();
    case "key_hash": return make_class([elt]);
    case "key": return make_class([elt]);
    case "lambda": return throw_error();
    case "list": return make_list(atype);
    case "map": {
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
                    taquito_to_ts(factory.createIdentifier("x"), atype.key_type, ci, { ...(env ?? {}), in_map_key: true }),
                    factory.createElementAccessExpression(
                      factory.createIdentifier("e"),
                      factory.createIdentifier("0")
                    )
                  ),
                  get_lambda_form(
                    taquito_to_ts(factory.createIdentifier("x"), atype.value_type, ci, env),
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
    case "nat": return make_class([elt]);
    case "never": return throw_error();
    case "operation": return throw_error();
    case "option": return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("Option")
      ),
      [archetype_type_to_ts_type(atype.arg)],
      [factory.createConditionalExpression(
        factory.createBinaryExpression(
          elt,
          factory.createToken(ts.SyntaxKind.EqualsEqualsToken),
          factory.createNull()
        ),
        factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createNull(),
        factory.createToken(ts.SyntaxKind.ColonToken),
        get_lambda_form(taquito_to_ts(factory.createIdentifier("x"), atype.arg, ci, env), elt)
      )]
    ))];
    case "or": return [factory.createReturnStatement(factory.createCallExpression(
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
          [
            factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                  factory.createIdentifier("is_left"),
                  undefined,
                  undefined,
                  factory.createBinaryExpression(
                    factory.createElementAccessExpression(
                      factory.createIdentifier("x"),
                      factory.createStringLiteral("0")
                    ),
                    factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                    factory.createIdentifier("undefined")
                  )
                )],
                ts.NodeFlags.Const
              )
            ),
            factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                  factory.createIdentifier("value"),
                  undefined,
                  undefined,
                  factory.createConditionalExpression(
                    factory.createIdentifier("is_left"),
                    factory.createToken(ts.SyntaxKind.QuestionToken),
                    factory.createCallExpression(
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
                          taquito_to_ts(factory.createIdentifier("x"), atype.left_type, ci, env),
                          false
                        )
                      )),
                      undefined,
                      [factory.createElementAccessExpression(
                        factory.createIdentifier("x"),
                        factory.createStringLiteral("0")
                      )]
                    ),
                    factory.createToken(ts.SyntaxKind.ColonToken),
                    factory.createCallExpression(
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
                          taquito_to_ts(factory.createIdentifier("x"), atype.right_type, ci, env),
                          false
                        )
                      )),
                      undefined,
                      [factory.createElementAccessExpression(
                        factory.createIdentifier("x"),
                        factory.createStringLiteral("1")
                      )]
                    )
                  )
                )],
                ts.NodeFlags.Const
              )
            ),
            factory.createReturnStatement(factory.createNewExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("att"),
                factory.createIdentifier("Or")
              ),
              [
                archetype_type_to_ts_type(atype.left_type),
                archetype_type_to_ts_type(atype.right_type)
              ],
              [
                factory.createIdentifier("value"),
                factory.createIdentifier("is_left")
              ]
            ))
          ],
          true
        )
      )),
      undefined,
      [elt]
    ))];
    case "partition": return throw_error();
    case "rational": return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("Rational")
      ),
      undefined,
      [
        access_nth_field(elt, 0),
        access_nth_field(elt, 1)
      ]
    ))];
    case "event":
    case "record": {
      const r = get_record_or_event_type(atype.name, ci)
      const field_annot_names = get_field_annot_names(r)
      if (r.fields.length == 1) {
        const f = r.fields[0];
        return [factory.createReturnStatement(get_lambda_form(taquito_to_ts(factory.createIdentifier("x"), f.type, ci, env), elt))];
      } else {
        return [factory.createReturnStatement(factory.createNewExpression(
          factory.createIdentifier(atype.name),
          undefined,
          r.fields.map((f, i) => {
            const field_value = env.in_map_key ? factory.createElementAccessExpression(
              elt,
              factory.createNumericLiteral(i)
            ) : factory.createPropertyAccessExpression(
              elt,
              factory.createIdentifier(field_annot_names[f.name])
            )
            return get_lambda_form(taquito_to_ts(factory.createIdentifier("x"), f.type, ci, env), field_value)
          })
        ))]
      }
    }
    case "sapling_state": return make_class([elt]);
    case "sapling_transaction": return make_class([elt]);
    case "set": return make_list(atype);
    case "signature": return make_class([elt]);
    case "state": return throw_error();
    case "string": return [factory.createReturnStatement(elt)];
    case "ticket": return [factory.createReturnStatement(factory.createNewExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("Ticket")
      ),
      [archetype_type_to_ts_type(atype.arg)],
      [factory.createNewExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("Address")
        ),
        undefined,
        [factory.createPropertyAccessExpression(
          factory.createIdentifier("x"),
          factory.createIdentifier("ticketer")
        )]
      ),
      factory.createPropertyAccessExpression(
        factory.createIdentifier("x"),
        factory.createIdentifier("value")
      ),
      factory.createNewExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("Nat")
        ),
        undefined,
        [factory.createPropertyAccessExpression(
          factory.createIdentifier("x"),
          factory.createIdentifier("amount")
        )]
      )]
    ))];
    case "timestamp": return throw_error();
    case "tuple": {
      const array = get_tuple_body(elt, atype, ci)[0]
      return [factory.createReturnStatement(factory.createArrayLiteralExpression(array))]
    }
    case "unit": return make_class([]);
  }
}

/* Typescript To Micheline utils ------------------------------------------------------ */

const class_to_mich = (x: ts.Expression): ts.CallExpression => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      x,
      factory.createIdentifier("to_mich")
    ),
    undefined,
    []
  )
}

const string_to_mich = (x: ts.Expression): ts.CallExpression => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("att"),
      factory.createIdentifier("string_to_mich")
    ),
    undefined,
    [x]
  );
}

export const unit_to_mich = (): ts.CallExpression => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("att"),
      factory.createIdentifier("unit_to_mich")
    ),
    undefined,
    []
  );
}

const bool_to_mich = (x: ts.Expression): ts.CallExpression => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("att"),
      factory.createIdentifier("bool_to_mich")
    ),
    undefined,
    [x]
  );
}

const date_to_mich = (x: ts.Expression): ts.CallExpression => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("att"),
      factory.createIdentifier("date_to_mich")
    ),
    undefined,
    [x]
  );
}

const tuple_to_mich = (name: string, types: ArchetypeType[], ci: ContractInterface): ts.CallExpression => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("att"),
      factory.createIdentifier("pair_to_mich")
    ),
    undefined,
    [factory.createArrayLiteralExpression(
      types.map((x, i) => function_param_to_mich({ name: name + "[" + i.toString() + "]", type: x }, ci)),
      false
    )]
  )
}

const record_to_mich = (fp: FunctionParameter, ci: ContractInterface): ts.CallExpression => {
  const v = get_record_or_event_type((fp.type as ATNamed).name, ci);
  if (v.fields.length == 1) {
    const aty = v.fields[0].type;
    return function_param_to_mich({ ...fp, type: aty }, ci);
  } else {
    return class_to_mich(factory.createIdentifier(fp.name))
  }
}

const list_to_mich = (name: string, atype: ArchetypeType, ci: ContractInterface): ts.CallExpression => {
  return internal_list_to_mich(name, [
    factory.createReturnStatement(function_param_to_mich({ name: "x", type: atype }, ci))
  ])
}

const internal_list_to_mich = (name: string, body: ts.Statement[]): ts.CallExpression => {
  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("att"),
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
          body,
          true
        )
      )
    ]
  )
}

const internal_map_to_mich = (name: string, decls: ts.CallExpression[]): ts.CallExpression => {
  return internal_list_to_mich(name, [
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
        factory.createIdentifier("att"),
        factory.createIdentifier("elt_to_mich")
      ),
      undefined,
      decls
    ))
  ])
}

const map_to_mich = (name: string, key_type: ArchetypeType | null, value_type: ArchetypeType | null, ci: ContractInterface) => {
  if (null == key_type) throw new Error("map_to_mich: null key type")
  if (null == value_type) throw new Error("map_to_mich: null value type")
  return internal_map_to_mich(name, [
    function_param_to_mich({ name: "x_key", type: key_type }, ci),
    function_param_to_mich({ name: "x_value", type: value_type }, ci)
  ])
}

export const function_param_to_mich = (fp: FunctionParameter, ci: ContractInterface): ts.CallExpression => {
  const throw_error = (ty: string): ts.CallExpression => {
    throw new Error("function_param_to_mich: unhandled type '" + ty + "'")
  }
  const option_to_mich = (ty: ArchetypeType, x: ts.Expression) => {
    return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        x,
        factory.createIdentifier("to_mich")
      ),
      undefined,
      [factory.createParenthesizedExpression(factory.createArrowFunction(
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
          [factory.createReturnStatement(function_param_to_mich({ name: "x", type: ty }, ci))],
          false
        )
      ))]
    )
  }

  const or_to_mich = (ty_left: ArchetypeType, ty_right: ArchetypeType, x: ts.Expression) => {
    return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        x,
        factory.createIdentifier("to_mich")
      ),
      undefined,
      [factory.createParenthesizedExpression(factory.createArrowFunction(
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
          [factory.createReturnStatement(function_param_to_mich({ name: "x", type: ty_left }, ci))],
          false
        )
      )),
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
          [factory.createReturnStatement(function_param_to_mich({ name: "x", type: ty_right }, ci))],
          false
        )
      ))
      ]
    )
  }

  const ticket_to_mich = (ty: ArchetypeType, x: ts.Expression) => {
    return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        x,
        factory.createIdentifier("to_mich")
      ),
      undefined,
      [factory.createParenthesizedExpression(factory.createArrowFunction(
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
          [factory.createReturnStatement(function_param_to_mich({ name: "x", type: ty }, ci))],
          false
        )
      ))]
    )
  }

  switch (fp.type.node) {
    case "address": return class_to_mich(factory.createIdentifier(fp.name))
    case "aggregate": return throw_error(fp.type.node)
    case "asset_container": return throw_error(fp.type.node);
    case "asset_key": return throw_error(fp.type.node);
    case "asset_value": return class_to_mich(factory.createIdentifier(fp.name));
    case "asset_view": return throw_error(fp.type.node);
    case "asset": return throw_error(fp.type.node);
    case "big_map": return map_to_mich(fp.name, fp.type.key_type, fp.type.value_type, ci);
    case "bls12_381_fr": return class_to_mich(factory.createIdentifier(fp.name));
    case "bls12_381_g1": return class_to_mich(factory.createIdentifier(fp.name));
    case "bls12_381_g2": return class_to_mich(factory.createIdentifier(fp.name));
    case "bool": return bool_to_mich(factory.createIdentifier(fp.name));
    case "bytes": return class_to_mich(factory.createIdentifier(fp.name));
    case "chain_id": return class_to_mich(factory.createIdentifier(fp.name));
    case "chest_key": return class_to_mich(factory.createIdentifier(fp.name));
    case "chest": return class_to_mich(factory.createIdentifier(fp.name));
    case "collection": return throw_error(fp.type.node);
    case "contract": return class_to_mich(factory.createIdentifier(fp.name));
    case "currency": return class_to_mich(factory.createIdentifier(fp.name));
    case "date": return date_to_mich(factory.createIdentifier(fp.name));
    case "duration": return class_to_mich(factory.createIdentifier(fp.name));
    case "enum": return class_to_mich(factory.createIdentifier(fp.name));
    case "event": return record_to_mich(fp, ci);
    case "int": return class_to_mich(factory.createIdentifier(fp.name));
    case "iterable_big_map": return throw_error(fp.type.node);
    case "key_hash": return class_to_mich(factory.createIdentifier(fp.name));
    case "key": return class_to_mich(factory.createIdentifier(fp.name));
    case "lambda": return throw_error(fp.type.node);
    case "list": return list_to_mich(fp.name, fp.type.arg, ci);
    case "map": return map_to_mich(fp.name, fp.type.key_type, fp.type.value_type, ci);
    case "nat": return class_to_mich(factory.createIdentifier(fp.name));
    case "never": return throw_error(fp.type.node);
    case "operation": return throw_error(fp.type.node);
    case "option": return option_to_mich(fp.type.arg, factory.createIdentifier(fp.name));
    case "or": return or_to_mich(fp.type.left_type, fp.type.right_type, factory.createIdentifier(fp.name));
    case "partition": return throw_error(fp.type.node);
    case "rational": return class_to_mich(factory.createIdentifier(fp.name));
    case "record": return class_to_mich(factory.createIdentifier(fp.name));
    case "sapling_state": return class_to_mich(factory.createIdentifier(fp.name));
    case "sapling_transaction": return class_to_mich(factory.createIdentifier(fp.name));
    case "set": return list_to_mich(fp.name, fp.type.arg, ci);
    case "signature": return class_to_mich(factory.createIdentifier(fp.name));
    case "state": return throw_error(fp.type.node);
    case "string": return string_to_mich(factory.createIdentifier(fp.name));
    case "ticket": return ticket_to_mich(fp.type.arg, factory.createIdentifier(fp.name));
    case "timestamp": return throw_error(fp.type.node);
    case "tuple": return tuple_to_mich(fp.name, fp.type.args, ci);
    case "unit": return unit_to_mich()
  }
}

export const function_params_to_mich = (a: Array<FunctionParameter>, ci: ContractInterface) => {
  if (a.length == 0) {
    return factory.createPropertyAccessExpression(
      factory.createIdentifier("att"),
      factory.createIdentifier("unit_mich")
    )
  } else if (a.length == 1) {
    return function_param_to_mich(a[0], ci)
  } else {
    return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("pair_to_mich")
      ),
      undefined,
      [factory.createArrayLiteralExpression(
        a.map((x, i) => function_param_to_mich(x, ci)),
        true
      )]
    )
  }
}

export const storage_to_mich = (mt: MichelsonType, selts: Array<StorageElement>, ci: ContractInterface): ts.Expression => {
  if (mt.prim == "pair" && mt.annots.length == 0) {
    return factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("pair_to_mich")
      ),
      undefined,
      [factory.createArrayLiteralExpression(
        mt.args.map(x => storage_to_mich(x, selts, ci)),
        false
      )]
    )
  } else {
    let selt = selts[0]
    if (mt.annots.length > 0) {
      const annot = mt.annots[0]
      for (let i = 0; i < selts.length; i++) {
        if (annot == "%" + selts[i].name) {
          selt = selts[i]
        }
      }
    }
    return function_param_to_mich(selt, ci)
  }
}

const get_archetype_type_of = (name: string, fields: Array<Omit<Field, "is_key">>) => {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    if (field.name == name) {
      return field.type
    }
  }
}

const get_archetype_type_from_idx = (idx: number, fields: Array<Partial<Field>>) => {
  return fields[idx].type
}

const get_field_name_from_idx = (idx: number, fields: Array<Partial<Field>>) => {
  return fields[idx].name
}

const mich_type_to_archetype = (mt: MichelsonType): ArchetypeType => {
  switch (mt.prim) {
    case "string": return { node: "string" }
    case "int": return { node: "int" }
    case "nat": return { node: "nat" }
    case "timestamp": return { node: "date" }
    case "address": return { node: "address" }
    case "bytes": return { node: "bytes" }
    case "unit": return { node: "unit" }
    case "list": return { node: "list", arg: mich_type_to_archetype(mt.args[0]) }
    case "pair": return { node: "tuple", args: [mich_type_to_archetype(mt.args[0]), mich_type_to_archetype(mt.args[1])] }
    default: throw new Error("mich_type_to_archetype: cannot convert prim '" + (mt.prim ?? "null") + "'")
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
export const entity_to_mich = (v: string, mt: MichelsonType, fields: Array<Partial<Field>>, fidx = 0, ci: ContractInterface): [number, ts.CallExpression] => {
  if (mt.annots.length > 0) {
    //const name = mt.annots[0].slice(1)
    const name = get_field_name_from_idx(fidx, fields)

    //const atype = get_archetype_type_of(name, fields)
    const atype = get_archetype_type_from_idx(fidx, fields)
    if (undefined == atype) {
      throw new Error("entity_to_mich: type not found for '" + (name ?? "null") + "'")
    }
    if (name == null) {
      throw new Error("entity_to_mich: field name is null")
    }
    const fp = { name: v + "." + name, type: atype }
    return [fidx + 1, function_param_to_mich(fp, ci)]
  } else {
    switch (mt.prim) {
      case "pair": {
        // left
        const [fidx0, expr0] = entity_to_mich(v, mt.args[0], fields, fidx, ci)
        // right
        const [fidx1, expr1] = entity_to_mich(v, mt.args[1], fields, fidx0, ci)
        return [fidx1, factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier("att"),
            factory.createIdentifier("pair_to_mich")
          ),
          undefined,
          [factory.createArrayLiteralExpression(
            [expr0, expr1],
            false
          )]
        )]
      }
      case "map":
      case "big_map": {
        // left
        const [_, expr0] = entity_to_mich("x_key", mt.args[0], fields.filter(x => x.is_key), fidx, ci)
        // right
        const [fidx1, expr1] = entity_to_mich("x_value", mt.args[1], fields.filter(x => !x.is_key), fidx, ci)
        return [fidx1, internal_map_to_mich(v, [
          expr0,
          expr1
        ])]
      }
      case "set": {
        const [_, expr0] = entity_to_mich("x", mt.args[0], fields.filter(x => x.is_key), fidx, ci)
        return [fidx, internal_list_to_mich(v, [
          factory.createReturnStatement(expr0)
        ])
        ]
      }
      default: return [fidx, function_param_to_mich({ name: v, type: mich_type_to_archetype(mt) }, ci)]
    }
  }
}


export const value_to_mich_type = (mt: MichelsonType): ts.CallExpression => {
  switch (mt.prim) {
    case "big_map": {
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("pair_annot_to_mich_type")
        ),
        undefined,
        [
          factory.createStringLiteral("big_map"),
          value_to_mich_type(mt.args[0]), value_to_mich_type(mt.args[1]), factory.createArrayLiteralExpression(annots, false)
        ]
      )
    }
    case "map": {
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("pair_annot_to_mich_type")
        ),
        undefined,
        [
          factory.createStringLiteral("map"),
          value_to_mich_type(mt.args[0]), value_to_mich_type(mt.args[1]), factory.createArrayLiteralExpression(annots, false)
        ]
      )
    }
    case "pair": {
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("pair_array_to_mich_type")
        ),
        undefined,
        [
          factory.createArrayLiteralExpression(
            [value_to_mich_type(mt.args[0]), value_to_mich_type(mt.args[1])],
            true
          ),
          factory.createArrayLiteralExpression(
            annots,
            false
          )
        ]
      )
    }
    case "option": {
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("option_annot_to_mich_type")
        ),
        undefined,
        [
          value_to_mich_type(mt.args[0]),
          factory.createArrayLiteralExpression(
            annots,
            false
          )
        ])
    }
    case "set":
    case "list": {
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("list_annot_to_mich_type")
        ),
        undefined,
        [
          value_to_mich_type(mt.args[0]),
          factory.createArrayLiteralExpression(
            annots,
            false
          )
        ])
    }
    case "or":
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("or_to_mich_type")
        ),
        undefined,
        [
          value_to_mich_type(mt.args[0]),
          value_to_mich_type(mt.args[1]),
          factory.createArrayLiteralExpression(
            mt.annots.map(a => factory.createStringLiteral(a, false))
          )
        ]
      )
    case "ticket": {
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
          factory.createIdentifier("ticket_annot_to_mich_type")
        ),
        undefined,
        [
          value_to_mich_type(mt.args[0]),
          factory.createArrayLiteralExpression(
            annots,
            false
          )
        ])
    }
    default: {
      const prim = mt.prim == null ? "string" : mt.prim
      const annots = mt.annots.length >= 1 ? [factory.createStringLiteral(mt.annots[0])] : []
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("att"),
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

/* Errors ------------------------------------------------------------------ */

export const mich_type_to_error = (expr: MichelsonType): [string, ts.Expression] => {
  if (expr.string != null) {
    return [expr.string.split(' ').join('_').toUpperCase(), factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("string_to_mich")
      ),
      undefined,
      [factory.createStringLiteral("\"" + expr.string + "\"")]
    )]
  } else if (expr.prim == "Pair") {
    const args = expr.args.map(mich_type_to_error)
    const label = args.reduce((acc, n) => {
      return (acc == "" ? "" : acc + "_") + n[0].toUpperCase()
    }, "")
    return [label, factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("pair_to_mich")
      ),
      undefined,
      [factory.createArrayLiteralExpression(args.map(p => p[1]))]
    )]
  } else if (expr.string) {
    return ["NOT_HANDLED", factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("string_to_mich")
      ),
      undefined,
      [factory.createStringLiteral(expr.string)]
    )]
  }  else if (expr.int) {
    return ["NOT_HANDLED", factory.createCallExpression(
      factory.createPropertyAccessExpression(
        factory.createIdentifier("att"),
        factory.createIdentifier("string_to_mich")
      ),
      undefined,
      [factory.createStringLiteral(expr.int.toString())]
    )]
  } else {
    throw new Error("mich_type_to_error: invalid error")
  }
}

export const make_error = (error: Error): [string, ts.Expression] => {
  switch (error.kind) {
    case "InvalidCondition":
      return [error.args[0], mich_type_to_error(error.expr)[1]]
    default:
      return mich_type_to_error(error.expr)
  }
}

/* constant code functions */

export const make_to_string_decl = () => {
  return factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    factory.createIdentifier("toString"),
    undefined,
    undefined,
    [],
    factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    factory.createBlock(
      [factory.createReturnStatement(factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("JSON"),
          factory.createIdentifier("stringify")
        ),
        undefined,
        [
          factory.createThis(),
          factory.createNull(),
          factory.createNumericLiteral("2")
        ]
      ))],
      true
    )
  )
}

// class utils

export const get_constructor = () => {
  return factory.createConstructorDeclaration(
    undefined,
    undefined,
    [factory.createParameterDeclaration(
      undefined,
      undefined,
      undefined,
      factory.createIdentifier("address"),
      undefined,
      factory.createUnionTypeNode([
        factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
      ]),
      factory.createIdentifier("undefined")
    )],
    factory.createBlock(
      [factory.createExpressionStatement(factory.createBinaryExpression(
        factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier("address")
        ),
        factory.createToken(ts.SyntaxKind.EqualsToken),
        factory.createIdentifier("address")
      ))],
      true
    )
  )
}

export const get_get_address_decl = () => {
  return factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    factory.createIdentifier("get_address"),
    undefined,
    undefined,
    [],
    factory.createTypeReferenceNode(
      factory.createQualifiedName(
        factory.createIdentifier("att"),
        factory.createIdentifier("Address")
      ),
      undefined
    ),
    factory.createBlock(
      [
        factory.createIfStatement(
          factory.createBinaryExpression(
            factory.createIdentifier("undefined"),
            factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            factory.createPropertyAccessExpression(
              factory.createThis(),
              factory.createIdentifier("address")
            )
          ),
          factory.createBlock(
            [factory.createReturnStatement(factory.createNewExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("att"),
                factory.createIdentifier("Address")
              ),
              undefined,
              [factory.createPropertyAccessExpression(
                factory.createThis(),
                factory.createIdentifier("address")
              )]
            ))],
            true
          ),
          undefined
        ),
        factory.createThrowStatement(factory.createNewExpression(
          factory.createIdentifier("Error"),
          undefined,
          [factory.createStringLiteral("Contract not initialised")]
        ))
      ],
      true
    )
  )
}

export const get_get_balance_decl = () => {
  return factory.createMethodDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
    undefined,
    factory.createIdentifier("get_balance"),
    undefined,
    undefined,
    [],
    factory.createTypeReferenceNode(
      factory.createIdentifier("Promise"),
      [factory.createTypeReferenceNode(
        factory.createQualifiedName(
          factory.createIdentifier("att"),
          factory.createIdentifier("Tez")
        ),
        undefined
      )]
    ),
    factory.createBlock(
      [
        factory.createIfStatement(
          factory.createBinaryExpression(
            factory.createNull(),
            factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            factory.createPropertyAccessExpression(
              factory.createThis(),
              factory.createIdentifier("address")
            )
          ),
          factory.createBlock(
            [factory.createReturnStatement(factory.createAwaitExpression(factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier("ex"),
                factory.createIdentifier("get_balance")
              ),
              undefined,
              [factory.createNewExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier("att"),
                  factory.createIdentifier("Address")
                ),
                undefined,
                [factory.createPropertyAccessExpression(
                  factory.createThis(),
                  factory.createIdentifier("address")
                )]
              )]
            )))],
            true
          ),
          undefined
        ),
        factory.createThrowStatement(factory.createNewExpression(
          factory.createIdentifier("Error"),
          undefined,
          [factory.createStringLiteral("Contract not initialised")]
        ))
      ],
      true
    )
  )
}


export const raw_to_contract_interface = (rci: RawContractInterface): ContractInterface => {
  const to_archetype_type = (rty: RawArchetypeType): ArchetypeType => {
    const force_name = (i: string | null): string => {
      if (i == null) {
        throw new Error("Invalid name")
      } else {
        return i
      }
    };
    switch (rty.node) {
      case "address": return { node: rty.node }
      case "aggregate": return { node: rty.node, name: force_name(rty.name) }
      case "asset_container": return { node: rty.node, name: force_name(rty.name) }
      case "asset_key": return { node: rty.node, name: force_name(rty.name) }
      case "asset_value": return { node: rty.node, name: force_name(rty.name) }
      case "asset_view": return { node: rty.node, name: force_name(rty.name) }
      case "asset": return { node: rty.node, name: force_name(rty.name) }
      case "big_map": return { node: rty.node, key_type: to_archetype_type(rty.args[0]), value_type: to_archetype_type(rty.args[1]) }
      case "bls12_381_fr": return { node: rty.node }
      case "bls12_381_g1": return { node: rty.node }
      case "bls12_381_g2": return { node: rty.node }
      case "bool": return { node: rty.node }
      case "bytes": return { node: rty.node }
      case "chain_id": return { node: rty.node }
      case "chest_key": return { node: rty.node }
      case "chest": return { node: rty.node }
      case "collection": return { node: rty.node, name: force_name(rty.name) }
      case "contract": return { node: rty.node, arg: to_archetype_type(rty.args[0]) }
      case "currency": return { node: rty.node }
      case "date": return { node: rty.node }
      case "duration": return { node: rty.node }
      case "enum": return { node: rty.node, name: force_name(rty.name) }
      case "event": return { node: rty.node, name: force_name(rty.name) }
      case "int": return { node: rty.node }
      case "iterable_big_map": return { node: rty.node, key_type: to_archetype_type(rty.args[0]), value_type: to_archetype_type(rty.args[1]) }
      case "key_hash": return { node: rty.node }
      case "key": return { node: rty.node }
      case "lambda": return { node: rty.node, arg_type: to_archetype_type(rty.args[0]), ret_type: to_archetype_type(rty.args[1]) }
      case "list": return { node: rty.node, arg: to_archetype_type(rty.args[0]) }
      case "map": return { node: rty.node, key_type: to_archetype_type(rty.args[0]), value_type: to_archetype_type(rty.args[1]) }
      case "nat": return { node: rty.node }
      case "never": return { node: rty.node }
      case "operation": return { node: rty.node }
      case "option": return { node: rty.node, arg: to_archetype_type(rty.args[0]) }
      case "or": return { node: rty.node, left_type: to_archetype_type(rty.args[0]), right_type: to_archetype_type(rty.args[1]) }
      case "partition": return { node: rty.node, name: force_name(rty.name) }
      case "rational": return { node: rty.node }
      case "record": return { node: rty.node, name: force_name(rty.name) }
      case "sapling_state": return { node: rty.node }
      case "sapling_transaction": return { node: rty.node }
      case "set": return { node: rty.node, arg: to_archetype_type(rty.args[0]) }
      case "signature": return { node: rty.node }
      case "state": return { node: rty.node }
      case "string": return { node: rty.node }
      case "ticket": return { node: rty.node, arg: to_archetype_type(rty.args[0]) }
      case "timestamp": return { node: rty.node }
      case "tuple": return { node: rty.node, args: rty.args.map(to_archetype_type) }
      case "unit": return { node: rty.node }
    }
  }

  const for_field = (i: FieldGen<RawArchetypeType>): Field => {
    return { ...i, "type": to_archetype_type(i.type) }
  };

  const for_field_omit = (i: Omit<FieldGen<RawArchetypeType>, "is_key">): Omit<Field, "is_key"> => {
    return { ...i, "type": to_archetype_type(i.type) }
  };

  const for_function_parameter = (i: FunctionParameterGen<RawArchetypeType>): FunctionParameter => {
    return { ...i, "type": to_archetype_type(i.type) }
  };

  return {
    "name": rci.name,
    "parameters": rci.parameters.map((i: ContractParameterGen<RawArchetypeType>): ContractParameter => { return { ...i, "type": to_archetype_type(i.type) } }),
    "types": {
      assets: rci.types.assets.map((i: AssetGen<RawArchetypeType>): Asset => { return { ...i, "fields": i.fields.map(for_field) } }),
      enums: rci.types.enums.map((i: EnumGen<RawArchetypeType>): Enum => { return { ...i, "constructors": i.constructors.map((i: EnumValueGen<RawArchetypeType>): EnumValue => { return { ...i, "types": i.types.map(to_archetype_type) } }) } }),
      records: rci.types.records.map((i: RecordGen<RawArchetypeType>): Record => { return { ...i, "fields": i.fields.map(for_field_omit) } }),
      events: rci.types.events.map((i: RecordGen<RawArchetypeType>): Record => { return { ...i, "fields": i.fields.map(for_field_omit) } }),
    },
    storage: rci.storage.map((i: StorageElementGen<RawArchetypeType>): StorageElement => {
      return { ...i, "type": to_archetype_type(i.type) }
    }),
    storage_type: rci.storage_type,
    entrypoints: rci.entrypoints.map((i: EntrypointGen<RawArchetypeType>): Entrypoint => { return { ...i, "args": i.args.map(for_function_parameter) } }),
    getters: rci.getters.map((i: GetterGen<RawArchetypeType>): Getter => { return { ...i, "args": i.args.map(for_function_parameter), "return": to_archetype_type(i.return) } }),
    views: rci.views.map((i: ViewGen<RawArchetypeType>): View => { return { ...i, "args": i.args.map(for_function_parameter), "return": to_archetype_type(i.return) } }),
    errors: rci.errors
  }

}
