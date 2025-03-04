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

import { 
    createGetter, 
    createSetter,
} from "./utils";
import { PropertyTranslator } from "./base";
import { 
    GetterSetter, 
    InitializerConstructor, 
    StructModifier
} from "./types";
import { 
    backingField, 
    expectName 
} from "../../common/arkts-utils";

export class StateTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter, StructModifier {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);

        this.cacheTranslatedInitializer(newName, originalName); // TODO: need to release cache after some point...
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(this.structName);
    
        const originNode: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(originalName).setOptional(true),
            undefined,
            this.property.typeAnnotation,
            this.property.modifiers,
            false
        );
        const translatedNode: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName).setOptional(true),
            undefined,
            this.property.typeAnnotation,
            this.property.modifiers,
            false
        );
        currentStructInfo.stateVariables.add({ originNode, translatedNode });

        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(newName, originalName);
        const updateStruct: arkts.AstNode = this.generateUpdateStruct(newName, originalName);
        currentStructInfo.initializeBody.push(initializeStruct);
        currentStructInfo.updateBody.push(updateStruct);

        arkts.GlobalInfo.getInfoInstance().setStructInfo(this.structName, currentStructInfo);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName).setOptional(true),
            undefined, // TODO: probably need to change this.
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('MutableState'),
                    arkts.factory.createTSTypeParameterInstantiation(
                        [
                            this.property.typeAnnotation ??
                            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
                        ]
                    )
                )
            ),
            this.property.modifiers,
            false
        )
        const member: arkts.MemberExpression = arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier(`${newName}!`), // TODO: probably need to change this.
            arkts.factory.createIdentifier('value'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        )
        const thisValue: arkts.MemberExpression = arkts.factory.createMemberExpression(
            arkts.factory.createIdentifier('this'),
            member,
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        )
    
        const getter: arkts.MethodDefinition = this.translateGetter(originalName, this.property.typeAnnotation, thisValue);
        const setter: arkts.MethodDefinition = this.translateSetter(originalName, this.property.typeAnnotation, thisValue);
    
        return [field, getter, setter];
    }

    translateGetter(
        originalName: string, 
        typeAnnotation: arkts.TypeNode | undefined, 
        returnValue: arkts.MemberExpression
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue);
    }

    translateSetter(
        originalName: string, 
        typeAnnotation: arkts.TypeNode | undefined, 
        left: arkts.MemberExpression
    ): arkts.MethodDefinition {
        const right: arkts.CallExpression = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier('observableProxy'),
            undefined,
            [arkts.factory.createIdentifier('value')]
        )

        return createSetter(originalName, typeAnnotation, left, right);
    }

    generateInitializeStruct(        
        newName: string, 
        originalName: string
    ): arkts.AstNode {
        const binaryItem = arkts.factory.createBinaryExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('initializers').setOptional(true),
                arkts.factory.createIdentifier(originalName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            this.property.value ?? arkts.factory.createIdentifier('undefined'),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
        )
        const call = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier('stateOf'),
            this.property.typeAnnotation ? [this.property.typeAnnotation] : [],
            [
                binaryItem,
                arkts.factory.createIdentifier('this')
            ]
        )
        return arkts.factory.createAssignmentExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier('this'),
                arkts.factory.createIdentifier(newName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            call
        )
    }

    generateUpdateStruct(
        newName: string, 
        originalName: string
    ): arkts.AstNode {
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(newName).setOptional(true),
                arkts.factory.createIdentifier('update'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier('initializer').setOptional(true),
                    arkts.factory.createIdentifier(originalName),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                )
            ]
        );
    }
}