/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import {
    BuilderLambdaNames,
    CustomComponentAnontations,
    CustomComponentNames,
    CustomDialogNames,
    hasNullOrUndefinedType,
    hasPropertyInAnnotation,
    optionsHasField,
} from './utils';
import { PartialExcept, PartialNested, PartialNestedExcept } from '../common/safe-types';
import { BuiltInNames, DecoratorNames } from '../common/predefines';
import { GenSymGenerator } from '../common/gensym-generator';
import { needDefiniteOrOptionalModifier } from './property-translators/utils';
import { addMemoAnnotation } from '../collectors/memo-collectors/utils';

export interface ScriptFunctionConfiguration {
    key: arkts.Identifier | undefined;
    body: arkts.AstNode | undefined;
    typeParams: arkts.TSTypeParameterDeclaration | undefined;
    params: readonly arkts.Expression[];
    returnTypeAnnotation: arkts.TypeNode | undefined;
    hasReceiver: boolean;
    flags: arkts.Es2pandaScriptFunctionFlags;
    modifiers: arkts.Es2pandaModifierFlags;
    annotations: arkts.AnnotationUsage[];
}

export interface MethodDefinitionConfiguration {
    key: arkts.Identifier;
    kind: arkts.Es2pandaMethodDefinitionKind;
    function: ScriptFunctionConfiguration;
    modifiers: arkts.Es2pandaModifierFlags;
    isComputed: boolean;
}

export interface IntrinsicAnnotationDeclarationConfiguration {
    expr: arkts.Identifier;
    properties: arkts.AstNode[];
}

export class factory {
    /**
     * create `instance: <typeName>` as identifier
     */
    static createInstanceIdentifier(typeName: string): arkts.Identifier {
        return arkts.factory.createIdentifier(
            BuilderLambdaNames.STYLE_ARROW_PARAM_NAME,
            factory.createTypeReferenceFromString(typeName)
        );
    }

    /**
     * create `instance: <typeName>` as parameter
     */
    static createInstanceParameter(typeName: string): arkts.ETSParameterExpression {
        return arkts.factory.createETSParameterExpression(factory.createInstanceIdentifier(typeName), false, undefined);
    }

    /**
     * create `(instance: <typeName>) => void`
     */
    static createStyleLambdaFunctionType(typeName: string): arkts.ETSFunctionType {
        return arkts.factory.createETSFunctionType(
            undefined,
            [factory.createInstanceParameter(typeName)],
            factory.createTypeReferenceFromString(typeName),
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
    }

    /**
     * create `style: ((instance: <typeName>) => void) | undefined` as identifier
     */
    static createStyleIdentifier(typeName: string): arkts.Identifier {
        return arkts.factory.createIdentifier(
            BuilderLambdaNames.STYLE_PARAM_NAME,
            arkts.factory.createETSUnionType([
                factory.createStyleLambdaFunctionType(typeName),
                arkts.factory.createETSUndefinedType(),
            ])
        );
    }

    /**
     * create `initializers: <optionsName> | undefined` as identifier
     */
    static createInitializerOptionsIdentifier(optionsName: string): arkts.Identifier {
        return arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_INITIALIZERS_NAME,
            arkts.factory.createETSUnionType([
                factory.createTypeReferenceFromString(optionsName),
                arkts.factory.createETSUndefinedType(),
            ])
        );
    }

    /**
     * create `initializers: <optionsName> | undefined` as parameter
     */
    static createInitializersOptionsParameter(optionsName: string): arkts.ETSParameterExpression {
        return arkts.factory.createETSParameterExpression(
            factory.createInitializerOptionsIdentifier(optionsName),
            false,
            undefined
        );
    }

    /**
     * create `content: (() => void) | undefined` as identifier
     */
    static createContentIdentifier(): arkts.Identifier {
        return arkts.factory.createIdentifier(
            BuilderLambdaNames.CONTENT_PARAM_NAME,
            arkts.factory.createETSUnionType([factory.createLambdaFunctionType(), arkts.factory.createETSUndefinedType()])
        );
    }

    /**
     * create `@memo() content: (() => void) | undefined` as parameter
     */
    static createContentParameter(): arkts.ETSParameterExpression {
        const contentParam: arkts.Identifier = factory.createContentIdentifier();
        const param: arkts.ETSParameterExpression = arkts.factory.createETSParameterExpression(contentParam, false, undefined);
        addMemoAnnotation(param);
        return param;
    }

