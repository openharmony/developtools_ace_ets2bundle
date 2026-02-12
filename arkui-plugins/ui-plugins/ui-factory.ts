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
import { GenSymGenerator } from '../common/gensym-generator';
import { PartialExcept, PartialNested, PartialNestedExcept } from '../common/safe-types';
import { ArkTsDefaultNames, DecoratorNames } from '../common/predefines';
import { needDefiniteOrOptionalModifier, hasDecoratorName } from './property-translators/utils';
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
        return arkts.factory.createParameterDeclaration(factory.createInstanceIdentifier(typeName), undefined);
    }

    /**
     * create `(instance: <typeName>) => void`
     */
    static createStyleLambdaFunctionType(typeName: string): arkts.ETSFunctionType {
        return arkts.factory.createFunctionType(
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [factory.createInstanceParameter(typeName)],
                factory.createTypeReferenceFromString(typeName),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
    }

    /**
     * create `<identName>: <typeNode>` as identifier. If it is optional, then create `<identName>: <typeNode> | undefined`.
     */
    static createIdentifierWithType(
        identName: string,
        typeNode: arkts.TypeNode,
        isOptional?: boolean
    ): arkts.Identifier {
        const type: arkts.TypeNode = isOptional
            ? arkts.factory.createUnionType([typeNode, arkts.factory.createETSUndefinedType()])
            : typeNode;
        return arkts.factory.createIdentifier(identName, type);
    }

    /**
     * create `<identName>: <typeNode>` as parameter. If it is optional, then create `<identName>?: <typeNode>`.
     */
    static createParameterWithType(
        identName: string,
        typeNode: arkts.TypeNode,
        isOptional?: boolean
    ): arkts.ETSParameterExpression {
        const ident = factory.createIdentifierWithType(identName, typeNode);
        const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(ident, undefined);
        if (isOptional) {
            param.setOptional(true);
        }
        return param;
    }

    /**
     * create `initializers: <optionsName> | undefined` as parameter
     */
    static createInitializersOptionsParameter(optionsName: string): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(
            factory.createIdentifierWithType(
                CustomComponentNames.COMPONENT_INITIALIZERS_NAME,
                factory.createTypeReferenceFromString(optionsName),
                true
            ),
            undefined
        );
    }

    /**
     * create `@memo() content: (() => void) | undefined` as parameter
     */
    static createContentParameter(): arkts.ETSParameterExpression {
        const contentParam: arkts.Identifier = factory.createIdentifierWithType(
            BuilderLambdaNames.CONTENT_PARAM_NAME,
            factory.createLambdaFunctionType(),
            true
        );
        const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(contentParam, undefined);
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
            part = arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(name), typeParams);
        } else {
            part = arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(name));
        }
        return arkts.factory.createTypeReference(part);
    }

    /**
     * create complex type from string and type parameter, e.g. `Set<T>`
     */
    static createComplexTypeFromStringAndTypeParameter(
        name: string,
        params: readonly arkts.TypeNode[]
    ): arkts.TypeNode {
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
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
        return arkts.factory.createFunctionType(
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                params ?? [],
                returnType ?? arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
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
            Object.hasOwn(config, 'body') ? config.body : original.body,
            arkts.factory.createFunctionSignature(
                config.typeParams ?? original.typeParams,
                config.params ?? original.params,
                config.returnTypeAnnotation ?? original.returnTypeAnnotation,
                config.hasReceiver ?? original.hasReceiver
            ),
            config.flags ?? original.flags,
            config.modifiers ?? original.modifiers
        );
        if (!!config.key) {
            newFunc.setIdent(config.key);
        }
        if (!!config.annotations) {
            newFunc.setAnnotations(config.annotations);
        }
        return newFunc;
    }

    /**
     * create ScriptFunction with configurations.
     */
    static createScriptFunction(config: Partial<ScriptFunctionConfiguration>): arkts.ScriptFunction {
        const newFunc: arkts.ScriptFunction = arkts.factory.createScriptFunction(
            config.body ?? undefined,
            arkts.factory.createFunctionSignature(
                config.typeParams ?? undefined,
                config.params ?? [],
                config.returnTypeAnnotation ?? undefined,
                config.hasReceiver ?? false
            ),
            config.flags ?? arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_NONE,
            config.modifiers ?? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        );
        if (!!config.key) {
            newFunc.setIdent(config.key);
        }
        if (!!config.annotations) {
            newFunc.setAnnotations(config.annotations);
        }
        return newFunc;
    }

    /**
     * update MethodDefinition with configurations.
     */
    static updateMethodDefinition(
        original: arkts.MethodDefinition,
        config: PartialNested<MethodDefinitionConfiguration>
    ): arkts.MethodDefinition {
        const key: arkts.Identifier = config.key ?? original.name;
        const newFunc: arkts.ScriptFunction = factory.updateScriptFunction(original.scriptFunction, {
            ...config.function,
            key,
        });
        const newMethod: arkts.MethodDefinition = arkts.factory.updateMethodDefinition(
            original,
            config.kind ?? original.kind,
            key,
            newFunc,
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
            config.key!,
            newFunc,
            config.modifiers ?? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            config.isComputed ?? false
        );
        return newMethod;
    }

    /**
     * create intrinsic `@Retention({policy:"SOURCE"})` AnnotationDeclaration with configurations.
     */
    static createIntrinsicAnnotationDeclaration(
        config: PartialExcept<IntrinsicAnnotationDeclarationConfiguration, 'expr'>
    ): arkts.AnnotationDeclaration {
        const intrinsicAnnotations: arkts.AnnotationUsage[] = [
            arkts.factory.create1AnnotationUsage(arkts.factory.createIdentifier('Retention'), [
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
                return arkts.factory.update1AnnotationUsage(anno, anno.expr, [
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
            arkts.factory.create1StringLiteral(value.name),
            undefined,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            false
        );
    }

    /**
     * add optional or definite modifier for class property needs initializing without assignment.
     */
    static preprocessClassPropertyModifier(st: arkts.AstNode, isDecl: boolean): arkts.AstNode {
        if (!isDecl && arkts.isClassProperty(st) && needDefiniteOrOptionalModifier(st)) {
            if (st.typeAnnotation && hasNullOrUndefinedType(st.typeAnnotation)) {
                st.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL;
            } else {
                st.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DEFINITE;
            }
            if (st.typeAnnotation && hasDecoratorName(st, DecoratorNames.ENV)) {
                st.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_READONLY;
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
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(interfaceName))
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
            newNode.id,
            newNode.typeParams,
            arkts.factory.updateInterfaceBody(newNode.body!, [
                ...newNode.body.body,
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
    static generateMemberExpression(object: arkts.AstNode, property: string, optional = false): arkts.MemberExpression {
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
        initializers?: arkts.AstNode
    ): arkts.ETSParameterExpression {
        return arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(keyName, this.createTypeReferenceFromString(typeName)),
            initializers
        );
    }

    /**
     * create class static block, e.g. `static {}`.
     */
    static createClassStaticBlock(): arkts.ClassStaticBlock {
        return arkts.factory.createClassStaticBlock(
            arkts.factory.createFunctionExpression(
                factory.createScriptFunction({
                    key: arkts.factory.createIdentifier(ArkTsDefaultNames.DEFAULT_STATIC_BLOCK_NAME),
                    body: arkts.factory.createBlock([]),
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
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_BOOLEAN),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
        arkts.classPropertySetOptional(optionsHasMember, true);
        return optionsHasMember;
    }

    /**
     * create `<callee>?.<typeArgs>(<args>)` or `{let _tmp = <callee>; _tmp == null ? undefined : _tmp<typeArgs>(<args>)}` from given `isLowered` flag.
     */
    static createOptionalCall(
        callee: arkts.Expression,
        typeArgs: readonly arkts.TypeNode[] | undefined,
        args: readonly arkts.AstNode[] | undefined,
        isLowered?: boolean,
    ): arkts.Expression {
        if (!isLowered) {
            return arkts.factory.createCallExpression(callee, typeArgs, args, true);
        }
        const id = GenSymGenerator.getInstance().id();
        const alternate = arkts.factory.createCallExpression(arkts.factory.createIdentifier(id), typeArgs, args);
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
    static generateLetVariableDecl(left: arkts.Identifier, right: arkts.AstNode): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
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
}
