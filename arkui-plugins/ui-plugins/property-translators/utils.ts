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
import { filterDefined, isDecoratorAnnotation } from '../../common/arkts-utils';
import {
    DecoratorNames,
    StateManagementTypes,
    GetSetTypes,
    ObservedNames,
    EnvInternalProperty,
    NodeCacheNames,
    CustomDialogNames,
    REQUIRED_ANNOTATIONS,
    DECORATOR_TYPE_MAP,
} from '../../common/predefines';
import {
    addMemoAnnotation,
    findCanAddMemoFromParameter,
    findCanAddMemoFromTypeAnnotation,
} from '../../collectors/memo-collectors/utils';
import { getStructNameFromOptionsName, getValueInObjectAnnotation } from '../utils';
import { ReturnTransformer } from './return-transformer';
import { AstNodeCacheValueMetadata, NodeCacheFactory } from '../../common/node-cache';
import { StructPropertyAnnotationInfo, StructPropertyAnnotationRecord, StructPropertyAnnotations, StructPropertyRecord } from '../../collectors/ui-collectors/records';
import { AnnotationRecord } from '../../collectors/ui-collectors/records/annotations/base';

export interface PropertyOptionalFieldOptions {
    name: string;
    propertyType: arkts.TypeNode | undefined;
    modifiers: arkts.Es2pandaModifierFlags;
    stateManagementType?: StateManagementTypes | undefined;
    needMemo?: boolean;
    isRequired?: boolean;
}

export interface DecoratorInfo {
    annotation: arkts.AnnotationUsage;
    name: DecoratorNames;
}

export interface OptionalMemberInfo {
    isCall?: boolean;
    isNumeric?: boolean;
    isNonNull?: boolean;
}

export interface InitializeValueOptions {
    shouldCheckNonNull?: boolean;
    isRequired?: boolean;
    isWatched?: boolean;
}

export function findStateManagementFactoryTypeFromPropertyName(
    node: arkts.Identifier
): StateManagementTypes | undefined {
    const decl = arkts.getPeerIdentifierDecl(node.peer);
    if (!decl || !arkts.isClassProperty(decl)) {
        return undefined;
    }
    const record = new StructPropertyRecord({ shouldIgnoreDecl: false });
    record.collect(decl);
    const propertyInfo = record.toJSON();
    if (propertyInfo?.annotationInfo?.hasState) {
        return StateManagementTypes.STATE_DECORATED;
    }
    if (propertyInfo?.annotationInfo?.hasObjectLink) {
        return StateManagementTypes.OBJECT_LINK_DECORATED;
    }
    return undefined;
}

export function findStateManagementFactoryGenericTypeFromProperty(
    property: arkts.Property
): arkts.TypeNode | undefined {
    const decl = arkts.getPeerPropertyDecl(property.peer);
    if (!decl) {
        return undefined;
    }
    if (arkts.isClassProperty(decl)) {
        return decl.typeAnnotation;
    }
    if (arkts.isMethodDefinition(decl)) {
        const kind = decl.kind;
        let type: arkts.TypeNode | undefined;
        if (kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            type = decl.function.returnTypeAnnotation;
        } else if (kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET) {
            const firstArg = decl.function.params.at(0);
            if (!!firstArg && arkts.isETSParameterExpression(firstArg)) {
                type = firstArg.typeAnnotation;
            }
        }
    }
    return undefined;
}

export function canCastTypeFromValue(value: arkts.AstNode | undefined): boolean {
    if (!value || arkts.isUndefinedLiteral(value) || arkts.isNullLiteral(value)) {
        return false;
    }
    if (arkts.isTSAsExpression(value)) {
        return false;
    }
    // check if it is an Enum value (Enum value cannot accept cast type)
    let decl: arkts.AstNode | undefined;
    if (
        arkts.isMemberExpression(value) && 
        !!value.object && 
        !!(decl = arkts.getPeerIdentifierDecl(value.object.peer))
    ) {
        return !(arkts.isClassDefinition(decl) && decl.isEnumTransformed);
    }
    return true;
}

export function removeDecorator(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames,
    ignoreDecl?: boolean
): void {
    if (arkts.isMethodDefinition(property)) {
        property.function!.setAnnotations(
            property.function!.annotations.filter(
                (anno) => !isDecoratorAnnotation(anno, decoratorName, ignoreDecl)
            )
        );
    } else {
        property.setAnnotations(
            property.annotations.filter((anno) => !isDecoratorAnnotation(anno, decoratorName, ignoreDecl))
        );
    }
}

