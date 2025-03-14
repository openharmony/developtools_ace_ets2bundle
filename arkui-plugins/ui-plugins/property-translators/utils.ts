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

import * as arkts from "@koalaui/libarkts"

export enum DecoratorNames {
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
    BUILDER_PARAM = "BuilderParam",
    CUSTOM_DIALOG = "CustomDialog",
    LOCAL_STORAGE_PROP = "LocalStorageProp",
    LOCAL_STORAGE_LINK = "LocalStorageLink",
}

export function isDecoratorAnnotation(anno: arkts.AnnotationUsage, decoratorName: DecoratorNames): boolean {
    return !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName;
}

export function hasDecorator(property: arkts.ClassProperty, decoratorName: DecoratorNames): boolean {
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
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
        false,
        undefined,
        [],
        undefined,
        type
    )

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
): arkts.MethodDefinition {
    const body = arkts.factory.createBlock(
        [
            arkts.factory.createAssignmentExpression(
                left,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                right
            )
        ]
    )

    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
        false,
        undefined,
        [
            arkts.factory.createParameterDeclaration(
                arkts.factory.createIdentifier(
                    'value',
                    type
                ),
                undefined
            )
        ],
        undefined,
        undefined
    )

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
        arkts.factory.createIdentifier(name),
        arkts.factory.createFunctionExpression(scriptFunction),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
        false
    );
}
