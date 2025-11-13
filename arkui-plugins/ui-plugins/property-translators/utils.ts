/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import { ImportCollector } from '../../common/import-collector';
import { isDecoratorAnnotation } from '../../common/arkts-utils';
import {
    DecoratorNames,
    StateManagementTypes,
    GetSetTypes,
    ObservedNames,
    NodeCacheNames,
} from '../../common/predefines';
import {
    addMemoAnnotation,
    findCanAddMemoFromParameter,
    findCanAddMemoFromTypeAnnotation,
} from '../../collectors/memo-collectors/utils';
import { CustomDialogNames } from '../utils';

export interface DecoratorInfo {
    annotation: arkts.AnnotationUsage;
    name: DecoratorNames;
}

export interface OptionalMemberInfo {
    isCall?: boolean;
    isNumeric?: boolean;
}

export function removeDecorator(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames,
    ignoreDecl?: boolean
): void {
    if (arkts.isMethodDefinition(property)) {
        property.scriptFunction.setAnnotations(
            property.scriptFunction.annotations.filter(
                (anno) => !isDecoratorAnnotation(anno, decoratorName, ignoreDecl)
            )
        );
    } else {
        property.setAnnotations(
            property.annotations.filter((anno) => !isDecoratorAnnotation(anno, decoratorName, ignoreDecl))
        );
    }
}

/**
 * checking whether astNode's annotations contain given corresponding decorator name,
 * regardless where the annotation's declaration is from arkui declaration files.
 */
export function hasDecoratorName(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames
): boolean {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName, true));
    }
    return property.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName, true));
}

export function hasDecorator(
    property:
        | arkts.ClassProperty
        | arkts.ClassDefinition
        | arkts.MethodDefinition
        | arkts.ETSParameterExpression
        | arkts.ETSFunctionType,
    decoratorName: DecoratorNames
): boolean {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
    }
    return property.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
}

/**
 * Determine whether the node `<st>` is decorated by decorators that need initializing without assignment.
 *
 * @param st class property node
 */
export function needDefiniteOrOptionalModifier(st: arkts.ClassProperty): boolean {
    return (
        hasDecoratorName(st, DecoratorNames.LINK) ||
        hasDecoratorName(st, DecoratorNames.CONSUME) ||
        hasDecoratorName(st, DecoratorNames.OBJECT_LINK) ||
        (hasDecoratorName(st, DecoratorNames.PROP_REF) && !st.value) ||
        (hasDecoratorName(st, DecoratorNames.PARAM) && !st.value) ||
        (hasDecoratorName(st, DecoratorNames.EVENT) && !st.value) ||
        (hasDecoratorName(st, DecoratorNames.REQUIRE) && !st.value) ||
        (hasDecoratorName(st, DecoratorNames.BUILDER_PARAM) && !st.value)
    );
}

export function findDecoratorByName(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames
): arkts.AnnotationUsage | undefined {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName, true));
    }
    return property.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName, true));
}

export function findDecorator(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames
): arkts.AnnotationUsage | undefined {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName));
    }
    return property.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName));
}

export function findDecoratorInfos(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition
): DecoratorInfo[] {
    const decoratorNames = Object.values(DecoratorNames);
    const infos: DecoratorInfo[] = [];
    for (let i = 0; i < decoratorNames.length; i++) {
        const name = decoratorNames[i];
        const annotation: arkts.AnnotationUsage | undefined = findDecoratorByName(property, name);
        if (!!annotation) {
            infos.push({ annotation, name });
        }
    }
    return infos;
}

export function collectStateManagementTypeImport(type: StateManagementTypes): void {
    ImportCollector.getInstance().collectImport(type);
}

export function createGetter(
    name: string,
    type: arkts.TypeNode | undefined,
    returns: arkts.Expression,
    isMemoCached: boolean = false,
    isStatic: boolean = false,
    metadata?: arkts.AstNodeCacheValueMetadata
): arkts.MethodDefinition {
    const returnType: arkts.TypeNode | undefined = type?.clone();
    const body = arkts.factory.createBlock([arkts.factory.createReturnStatement(returns)]);
    const modifiers = isStatic
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(undefined, [], returnType, false),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
        modifiers
    );
    const method = arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET,
        arkts.factory.createIdentifier(name),
        scriptFunction,
        modifiers,
        false
    );
    if (!!returnType && isMemoCached) {
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(returnType, metadata);
    }
    return method;
}