export function getGetterReturnType(method: arkts.MethodDefinition): arkts.TypeNode | undefined {
    const body = method.function?.body;
    if (!body || !arkts.isBlockStatement(body) || body.statements.length <= 0) {
        return undefined;
    }
    let returnType: arkts.TypeNode | undefined = undefined;
    const returnTransformer = new ReturnTransformer();
    returnTransformer.visitor(body);
    const typeArray = returnTransformer.types;
    if (typeArray.length <= 0) {
        returnType = undefined;
    } else if (typeArray.length === 1) {
        returnType = typeArray.at(0);
    } else {
        returnType = arkts.factory.createETSUnionType(typeArray);
    }
    returnTransformer.reset();
    return returnType?.clone();
}

/**
 * checking whether astNode's annotations contain given corresponding decorator name,
 * regardless where the annotation's declaration is from arkui declaration files.
 */
export function hasDecoratorName(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition | arkts.FunctionDeclaration,
    decoratorName: DecoratorNames
): boolean {
    if (arkts.isMethodDefinition(property)) {
        return property.function!.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName, true));
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
        return property.function!.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
    }
    return property.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
}

/**
 * Determine whether the node `<st>` is decorated by decorators that need initializing without assignment.
 *
 * @param st class property node
 * @deprecated
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
        (hasDecoratorName(st, DecoratorNames.BUILDER_PARAM) && !st.value) ||
        (hasDecoratorName(st, DecoratorNames.ENV)) ||
        (hasDecoratorName(st, DecoratorNames.CUSTOM_ENV))
    );
}

/**
 * Determine whether the node `<st>` is decorated by decorators that need initializing without assignment.
 *
 * @param st class property node
 * @param annotationRecord annotation collection record
 */
export function needInitializeWithoutAssignmentFromInfo(
    st: arkts.ClassProperty, 
    annotationRecord: AnnotationRecord<StructPropertyAnnotations, StructPropertyAnnotationInfo> | undefined
): boolean {
    const annotationInfo = annotationRecord?.annotationInfo;
    if (
        !annotationInfo ||
        Object.keys(annotationInfo).length === 0 ||
        annotationInfo.hasPropRef ||
        annotationInfo.hasParam ||
        annotationInfo.hasEvent ||
        annotationInfo.hasRequire ||
        annotationInfo.hasBuilderParam
    ) {
        return !st.value;
    }
    if (
        annotationInfo.hasLink || 
        annotationInfo.hasConsume || 
        annotationInfo.hasObjectLink || 
        annotationInfo.hasEnv
    ) {
        return true;
    }
    return false;
}

export function checkIsRequiredPropertyFromAnnotationInfo(
    info: AnnotationRecord<StructPropertyAnnotations, StructPropertyAnnotationInfo> | undefined
): boolean {
    if (!info || !info.annotationInfo) {
        return false;
    }
    const annotationInfo = info.annotationInfo;
    return Object.keys(annotationInfo).length === 0 || REQUIRED_ANNOTATIONS.some(
        (decoratorName: string) => annotationInfo[`has${decoratorName}`]
    );
}

export function collectAnnotationsFromInfo(
    info: AnnotationRecord<StructPropertyAnnotations, StructPropertyAnnotationInfo> | undefined
): arkts.AnnotationUsage[] {
    if (!info || !info.annotations) {
        return [];
    }
    const annotations: arkts.AnnotationUsage[] = [];
    Object.keys(info.annotations).forEach((key: string) => {
        const annotation = info.annotations?.[key];
        if (annotation !== undefined) {
            annotations.push(annotation.clone())
        }
    });
    return annotations;
}

export function collectAnnotationForBackingFromInfo(
    info: AnnotationRecord<StructPropertyAnnotations, StructPropertyAnnotationInfo> | undefined
): arkts.AnnotationUsage[] {
    if (!info || !info.annotations) {
        return [];
    }
    const annotations: arkts.AnnotationUsage[] = [];
    Object.keys(info.annotations).forEach((key: string) => {
        const annotation = info.annotations?.[key];
        if (DECORATOR_TYPE_MAP.has(key as DecoratorNames) && annotation !== undefined) {
            annotations.push(annotation.clone())
        }
    });
    return annotations;
}

export function findDecoratorByName(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames | string
): arkts.AnnotationUsage | undefined {
    if (arkts.isMethodDefinition(property)) {
        return property.function!.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName, true));
    }
    return property.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName, true));
}

export function findDecorator(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames
): arkts.AnnotationUsage | undefined {
    if (arkts.isMethodDefinition(property)) {
        return property.function!.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName));
    }
    return property.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName));
}