    /**
     * create type from string
     */
    static createTypeReferenceFromString(
        name: string,
        typeParams?: arkts.TSTypeParameterInstantiation
    ): arkts.TypeNode {
        let part: arkts.ETSTypeReferencePart;
        if (!!typeParams) {
            part = arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier(name), typeParams);
        } else {
            part = arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier(name));
        }
        return arkts.factory.createETSTypeReference(part);
    }

    /**
     * create complex type from string and type parameter, e.g. `Set<T>`
     */
    static createComplexTypeFromStringAndTypeParameter(
        name: string,
        params: readonly arkts.TypeNode[]
    ): arkts.TypeNode {
        return arkts.factory.createETSTypeReference(
            arkts.factory.createETSTypeReferencePart(
                arkts.factory.createIdentifier(name),
                arkts.factory.createTSTypeParameterInstantiation(params)
            )
        );
    }

    /**
     * create `(<params>) => <returnType>`. If returnType is not given, then using `void`.
     */
    static createLambdaFunctionType(
        params?: arkts.Expression[],
        returnType?: arkts.TypeNode | undefined
    ): arkts.ETSFunctionType {
        return arkts.factory.createETSFunctionType(
            undefined,
            params ?? [],
            returnType ?? arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
    }

    /**
     * create `import { <imported> as <local> } ...`.
     */
    static createAdditionalImportSpecifier(imported: string, local: string): arkts.ImportSpecifier {
        return arkts.factory.createImportSpecifier(
            arkts.factory.createIdentifier(imported),
            arkts.factory.createIdentifier(local)
        );
    }

    /**
     * update ScriptFunction with configurations.
     */
    static updateScriptFunction(
        original: arkts.ScriptFunction,
        config: Partial<ScriptFunctionConfiguration>
    ): arkts.ScriptFunction {
        const newFunc: arkts.ScriptFunction = arkts.factory.updateScriptFunction(
            original,
            config.body ?? original.body,
            config.typeParams ?? original.typeParams,
            config.params ?? original.params,
            config.returnTypeAnnotation ?? original.returnTypeAnnotation,
            config.hasReceiver ?? original.hasReceiver,
            config.flags ?? original.flags,
            config.modifiers ?? original.modifiers,
            config.key ?? original.id,
            config.annotations ?? original.annotations
        );
        return newFunc;
    }

    /**
     * create ScriptFunction with configurations.
     */
    static createScriptFunction(config: Partial<ScriptFunctionConfiguration>): arkts.ScriptFunction {
        const newFunc: arkts.ScriptFunction = arkts.factory.createScriptFunction(
            config.body ?? undefined,
            config.typeParams ?? undefined,
            config.params ?? [],
            config.returnTypeAnnotation ?? undefined,
            config.hasReceiver ?? false,
            config.flags ?? arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_NONE,
            config.modifiers ?? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            config.key?.clone(),
            config.annotations,
        );
        return newFunc;
    }

    /**
     * update MethodDefinition with configurations.
     */
    static updateMethodDefinition(
        original: arkts.MethodDefinition,
        config: PartialNested<MethodDefinitionConfiguration>
    ): arkts.MethodDefinition {
        const key: arkts.Identifier = config.key ?? original.id!.clone();
        const newFunc: arkts.ScriptFunction = factory.updateScriptFunction(original.function!, {
            ...config.function,
            key,
        });
        const newMethod: arkts.MethodDefinition = arkts.factory.updateMethodDefinition(
            original,
            config.kind ?? original.kind,
            key.clone(),
            arkts.factory.createFunctionExpression(key.clone(), newFunc),
            config.modifiers ?? original.modifiers,
            config.isComputed ?? false
        );
        return newMethod;
    }

    /**
     * create MethodDefinition with configurations.
     */
    static createMethodDefinition(config: PartialNested<MethodDefinitionConfiguration>): arkts.MethodDefinition {
        const newFunc: arkts.ScriptFunction = factory.createScriptFunction({
            ...config.function,
            key: config.key,
        });
        const newMethod: arkts.MethodDefinition = arkts.factory.createMethodDefinition(
            config.kind ?? arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_NONE,
            config.key?.clone(),
            arkts.factory.createFunctionExpression(config.key?.clone(), newFunc),
            config.modifiers ?? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            config.isComputed ?? false
        );
        return newMethod;
    }

    /**
     * create intrinsic `@Retention({policy:"SOURCE"})` AnnotationDeclaration with configurations.
     * @deprecated
     */
    static createIntrinsicAnnotationDeclaration(
        config: PartialExcept<IntrinsicAnnotationDeclarationConfiguration, 'expr'>
    ): arkts.AnnotationDeclaration {
        const intrinsicAnnotations: arkts.AnnotationUsage[] = [
            arkts.factory.createAnnotationUsage(arkts.factory.createIdentifier('Retention'), [
                arkts.factory.createClassProperty(
                    arkts.factory.createIdentifier('policy'),
                    arkts.factory.createStringLiteral('SOURCE'),
                    undefined,
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
                    false
                ),
            ]),
        ];
        const newAnnotationDecl: arkts.AnnotationDeclaration = arkts.factory
            .createAnnotationDeclaration(config.expr, config.properties ?? [])
            .setAnnotations(intrinsicAnnotations);
        return newAnnotationDecl;
    }

    /**
     * add alias: <property.key.name> to @Provide annotation when no alias in @Provide({...}).
     */
    static processNoAliasProvideVariable(property: arkts.ClassProperty): void {
        let annotations: readonly arkts.AnnotationUsage[] = property.annotations;
        if (annotations.length === 0) {
            return;
        }
        const newAnnos: arkts.AnnotationUsage[] = annotations.map((anno: arkts.AnnotationUsage) => {
            if (
                !!anno.expr &&
                arkts.isIdentifier(anno.expr) &&
                anno.expr.name === DecoratorNames.PROVIDE &&
                !hasPropertyInAnnotation(anno, 'alias') &&
                property.key &&
                arkts.isIdentifier(property.key)
            ) {
                return arkts.factory.updateAnnotationUsage(anno, anno.expr, [
                    ...anno.properties,
                    factory.createAliasClassProperty(property.key),
                ]);
            } else {
                return anno;
            }
        });
        property.setAnnotations(newAnnos);
    }

    /**
     * create class property : `alias: <value>`.
     */
    static createAliasClassProperty(value: arkts.Identifier): arkts.ClassProperty {
        return arkts.factory.createClassProperty(
            arkts.factory.createIdentifier('alias'),
            arkts.factory.createStringLiteral(value.name),
            undefined,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            false
        );
    }

    /**
     * add optional or definite modifier for class property needs initializing without assignment.
     */
    static PreprocessClassPropertyModifier(st: arkts.AstNode, isDecl: boolean): arkts.AstNode {
        if (!isDecl && arkts.isClassProperty(st) && needDefiniteOrOptionalModifier(st)) {
            if (st.typeAnnotation && hasNullOrUndefinedType(st.typeAnnotation)) {
                st.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL;
            } else {
                st.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DEFINITE;
            }
        }
        return st;
    }

    /**
     * create class implements : `implements <interfaceName>`.
     */
    static createClassImplements(
        interfaceName: string,
        typeParameters?: arkts.TSTypeParameterInstantiation
    ): arkts.TSClassImplements {
        return arkts.factory.createTSClassImplements(
            arkts.factory.createETSTypeReference(
                arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier(interfaceName))
            ),
            typeParameters
        );
    }

    /**
     * Generate class implements for struct with struct annotations.
     *
     * @param method method definition node
     */
    static generateImplementsForStruct(annotations: CustomComponentAnontations): arkts.TSClassImplements[] {
        const implementsInfo: arkts.TSClassImplements[] = [];
        if (annotations.entry) {
            implementsInfo.push(factory.createClassImplements(CustomComponentNames.PAGE_LIFE_CYCLE));
        }
        if (annotations.customLayout) {
            implementsInfo.push(factory.createClassImplements(CustomComponentNames.LAYOUT_CALLBACKS));
        }
        return implementsInfo;
    }

    /**
     * create class property node: `<key>:<type>`.
     *
     * @param method method definition node
     */
    static createPropertyInInterface(key: string, type?: arkts.TypeNode): arkts.ClassProperty {
        const keyIdent: arkts.Identifier = arkts.factory.createIdentifier(key);
        return arkts.factory.createClassProperty(
            keyIdent,
            undefined,
            type,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL,
            false
        );
    }

    /**
     * add `baseComponent: ExtendableComponent` to interface CustomDialogControllerOptions.
     *
     * @param method method definition node
     */
    static updateCustomDialogOptionsInterface(newNode: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        if (!newNode.body?.body || newNode.body?.body.length <= 0) {
            return newNode;
        }

        return arkts.factory.updateInterfaceDeclaration(
            newNode,
            newNode.extends,
            newNode.id?.clone(),
            newNode.typeParams,
            arkts.factory.updateInterfaceBody(newNode.body!, [
                ...newNode.body.body.map(n => n.clone()),
                factory.createPropertyInInterface(
                    CustomDialogNames.BASE_COMPONENT,
                    factory.createTypeReferenceFromString(CustomDialogNames.EXTENDABLE_COMPONENT)
                ),
            ]),
            newNode.isStatic,
            newNode.isFromExternal
        );
    }

    /**
     * Generate member expression, e.g. `<object>.<property>`.
     *
     * @param method method definition node
     */
    static generateMemberExpression(object: arkts.Expression, property: string, optional = false): arkts.MemberExpression {
        return arkts.factory.createMemberExpression(
            object,
            arkts.factory.createIdentifier(property),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            optional
        );
    }

    /**
     * create `<keyName>: <typeName> = <initializers>` as parameter
     */
    static createParameterDeclaration(
        keyName: string,
        typeName: string,
        initializers?: arkts.Expression
    ): arkts.ETSParameterExpression {
        return arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(keyName, this.createTypeReferenceFromString(typeName)),
            false,
            initializers
        );
    }

    /**
     * create class static block, e.g. `static {}`.
     */
    static createClassStaticBlock(): arkts.ClassStaticBlock {
        return arkts.factory.createClassStaticBlock(
            arkts.factory.createFunctionExpression(
                arkts.factory.createIdentifier(BuiltInNames.DEFAULT_STATIC_BLOCK_NAME),
                factory.createScriptFunction({
                    key: arkts.factory.createIdentifier(BuiltInNames.DEFAULT_STATIC_BLOCK_NAME),
                    body: arkts.factory.createBlockStatement([]),
                    modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
                    flags:
                        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_STATIC_BLOCK |
                        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_EXPRESSION,
                })
            )
        );
    }

    /**
     * create `__Options_has_<name>` class property.
     */
    static createOptionsHasMember(name: string): arkts.ClassProperty {
        const optionsHasMember: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(optionsHasField(name)),
            undefined,
            arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_BOOLEAN),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
        arkts.classPropertySetOptional(optionsHasMember, true);
        return optionsHasMember;
    }

    /**
     * find arkts.ObjectExpression type from its declaration.
     */
    static findObjectType(obj: arkts.ObjectExpression): arkts.TypeNode | undefined {
        const decl = arkts.getDecl(obj);
        if (!decl) {
            return undefined;
        }
        let typeName: string | undefined;
        if (arkts.isClassDefinition(decl)) {
            typeName = decl.ident?.name;
        } else if (arkts.isTSInterfaceDeclaration(decl)) {
            typeName = decl.id?.name;
        } else if (arkts.isTSTypeAliasDeclaration(decl)) {
            typeName = decl.id?.name;
        }
        if (!typeName) {
            return undefined;
        }
        return this.createTypeReferenceFromString(typeName);
    }

    /**
     * create `<callee>?.<typeArgs>(<args>)` or `{let _tmp = <callee>; _tmp == null ? undefined : _tmp<typeArgs>(<args>)}` from given `isLowered` flag.
     */
    static createOptionalCall(
        callee: arkts.Expression,
        typeArgs: readonly arkts.TypeNode[],
        args: readonly arkts.Expression[],
        isLowered?: boolean
    ): arkts.Expression {
        const typeParams = arkts.factory.createTSTypeParameterInstantiation(typeArgs)
        if (!isLowered) {
            return arkts.factory.createCallExpression(callee, args, typeParams, true, false);
        }
        const id = GenSymGenerator.getInstance().id();
        const alternate = arkts.factory.createCallExpression(arkts.factory.createIdentifier(id), args, typeParams, false, false);
        const statements: arkts.Statement[] = [
            factory.generateLetVariableDecl(arkts.factory.createIdentifier(id), callee),
            factory.generateTernaryExpression(id, alternate),
        ];
        return arkts.factory.createBlockExpression(statements);
    }

    /**
     * generate a variable declaration, e.g. `let <left> = <right>`;
     *
     * @param left left expression.
     * @param right right expression.
     */
    static generateLetVariableDecl(left: arkts.Identifier, right: arkts.Expression): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                    left,
                    right
                ),
            ]
        );
    }

    /**
     * generate a ternary expression, e.g. `<testLeft> ? undefined : <alternate>`;
     *
     * @param testLeft the left hand of the test condition.
     * @param alternate the alternate of the ternary expression
     */
    static generateTernaryExpression(testLeft: string, alternate: arkts.Expression): arkts.ExpressionStatement {
        const test = arkts.factory.createBinaryExpression(
            arkts.factory.createIdentifier(testLeft),
            arkts.factory.createNullLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_EQUAL
        );
        const consequent: arkts.Expression = arkts.factory.createUndefinedLiteral();
        return arkts.factory.createExpressionStatement(
            arkts.factory.createConditionalExpression(test, consequent, alternate)
        );
    }
}
