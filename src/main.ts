import ts, { createPrinter, createSourceFile, factory, ListFormat, NewLineKind, NodeFlags, ScriptKind, ScriptTarget, SyntaxKind } from 'typescript';

import contract_json from '../examples/test-binding.json'
import { ArchetypeType, get_return_body, archetype_type_to_ts_type, field_to_cmp_body, mich_to_field_decl, archetype_type_to_mich_to_name, Asset, ContractInterface, entity_to_mich, Entrypoint, Enum, Field, function_params_to_mich, FunctionParameter, MichelsonType, Record, StorageElement, valuetoMichType } from "./utils";

const file = createSourceFile("source.ts", "", ScriptTarget.ESNext, false, ScriptKind.TS);
const printer = createPrinter({ newLine: NewLineKind.LineFeed });

const contract_interface : ContractInterface = contract_json

// https://ts-ast-viewer.com/#

const michToentityDecl = (name : string, fields : Array<Omit<Field, "is_key">>) => {
  return factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
    [factory.createVariableDeclaration(
      factory.createIdentifier("mich_to_" + name),
      undefined,
      undefined,
      factory.createArrowFunction(
        undefined,
        undefined,
        [factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier("v"),
          undefined,
          factory.createTypeReferenceNode(
            factory.createQualifiedName(
              factory.createIdentifier("ex"),
              factory.createIdentifier("Micheline")
            ),
            undefined
          ),
          undefined
        )],
        factory.createTypeReferenceNode(
          factory.createIdentifier(name),
          undefined
        ),
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createBlock(fields.length > 1 ?
          [factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
              [factory.createVariableDeclaration(
                factory.createIdentifier("fields"),
                undefined,
                undefined,
                factory.createCallExpression(
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("ex"),
                    factory.createIdentifier("annotated_mich_to_array")
                  ),
                  undefined,
                  [
                    factory.createIdentifier("v"),
                    factory.createIdentifier(name + "_mich_type")
                  ]
                )
              )],
              ts.NodeFlags.Const
            )
          ),
          factory.createReturnStatement(factory.createObjectLiteralExpression(fields.map((x, i) => {
            return factory.createPropertyAssignment(
              factory.createIdentifier(x.name),
              mich_to_field_decl(x.type, "fields["+i+"]", i, fields.length)
            )
          })))] :
          [factory.createReturnStatement(factory.createTrue())], /* TODO */
          true
        )
      )
    )],
    ts.NodeFlags.Const
  ))
}

const michToAssetValueDecl = (a : Asset) => michToentityDecl(a.name + "_value", a.fields.filter(x => !x.is_key))
const michToRecordDecl = (r : Record) => michToentityDecl(r.name, r.fields)

const fieldsToCmpDecl = (name : string, fields : Array<Omit<Field, "is_key">>) => {
  return factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
    [factory.createVariableDeclaration(
      factory.createIdentifier(name + "_cmp"),
      undefined,
      undefined,
      factory.createArrowFunction(
        undefined,
        undefined,
        [
          factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            factory.createIdentifier("a"),
            undefined,
            factory.createTypeReferenceNode(
              factory.createIdentifier(name),
              undefined
            ),
            undefined
          ),
          factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            factory.createIdentifier("b"),
            undefined,
            factory.createTypeReferenceNode(
              factory.createIdentifier(name),
              undefined
            ),
            undefined
          )
        ],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createBlock(
          [factory.createReturnStatement(factory.createParenthesizedExpression(
            fields.slice(1).reduce((acc, f) => {
              return factory.createBinaryExpression(
                acc,
                factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                field_to_cmp_body(f)
              )
            },field_to_cmp_body(fields[0]))
          ))],
          true
        )
      )
    )],
    ts.NodeFlags.Const
  ))
}

const assetToCmpDecl = (a : Asset) => fieldsToCmpDecl(a.name+"_value", a.fields.filter(x => !x.is_key))
const recordToCmpDecl = (r : Record) => fieldsToCmpDecl(r.name, r.fields)

