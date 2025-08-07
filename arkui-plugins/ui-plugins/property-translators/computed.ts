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

import { expectName } from '../../common/arkts-utils';
import { GetSetTypes, StateManagementTypes } from '../../common/predefines';
import { computedField } from '../utils';
import { generateThisBacking, generateGetOrSetCall, getGetterReturnType } from './utils';
import { MethodTranslator } from './base';
import { InitializerConstructor } from './types';
import { factory as UIFactory } from '../ui-factory';
import { factory } from './factory';

export class ComputedTranslator extends MethodTranslator implements InitializerConstructor {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.method.name);
        const newName: string = computedField(originalName);
        if (!this.returnType) {
            this.returnType = getGetterReturnType(this.method);
        }
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string): void {}

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName),
            factory.generateStateMgmtFactoryCall(
                StateManagementTypes.MAKE_COMPUTED,
                this.returnType,
                [
                    arkts.factory.createArrowFunction(
                        UIFactory.createScriptFunction({
                            body: this.method.scriptFunction.body?.clone(),
                            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
                            flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                        })
                    ),
                    arkts.factory.createStringLiteral(originalName),
                ],
                false
            ),
            undefined,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );

        const originGetter: arkts.MethodDefinition = UIFactory.updateMethodDefinition(this.method, {
            function: {
                returnTypeAnnotation: this.returnType,
                body: arkts.factory.createBlock([
                    arkts.factory.createReturnStatement(this.generateComputedGet(newName)),
                ]),
            },
        });

        return [field, originGetter];
    }

    generateComputedGet(newName: string): arkts.CallExpression {
        const thisValue: arkts.Expression = generateThisBacking(newName, false, true);
        return generateGetOrSetCall(thisValue, GetSetTypes.GET);
    }
}
