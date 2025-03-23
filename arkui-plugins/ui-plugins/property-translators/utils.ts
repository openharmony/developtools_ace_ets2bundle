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

import * as arkts from "@koalaui/libarkts";
import { annotation } from "../../common/arkts-utils";

export enum DecoratorNames {
    ENTRY = "Entry",
    STATE = "State",
    STORAGE_LINK = "StorageLink",
    STORAGE_PROP = "StorageProp",
    LINK = "Link",
    PROP = "Prop",
    PROVIDE = "Provide",
    CONSUME = "Consume",
    OBJECT_LINK = "ObjectLink",
    OBSERVED = "Observed",
    WATCH = "Watch",
    BUILDER = "Builder",
    BUILDER_PARAM = "BuilderParam",
    CUSTOM_DIALOG = "CustomDialog",
    LOCAL_STORAGE_PROP = "LocalStorageProp",
    LOCAL_STORAGE_LINK = "LocalStorageLink",
}

export function isDecoratorAnnotation(anno: arkts.AnnotationUsage, decoratorName: DecoratorNames): boolean {
    return !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName;
}

export function hasDecorator(property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition, decoratorName: DecoratorNames): boolean {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
    }
    return property.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
}

export function createGetter(
    name: string, 
    type: arkts.TypeNode | undefined, 
    returns: arkts.Expression
): arkts.MethodDefinition {
    const body = arkts.factory.createBlock(
        [
            arkts.factory.createReturnStatement(
                returns
            ),
        ]
    )

    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [],
            type,
            false
        ),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET,
        arkts.factory.createIdentifier(name),
        arkts.factory.createFunctionExpression(scriptFunction),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
        false
    );
}

export function createSetter(
    name: string, 
    type: arkts.TypeNode | undefined, 
    left: arkts.MemberExpression,
    right: arkts.AstNode,
    needMemo: boolean = false
): arkts.MethodDefinition {
    const body = arkts.factory.createBlock(
        [
            arkts.factory.createAssignmentExpression(
                left,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                right
            )
        ]
    );
    const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier('value', type),
        undefined
    );
    if (needMemo) {
        param.annotations = [annotation("memo")];
    }
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(undefined, [param], undefined, false),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
    );
    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
        arkts.factory.createIdentifier(name),
        arkts.factory.createFunctionExpression(scriptFunction),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
        false
    );
}

export function generateThisValue(newName: string): arkts.MemberExpression {
    const member: arkts.Expression = arkts.factory.createTSNonNullExpression(
        arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            arkts.factory.createIdentifier(newName),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        )
    );
    return arkts.factory.createMemberExpression(
        member,
        arkts.factory.createIdentifier('value'),
        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
        false,
        false
    );
}

function getValueStr(node: arkts.AstNode): string | undefined {
    if (!arkts.isClassProperty(node) || !node.value) return undefined;
    return arkts.isStringLiteral(node.value) ? node.value.str : undefined;
}

function getAnnotationValue(anno: arkts.AnnotationUsage, decoratorName: DecoratorNames): string | undefined {
    const isSuitableAnnotation: boolean = !!anno.expr 
        && arkts.isIdentifier(anno.expr) 
        && anno.expr.name === decoratorName;
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