const entityToMichTypeDecl = (name : string, mt : MichelsonType) => {
  return factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(
        factory.createIdentifier(name),
        undefined,
        factory.createTypeReferenceNode(
          factory.createQualifiedName(
            factory.createIdentifier("ex"),
            factory.createIdentifier("MichelineType")
          ),
          undefined
        ),
        valuetoMichType(mt)
      )],
      ts.NodeFlags.Const
    )
  )
}

const assetKeyToMichTypeDecl = (a : Asset) => entityToMichTypeDecl(a.name + "_key_mich_type", a.key_type_michelson)
const assetValueToMichTypeDecl = (a : Asset) => entityToMichTypeDecl(a.name + "_value_mich_type", a.value_type_michelson)
const assetContainerToMichTypeDecl = (a : Asset) => entityToMichTypeDecl(a.name + "_container_mich_type", a.container_type_michelson)
const recordToMichTypeDecl = (r : Record) => entityToMichTypeDecl(r.name + "_mich_type", r.type_michelson)

const entryToArgToMichDecl = (e: Entrypoint) : ts.VariableDeclarationList => {
  return factory.createVariableDeclarationList(
    [factory.createVariableDeclaration(
      factory.createIdentifier(e.name+"_arg_to_mich"),
      undefined,
      undefined,
      factory.createArrowFunction(
        undefined,
        undefined,
        e.args.map(contractParameterToParamDecl),
        factory.createTypeReferenceNode(
          factory.createQualifiedName(
            factory.createIdentifier("ex"),
            factory.createIdentifier("Micheline")
          ),
          undefined
        ),
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createBlock(
          [factory.createReturnStatement(function_params_to_mich(e.args))],
          true
        )
      )
    )],
    ts.NodeFlags.Const
  )
}

const fieldToPropertyDecl = (f : Omit<Field, "is_key">) => {
  return factory.createPropertySignature(
    undefined,
    factory.createIdentifier(f.name),
    undefined,
    archetype_type_to_ts_type(f.type)
  )
}

const entityToInterfaceDecl = (name : string, fields : Array<Omit<Field,"is_key">>) => {
  if (fields.length == 1) {
    const field = fields[0];
    return factory.createTypeAliasDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier(name),
      undefined,
      archetype_type_to_ts_type(field.type)
    )
  } else {
    return factory.createInterfaceDeclaration(
      undefined,
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier(name),
      undefined,
      undefined,
      fields.map(fieldToPropertyDecl)
    )
  }
}

const assetKeyToInterfaceDecl = (a : Asset) => entityToInterfaceDecl(a.name + "_key", a.fields.filter(x => x.is_key))
const assetValueToInterfaceDecl = (a : Asset) => entityToInterfaceDecl(a.name + "_value", a.fields.filter(x => !x.is_key))
const recordToInterfaceDecl = (r : Record) => entityToInterfaceDecl(r.name, r.fields)

const assetContainerToTypeDecl = (a : Asset) => {
  return factory.createTypeAliasDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    factory.createIdentifier(a.name+"_container"),
    undefined,
    factory.createTypeReferenceNode(
      factory.createIdentifier("Array"),
      [factory.createTupleTypeNode([
        factory.createTypeReferenceNode(
          factory.createIdentifier(a.name+"_key"),
          undefined
        ),
        factory.createTypeReferenceNode(
          factory.createIdentifier(a.name+"_value"),
          undefined
        )
      ])]
    ))
}

const entityToMichDecl = (entity_postfix : string, aname : string, mt : MichelsonType, fields : Array<Omit<Field, "is_key">>) => {
  return factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
    [factory.createVariableDeclaration(
      factory.createIdentifier(aname + entity_postfix + "_to_mich"),
      undefined,
      undefined,
      factory.createArrowFunction(
        undefined,
        undefined,
        [factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier("x"),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier(aname + entity_postfix),
            undefined
          ),
          undefined
        )],
        factory.createTypeReferenceNode(
          factory.createQualifiedName(
            factory.createIdentifier("ex"),
            factory.createIdentifier("Micheline")
          ),
          undefined
        ),
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createBlock(
          [factory.createReturnStatement((entity_to_mich("x", mt, fields))[1])],
          true
        )
      )
    )],
    ts.NodeFlags.Const
  ))
}

