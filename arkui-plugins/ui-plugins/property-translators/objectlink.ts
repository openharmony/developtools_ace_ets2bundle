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

import { generateToRecord } from './utils';
import { PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { backingField, expectName } from '../../common/arkts-utils';
import { factory } from './factory';

export class ObjectLinkTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);

        this.cacheTranslatedInitializer(newName, originalName); // TODO: need to release cache after some point...
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(this.structName);
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(newName, originalName);
        const updateStruct: arkts.AstNode = this.generateUpdateStruct(newName, originalName);
        currentStructInfo.initializeBody.push(initializeStruct);
        currentStructInfo.updateBody.push(updateStruct);

        if (currentStructInfo.isReusable) {
            const toRecord = generateToRecord(newName, originalName);
            currentStructInfo.toRecordBody.push(toRecord);
        }

        arkts.GlobalInfo.getInfoInstance().setStructInfo(this.structName, currentStructInfo);
    }

    generateInitializeStruct(newName: string, originalName: string): arkts.AstNode {
        const call = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier('objectLinkState'),
            this.property.typeAnnotation ? [this.property.typeAnnotation] : [],
            []
        );
        return arkts.factory.createAssignmentExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(newName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            call
        );
    }

    generateUpdateStruct(newName: string, originalName: string): arkts.AstNode {
        const test = arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            arkts.factory.createIdentifier(newName),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );

        const consequent = arkts.BlockStatement.createBlockStatement([
            arkts.factory.createExpressionStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createTSNonNullExpression(test),
                        arkts.factory.createIdentifier('update'),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    [
                        factory.createBlockStatementForOptionalExpression(
                            arkts.factory.createIdentifier('initializers'),
                            originalName
                        ),
                    ]
                )
            ),
        ]);
        return arkts.factory.createExpressionStatement(arkts.factory.createIfStatement(test, consequent));
    }
}