export function createSetter(
    name: string,
    type: arkts.TypeNode | undefined,
    left: arkts.Expression,
    right: arkts.AstNode,
    needMemo: boolean = false
): arkts.MethodDefinition {
    const body = arkts.factory.createBlock([
        arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                left,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                right
            )
        ),
    ]);
    const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier('value', type?.clone()),
        undefined
    );
    if (needMemo && findCanAddMemoFromParameter(param)) {
        addMemoAnnotation(param);
    }
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(undefined, [param], undefined, false),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
        arkts.factory.createIdentifier(name),
        scriptFunction,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );
}

export function createSetter2(
    name: string,
    type: arkts.TypeNode | undefined,
    statement: arkts.AstNode,
    isStatic: boolean = false
): arkts.MethodDefinition {
    const body = arkts.factory.createBlock([statement]);
    const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier('value', type?.clone()),
        undefined
    );
    const modifiers = isStatic
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(undefined, [param], undefined, false),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
        modifiers
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
        arkts.factory.createIdentifier(name),
        scriptFunction,
        modifiers,
        false
    );
}

export function generateThisBackingValue(
    name: string,
    optional: boolean = false,
    nonNull: boolean = false
): arkts.MemberExpression {
    const member: arkts.Expression = generateThisBacking(name, optional, nonNull);
    return arkts.factory.createMemberExpression(
        member,
        arkts.factory.createIdentifier('value'),
        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
        false,
        false
    );
}

export function generateThisBacking(
    name: string,
    optional: boolean = false,
    nonNull: boolean = false
): arkts.Expression {
    const member: arkts.Expression = arkts.factory.createMemberExpression(
        arkts.factory.createThisExpression(),
        arkts.factory.createIdentifier(`${name}`),
        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
        false,
        optional
    );
    return nonNull ? arkts.factory.createTSNonNullExpression(member) : member;
}

function getValueStr(node: arkts.AstNode): string | undefined {
    if (!arkts.isClassProperty(node) || !node.value) return undefined;
    return arkts.isStringLiteral(node.value) ? node.value.str : undefined;
}

export function getAnnotationValue(anno: arkts.AnnotationUsage, decoratorName: DecoratorNames): string | undefined {
    const isSuitableAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName;
    if (isSuitableAnnotation && anno.properties.length === 1) {
        return getValueStr(anno.properties.at(0)!);
    }
    return undefined;
}

export function getValueInAnnotation(node: arkts.ClassProperty, decoratorName: DecoratorNames): string | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;
    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        const str: string | undefined = getAnnotationValue(anno, decoratorName);
        if (!!str) {
            return str;
        }
    }
    return undefined;
}

export interface ProvideOptions {
    alias: string | undefined;
    allowOverride: boolean;
}

export function getValueInProvideAnnotation(node: arkts.ClassProperty): ProvideOptions | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;
    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        if (anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.PROVIDE) {
            const alias = getValueInObjectAnnotation(anno, DecoratorNames.PROVIDE, 'alias') as string | undefined;
            const allowOverride: boolean = getValueInObjectAnnotation(anno, DecoratorNames.PROVIDE, 'allowOverride')
                ? true
                : false;
            return { alias, allowOverride };
        }
    }
    return undefined;
}

function getValueInObjectAnnotation(
    anno: arkts.AnnotationUsage,
    decoratorName: DecoratorNames,
    key: string
): string | boolean | undefined {
    const isSuitableAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName;
    if (!isSuitableAnnotation) {
        return undefined;
    }
    const keyItem: arkts.AstNode | undefined = anno.properties.find(
        (annoProp: arkts.AstNode) =>
            arkts.isClassProperty(annoProp) &&
            annoProp.key &&
            arkts.isIdentifier(annoProp.key) &&
            annoProp.key.name === key
    );
    if (keyItem && arkts.isClassProperty(keyItem) && keyItem.value) {
        return getDifferentAnnoTypeValue(keyItem.value);
    }
    return undefined;
}