const assetKeyToMichDecl = (a : Asset) => entityToMichDecl("_key", a.name, a.key_type_michelson, a.fields.filter(x => x.is_key))
const assetValueToMichDecl = (a : Asset) =>  entityToMichDecl("_value", a.name, a.value_type_michelson, a.fields.filter(x => !x.is_key))
const assetContainerToMichDecl = (a : Asset) => entityToMichDecl("_container", a.name, a.container_type_michelson, a.fields)
const recordToMichDecl = (r : Record) => entityToMichDecl("", r.name, r.type_michelson, r.fields)

const contractParameterToParamDecl = (fp : FunctionParameter) => {
  return factory.createParameterDeclaration(
    undefined,
    undefined,
    undefined,
    factory.createIdentifier(fp.name),
    undefined,
    archetype_type_to_ts_type(fp.type),
    undefined
  )
}

const storageElementToParamDecl = (se : StorageElement) => {
  return factory.createParameterDeclaration(
    undefined,
    undefined,
    undefined,
    factory.createIdentifier(se.name),
    factory.createToken(SyntaxKind.QuestionToken),
    archetype_type_to_ts_type(se.type),
    undefined
  )
}

const entryToMethod = (e : Entrypoint) => {
  return factory.createMethodDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.AsyncKeyword)],
    undefined,
    factory.createIdentifier(e.name),
    undefined,
    undefined,
    e.args.map(contractParameterToParamDecl).concat([
      factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier("params"),
        undefined,
        factory.createTypeReferenceNode(
          factory.createIdentifier("Partial"),
          [factory.createTypeReferenceNode(
            factory.createQualifiedName(
              factory.createIdentifier("ex"),
              factory.createIdentifier("Parameters")
            ),
            undefined
          )]
        ),
        undefined
      )
    ]),
    factory.createTypeReferenceNode(
      factory.createIdentifier("Promise"),
      [factory.createKeywordTypeNode(SyntaxKind.AnyKeyword)]
    ),
    factory.createBlock(
      [factory.createIfStatement(
        factory.createBinaryExpression(
          factory.createPropertyAccessExpression(
            factory.createThis(),
            factory.createIdentifier("address")
          ),
          factory.createToken(SyntaxKind.ExclamationEqualsToken),
          factory.createIdentifier("undefined")
        ),
        factory.createBlock(
          [factory.createExpressionStatement(factory.createAwaitExpression(factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("ex"),
              factory.createIdentifier("call")
            ),
            undefined,
            [
              factory.createPropertyAccessExpression(
                factory.createThis(),
                factory.createIdentifier("address")
              ),
              factory.createStringLiteral(e.name),
              factory.createCallExpression(
                factory.createIdentifier(e.name+"_arg_to_mich"),
                undefined,
                e.args.map(x => x.name).map(x => factory.createIdentifier(x))
              ),
              factory.createIdentifier("params")
            ]
          )))],
          true
        ),
        undefined
      )],
      true
    )
  )
}