/**
 * @deprecated
 */
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
    metadata?: AstNodeCacheValueMetadata
): arkts.MethodDefinition {
    const returnType: arkts.TypeNode | undefined = type?.clone();
    const body = arkts.factory.createBlockStatement([arkts.factory.createReturnStatement(returns)]);
    const modifiers = isStatic
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        undefined, [], returnType, false,
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
        modifiers,
        arkts.factory.createIdentifier(name),
        undefined
    );
    const method = arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET,
        arkts.factory.createIdentifier(name),
        arkts.factory.createFunctionExpression(undefined, scriptFunction),
        modifiers,
        false
    );
    if (!!returnType && isMemoCached) {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(returnType, metadata);
    }
    return method;
}

export function createSetter(
    name: string,
    type: arkts.TypeNode | undefined,
    left: arkts.Expression,
    right: arkts.Expression,
    needMemo: boolean = false
): arkts.MethodDefinition {
    const body = arkts.factory.createBlockStatement([
        arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                left,
                right,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
            )
        ),
    ]);
    const param: arkts.ETSParameterExpression = arkts.factory.createETSParameterExpression(
        arkts.factory.createIdentifier('value', type?.clone()),
        false,
        undefined
    );
    if (needMemo && findCanAddMemoFromParameter(param).canAddMemo) {
        addMemoAnnotation(param);
    }
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        undefined, [param], undefined, false,
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        arkts.factory.createIdentifier(name),
        undefined
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
        arkts.factory.createIdentifier(name),
        arkts.factory.createFunctionExpression(undefined, scriptFunction),
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
    const body = arkts.factory.createBlockStatement([statement as arkts.Statement]);
    const param: arkts.ETSParameterExpression = arkts.factory.createETSParameterExpression(
        arkts.factory.createIdentifier('value', type?.clone()),
        false,
        undefined
    );
    const modifiers = isStatic
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        undefined, [param], undefined, false,
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
        modifiers,
        arkts.factory.createIdentifier(name),
        undefined
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
        arkts.factory.createIdentifier(name),
        arkts.factory.createFunctionExpression(undefined, scriptFunction),
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
    alias?: arkts.Expression;
    allowOverride?: arkts.Expression;
}

export interface EnvOptions {
    envValue?: arkts.Expression;
}

export function getValueInProvideAnnotation(node: arkts.ClassProperty): ProvideOptions | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;
    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        if (anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.PROVIDE) {
            const alias = getValueInObjectAnnotation(anno, DecoratorNames.PROVIDE, 'alias');
            const allowOverride = getValueInObjectAnnotation(anno, DecoratorNames.PROVIDE, 'allowOverride');
            return { alias, allowOverride };
        }
    }
    return undefined;
}

export function getValueInEnvAnnotation(node: arkts.ClassProperty): EnvOptions | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;
    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        if (anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.ENV) {
            const envValue = getValueInObjectAnnotation(anno, DecoratorNames.ENV, EnvInternalProperty.ENV_VALUE);
            return { envValue };
        }
    }
    return undefined;
}

export function generateGetOrSetCall(beforeCall: arkts.Expression, type: GetSetTypes) {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            beforeCall,
            arkts.factory.createIdentifier(type),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        type === 'set' ? [arkts.factory.createIdentifier('value')] : [],
        undefined,
        false,
        false
    );
}

export function generateToRecord(newName: string, originalName: string): arkts.Property {
    return arkts.Property.create1Property(
        arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
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
                arkts.factory.createETSTypeReference(
                    arkts.factory.createETSTypeReferencePart(arkts.factory.createIdentifier('Object'))
                ),
                []
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
        ),
        false,
        false
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

export function findCachedMemoMetadata(
    node: arkts.AstNode,
    shouldWrapType: boolean = true
): AstNodeCacheValueMetadata | undefined {
    if (!NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(node)) {
        return undefined;
    }
    const metadata = NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).get(node)?.metadata ?? {};
    if (!!shouldWrapType) {
        metadata.isWithinTypeParams = true;
    }
    return metadata;
}

export function findPropertyAccessModifierFlags(property: arkts.ClassProperty): arkts.Es2pandaModifierFlags {
    let modifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    if(arkts.hasModifierFlag(property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE)) {
        modifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
    } else if(arkts.hasModifierFlag(property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED)) {
        modifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED;
    }
    return modifierFlags;
}

export function checkIsNameStartWithBackingField(node: arkts.AstNode | undefined): boolean {
    if (!node || !arkts.isIdentifier(node)) {
        return false;
    }
    return node.name.startsWith(StateManagementTypes.BACKING);
}