function getDifferentAnnoTypeValue(value: arkts.Expression): string | boolean {
    if (arkts.isBooleanLiteral(value)) {
        return value.value;
    } else if (arkts.isStringLiteral(value)) {
        return value.str;
    }
    return value.dumpSrc();
}

export function generateGetOrSetCall(beforCall: arkts.AstNode, type: GetSetTypes) {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            beforCall,
            arkts.factory.createIdentifier(type),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        type === 'set' ? [arkts.factory.createIdentifier('value')] : undefined,
        undefined
    );
}

export function generateToRecord(newName: string, originalName: string): arkts.Property {
    return arkts.Property.createProperty(
        arkts.factory.createStringLiteral(originalName),
        arkts.factory.createBinaryExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('paramsCasted'),
                arkts.factory.createIdentifier(originalName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            arkts.ETSNewClassInstanceExpression.createETSNewClassInstanceExpression(
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('Object'))
                ),
                []
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
        )
    );
}

export function isCustomDialogController(type: arkts.TypeNode): boolean {
    if (arkts.isETSUnionType(type)) {
        return !!type.types.find((item: arkts.TypeNode) => {
            return isCustomDialogController(item);
        });
    }
    return (
        !!arkts.isETSTypeReference(type) &&
        !!type.part &&
        !!type.part.name &&
        arkts.isIdentifier(type.part.name) &&
        type.part.name.name === CustomDialogNames.CUSTOM_DIALOG_CONTROLLER
    );
}

export function removeImplementProperty(originalName: string): string {
    const prefix = ObservedNames.PROPERTY_PREFIX;
    return originalName.substring(prefix.length);
}

export function getValueInMonitorAnnotation(annotations: readonly arkts.AnnotationUsage[]): string[] | undefined {
    const monitorAnno: arkts.AnnotationUsage | undefined = annotations.find((anno: arkts.AnnotationUsage) => {
        return (
            anno.expr &&
            arkts.isIdentifier(anno.expr) &&
            anno.expr.name === DecoratorNames.MONITOR &&
            anno.properties.length === 1
        );
    });
    if (!monitorAnno) {
        return undefined;
    }
    return getArrayFromAnnoProperty(monitorAnno.properties.at(0)!);
}

export function getArrayFromAnnoProperty(property: arkts.AstNode): string[] | undefined {
    if (!arkts.isClassProperty(property) || !property.value || !arkts.isArrayExpression(property.value)) {
        return undefined;
    }
    const resArr: string[] = [];
    property.value.elements.forEach((item: arkts.Expression) => {
        if (arkts.isStringLiteral(item)) {
            resArr.push(item.str);
        } else if (arkts.isMemberExpression(item)) {
            const res: string | undefined = getMonitorStrFromMemberExpr(item);
            !!res && resArr.push(res);
        }
    });
    return resArr;
}

function getMonitorStrFromMemberExpr(node: arkts.MemberExpression): string | undefined {
    const decl: arkts.AstNode | undefined = arkts.getPeerIdentifierDecl(node.property.peer);
    if (!decl || !arkts.isClassProperty(decl) || !decl.value || !arkts.isETSNewClassInstanceExpression(decl.value)) {
        return undefined;
    }
    const args: readonly arkts.Expression[] = decl.value.getArguments;
    if (args.length >= 2 && arkts.isStringLiteral(args[1])) {
        return args[1].str;
    }
    return undefined;
}

export function findCachedMemoMetadata(
    node: arkts.AstNode,
    shouldWrapType: boolean = true
): arkts.AstNodeCacheValueMetadata | undefined {
    if (!arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(node)) {
        return undefined;
    }
    const metadata = arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).get(node)?.metadata ?? {};
    if (!!shouldWrapType) {
        metadata.isWithinTypeParams = true;
    }
    return metadata;
}

export function checkIsNameStartWithBackingField(node: arkts.AstNode | undefined): boolean {
    if (!node || !arkts.isIdentifier(node)) {
        return false;
    }
    return node.name.startsWith(StateManagementTypes.BACKING);
}