const storage_elt_to_getter_skeleton = (elt_name : string, args : ts.ParameterDeclaration[], ts_type : ts.KeywordTypeNode<any>, body : ts.Statement[]) => {
  return factory.createMethodDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
    undefined,
    factory.createIdentifier("get_" + elt_name),
    undefined,
    undefined,
    args,
    factory.createTypeReferenceNode(
      factory.createIdentifier("Promise"),
      [ ts_type ]
    ),
    factory.createBlock(
      [
        factory.createIfStatement(
          factory.createBinaryExpression(
            factory.createPropertyAccessExpression(
              factory.createThis(),
              factory.createIdentifier("address")
            ),
            factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            factory.createIdentifier("undefined")
          ),
          factory.createBlock(
            ([
              factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                  [factory.createVariableDeclaration(
                    factory.createIdentifier("storage"),
                    undefined,
                    undefined,
                    factory.createAwaitExpression(factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("ex"),
                        factory.createIdentifier("get_storage")
                      ),
                      undefined,
                      [factory.createPropertyAccessExpression(
                        factory.createThis(),
                        factory.createIdentifier("address")
                      )]
                    ))
                  )],
                  ts.NodeFlags.Const | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
                )
              ),
              ...(body)
            ])
            ,
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

const storage_elt_to_class = (selt: StorageElement, ci : ContractInterface) => {
  const root = factory.createIdentifier("storage")
  const elt = ci.storage.length > 1 ?
    factory.createPropertyAccessExpression(
      root,
      factory.createIdentifier(selt.name)
    ) :
    root
  return storage_elt_to_getter_skeleton(
    selt.name,
    [],
    archetype_type_to_ts_type(selt.type),
    get_return_body(root, elt, selt.type, ci)
  )
}

const get_big_map_value_getter_body = (name : string) : ts.Statement[] => {
  return [
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [factory.createVariableDeclaration(
          factory.createIdentifier("data"),
          undefined,
          undefined,
          factory.createAwaitExpression(factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("ex"),
              factory.createIdentifier("get_big_map_value")
            ),
            undefined,
            [
              factory.createCallExpression(
                factory.createIdentifier("BigInt"),
                undefined,
                [factory.createPropertyAccessExpression(
                  factory.createIdentifier("storage"),
                  factory.createIdentifier(name)
                )]
              ),
              factory.createCallExpression(
                factory.createIdentifier(name+"_key_to_mich"),
                undefined,
                [factory.createIdentifier("key")]
              ),
              factory.createIdentifier(name+"_key_mich_type")
            ]
          ))
        )],
        ts.NodeFlags.Const | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
      )
    ),
    factory.createIfStatement(
      factory.createBinaryExpression(
        factory.createIdentifier("data"),
        factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
        factory.createIdentifier("undefined")
      ),
      factory.createBlock(
        [factory.createReturnStatement(factory.createCallExpression(
          factory.createIdentifier("mich_to_" + name + "_value"),
          undefined,
          [factory.createIdentifier("data")]
        ))],
        true
      ),
      factory.createBlock(
        [factory.createReturnStatement(factory.createIdentifier("undefined"))],
        true
      )
    )
  ]
}

const storageToGetters = (selt: StorageElement, ci : ContractInterface) => {
  switch (selt.type.node) {
    /* TODO same for big maps ? */
    case "asset"   : // Special treatment for big map assets
      const assetType = ci.types.assets.find(x => x.name == selt.name)
      if (assetType != undefined && assetType.container_kind == "big_map") {
        return storage_elt_to_getter_skeleton(
          selt.name + "_value",
          [factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            factory.createIdentifier("key"),
            undefined,
            factory.createTypeReferenceNode(
              factory.createIdentifier(selt.name+"_key"),
              undefined
            ),
            undefined
          )],
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(
              factory.createIdentifier(selt.name+"_value"),
              undefined
            ),
            factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
          ]),
          get_big_map_value_getter_body(selt.name)
        )
        //return [assetValueToBigMapGetter(assetType)]
      }
    default : return storage_elt_to_class(selt, ci)
  }
}

