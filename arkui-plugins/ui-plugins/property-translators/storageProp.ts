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

import { 
    createGetter, 
    createSetter,
    generateThisValue,
    getValueInAnnotation,
    DecoratorNames
} from "./utils";
import { PropertyTranslator } from "./base";
import { 
    GetterSetter, 
    InitializerConstructor
} from "./types";
import { 
    backingField, 
    expectName 
} from "../../common/arkts-utils";
import { createOptionalClassProperty } from "../utils";

export class StoragePropTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        this.cacheTranslatedInitializer(newName, originalName); // TODO: need to release cache after some point...
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(this.structName);
        const mutableThis: arkts.MemberExpression = arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            arkts.factory.createIdentifier(newName),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
        const storagePropValueStr: string | undefined = 
            getValueInAnnotation(this.property, DecoratorNames.STORAGE_PROP);
        if (!storagePropValueStr) {
            throw new Error("StorageProp required only one value!!") // TODO: replace this with proper error message.
        };
        const insideCallExpression = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier('AppStorageLinkState'),
            this.property.typeAnnotation ? [this.property.typeAnnotation] : [],
            [
                arkts.factory.createStringLiteral(storagePropValueStr),
                this.property.value ?? arkts.factory.createUndefinedLiteral()
            ]
        );
        const insideMemberExpression = arkts.factory.createMemberExpression(
            insideCallExpression,
            arkts.factory.createIdentifier('value'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(mutableThis, insideMemberExpression);
        const updateStruct: arkts.AstNode = this.generateUpdateStruct(mutableThis, insideMemberExpression);
        currentStructInfo.initializeBody.push(initializeStruct);
        currentStructInfo.updateBody.push(updateStruct);
        arkts.GlobalInfo.getInfoInstance().setStructInfo(this.structName, currentStructInfo);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = createOptionalClassProperty(newName, this.property, 'MutableState',
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE);
        const thisValue: arkts.MemberExpression = generateThisValue(newName);
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
        );

        return createSetter(originalName, typeAnnotation, left, right);
    }

    generateInitializeStruct(left: arkts.MemberExpression, insideMemberExpression: arkts.MemberExpression): arkts.AstNode {
        const call = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier('propState'),
            this.property.typeAnnotation ? [this.property.typeAnnotation] : [],
            [insideMemberExpression]
        );
        return arkts.factory.createAssignmentExpression(
            left,
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            call
        );
    }

    generateUpdateStruct(
        mutableThis: arkts.MemberExpression, 
        insideMemberExpression: arkts.MemberExpression
    ): arkts.AstNode {
        const left: arkts.MemberExpression = arkts.factory.createMemberExpression(
            mutableThis,
            arkts.factory.createIdentifier('value'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
        return arkts.factory.createAssignmentExpression(
            left,
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            insideMemberExpression
        );
    }
}