const get_contract_class_node = (ci : ContractInterface) => {
  return factory.createClassDeclaration(
    undefined,
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    factory.createIdentifier(ci.name.charAt(0).toUpperCase() + ci.name.slice(1)),
    undefined,
    undefined,
    [
      factory.createPropertyDeclaration(
        undefined,
        undefined,
        factory.createIdentifier("address"),
        undefined,
        factory.createUnionTypeNode([
          factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          factory.createKeywordTypeNode(SyntaxKind.UndefinedKeyword)
        ]),
        undefined
      ),
      factory.createMethodDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier("get_address"),
        undefined,
        undefined,
        [],
        factory.createUnionTypeNode([
          factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          factory.createKeywordTypeNode(SyntaxKind.UndefinedKeyword)
        ]),
        factory.createBlock(
          [factory.createReturnStatement(factory.createPropertyAccessExpression(
            factory.createThis(),
            factory.createIdentifier("address")
          ))],
          true
        )
      ),
      factory.createMethodDeclaration(
        undefined,
        [factory.createModifier(SyntaxKind.AsyncKeyword)],
        undefined,
        factory.createIdentifier("deploy"),
        undefined,
        undefined,
        ci.parameters.filter(x => !x.const).map(contractParameterToParamDecl).concat([
          factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            factory.createIdentifier("params"),
            undefined,
            factory.createTypeReferenceNode(
              factory.createIdentifier("Partial"),
              [factory.createTypeReferenceNode(
                factory.createQualifiedName(
                  factory.createIdentifier("ex"),
                  factory.createIdentifier("Parameters")
                ),
                undefined
              )]
            ),
            undefined
          )
        ]),
        undefined,
        factory.createBlock(
          [
            factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                  factory.createIdentifier("address"),
                  undefined,
                  undefined,
                  factory.createAwaitExpression(factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                      factory.createIdentifier("ex"),
                      factory.createIdentifier("deploy")
                    ),
                    undefined,
                    [
                      factory.createStringLiteral("./contracts/"+ci.name+".arl"),
                      factory.createObjectLiteralExpression(ci.parameters.filter(x => !x.const).map(x =>
                        factory.createPropertyAssignment(
                          factory.createIdentifier(x.name),
                          factory.createIdentifier(x.name)
                        )
                      ), true),
                      factory.createIdentifier("params")
                    ]
                  ))
                )],
                NodeFlags.Const | NodeFlags.AwaitContext | NodeFlags.ContextFlags | NodeFlags.TypeExcludesFlags
              )
            ),
            factory.createExpressionStatement(factory.createBinaryExpression(
              factory.createPropertyAccessExpression(
                factory.createThis(),
                factory.createIdentifier("address")
              ),
              factory.createToken(SyntaxKind.EqualsToken),
              factory.createIdentifier("address")
            ))
          ],
          true
        )
      )
    ]
    .concat(ci.entrypoints.map(entryToMethod))
    .concat(ci.storage.filter(x => !x.const).reduce((acc,x) => acc.concat(storageToGetters(x, ci)),<ts.MethodDeclaration[]>[]))
    .concat(ci.types.enums.filter(x => x.name == "state").map(getStateDecl))
    .concat([errorsToDecl(ci)])
  )
}

const get_imports = () : ts.ImportDeclaration => {
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamespaceImport(factory.createIdentifier("ex"))
    ),
    factory.createStringLiteral("@completium/experiment-ts"),
    undefined
  )
}

const get_contract_decl = (ci : ContractInterface) => {
  return factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(
        factory.createIdentifier(ci.name),
        undefined,
        undefined,
        factory.createNewExpression(
          factory.createIdentifier(ci.name.charAt(0).toUpperCase() + ci.name.slice(1)),
          undefined,
          []
        )
      )],
      ts.NodeFlags.Const
    )
  )
}

const enumToDecl = (e : Enum) : ts.EnumDeclaration => {
  return factory.createEnumDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier("states"),
      e.constructors.map((x,i) => {
        return factory.createEnumMember(
          factory.createIdentifier(x.name),
          i == 0 ? factory.createNumericLiteral("1") : undefined
        )
      })
    );
    /* TODO manage non integer enums */
}

const getStateDecl = (e : Enum) : ts.MethodDeclaration => {
  return factory.createMethodDeclaration(
    undefined,
    [factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
    undefined,
    factory.createIdentifier("get_state"),
    undefined,
    undefined,
    [],
    factory.createTypeReferenceNode(
      factory.createIdentifier("Promise"),
      [factory.createTypeReferenceNode(
        factory.createIdentifier("states"),
        undefined
      )]
    ),
    factory.createBlock(
      [
        factory.createIfStatement(
          factory.createBinaryExpression(
            factory.createPropertyAccessExpression(
              factory.createThis(),
              factory.createIdentifier("address")
            ),
            factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            factory.createIdentifier("undefined")
          ),
          factory.createBlock(
            [
              factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                  [factory.createVariableDeclaration(
                    factory.createIdentifier("storage"),
                    undefined,
                    undefined,
                    factory.createAwaitExpression(factory.createCallExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("ex"),
                        factory.createIdentifier("get_storage")
                      ),
                      undefined,
                      [factory.createPropertyAccessExpression(
                        factory.createThis(),
                        factory.createIdentifier("address")
                      )]
                    ))
                  )],
                  ts.NodeFlags.Const | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
                )
              ),
              factory.createVariableStatement(
                undefined,
                factory.createVariableDeclarationList(
                  [factory.createVariableDeclaration(
                    factory.createIdentifier("state"),
                    undefined,
                    undefined,
                    factory.createPropertyAccessExpression(
                      factory.createIdentifier("storage"),
                      factory.createIdentifier("_state")
                    )
                  )],
                  ts.NodeFlags.Const | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
                )
              ),
              factory.createSwitchStatement(
                factory.createCallExpression(
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("state"),
                    factory.createIdentifier("toNumber")
                  ),
                  undefined,
                  []
                ),
                factory.createCaseBlock(
                e.constructors.map((x, i) => {
                  return factory.createCaseClause(
                    factory.createNumericLiteral(i),
                    [factory.createReturnStatement(factory.createPropertyAccessExpression(
                      factory.createIdentifier("states"),
                      factory.createIdentifier(x.name)
                    ))]
                  )
                }))
              )
            ],
            true
          ),
          undefined
        ),
        factory.createReturnStatement(factory.createPropertyAccessExpression(
          factory.createIdentifier("states"),
          factory.createIdentifier(e.constructors[0].name)
        ))
      ],
      true
    )
  )
}

const errorsToDecl = (ci : ContractInterface) : ts.PropertyDeclaration => {
  return factory.createPropertyDeclaration(
    undefined,
    undefined,
    factory.createIdentifier("errors"),
    undefined,
    undefined,
    factory.createObjectLiteralExpression(
      ci.storage.filter(x => x.const).map(x => {
        return factory.createPropertyAssignment(
          factory.createIdentifier(x.name),
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("ex"),
              factory.createIdentifier("string_to_mich")
            ),
            undefined,
            [factory.createStringLiteral("bad sig")]
          )
        )
      }),
      true
    )
  )
}

const nodes : (ts.ImportDeclaration | ts.InterfaceDeclaration | ts.ClassDeclaration | ts.TypeAliasDeclaration | ts.VariableDeclarationList | ts.VariableStatement | ts.EnumDeclaration)[] = [
  ...([get_imports()]),
  // enums
  ...(contract_interface.types.enums.map(enumToDecl)),
  // records
  ...(contract_interface.types.records.map(recordToInterfaceDecl)),
  ...(contract_interface.types.records.map(recordToMichDecl)),
  ...(contract_interface.types.records.map(recordToMichTypeDecl)),
  ...(contract_interface.types.records.map(michToRecordDecl)),
  ...(contract_interface.types.records.map(recordToCmpDecl)),
  // asset keys
  ...(contract_interface.types.assets.map(assetKeyToInterfaceDecl)),
  ...(contract_interface.types.assets.map(assetKeyToMichDecl)),
  ...(contract_interface.types.assets.map(assetKeyToMichTypeDecl)),
  // asset values
  ...(contract_interface.types.assets.map(assetValueToInterfaceDecl)),
  ...(contract_interface.types.assets.map(assetValueToMichDecl)),
  ...(contract_interface.types.assets.map(assetValueToMichTypeDecl)),
  ...(contract_interface.types.assets.map(michToAssetValueDecl)),
  ...(contract_interface.types.assets.map(assetToCmpDecl)),
  // asset containers
  ...(contract_interface.types.assets.map(assetContainerToTypeDecl)),
  ...(contract_interface.types.assets.map(assetContainerToMichDecl)),
  ...(contract_interface.types.assets.map(assetContainerToMichTypeDecl)),
  // entrypoint argument to michelson
  ...(contract_interface.entrypoints.map(entryToArgToMichDecl)),
  ...([
  // contract class
    get_contract_class_node(contract_interface),
  // contract instance
    get_contract_decl(contract_interface)
  ]),
]

const nodeArr = factory.createNodeArray(nodes);

const result = printer.printList(ListFormat.MultiLine, nodeArr, file);
console.log(result);